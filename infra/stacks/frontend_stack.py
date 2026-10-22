import aws_cdk as cdk
from aws_cdk import aws_apigatewayv2 as apigw
from aws_cdk import aws_cloudfront as cloudfront
from aws_cdk import aws_cloudfront_origins as origins
from aws_cdk import aws_s3 as s3
from constructs import Construct


class FrontendStack(cdk.Stack):
    def __init__(self, scope: Construct, construct_id: str, *, api: apigw.HttpApi, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        bucket = s3.Bucket(
            self, "SiteBucket",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            encryption=s3.BucketEncryption.S3_MANAGED,
            enforce_ssl=True,
            removal_policy=cdk.RemovalPolicy.DESTROY,
            auto_delete_objects=True,
        )

        # dominio de la API sin esquema: https://xxx.execute-api... -> xxx.execute-api...
        api_domain = cdk.Fn.select(2, cdk.Fn.split("/", api.api_endpoint))

        api_cache = cloudfront.CachePolicy(
            self, "ApiCache",
            default_ttl=cdk.Duration.minutes(5),   # alivia cold starts y consultas repetidas
            min_ttl=cdk.Duration.seconds(0),
            max_ttl=cdk.Duration.minutes(10),
            query_string_behavior=cloudfront.CacheQueryStringBehavior.all(),
            header_behavior=cloudfront.CacheHeaderBehavior.none(),
            cookie_behavior=cloudfront.CacheCookieBehavior.none(),
            enable_accept_encoding_gzip=True,
            enable_accept_encoding_brotli=True,
        )
        api_behavior = cloudfront.BehaviorOptions(
            origin=origins.HttpOrigin(
                api_domain, protocol_policy=cloudfront.OriginProtocolPolicy.HTTPS_ONLY),
            viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowed_methods=cloudfront.AllowedMethods.ALLOW_GET_HEAD,
            cache_policy=api_cache,
            origin_request_policy=cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        )

        dist = cloudfront.Distribution(
            self, "Cdn",
            default_root_object="index.html",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            additional_behaviors={"/analytics/*": api_behavior, "/predict/*": api_behavior},
            price_class=cloudfront.PriceClass.PRICE_CLASS_100,
        )

        cdk.CfnOutput(self, "FrontendBucketName", value=bucket.bucket_name)
        cdk.CfnOutput(self, "DistributionId", value=dist.distribution_id)
        cdk.CfnOutput(self, "SiteUrl", value=f"https://{dist.distribution_domain_name}")