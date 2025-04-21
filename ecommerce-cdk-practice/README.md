
# Ecommerce CDK Practice
This is a practice repository for building a application on AWS for the Ecommerce app using AWS CDK.

## Requirement
[Ecommerce app practice](https://docs.google.com/document/d/1Ixvg4oiE0SedlEZOwOF6tpUO5qx7-emW8tbNe5pv4J8/edit?tab=t.0)

## Prerequisites
Node.js (>=18.x)
AWS CDK CLI (npm install -g aws-cdk)

## Setup

1. Clone the repository:
```
git clone https://gitlab.asoft-python.com/huyen.cao/aws-training
git checkout develop
cd ecommerce-cdk-practice
```

## Install dependencies:
```
npm install
```

## Configure AWS credentials:
```
aws configure
```

## Bootstrap CDK (run once per AWS account/region):
```
cdk bootstrap aws://123456789012/us-east-1
```

## Deploy the pipeline:
```
cdk deploy PipelineStack
```

## Cleanup
To avoid costs, destroy the stacks:
```
cdk destroy --all
```
