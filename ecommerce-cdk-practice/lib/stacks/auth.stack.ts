import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { UserPoolOperation } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import 'dotenv/config';

import { getLibrariesLayer } from '@utils/layer';

import {
  CreateAuthChallengeLambdaConstruct,
  DefineAuthChallengeLambdaConstruct,
  VerifyAuthChallengeLambdaConstruct,
  PostConfirmationLambdaConstruct,
  PreSignUpLambdaConstruct,
  CustomMessageLambdaConstruct
} from '../constructs/lambda/cognito';
import { UserPoolConstruct } from '../constructs/cognito/user-pool.construct';
import { ProviderConstruct } from '../constructs/cognito/provider.construct';

/**
 * AuthStack is responsible for provisioning all authentication-related resources
 * for the application.
 */
export class AuthStack extends Stack {
  public readonly userPoolConstruct: UserPoolConstruct;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    // Get layer on Lambda
    const librariesLayer = getLibrariesLayer(this, 'LibrariesLayer');

    // Create user pool construct
    this.userPoolConstruct = new UserPoolConstruct(this, 'UserPoolConstruct', {
      librariesLayer: librariesLayer,
      region: this.region
    });

    const { userPool, userPoolClient } = this.userPoolConstruct;

    // Create Lambda functions for custom authentication flow
    // These functions handle different stages of the authentication process
    const createAuthChallengeLambda = new CreateAuthChallengeLambdaConstruct(
      this,
      'CreateAuthChallengeLambdaConstruct',
      {
        librariesLayer: librariesLayer
      }
    );
    const defineAuthChallengeLambda = new DefineAuthChallengeLambdaConstruct(
      this,
      'DefineAuthChallengeLambdaConstruct',
      {
        librariesLayer: librariesLayer
      }
    );
    const verifyAuthChallengeLambda = new VerifyAuthChallengeLambdaConstruct(
      this,
      'VerifyAuthChallengeLambdaConstruct'
    );

    // Create Lambda functions for user lifecycle events
    // These functions handle events like sign-up confirmation and pre-signup validation
    const postConfirmationLambda = new PostConfirmationLambdaConstruct(
      this,
      'PostConfirmationLambdaConstruct',
      {
        librariesLayer: librariesLayer,
        userPool: userPool
      }
    );
    const preSignUpLambda = new PreSignUpLambdaConstruct(
      this,
      'PreSignUpLambdaConstruct',
      {
        librariesLayer: librariesLayer,
        userPool: userPool
      }
    );
    const customMessageLambda = new CustomMessageLambdaConstruct(
      this,
      'CustomMessageLambdaConstruct',
      {
        librariesLayer: librariesLayer
      }
    );

    // Attach Lambda triggers to the User Pool
    // These triggers are called at specific points in the authentication flow
    userPool.addTrigger(
      UserPoolOperation.CREATE_AUTH_CHALLENGE,
      createAuthChallengeLambda.createAuthChallenge
    );
    userPool.addTrigger(
      UserPoolOperation.DEFINE_AUTH_CHALLENGE,
      defineAuthChallengeLambda.defineAuthChallenge
    );
    userPool.addTrigger(
      UserPoolOperation.VERIFY_AUTH_CHALLENGE_RESPONSE,
      verifyAuthChallengeLambda.verifyAuthChallenge
    );
    userPool.addTrigger(
      UserPoolOperation.POST_CONFIRMATION,
      postConfirmationLambda.postConfirmation
    );
    userPool.addTrigger(
      UserPoolOperation.PRE_SIGN_UP,
      preSignUpLambda.preSignUp
    );
    userPool.addTrigger(
      UserPoolOperation.CUSTOM_MESSAGE,
      customMessageLambda.customMessage
    );

    // Create social identity providers
    const providerConstruct = new ProviderConstruct(
      this,
      'ProviderConstruct',
      {
        librariesLayer: librariesLayer,
        userPool: userPool
      }
    );

    // Ensure social providers are created before the app client
    // This is required for the app client to support social login
    userPoolClient.node.addDependency(
      providerConstruct.facebookProvider,
      providerConstruct.googleProvider
    );

    // Output for User Pool
    new CfnOutput(this, 'UserPoolId', {
      value: this.userPoolConstruct.userPool.userPoolId,
      description: `User Pool ID`,
    });

    // Output for User Pool Client
    new CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolConstruct.userPoolClient.userPoolClientId,
      description: `User Pool Client ID`,
    });

    new CfnOutput(this, 'LoginPageUrl', {
      value: `https://ecommerce-cdk-app.auth.${this.region}.amazoncognito.com/login?` +
        `client_id=${this.userPoolConstruct.userPoolClient.userPoolClientId}&` +
        `response_type=code&scope=email+openid+profile&` +
        `redirect_uri=https://ecommerce-app.com`,
      description: 'Login page URL'
    });
  }
}
