import { a } from '@aws-amplify/backend';

export const VerifyOtpRequest = {
  authData: a.customType({
    ChallengeName: a.string().required(),
    Session: a.string().required(),
  }),
  email: a.email().required(),
  otp: a.string().required()
};
