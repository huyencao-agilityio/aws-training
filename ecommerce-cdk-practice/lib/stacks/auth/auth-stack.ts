import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  UserPool,
  UserPoolClient,
  UserPoolEmail,
  VerificationEmailStyle,
  Mfa,
  UserPoolClientIdentityProvider,
  OAuthScope,
  CfnUserPoolGroup
} from 'aws-cdk-lib/aws-cognito';

export class AuthStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

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
        givenName: {
          required: true,
          mutable: true
        },
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
      userVerification: {
        emailSubject: 'Ecommerce - Verification email address',
        emailBody: 'Please click the link below to verify your email address. {##Verify Email##}',
        emailStyle: VerificationEmailStyle.LINK
      },
    });

    // Groups: admin and user
    new CfnUserPoolGroup(this, 'AdminGroup', {
      groupName: 'admin',
      userPoolId: this.userPool.userPoolId,
      description: 'Admin group with elevated permissions',
    });

    new CfnUserPoolGroup(this, 'UserGroup', {
      groupName: 'user',
      userPoolId: this.userPool.userPoolId,
      description: 'Standard user group',
    });

    // App Client
    this.userPoolClient = this.userPool.addClient('AppClient', {
      userPoolClientName: `EcommerceUserPool`,
      authFlows: {
        custom: true, // ALLOW_CUSTOM_AUTH
        user: true, // ALLOW_USER_AUTH
        userSrp: true, // ALLOW_USER_SRP_AUTH
      },
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO
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

    // Output
    new CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: `User Pool ID`,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: `User Pool Client ID`,
    });
  }
}
