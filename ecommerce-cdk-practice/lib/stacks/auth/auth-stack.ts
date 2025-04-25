import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  UserPool,
  UserPoolClient,
  UserPoolEmail,
  VerificationEmailStyle,
  UserPoolIdentityProviderGoogle,
  UserPoolIdentityProviderFacebook,
  Mfa,
  UserPoolClientIdentityProvider,
  OAuthScope,
  CfnUserPoolGroup,
  ProviderAttribute,
  CfnUserPool
} from 'aws-cdk-lib/aws-cognito';
import { LayerVersion, Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

import 'dotenv/config';
import path = require('path');
export class AuthStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const layerArn = StringParameter.valueForStringParameter(this, '/lambda/layer/LibrariesLayerArn');
    const librariesLayer = LayerVersion.fromLayerVersionArn(this, 'LibrariesLayer', layerArn);

    const defaultEmail = process.env.DEFAULT_EMAIL || '';
    const dbHost = process.env.DB_HOST || '';
    const dbName = process.env.DB_NAME || '';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbUser= process.env.DB_USER || '';
    const fbClientId = process.env.FB_CLIENT_ID || '';
    const fbClientSecret = process.env.FB_CLIENT_SECRET || '';
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const challengeCode = process.env.CHALLENGE_CODE || '';
    // Lambda for Create Auth Challenge
    const createAuthChallengeLambda = new Function(this, 'CreateAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      layers: [librariesLayer],
      code: Code.fromAsset(path.join(__dirname, '../../../dist/lib/lambda/trigger/auth/create-auth-challenge/')),
      environment: {
        DEFAULT_EMAIL: defaultEmail,
        CHALLENGE_CODE: challengeCode
      },
    });

    // Lambda for Define Auth Challenge
    const defineAuthChallengeLambda = new Function(this, 'DefineAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      layers: [librariesLayer],
      code: Code.fromAsset(path.join(__dirname, '../../../dist/lib/lambda/trigger/auth/define-auth-challenge/')),
      timeout: Duration.minutes(15),
    });

    // Lambda for Verify Auth Challenge
    const verifyAuthChallengeLambda = new Function(this, 'VerifyAuthChallengeLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      layers: [librariesLayer],
      code: Code.fromAsset(path.join(__dirname, '../../../dist/lib/lambda/trigger/auth/verify-auth-challenge/'))
    });

    // Lambda for Custom Message
    const customMessageLambda = new Function(this, 'CustomMessageLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      layers: [librariesLayer],
      code: Code.fromAsset(path.join(__dirname, '../../../dist/lib/lambda/trigger/auth/custom-message/')),
    });

    // Lambda for Custom Message
    const postConfirmationLambda = new Function(this, 'PostConfirmationLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      layers: [librariesLayer],
      code: Code.fromAsset(path.join(__dirname, '../../../dist/lib/lambda/trigger/auth/post-confirmation/')),
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser
      },
      timeout: Duration.minutes(15),
    });

    // Lambda for Custom Message
    const preSignUpLambda = new Function(this, 'PreSignUpLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      layers: [librariesLayer],
      code: Code.fromAsset(path.join(__dirname, '../../../dist/lib/lambda/trigger/auth/pre-sign-up/')),
      environment: {
        DB_HOST: dbHost,
        DB_NAME: dbName,
        DB_PASSWORD: dbPassword,
        DB_USER: dbUser
      },
      timeout: Duration.minutes(15),
    });

    // User Pool
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
        sesRegion: this.region
      }),
      removalPolicy: RemovalPolicy.DESTROY,
      lambdaTriggers: {
        createAuthChallenge: createAuthChallengeLambda,
        defineAuthChallenge: defineAuthChallengeLambda,
        verifyAuthChallengeResponse: verifyAuthChallengeLambda,
        customMessage: customMessageLambda,
        postConfirmation: postConfirmationLambda,
        preSignUp: preSignUpLambda
      },
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

    // Identity Providers: Facebook, Google
    const facebookProvider = new UserPoolIdentityProviderFacebook(this, 'FacebookProvider', {
      clientId: fbClientId,
      clientSecret: fbClientSecret,
      userPool: this.userPool,
      scopes: ['public_profile', 'email'],
      attributeMapping: {
        email: ProviderAttribute.FACEBOOK_EMAIL,
        givenName: ProviderAttribute.FACEBOOK_NAME
      }
    });

    const googleProvider = new UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      userPool: this.userPool,
      scopes: ['profile', 'email', 'openid'],
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
        givenName: ProviderAttribute.GOOGLE_NAME,
        emailVerified: ProviderAttribute.GOOGLE_EMAIL_VERIFIED
      }
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

    // Ensure providers are created before client
    this.userPoolClient.node.addDependency(facebookProvider, googleProvider);

    // Add role policy for Lambda functions
    createAuthChallengeLambda.addToRolePolicy(new PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*'],
      effect: Effect.ALLOW
    }));

    preSignUpLambda.addToRolePolicy(new PolicyStatement({
      actions: [
        'cognito-idp:ListUsers',
        'cognito-idp:AdminLinkProviderForUser',
        'cognito-idp:AdminDeleteUser'
      ],
      resources: [this.userPool.userPoolArn],
      effect: Effect.ALLOW
    }));

    postConfirmationLambda.addToRolePolicy(new PolicyStatement({
      actions: [
        'cognito-idp:AdminAddUserToGroup'
      ],
      resources: [this.userPool.userPoolArn],
      effect: Effect.ALLOW
    }));

    // Output
    new CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: `User Pool ID`,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: `User Pool Client ID`,
    });

    new CfnOutput(this, 'LoginPageUrl', {
      value: `https://ecommerce-cdk-app.auth.${this.region}.amazoncognito.com/login?client_id=${this.userPoolClient.userPoolClientId}&response_type=code&scope=email+openid+profile&redirect_uri=https://ecommerce-app.com`,
      description: 'Login page URL'
    });
  }
}
