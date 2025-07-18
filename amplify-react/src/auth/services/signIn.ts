import {
  signIn,
  confirmSignIn,
  type SignInOutput,
  type ConfirmSignInOutput,
  type SignInInput,
  type ConfirmSignInInput,
} from 'aws-amplify/auth';

/**
 * Custom sign in process of Cognito
 *
 * @param input The sign in input
 * @returns The sign in output
 */
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

/**
 * Custom handle confirm sign in process of Cognito
 *
 * @param input The confirm sign in input
 * @returns The confirm sign in output
 */
export async function customHandleConfirmSignIn(
  input: ConfirmSignInInput
): Promise<ConfirmSignInOutput> {
  const { challengeResponse } = input;

  return await confirmSignIn({ challengeResponse });
}
