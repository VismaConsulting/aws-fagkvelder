from aws_cdk import (
    Stack,
    CfnOutput,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    RemovalPolicy,
    aws_iam as iam,
    aws_lambda as _lambda,
    aws_apigatewayv2_alpha as api,
    aws_apigatewayv2_integrations_alpha as api_integrations
)
from constructs import Construct

# Sett inn dine initialer her!
custom_prefix = "mine_initialer"

class CdkStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # S3 BUCKET
        bucket_name = f"{custom_prefix}-cdk-sertifiseringer-bucket"
        
        bucket = s3.Bucket(self, 
            bucket_name, 
            bucket_name = bucket_name,
            website_index_document = "index.html",
            removal_policy = RemovalPolicy.DESTROY,
            auto_delete_objects = True,
        )
        
        bucket.add_to_resource_policy(
            iam.PolicyStatement(
                actions = ["s3:*"],
                principals = [iam.AnyPrincipal()],
                resources = [bucket.bucket_arn + "/*"]
            )
        )
        
        # DYNAMODB
        table_name = f"{custom_prefix}-cdk-sertifiseringer"
        
        database = dynamodb.Table(self, 
            table_name,
            table_name = table_name,
            partition_key = dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            removal_policy = RemovalPolicy.DESTROY,
        )
        
        database.auto_scale_read_capacity(
            min_capacity = 1,
            max_capacity = 5
        ).scale_on_utilization(target_utilization_percent=75)
        
        database.auto_scale_write_capacity(
            min_capacity = 1,
            max_capacity = 5
        ).scale_on_utilization(target_utilization_percent=75)
        
        # LAMBDA
        upload_func = _lambda.Function(self, 
            f"{custom_prefix}-cdk-sertifisering-upload",
            function_name = f"{custom_prefix}-cdk-sertifisering-upload",
            code = _lambda.Code.from_asset(f"{custom_prefix}_cdk/functions"),
            handler = "upload-lambda.handler",
            runtime = _lambda.Runtime.NODEJS_14_X,
            environment = {
                "S3_BUCKET_NAME": bucket_name
            }
        )
        
        database_func = _lambda.Function(self, 
            f"{custom_prefix}-cdk-sertifisering-db",
            function_name = f"{custom_prefix}-cdk-sertifisering",
            code = _lambda.Code.from_asset(f"{custom_prefix}_cdk/functions"),
            handler = "sertifisering-lambda.handler",
            runtime = _lambda.Runtime.NODEJS_14_X,
            environment = {
                "TABLE_NAME": table_name
            }
        )
        
        database.grant_read_write_data(database_func)
        
        # API
        http_api = api.HttpApi(self, 
            f"{custom_prefix}-cdk-sertifiseringer-api",
            api_name = f"{custom_prefix}-cdk-sertifiseringer-api",
            cors_preflight = api.CorsPreflightOptions(
                allow_headers = ["*"],
                allow_methods = [api.CorsHttpMethod.ANY],
                allow_origins = ["*"]
            )
        )
        
        http_api.add_routes(
            path = "/sertifiseringer",
            methods = [api.HttpMethod.GET, api.HttpMethod.PUT],
            integration = api_integrations.HttpLambdaIntegration("DatabaseIntegration", database_func)
        )
        
        http_api.add_routes(
            path = "/sertifiseringer/{id}",
            methods = [api.HttpMethod.GET, api.HttpMethod.DELETE],
            integration = api_integrations.HttpLambdaIntegration("DatabaseIntegrationPathVar", database_func)
        )
        
        http_api.add_routes(
            path = "/upload",
            methods = [api.HttpMethod.PUT],
            integration = api_integrations.HttpLambdaIntegration("UploadIntegration", upload_func)
        )

        CfnOutput(self, "API_URL", value=http_api.api_endpoint)