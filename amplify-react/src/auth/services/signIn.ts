import {
  signIn,
  confirmSignIn,
  type SignInOutput,
  type ConfirmSignInOutput,
  type SignInInput,
  type ConfirmSignInInput,
} from 'aws-amplify/auth';

export async function customSignIn(
  input: SignInInput
): Promise<SignInOutput> {
  const { username, password } = input;

  return await signIn({
    username,
    password,
    options: {
      authFlowType: 'CUSTOM_WITH_SRP',
    },
  });
}

export async function customHandleConfirmSignIn(
  input: ConfirmSignInInput
): Promise<ConfirmSignInOutput> {
  const { challengeResponse } = input;

  return await confirmSignIn({ challengeResponse });
}
