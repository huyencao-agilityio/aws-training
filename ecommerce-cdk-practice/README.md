
# Ecommerce CDK Practice
This is a practice repository for building a application on AWS for the Ecommerce app using AWS CDK.

## Requirement
[Ecommerce app practice](https://docs.google.com/document/d/1Ixvg4oiE0SedlEZOwOF6tpUO5qx7-emW8tbNe5pv4J8/edit?tab=t.0)

## Prerequisites
Node.js (>=20.x)

## Project Structure
```
ecommerce-cdk-practice/
|
├── bin/                      # Entry point for the CDK application
|
├── lib/                      # CDK infrastructure code
│   ├── constructs/           # CDK constructs definitions
│   │   ├── api-gateway/      # Constructs for API Gateway resources
│   │   ├── certificate/      # Constructs for Certificate resources
│   │   ├── cloudfront/       # Constructs for CloudFront resources
│   │   ├── cloudwatch/       # Constructs for CloudWatch resources
│   │   ├── cognito/          # Constructs for Cognito resources
│   │   ├── event-bridge/     # Constructs for Event Bridge resources
│   │   ├── lambda/           # Constructs for Lambda functions
│   │   ├── queue/            # Constructs for Queue resources
│   │   ├── rds/              # Constructs for RDS resources
│   │   ├── route53/          # Constructs for Route 53 resources
│   │   ├── s3/               # Constructs for S3 resources
│   │   ├── sns/              # Constructs for SNS resources
│   │   ├── vpc/              # Constructs for VPC resources
│
│   ├── stacks/               # CDK stack definitions
│   ├── pipelines/            # CDK pipeline definitions (e.g., Prod, Staging)
│   ├── stages/               # CDK stage definitions (e.g., Prod, Staging)
│   └── shared/               # Shared utilities for CDK code
|
├── src/                      # Application source code
│   ├── lambda-handler/       # Lambda function handlers
│   │   ├── api/              # Handlers for API Gateway
│   │   ├── cognito/          # Handlers for Cognito
│   │   ├── cloudfront/       # Handlers for CloudFront
│   │   ├── event-bridge/     # Handlers for Event Bridge
│   │   ├── queue/            # Handlers for Queue
│
│   ├── interfaces/           # TypeScript interfaces for the application
│   └── utils/                # Helper utility functions
│   └── enums/                # Enum definitions used across the application
│   └── types/                # Define types for the app
│   └── constants/            # Define constants use in the app
|
└── test/                     # Unit tests
│   ├── constructs/           # Implement unit test for the constructs
│   │   ├── api-gateway/
│   │   ├── certificate/
│   │   ├── cloudfront/
│   │   ├── cloudwatch/
│   │   ├── cognito/
│   │   ├── event-bridge/
│   │   ├── lambda/
│   │   ├── queue/
│   │   ├── rds/
│   │   ├── route53/
│   │   ├── s3/
│   │   ├── sns/
│   │   ├── vpc/
│   ├── stacks/               # Implement unit test for the stacks
│   ├── pipelines/            # Implement unit test for the pipelines
│   ├── stages/               # Implement unit test for the stages
```

## Setup

### 1. Clone the repository:
```
git clone https://gitlab.asoft-python.com/huyen.cao/aws-training
git checkout develop
cd ecommerce-cdk-practice
```

### 2. Install dependencies:
```
npm install
```

### 3. Configure AWS credentials:
```
aws configure
```

### 4. Bootstrap CDK (run once per AWS account/region):
```
cdk bootstrap aws://ACCOUNT_ID/REGION
```
Example: `cdk bootstrap aws://123456789012/us-east-1`

## Deployment

Development and deploy to different environments

1. Development:
```bash
npm run synth:dev
npm run deploy:dev
```

2. Staging:
```bash
npm run synth:staging
npm run deploy:staging
```

3. Production:
```bash
npm run synth:prod
npm run deploy:prod
```

## Testing

1. Run unit test
```
npm run test
npm run test [FILE]
```

2. Run unit test in watch mode
```
npm run test:watch
```

3. Run unit test with coverage
```
npm run test:coverage
```
