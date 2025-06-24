import type { Handler } from 'aws-lambda';

import { CognitoIdentityServiceProvider } from 'aws-sdk';
import {
  SRPClient,
  getNowString,
  calculateSignature,
  UserPoolSRPClient
} from 'amazon-user-pool-srp-client';
import { InitiateAuthResponse } from 'aws-sdk/clients/cognitoidentityserviceprovider';

const userPoolId = 'us-east-1_XXXXX';
const clientId = 'XXXXXXXXXXXX';

const cognito = new CognitoIdentityServiceProvider();
// const srp = new UserPoolSRPClient.SRPClient(userPoolId)

async function initiateAuth(email: string, srp: SRPClient) {
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
  srp: SRPClient
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
    userPoolId,
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
  const { email, password } = event.arguments;

  try {
    const srp = new SRPClient(userPoolId);

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
