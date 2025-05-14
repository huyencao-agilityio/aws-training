import path from 'path';

import {
  Function,
  Runtime,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

import { BaseConstructProps } from '@interfaces/construct.interface';
import { DEFAULT_EMAIL_ADDRESS } from '@constants/email.constant';
import { LAMBDA_PATH } from '@constants/lambda-path.constants';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';

/**
 * Construct sets up a Lambda function that implements custom authentication flow
 */
export class CreateAuthChallengeLambdaConstruct extends Construct {
  public readonly createAuthChallenge: Function;

  constructor(scope: Construct, id: string, props: BaseConstructProps) {
    super(scope, id);

    const { librariesLayer } = props;

    // Lambda for Create Auth Challenge
    this.createAuthChallenge = this.createCreateAuthChallengeLambdaFunction(
      librariesLayer!
    );
  }

  /**
   * Create the Lambda function for Create Auth Challenge
   *
   * @param librariesLayer - The libraries layer
   * @returns The Lambda function for Create Auth Challenge
   */
  createCreateAuthChallengeLambdaFunction(
    librariesLayer: ILayerVersion
  ): Function {
    // Get challenge code
    const challengeCode = StringParameter.valueForStringParameter(
      this,
      '/cognito/challenge-code',
    );

    // Create new Lambda function
    const lambdaFunction = new NodejsFunction(this, 'CreateAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      layers: [librariesLayer!],
      entry: path.join(__dirname, `${LAMBDA_PATH.AUTH}/create-auth-challenge.ts`),
      bundling: {
        externalModules: EXTERNAL_MODULES,
      },
      environment: {
        DEFAULT_EMAIL: DEFAULT_EMAIL_ADDRESS,
        CHALLENGE_CODE: challengeCode
      },
    });

    // Add IAM policy to allow sending emails via SES
    lambdaFunction.addToRolePolicy(new PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*'],
      effect: Effect.ALLOW
    }));

    return lambdaFunction;
  }
}
