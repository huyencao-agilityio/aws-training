import path from 'path';
import { fileURLToPath } from 'url';

import { Duration } from 'aws-cdk-lib';
import {
  Function,
  Runtime,
  Version,
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { buildResourceName } from '../../../utils/resource.utils';
import {
  DEFAULT_LAMBDA_HANDLER,
  ENTRY_PATH
} from '../../../shared/constants/lambda.constant';
import { PolicyHelper } from '../../../utils/policy.utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Construct for creating Lambda function for origin request in Lambda@Edge
 */
export class OriginRequestLambdaConstruct extends Construct {
  public readonly originRequestLambda: Function;
  public readonly currentVersion: Version;

  constructor(scope: Construct, id: string) {
    super(scope, id);


    // Create the Lambda function for origin request
    this.originRequestLambda = this.createOriginRequestLambdaFunction();
    // Get version for Lambda function
    this.currentVersion = this.originRequestLambda.currentVersion;
  }

  /**
   * Create the Lambda function for origin request
   *
   * @returns The Lambda function for origin request
   */
  createOriginRequestLambdaFunction(): Function {
    const lambdaFnName = buildResourceName(
      'cloudfront-origin-request'
    );

    // Create the Lambda function for resize image
    const lambdaFunction = new NodejsFunction(this, 'ResizeImage', {
      runtime: Runtime.NODEJS_22_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(__dirname, ENTRY_PATH),
      timeout: Duration.seconds(30),
      functionName: lambdaFnName,
      // Need to use bundling to build node modules for Lambda@Edge
      // to avoid the error:
      // "Error: Cannot find module 'sharp'" in Lambda Function
      bundling: {
        externalModules: [],
        nodeModules: ['sharp', 'aws-sdk'],
      },
    });

    // Add IAM role policy for Lambda function
    lambdaFunction.addToRolePolicy(
      PolicyHelper.lambdaFunctionAccess(this, lambdaFnName)
    );

    return lambdaFunction;
  }
}
