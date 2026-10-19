import os

import aws_cdk as cdk

from stacks.data_stack import DataStack

app = cdk.App()

env = cdk.Environment(
    account=os.getenv("CDK_DEFAULT_ACCOUNT"),
    region=os.getenv("CDK_DEFAULT_REGION"),
)

DataStack(app, "ChicagoCrimeDataStack", env=env)

app.synth()