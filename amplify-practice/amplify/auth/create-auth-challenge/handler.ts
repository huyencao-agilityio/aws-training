import {
  CreateAuthChallengeTriggerEvent,
  CreateAuthChallengeTriggerHandler
} from 'aws-lambda';
import { SES } from 'aws-sdk';

import {
  EMAIL_SUBJECT,
  verificationEmailTemplate
} from '../../shared/constants/email.constant';

const ses = new SES();

export const handler: CreateAuthChallengeTriggerHandler = async (
  event: CreateAuthChallengeTriggerEvent
): Promise<CreateAuthChallengeTriggerEvent> => {
  console.log('CreateAuthChallengeTriggerHandler', JSON.stringify(event));

  const defaultEmail = process.env.DEFAULT_EMAIL;
  if (!defaultEmail) {
    throw new Error('DEFAULT_EMAIL environment variable is not set');
  }

  const email = event.request.userAttributes.email;
  const userName = email.split('@')[0];
  const challengeCode =
    process.env.CHALLENGE_CODE ||
    Math.floor(100000 + Math.random() * 900000).toString();

  event.response.publicChallengeParameters = { email: email };
  event.response.privateChallengeParameters = { challengeCode: challengeCode };
  event.response.challengeMetadata = challengeCode;

  const emailBody = verificationEmailTemplate(userName, challengeCode);
  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: { Data: emailBody },
      },
      Subject: { Data: EMAIL_SUBJECT.LOGIN_VERIFICATION_CODE },
    },
    Source: defaultEmail,
  };
  try {
    if (!params.Source) {
      throw new Error('Source email is required');
    }

    const result = await ses.sendEmail(params).promise();

    console.log(`Email sent successfully: ${result}`);
  } catch (err) {
    console.error(`Error sending email: ${err}`);
  }

  return event;
};
