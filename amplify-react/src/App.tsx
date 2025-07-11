import { Authenticator } from '@aws-amplify/ui-react';
import './App.css'
import AuthProvider from './auth/AuthProvider';

export default function App() {
  return  (
    <Authenticator.Provider>
      <AuthProvider />
    </Authenticator.Provider>
  );
}
