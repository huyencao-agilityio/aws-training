import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

import ConfirmSignUp from './components/ConfirmSignUp';

export default function AuthProvider() {

  const { route } = useAuthenticator();

  if (route === 'confirmSignUp') {
    return <ConfirmSignUp />;
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="p-4">
          <h1>Welcome, {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}
