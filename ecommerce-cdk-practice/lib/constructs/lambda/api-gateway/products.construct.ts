import path from 'path';

import {
  Function,
  Runtime,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import {
  UserPoolConstructProps
} from '@interfaces/construct.interface';
import { getDatabaseConfig } from '@shared/database.helper';
import {
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME,
  LAMBDA_PATH
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';
import { buildResourceName } from '@shared/resource.helper';

/**
 * Construct for creating Lambda function for API products
 */
export class ProductsLambdaConstruct extends Construct {
  public readonly getProductsLambda: Function;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    const { librariesLayer, userPool } = props;

    // Get the db instance
    const dbInstance = getDatabaseConfig(scope);

    // Create the Lambda function for products retrieval
    this.getProductsLambda = this.createGetProductsLambdaFunction(
      librariesLayer!,
      dbInstance,
      userPool
    );
  }

  /**
   * Create the Lambda function for products retrieval
   *
   * @param librariesLayer - The libraries layer
   * @param dbInstance - The database instance
   * @param userPool - The user pool
   * @returns The Lambda function for product retrieval
   */
  createGetProductsLambdaFunction(
    librariesLayer: ILayerVersion,
    dbInstance: Record<string, string>,
    userPool: UserPool
  ): Function {
    const lambdaFunction = new NodejsFunction(this, 'GetProducts', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.PRODUCTS}/get-products.ts`
      ),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      layers: [librariesLayer!],
      timeout: Duration.seconds(30),
      environment: {
        COGNITO_USER_POOL_ID: userPool.userPoolId,
        COGNITO_REGION: userPool.env.region,
        ...dbInstance
      },
      functionName: buildResourceName(
        this, LAMBDA_FUNCTION_NAME.API_GET_PRODUCTS
      )
    });

    return lambdaFunction;
  }
}
