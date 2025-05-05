import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import 'dotenv/config';

import {
  BaseConstructProps
} from '@interfaces/construct.interface';

/**
 * Construct for creating Lambda function for API update user profile
 */
export class UpdateUserLambdaConstruct extends Construct {
  public readonly updateUserLambda: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';

    // Create the Lambda function for product retrieval
    this.updateUserLambda = new Function(this, 'UpdateUser', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'update-user.handler',
      code: Code.fromAsset('dist/src/lambda-handler/api/users/', {
        exclude: ['**/*', '!update-user.js'],
      }),
      layers: [props.librariesLayer],
      timeout: Duration.seconds(30),
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_USER: dbUser,
        DB_PASSWORD: dbPassword
      },
    });
  }
}
