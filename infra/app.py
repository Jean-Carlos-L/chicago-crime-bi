import os

import aws_cdk as cdk

from stacks.backend_stack import BackendStack
from stacks.data_stack import DB_NAME, WORKGROUP_NAME, DataStack
from stacks.frontend_stack import FrontendStack

app = cdk.App()
env = cdk.Environment(
    account=os.getenv("CDK_DEFAULT_ACCOUNT"),
    region=os.getenv("CDK_DEFAULT_REGION"),
)

data = DataStack(app, "ChicagoCrimeDataStack", env=env)
backend = BackendStack(
    app, "ChicagoCrimeBackendStack", env=env,
    workgroup_name=WORKGROUP_NAME, database_name=DB_NAME,
    workgroup_arn=data.workgroup_arn,
)
FrontendStack(app, "ChicagoCrimeFrontendStack", env=env, api=backend.api)

app.synth()