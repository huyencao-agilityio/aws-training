import {
  Authenticator,
  Button,
  useAuthenticator,
  View,
} from '@aws-amplify/ui-react';
import {
  getCurrentUser,
  signOut,
  type SignInInput,
  type SignInOutput
} from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ConfirmSignUp from './components/ConfirmSignUp';
import { customSignIn } from './services/signIn';
import ConfirmLogin from './components/ConfirmLogin';
import UserProfile from '../users/UserProfile';

export default function AuthProvider() {

  const { route } = useAuthenticator();

  const [step, setStep] = useState<'SIGN_IN' | 'CUSTOM_CHALLENGE' | 'AUTHENTICATED'|'EMAIL_NOT_VERIFIED'>('SIGN_IN');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [username, setUsername] = useState<string>('');
  const navigate = useNavigate();
  const { pathname } = useLocation();

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

  useEffect(() => {
    if (step === 'AUTHENTICATED' && location.pathname === '/login') {
      navigate('/');
    }
  }, [step, navigate, pathname]);

  const services = {

    async handleSignIn(input: SignInInput): Promise<SignInOutput> {
      // eslint-disable-next-line no-useless-catch
      try {
        const result = await customSignIn(input);
        setUsername(input.username);

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

  const handleSignOut = async () => {
    await signOut();
    setCurrentUser(null);
    setStep('SIGN_IN');
    navigate('/');
  };

  // Custom confirm sign up form when sign up
  if (route === 'confirmSignUp' || step === 'EMAIL_NOT_VERIFIED') {
    return <ConfirmSignUp
      username={username}
      onBack={() => setStep('SIGN_IN')}
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

  if (step === 'AUTHENTICATED' && currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        {/* Header */}
        <header className="bg-indigo-600 text-white px-6 py-4 shadow">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">User Profile</h1>
            <Button
              onClick={handleSignOut}
              variation="link"
            >
              Sign out
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <UserProfile user={currentUser} />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 text-center text-sm text-gray-600 py-4 border-t">
          <div className="max-w-4xl mx-auto">
            © 2025 Amplify app. All rights reserved.
          </div>
        </footer>
      </div>
    );
  }

  // return (
  //   <>
  //     {!showLogin && (
  //       <View position="absolute" top="1rem" right="1rem">
  //         <Button onClick={() => setShowLogin(true)}>Login</Button>
  //       </View>
  //     )}
  //     {showLogin && (
  //       <Authenticator services={services}>
  //         {({ signOut, user }) => (
  //           <div className="p-4">
  //             <p>Welcome, {user?.username}</p>
  //             <button onClick={signOut}>Sign out</button>
  //           </div>
  //         )}
  //       </Authenticator>
  //     )}
  //   </>
  // );

  return (
    <Authenticator services={services}>
      {({ signOut, user }) => (
        <main className="p-4">
          <h1>Welcome, {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}
