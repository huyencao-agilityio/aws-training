import {
  CustomMessageTriggerEvent,
  CustomMessageTriggerHandler
} from 'aws-lambda';

import {
  EMAIL_SUBJECT,
  passwordResetEmailTemplate,
  verifyNewEmailTemplate
} from '../../shared/constants/email.constant';
import { BASE_URL } from '../../shared/constants/domain.constant';
import { CustomMessageTrigger } from '../../shared/enums/custom-message.enum';

export const handler: CustomMessageTriggerHandler = async (
  event: CustomMessageTriggerEvent
): Promise<CustomMessageTriggerEvent> => {
  console.log('CustomMessageTriggerHandler', JSON.stringify(event));

  const { request } = event;
  const email = request.usernameParameter;
  const code = request.codeParameter;

  if (
    event.triggerSource === CustomMessageTrigger.FORGOT_PASSWORD
  ) {
    const resetLink = `${BASE_URL}/reset-password?code=${code}&email=${email}`;

    event.response.emailSubject = EMAIL_SUBJECT.PASSWORD_RESET_VERIFICATION_CODE;
    event.response.emailMessage = passwordResetEmailTemplate(code, resetLink);
  } else if (
    event.triggerSource === CustomMessageTrigger.UPDATE_USER_ATTRIBUTE
  ) {
    const verificationLink = `${BASE_URL}/verify-email?code=${code}&email=${email}`

    event.response.emailSubject = EMAIL_SUBJECT.VERIFY_NEW_EMAIL;
    event.response.emailMessage = verifyNewEmailTemplate(code, verificationLink);
  }

  return event;
};
