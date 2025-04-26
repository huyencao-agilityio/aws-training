import { Handler, CustomMessageTriggerEvent } from 'aws-lambda';

export const handler: Handler = async (
  event: CustomMessageTriggerEvent
): Promise<CustomMessageTriggerEvent> => {
  console.log('Cognito custom message', JSON.stringify(event));

  const { request } = event;
  const email = request.usernameParameter;
  const code = request.codeParameter;

  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    const resetLink = `https://ecommerce-app.com/reset-password?code=${code}&email=${email}`;

    event.response.emailSubject = 'Ecommerce - Password Reset Verification Code';
    event.response.emailMessage = `
    <p>Dear user,</p>

    <p>We received a request to reset the password for your account associated with this email address.</p>
    <p>To proceed, please use the verification code below and follow the link to reset your password:</p>
    <p><b>Verification Code: ${code}</b></p>
    <p><a href="${resetLink}">Reset Your Password Now</a></p>

    <p>If you did not request a password reset, please ignore this email or contact our support team immediately at <a href="mailto:support@example.com">support@example.com</a></p>

    <p>Thank you,</p>
    <p>The Ecommerce Team</p>
    `;
  } else if (event.triggerSource === 'CustomMessage_UpdateUserAttribute') {
    const verificationLink = `https://ecommerce-app.com/verify-email?code=${code}&email=${email}`

    event.response.emailSubject = 'Ecommerce - Verify Your New Email Address';
    event.response.emailMessage = `
      <p>Hi user,</p>

      <p>You've requested to update your email address. Please use the following verification code to confirm your new email:</p>
      <p><b>Your verification code: ${code}</b></p>
      <p><a href="${verificationLink}">Click here to verify your email.</a></p>
      <p>If you didn't request this change, please contact us at <a href="mailto:support@example.com">support@example.com</a></p>

      <p>Thank you,</p>
      <p>The Ecommerce Team</p>
    `;
  }

  return event;
};
