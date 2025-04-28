
export const EMAIL_SUBJECT = {
  LOGIN_VERIFICATION_CODE: 'Ecommerce - Login Verification Code',
  PASSWORD_RESET_VERIFICATION_CODE: 'Ecommerce - Password Reset Verification Code',
  VERIFY_NEW_EMAIL: 'Ecommerce - Verify Your New Email Address'
}

/**
 * Generate verification email template
 */
export const verificationEmailTemplate = (userName: string, challengeCode: string) => `
  <html>
    <body>
      <p>Hi ${userName},</p>
      <p>Please use the following verification code to sign into application: ${challengeCode}</p>
      <p>Thanks!</p>
    </body>
  </html>
`;

/**
 * Generates the password reset email template.
 */
export const passwordResetEmailTemplate = (code: string, resetLink: string): string => {
  return `
  <html>
    <body>
      <p>Dear user,</p>

      <p>We received a request to reset the password for your account associated with this email address.</p>
      <p>To proceed, please use the verification code below and follow the link to reset your password:</p>
      <p><b>Verification Code: ${code}</b></p>
      <p><a href="${resetLink}">Reset Your Password Now</a></p>

      <p>If you did not request a password reset, please ignore this email or contact our support team immediately at <a href="mailto:support@example.com">support@example.com</a></p>

      <p>Thank you,</p>
      <p>The Ecommerce Team</p>
    </body>
  </html>
  `;
};

/**
 * Generates the verify new email template.
 */
export const verifyNewEmailTemplate = (code: string, verificationLink: string): string => {
  return `
  <html>
    <body>
      <p>Hi user,</p>

      <p>You've requested to update your email address. Please use the following verification code to confirm your new email:</p>
      <p><b>Your verification code: ${code}</b></p>
      <p><a href="${verificationLink}">Click here to verify your email.</a></p>
      <p>If you didn't request this change, please contact us at <a href="mailto:support@example.com">support@example.com</a></p>

      <p>Thank you,</p>
      <p>The Ecommerce Team</p>
    </body>
  </html>
  `;
};
