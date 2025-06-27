import type { Handler } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const clientId = process.env.CLIENT_ID || '';
const cognito = new CognitoIdentityServiceProvider();

/**
 * Verify the OTP for a user
 *
 * @param event - The event object
 * @param context - The context object
 * @returns The verify OTP response
 */
export const handler: Handler = async (event, context) => {
  console.log(`Verify OTP Event: ${JSON.stringify(event)}`);

  try {
    const { authData, email, otp } = event.arguments;
    const params = {
      ChallengeName: authData?.ChallengeName,
      ChallengeResponses: {
        ANSWER: otp,
        USERNAME: email
      },
      ClientId: clientId,
      Session: authData?.Session
    };
    const result = await cognito.respondToAuthChallenge(params).promise();

    return result?.AuthenticationResult;
  } catch (err) {
    console.error('Verify OTP error:', err);

    return {
      success: false,
      message: 'Verify OTP failed. Please check your OTP.',
    };
  }
};
