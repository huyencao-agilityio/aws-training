import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import {
  CfnUserPool,
  Mfa,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolEmail,
  UserPoolOperation,
  VerificationEmailStyle } from 'aws-cdk-lib/aws-cognito';
import { CfnUserPoolGroup } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

import { UserPoolConstructProps } from '@interfaces/construct-props.interface';
import { COGNITO } from '@constants/cognito.constant';

import { ProviderConstruct } from './provider.construct';
import {
  CreateAuthChallengeLambdaConstruct
} from '../lambda/cognito/create-auth-challenge.construct';
import {
  DefineAuthChallengeLambdaConstruct
} from '../lambda/cognito/define-auth-challenge.construct';
import {
  VerifyAuthChallengeLambdaConstruct
} from '../lambda/cognito/verify-auth-challenge.construct';
import {
  PostConfirmationLambdaConstruct
} from '../lambda/cognito/post-confirmation.construct';
import {
  PreSignUpLambdaConstruct
} from '../lambda/cognito/pre-sign-up.construct';
import {
  CustomMessageLambdaConstruct
} from '../lambda/cognito/custom-message.construct';

/**
 * Construct for managing Cognito User Pool and its associated resources
 * This construct handles the complete setup of user authentication including:
 * - User Pool configuration (password policy, MFA, email settings)
 * - Custom authentication flows using Lambda triggers
 * - Social identity providers (Facebook, Google)
 * - User groups and permissions
 * - App client configuration with OAuth settings
 */
export class UserPoolConstruct extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    /**
     * Create the User Pool with:
     * Strong password policy
     * Email verification required
     * SES for email delivery
     * Standard attributes for user profile
     */
    this.userPool = new UserPool(this, 'UserPool', {
      userPoolName: COGNITO.USER_POOL_NAME,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: true, mutable: true }
      },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(7),
        passwordHistorySize: 2
      },
      mfa: Mfa.OFF,
      email: UserPoolEmail.withSES({
        fromEmail: COGNITO.EMAIL.FROM,
        sesRegion: props.region
      }),
      removalPolicy: RemovalPolicy.DESTROY,
      userVerification: {
        emailSubject: COGNITO.EMAIL.SUBJECT,
        emailBody: COGNITO.EMAIL.BODY,
        emailStyle: VerificationEmailStyle.LINK
      }
    });

    // Add a custom domain to the User Pool
    this.userPool.addDomain('UserPoolDomain', {
      cognitoDomain: {
        domainPrefix: COGNITO.DOMAIN_PREFIX
      }
    });

    // Create Lambda functions for custom authentication flow
    // These functions handle different stages of the authentication process
    const createAuthChallengeLambda = new CreateAuthChallengeLambdaConstruct(
      this,
      'CreateAuthChallengeLambdaConstruct',
      {
        librariesLayer: props.librariesLayer
      }
    );

    const defineAuthChallengeLambda = new DefineAuthChallengeLambdaConstruct(
      this,
      'DefineAuthChallengeLambdaConstruct',
      {
        librariesLayer: props.librariesLayer
      }
    );

    const verifyAuthChallengeLambda = new VerifyAuthChallengeLambdaConstruct(
      this,
      'VerifyAuthChallengeLambdaConstruct',
      {
        librariesLayer: props.librariesLayer
      }
    );

    // Create Lambda functions for user lifecycle events
    // These functions handle events like sign-up confirmation and pre-signup validation
    const postConfirmationLambda = new PostConfirmationLambdaConstruct(
      this,
      'PostConfirmationLambdaConstruct',
      {
        librariesLayer: props.librariesLayer,
        userPool: this.userPool
      }
    );

    const preSignUpLambda = new PreSignUpLambdaConstruct(
      this,
      'PreSignUpLambdaConstruct',
      {
        librariesLayer: props.librariesLayer,
        userPool: this.userPool
      }
    );

    const customMessageLambda = new CustomMessageLambdaConstruct(
      this,
      'CustomMessageLambdaConstruct',
      {
        librariesLayer: props.librariesLayer
      }
    );

    // Attach Lambda triggers to the User Pool
    // These triggers are called at specific points in the authentication flow
    this.userPool.addTrigger(
      UserPoolOperation.CREATE_AUTH_CHALLENGE,
      createAuthChallengeLambda.createAuthChallenge
    );

    this.userPool.addTrigger(
      UserPoolOperation.DEFINE_AUTH_CHALLENGE,
      defineAuthChallengeLambda.defineAuthChallenge
    );

    this.userPool.addTrigger(
      UserPoolOperation.VERIFY_AUTH_CHALLENGE_RESPONSE,
      verifyAuthChallengeLambda.verifyAuthChallenge
    );

    this.userPool.addTrigger(
      UserPoolOperation.POST_CONFIRMATION,
      postConfirmationLambda.postConfirmation
    );

    this.userPool.addTrigger(
      UserPoolOperation.PRE_SIGN_UP,
      preSignUpLambda.preSignUp
    );

    this.userPool.addTrigger(
      UserPoolOperation.CUSTOM_MESSAGE,
      customMessageLambda.customMessage
    );

    // Configure user attribute update settings
    // This ensures email verification is required before updating email
    const cfnUserPool = this.userPool.node.defaultChild as CfnUserPool;
    cfnUserPool.userAttributeUpdateSettings = {
      attributesRequireVerificationBeforeUpdate: ['email'],
    };

    // Create user groups for role-based access control
    // These groups determine what permissions users have in the system
    new CfnUserPoolGroup(this, 'AdminGroup', {
      groupName: COGNITO.GROUPS.ADMIN.NAME,
      userPoolId: this.userPool.userPoolId,
      description: COGNITO.GROUPS.ADMIN.DESCRIPTION,
    });

    new CfnUserPoolGroup(this, 'UserGroup', {
      groupName: COGNITO.GROUPS.USER.NAME,
      userPoolId: this.userPool.userPoolId,
      description: COGNITO.GROUPS.USER.DESCRIPTION,
    });

    // Create the App Client with OAuth configuration
    // This client is used by applications to authenticate users
    this.userPoolClient = this.userPool.addClient('AppClient', {
      userPoolClientName: COGNITO.CLIENT_NAME,
      accessTokenValidity: Duration.minutes(60),
      idTokenValidity: Duration.minutes(60),
      refreshTokenValidity: Duration.days(5),
      preventUserExistenceErrors: true,
      enableTokenRevocation: true,
      authFlows: {
        custom: true,
        user: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
        UserPoolClientIdentityProvider.FACEBOOK,
        UserPoolClientIdentityProvider.GOOGLE,
      ],
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          OAuthScope.COGNITO_ADMIN,
          OAuthScope.EMAIL,
          OAuthScope.OPENID,
          OAuthScope.PHONE,
          OAuthScope.PROFILE,
        ],
        callbackUrls: [COGNITO.REDIRECT_URI],
        logoutUrls: [COGNITO.LOGOUT_URI],
      },
    });

    // Create social identity providers
    const providerConstruct = new ProviderConstruct(
      this,
      'ProviderConstruct',
      {
        librariesLayer: props.librariesLayer,
        userPool: this.userPool
      }
    );

    // Ensure social providers are created before the app client
    // This is required for the app client to support social login
    this.userPoolClient.node.addDependency(
      providerConstruct.facebookProvider,
      providerConstruct.googleProvider
    );
  }
}
