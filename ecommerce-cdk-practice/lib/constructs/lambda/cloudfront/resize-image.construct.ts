import path from 'path';

import { Duration } from 'aws-cdk-lib';
import {
  Function,
  Runtime,
  Version,
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { BaseConstructProps } from '@interfaces/construct.interface';
import {
  LAMBDA_PATH,
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME
} from '@constants/lambda.constant';
import { PolicyHelper } from '@shared/policy.helper';
import { buildResourceName } from '@shared/resource.helper';

/**
 * Construct for creating Lambda function for resize image in Lambda@Edge
 */
export class ResizeImageLambdaConstruct extends Construct {
  public readonly resizeImageLambda: Function;
  public readonly currentVersion: Version;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    // Create the Lambda function for resize image
    this.resizeImageLambda = this.createResizeImageLambdaFunction();
    // Get version for Lambda function
    this.currentVersion = this.resizeImageLambda.currentVersion;
  }

  /**
   * Create the Lambda function for resize image
   *
   * @param librariesLayer - The libraries layer
   * @returns The Lambda function for resize image
   */
  createResizeImageLambdaFunction(): Function {
    const lambdaFnName = buildResourceName(
      this, LAMBDA_FUNCTION_NAME.CLOUDFRONT_RESIZE_IMAGE
    );

    // Create the Lambda function for resize image
    const lambdaFunction = new NodejsFunction(this, 'ResizeImage', {
      runtime: Runtime.NODEJS_20_X,
      handler: DEFAULT_LAMBDA_HANDLER,
      entry: path.join(
        __dirname,
        `${LAMBDA_PATH.CLOUDFRONT}/resize-image.ts`
      ),
      bundling: {
        forceDockerBundling: true,
        externalModules: [],
        nodeModules: ['sharp', 'aws-sdk', '@types/aws-lambda']
      },
      timeout: Duration.seconds(30),
      functionName: lambdaFnName
    });

    // Add IAM role policy for Lambda function
    lambdaFunction.addToRolePolicy(
      PolicyHelper.lambdaFunctionAccess(this, lambdaFnName)
    );
    lambdaFunction.addToRolePolicy(
      PolicyHelper.s3ObjectCrud(this)
    );

    return lambdaFunction;
  }
}
