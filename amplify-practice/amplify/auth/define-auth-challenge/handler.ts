import {
  DefineAuthChallengeTriggerEvent,
  DefineAuthChallengeTriggerHandler
} from 'aws-lambda';

import { ChallengeName } from '../../shared/enums/challenge-name.enum';

export const handler: DefineAuthChallengeTriggerHandler = async (
  event: DefineAuthChallengeTriggerEvent
): Promise<DefineAuthChallengeTriggerEvent>  => {
  console.log('DefineAuthChallengeTriggerHandler', JSON.stringify(event));

  if (event.request.session &&
    event.request.session.length === 1 &&
    event.request.session[0].challengeName === ChallengeName.SRP_A &&
    event.request.session[0].challengeResult === true) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = ChallengeName.PASSWORD_VERIFIER;
  } else if (
    event.request.session &&
    event.request.session.length === 2 &&
    event.request.session[1].challengeName === ChallengeName.PASSWORD_VERIFIER &&
    event.request.session[1].challengeResult === true
  ) {
    //If password verification is successful then set next challenge as CUSTOM_CHALLENGE.
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = ChallengeName.CUSTOM_CHALLENGE;
  } else if (
    event.request.session &&
    event.request.session.length === 3 &&
    event.request.session[2].challengeName === ChallengeName.CUSTOM_CHALLENGE &&
    event.request.session[2].challengeResult === true
  ) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  }
  else {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
  }

  return event;
};
