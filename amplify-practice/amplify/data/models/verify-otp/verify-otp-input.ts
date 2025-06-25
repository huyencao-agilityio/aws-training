import { a } from '@aws-amplify/backend';

export const VerifyOtpInput = {
  // authData:{
  //   ChallengeName: a.string().required(),
  //   Session: a.string().required(),
  // },
  email: a.string().required(),
  otp: a.string().required(),
};
