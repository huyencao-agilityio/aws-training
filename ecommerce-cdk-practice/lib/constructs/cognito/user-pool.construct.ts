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

import { UserPoolConstructProps } from '@interface/construct-props.interface';

import { ProviderConstruct } from './provider.construct';
import { CreateAuthChallengeLambdaConstruct } from '../lambda/cognito/create-auth-challenge.construct';
import { DefineAuthChallengeLambdaConstruct } from '../lambda/cognito/define-auth-challenge.construct';
import { VerifyAuthChallengeLambdaConstruct } from '../lambda/cognito/verify-auth-challenge.construct';
import { PostConfirmationLambdaConstruct } from '../lambda/cognito/post-confirmation.construct';
import { PreSignUpLambdaConstruct } from '../lambda/cognito/pre-sign-up.construct';
import { CustomMessageLambdaConstruct } from '../lambda/cognito/custom-message.construct';

export class UserPoolConstruct extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: UserPoolConstructProps) {
    super(scope, id);

    this.userPool = new UserPool(this, 'UserPool', {
      userPoolName: `EcommerceUserPoolCDK`,
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
        fromEmail: 'thanhhuyen11cntt1@gmail.com',
        sesRegion: props.region
      }),
      removalPolicy: RemovalPolicy.DESTROY,
      userVerification: {
        emailSubject: 'Ecommerce - Verification email address',
        emailBody: 'Please click the link below to verify your email address. {##Verify Email##}',
        emailStyle: VerificationEmailStyle.LINK
      }
    });

    // Add domain to user pool
    this.userPool.addDomain('UserPoolDomain', {
      cognitoDomain: {
        domainPrefix: 'ecommerce-cdk-app'
      }
    });

    const createAuthChallengeLambda = new CreateAuthChallengeLambdaConstruct(this, 'CreateAuthChallengeLambdaConstruct', {
      librariesLayer: props.librariesLayer
    });
    const defineAuthChallengeLambda = new DefineAuthChallengeLambdaConstruct(this, 'DefineAuthChallengeLambdaConstruct', {
      librariesLayer: props.librariesLayer
    });
    const verifyAuthChallengeLambda = new VerifyAuthChallengeLambdaConstruct(this, 'VerifyAuthChallengeLambdaConstruct', {
      librariesLayer: props.librariesLayer,
    });
    const postConfirmationLambda = new PostConfirmationLambdaConstruct(this, 'PostConfirmationLambdaConstruct', {
      librariesLayer: props.librariesLayer,
      userPool: this.userPool
    });
    const preSignUpLambda = new PreSignUpLambdaConstruct(this, 'PreSignUpLambdaConstruct', {
      librariesLayer: props.librariesLayer,
      userPool: this.userPool
    });
    const customMessageLambda = new CustomMessageLambdaConstruct(this, 'CustomMessageLambdaConstruct', {
      librariesLayer: props.librariesLayer
    });

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

    // Update user attribute update settings to require verification before update
    const cfnUserPool = this.userPool.node.defaultChild as CfnUserPool;

    cfnUserPool.userAttributeUpdateSettings = {
      attributesRequireVerificationBeforeUpdate: ['email'],
    };

    // Groups: admin and user
    new CfnUserPoolGroup(this, 'AdminGroup', {
      groupName: 'Admin',
      userPoolId: this.userPool.userPoolId,
      description: 'Admin group with elevated permissions',
    });

    new CfnUserPoolGroup(this, 'UserGroup', {
      groupName: 'User',
      userPoolId: this.userPool.userPoolId,
      description: 'Standard user group',
    });

    // App Client
    this.userPoolClient = this.userPool.addClient('AppClient', {
      userPoolClientName: `EcommerceUserPool`,
      accessTokenValidity: Duration.minutes(60),
      idTokenValidity: Duration.minutes(60),
      refreshTokenValidity: Duration.days(5),
      // Prevent user existence errors
      preventUserExistenceErrors: true,
      enableTokenRevocation: true,
      authFlows: {
        custom: true, // ALLOW_CUSTOM_AUTH
        user: true, // ALLOW_USER_AUTH
        userSrp: true, // ALLOW_USER_SRP_AUTH
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
        callbackUrls: ['https://ecommerce-app.com'],
        logoutUrls: ['https://ecommerce-app.com/logout'],
      },
    });

    const providerConstruct = new ProviderConstruct(this, 'ProviderConstruct', {
      librariesLayer: props.librariesLayer,
      userPool: this.userPool
    });

    // Ensure providers are created before client
    this.userPoolClient.node.addDependency(providerConstruct.facebookProvider, providerConstruct.googleProvider);
  }
}
