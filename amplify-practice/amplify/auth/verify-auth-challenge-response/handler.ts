import {
  VerifyAuthChallengeResponseTriggerEvent,
  VerifyAuthChallengeResponseTriggerHandler
} from 'aws-lambda';

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (
  event: VerifyAuthChallengeResponseTriggerEvent
): Promise<VerifyAuthChallengeResponseTriggerEvent> => {
  console.log('VerifyAuthChallengeResponseTriggerHandler', JSON.stringify(event));

  const expectedAnswer = event.request.privateChallengeParameters.challengeCode;
  const challengeAnswer = event.request.challengeAnswer;

  if (challengeAnswer === expectedAnswer) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }

  return event;
};
