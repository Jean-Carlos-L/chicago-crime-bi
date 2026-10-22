import aws_cdk as cdk
from aws_cdk import aws_ec2 as ec2
from aws_cdk import aws_iam as iam
from aws_cdk import aws_redshiftserverless as rs
from aws_cdk import aws_s3 as s3
from constructs import Construct

DB_NAME = "chicago_crime"
NAMESPACE_NAME = "chicago-crime"
WORKGROUP_NAME = "chicago-crime-wg"


class DataStack(cdk.Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # --- S3: data lake (parquet limpios) ---
        bucket = s3.Bucket(
            self, "DataBucket",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            encryption=s3.BucketEncryption.S3_MANAGED,
            enforce_ssl=True,
            removal_policy=cdk.RemovalPolicy.DESTROY,  # proyecto académico:
            auto_delete_objects=True,                  # cdk destroy lo borra todo
        )

        # --- Rol que Redshift asume para ejecutar COPY desde S3 ---
        redshift_role = iam.Role(
            self, "RedshiftS3Role",
            assumed_by=iam.CompositePrincipal(
                iam.ServicePrincipal("redshift.amazonaws.com"),
                iam.ServicePrincipal("redshift-serverless.amazonaws.com"),
            ),
        )
        bucket.grant_read(redshift_role)

        # --- Red: VPC por defecto (tiene subredes en todas las AZ) ---
        vpc = ec2.Vpc.from_lookup(self, "DefaultVpc", is_default=True)
        sg = ec2.SecurityGroup(
            self, "RedshiftSg", vpc=vpc,
            description="Redshift Serverless (sin acceso entrante)",
            allow_all_outbound=True,
        )

        # --- Redshift Serverless ---
        namespace = rs.CfnNamespace(
            self, "Namespace",
            namespace_name=NAMESPACE_NAME,
            db_name=DB_NAME,
            admin_username="admin",
            manage_admin_password=True,  # la contraseña queda en Secrets Manager
            iam_roles=[redshift_role.role_arn],
            default_iam_role_arn=redshift_role.role_arn,
        )

        workgroup = rs.CfnWorkgroup(
            self, "Workgroup",
            workgroup_name=WORKGROUP_NAME,
            namespace_name=NAMESPACE_NAME,
            base_capacity=8,        # RPU mínimos
            max_capacity=16,        # tope para controlar costos
            publicly_accessible=False,
            subnet_ids=[s.subnet_id for s in vpc.public_subnets],
            security_group_ids=[sg.security_group_id],
        )
        workgroup.add_dependency(namespace)

        # --- Salidas: se copian al .env ---
        cdk.CfnOutput(self, "BucketName", value=bucket.bucket_name)
        cdk.CfnOutput(self, "RedshiftRoleArn", value=redshift_role.role_arn)
        cdk.CfnOutput(self, "WorkgroupName", value=WORKGROUP_NAME)
        cdk.CfnOutput(self, "DatabaseName", value=DB_NAME)
        self.workgroup_arn = workgroup.attr_workgroup_workgroup_arn