from pathlib import Path

import aws_cdk as cdk
from aws_cdk import aws_apigatewayv2 as apigw
from aws_cdk import aws_apigatewayv2_integrations as integrations
from aws_cdk import aws_ecr_assets as ecr_assets
from aws_cdk import aws_iam as iam
from aws_cdk import aws_lambda as _lambda
from aws_cdk import aws_logs as logs
from constructs import Construct

ROOT = str(Path(__file__).resolve().parents[2])


class BackendStack(cdk.Stack):
    def __init__(self, scope: Construct, construct_id: str, *, workgroup_name: str,
                 database_name: str, workgroup_arn: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        def image(dockerfile: str) -> _lambda.DockerImageCode:
            return _lambda.DockerImageCode.from_image_asset(
                ROOT, file=dockerfile, platform=ecr_assets.Platform.LINUX_ARM64)

        def logs_for(name: str) -> logs.LogGroup:
            return logs.LogGroup(self, f"{name}Logs", retention=logs.RetentionDays.ONE_WEEK,
                                 removal_policy=cdk.RemovalPolicy.DESTROY)

        # --- Lambda descriptiva: consulta Redshift por la Data API ---
        descriptive = _lambda.DockerImageFunction(
            self, "DescriptiveFn",
            code=image("backend/Dockerfile.descriptive"),
            architecture=_lambda.Architecture.ARM_64,
            memory_size=512,
            timeout=cdk.Duration.seconds(29),
            environment={"REDSHIFT_WORKGROUP": workgroup_name,
                         "REDSHIFT_DATABASE": database_name},
            log_group=logs_for("Descriptive"),
        )
        descriptive.add_to_role_policy(iam.PolicyStatement(
            actions=["redshift-data:ExecuteStatement", "redshift-data:DescribeStatement",
                     "redshift-data:GetStatementResult", "redshift-data:CancelStatement"],
            resources=["*"],
        ))
        descriptive.add_to_role_policy(iam.PolicyStatement(
            actions=["redshift-serverless:GetCredentials"],
            resources=[workgroup_arn],
        ))

        # --- Lambda predictiva: solo lee los JSON de la imagen ---
        predictive = _lambda.DockerImageFunction(
            self, "PredictiveFn",
            code=image("backend/Dockerfile.predictive"),
            architecture=_lambda.Architecture.ARM_64,
            memory_size=256,
            timeout=cdk.Duration.seconds(10),
            log_group=logs_for("Predictive"),
        )

        # --- API HTTP con enrutamiento por prefijo ---
        self.api = apigw.HttpApi(self, "Api", api_name="chicago-crime-api")
        self.api.add_routes(
            path="/analytics/{proxy+}", methods=[apigw.HttpMethod.GET],
            integration=integrations.HttpLambdaIntegration("DescriptiveInt", descriptive))
        self.api.add_routes(
            path="/predict/{proxy+}", methods=[apigw.HttpMethod.GET],
            integration=integrations.HttpLambdaIntegration("PredictiveInt", predictive))

        cdk.CfnOutput(self, "ApiUrl", value=self.api.api_endpoint)
        cdk.CfnOutput(self, "DescriptiveRoleName", value=descriptive.role.role_name)