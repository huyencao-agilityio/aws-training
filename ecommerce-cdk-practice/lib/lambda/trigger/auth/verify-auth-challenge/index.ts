import { Handler, VerifyAuthChallengeResponseTriggerEvent } from 'aws-lambda';

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
