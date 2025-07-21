import {
  Authenticator,
  useAuthenticator,
} from '@aws-amplify/ui-react';
import {
  getCurrentUser,
  type AuthUser,
  type SignInInput,
  type SignInOutput
} from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ConfirmSignUp from './components/ConfirmSignUp';
import { customSignIn } from './services/signIn';
import ConfirmLogin from './components/ConfirmLogin';
import UserProfile from '../users/UserProfile';
import Layout from '../layout/AppLayout';

export default function AuthProvider() {
  const { route } = useAuthenticator();
  const [step, setStep] = useState<
    'SIGN_IN' |
    'CUSTOM_CHALLENGE' |
    'AUTHENTICATED' |
    'EMAIL_NOT_VERIFIED'
  >('SIGN_IN');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toSignIn } = useAuthenticator();

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        setStep('AUTHENTICATED');
      })
      .catch(() => {
        setCurrentUser(null);
        setStep('SIGN_IN');
      });
  }, []);

  // Handle flow when user is authenticated
  useEffect(() => {
    if (
      step === 'AUTHENTICATED'
      && currentUser &&
      location.pathname === '/login'
    ) {
      navigate('/');
    }
  }, [step, navigate, pathname, currentUser]);

  // Override default services
  const services = {
    /**
     * Handles the sign in process
     *
     * @param input The sign in input
     * @returns The sign in output
     */
    async handleSignIn(input: SignInInput): Promise<SignInOutput> {
      // eslint-disable-next-line no-useless-catch
      try {
        const result = await customSignIn(input);

        if (
          result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE'
        ) {
          setStep('CUSTOM_CHALLENGE');
        }

        // Prevent send email verify again when user use account that is not verified
        // User need to verify email before login
        // Or if verify link expired, user need to request new link
        if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
          setStep('EMAIL_NOT_VERIFIED');
          return {
            isSignedIn: false,
            nextStep: {
              signInStep: 'EMAIL_NOT_VERIFIED',
            },
          } as unknown as SignInOutput;
        }

        return result;
      } catch (error: unknown) {
        throw error;
      }
    }
  }

  // Custom confirm sign up form when sign up
  if (route === 'confirmSignUp' || step === 'EMAIL_NOT_VERIFIED') {
    return <ConfirmSignUp
      onClose={
        () => {
          setStep('SIGN_IN');
          toSignIn();
        }
      }
    />;
  }

  // Custom confirm OTP form when login
  if (step === 'CUSTOM_CHALLENGE') {
    return <ConfirmLogin
      onAuthenticated={(user) => {
        setCurrentUser(user);
        setStep('AUTHENTICATED');
      }}
    />;
  }

  // Handle flow when user is authenticated
  if (step === 'AUTHENTICATED' && currentUser) {
    if (location.pathname === '/login') {
      return null;
    }

    return (
      <Layout>
        <UserProfile user={currentUser} />
      </Layout>
    );
  }

  return (
    <Authenticator services={services}>
      {({ user }) => (
        <Layout>
          <UserProfile user={user} />
        </Layout>
      )}
    </Authenticator>
  );
}
