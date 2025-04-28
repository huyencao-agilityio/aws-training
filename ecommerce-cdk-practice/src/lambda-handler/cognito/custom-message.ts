import { Handler, CustomMessageTriggerEvent } from 'aws-lambda';

import {
  EMAIL_SUBJECT,
  passwordResetEmailTemplate,
  verifyNewEmailTemplate
} from '@constants/email.constant';
import { CustomMessageTrigger } from '@enums/custom-message.enum';

/**
 * Lambda handler for Cognito Custom Message trigger.
 *
 * @param event - CustomMessageTriggerEvent containing user and trigger information.
 * @returns The updated event object with customized message content.
 */
export const handler: Handler = async (
  event: CustomMessageTriggerEvent
): Promise<CustomMessageTriggerEvent> => {
  console.log('Cognito custom message', JSON.stringify(event));

  const { request } = event;
  const email = request.usernameParameter;
  const code = request.codeParameter;

  if (event.triggerSource === CustomMessageTrigger.FORGOT_PASSWORD) {
    const resetLink = `https://ecommerce-app.com/reset-password?code=${code}&email=${email}`;

    event.response.emailSubject = EMAIL_SUBJECT.PASSWORD_RESET_VERIFICATION_CODE;
    event.response.emailMessage = passwordResetEmailTemplate(code, resetLink);
  } else if (event.triggerSource === CustomMessageTrigger.UPDATE_USER_ATTRIBUTE) {
    const verificationLink = `https://ecommerce-app.com/verify-email?code=${code}&email=${email}`

    event.response.emailSubject = EMAIL_SUBJECT.VERIFY_NEW_EMAIL;
    event.response.emailMessage = verifyNewEmailTemplate(code, verificationLink);
  }

  return event;
};
