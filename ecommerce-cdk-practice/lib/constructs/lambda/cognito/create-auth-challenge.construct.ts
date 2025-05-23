import path from 'path';

import {
  Function,
  Runtime,
  ILayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { BaseConstructProps } from '@interfaces/construct.interface';
import {
  LAMBDA_PATH,
  DEFAULT_LAMBDA_HANDLER,
  LAMBDA_FUNCTION_NAME
} from '@constants/lambda.constant';
import { EXTERNAL_MODULES } from '@constants/external-modules.constant';
import { ParameterKeys } from '@constants/parameter-keys.constant';
import { SecretHelper } from '@shared/secret.helper';
import { PolicyHelper } from '@shared/policy.helper';
import { buildResourceName } from '@shared/resource.helper';

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
    const challengeCode = SecretHelper.getPlainTextParameter(
      this,
      ParameterKeys.ChallengeCode
    );
    // Get default email from SSM Parameter Store
    const defaultEmail = SecretHelper.getPlainTextParameter(
      this,
      ParameterKeys.DefaultEmailAddress
    );

    // Create new Lambda function
    const lambdaFunction = new NodejsFunction(
      this,
      'CreateAuthChallengeLambda',
      {
        runtime: Runtime.NODEJS_20_X,
        handler: DEFAULT_LAMBDA_HANDLER,
        layers: [librariesLayer!],
        entry: path.join(
          __dirname,
          `${LAMBDA_PATH.COGNITO}/create-auth-challenge.ts`
        ),
        bundling: {
          externalModules: EXTERNAL_MODULES,
        },
        environment: {
          DEFAULT_EMAIL: defaultEmail,
          CHALLENGE_CODE: challengeCode
        },
        functionName: buildResourceName(
          this, LAMBDA_FUNCTION_NAME.COGNITO_CREATE_AUTH
        )
      }
    );

    // Add IAM policy to allow sending emails via SES
    lambdaFunction.addToRolePolicy(
      PolicyHelper.sesSendEmail(this)
    );

    return lambdaFunction;
  }
}
