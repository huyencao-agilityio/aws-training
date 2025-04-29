import { IFunction, Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import 'dotenv/config';

import {
  UserPoolConstructProps
} from '@interfaces/construct.interface';

/**
 * Construct for creating Lambda function to handles GET requests to retrieve products
 */
export class GetProductsLambdaConstruct extends Construct {
  public readonly getProductsLambda: IFunction;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { librariesLayer, userPool } = props;

    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

    // Create the Lambda function for product retrieval
    this.getProductsLambda = new Function(this, 'GetProducts', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'get-products.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/products/', {
        exclude: ['**/*', '!get-products.js'],
      }),
      layers: [librariesLayer],
      timeout: Duration.seconds(30),
      environment: {
        COGNITO_USER_POOL_ID: userPool.userPoolId,
        COGNITO_REGION: userPool.env.region,
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_USER: dbUser,
        DB_PASSWORD: dbPassword
      },
    });
  }
}
