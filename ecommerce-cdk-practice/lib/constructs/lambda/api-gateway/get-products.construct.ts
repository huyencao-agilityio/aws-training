import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import 'dotenv/config';

import { UserPoolLambdaConstructProps } from '@interface/construct-props.interface';
import { Duration } from 'aws-cdk-lib';

export class GetProductsLambdaConstruct extends Construct {
  public readonly getProductsLambda: Function;

  constructor(scope: Construct, id: string, props: UserPoolLambdaConstructProps) {
    super(scope, id);

    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

    // Create Lambda function
    this.getProductsLambda = new Function(scope, 'GetProductsLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'get-products.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/products/', {
        exclude: ['**/*', '!get-products.js'],
      }),
      layers: [props.librariesLayer],
      timeout: Duration.seconds(30),
      environment: {
        COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        COGNITO_REGION: props.userPool.env.region,
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_USER: dbUser,
        DB_PASSWORD: dbPassword
      },
    });
  }
}
