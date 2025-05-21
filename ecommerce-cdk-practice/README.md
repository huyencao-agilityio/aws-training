
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
├── bin/                      # Entry point for the CDK application (e.g., app.ts)
|
├── lib/                      # CDK infrastructure code
│   ├── constructs/           # CDK constructs definitions
│   │   ├── api-gateway/      # Constructs for API Gateway resources
│   │   ├── cognito/          # Constructs for Cognito resources
│   │   ├── lambda/           # Constructs for Lambda functions
│   │   └── ...               # Other construct categories
│   ├── stacks/               # CDK stack definitions
│   ├── pipelines/            # CDK pipeline definitions (e.g., Prod Pipeline, Staging Pipeline)
│   ├── stages/               # CDK stage definitions (e.g., Prod, Staging)
│   └── shared/               # Shared utilities for CDK code
|
├── src/                      # Application source code
│   ├── lambda-handler/       # Lambda function handlers
│   │   ├── api-gateway/      # Handlers for API Gateway
│   │   ├── cognito/          # Handlers for Cognito
│   │   └── ...               # Other Lambda handlers
│   ├── interfaces/           # TypeScript interfaces for the application
│   └── utils/                # Helper utility functions
│   └── enums/                # Enum definitions used across the application
│   └── types/                # Define types for the app
│   └── constants/            # Define constants use in the app
|
└── test/                     # Unit and integration tests
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

Deploy to different environments

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
