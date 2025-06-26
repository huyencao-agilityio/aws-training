import { a } from '@aws-amplify/backend';

export const VerifyOtpInput = {
  authData: a.customType({
    ChallengeName: a.string().required(),
    Session: a.string().required(),
  }),
  email: a.string().required(),
  otp: a.string().required(),
  // authData: a. ({
  //   ChallengeName: a.string().required(),
  //   Session: a.string().required(),
  // }),
};
