import { Handler, VerifyAuthChallengeResponseTriggerEvent } from 'aws-lambda';

/**
 * Lambda handler for Cognito Verify Auth Challenge Response trigger.
 *
 * @param event - VerifyAuthChallengeResponseTriggerEvent containing user response and session information.
 * @returns The updated event object with the verification result for Cognito.
 */
export const handler: Handler = async (
  event: VerifyAuthChallengeResponseTriggerEvent
): Promise<VerifyAuthChallengeResponseTriggerEvent> => {
  console.log(`Verify Auth Challenge Event: ${JSON.stringify(event, null, 2)}`);

  const expectedAnswer = event.request.privateChallengeParameters.challengeCode;
  const challengeAnswer = event.request.challengeAnswer;

  if (challengeAnswer === expectedAnswer) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }

  return event;
};
