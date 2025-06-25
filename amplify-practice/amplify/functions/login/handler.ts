import type { Handler } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import {
  InitiateAuthResponse
} from 'aws-sdk/clients/cognitoidentityserviceprovider';

const UserPoolSRPClient = require('amazon-user-pool-srp-client');

const userPoolId = process.env.USER_POOL_ID  || '';
const userPoolShortId = userPoolId.split('_')[1];
const clientId = process.env.CLIENT_ID || '';

const cognito = new CognitoIdentityServiceProvider();

async function initiateAuth(email: string, srp: any) {
  const SRP_A = srp.calculateA();
  const params = {
    AuthFlow: 'CUSTOM_AUTH',
    ClientId: clientId,
    AuthParameters: {
      CHALLENGE_NAME: 'SRP_A',
      USERNAME: email,
      SRP_A: SRP_A
    }
  };

  return await cognito.initiateAuth(params).promise();
}

async function verifyPassword(
  authData: InitiateAuthResponse,
  password: string,
  srp: any
) {
  const { ChallengeName, ChallengeParameters, Session } = authData;

  if (!ChallengeName) {
    throw new Error('ChallengeName is undefined');
  }

  if (
    !ChallengeParameters?.USER_ID_FOR_SRP ||
    !ChallengeParameters?.SECRET_BLOCK ||
    !ChallengeParameters?.SRP_B ||
    !ChallengeParameters?.SALT
  ) {
    throw new Error('Missing challenge parameters');
  }

  const hkdf = srp.getPasswordAuthenticationKey(
    ChallengeParameters.USER_ID_FOR_SRP,
    password,
    ChallengeParameters.SRP_B,
    ChallengeParameters.SALT
  );
  const dateNow = UserPoolSRPClient.getNowString();
  const signatureString = UserPoolSRPClient.calculateSignature(
    hkdf,
    userPoolShortId,
    ChallengeParameters.USER_ID_FOR_SRP,
    ChallengeParameters.SECRET_BLOCK,
    dateNow
  );

  const params = {
    ChallengeName: ChallengeName,
    ChallengeResponses: {
      TIMESTAMP: dateNow,
      USERNAME: ChallengeParameters.USERNAME,
      PASSWORD_CLAIM_SIGNATURE: signatureString,
      PASSWORD_CLAIM_SECRET_BLOCK: ChallengeParameters.SECRET_BLOCK
    },
    ClientId: clientId,
    Session: Session
  };

  return await cognito.respondToAuthChallenge(params).promise();
}

export const handler: Handler = async (event, context) => {
  console.log(`Login: ${JSON.stringify(event)}`);

  const { email, password } = event.arguments;

  try {
    const srp = new UserPoolSRPClient.SRPClient(userPoolShortId);

    const authData = await initiateAuth(email, srp);
    const result = await verifyPassword(authData, password, srp);

    return result;
  } catch (err) {
    console.error('Login error:', err);

    return {
      success: false,
      message: 'Login failed. Please check your credentials.',
    };
  }
};
