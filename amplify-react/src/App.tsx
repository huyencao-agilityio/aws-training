import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { getCurrentUser, type AuthUser } from 'aws-amplify/auth';

import ProductList from './products/Product';
import UserProfile from './users/UserProfile';
import Layout from './layout/AppLayout';
import AuthProvider from './auth/AuthProvider';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(
        (user) => {
          console.log('user AppContent', user);
          setCurrentUser(user)
        }
      )
      .catch(() => setCurrentUser(null));
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <ProductList />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout>
            <AuthProvider />
          </Layout>
        }
      />
      <Route
        path="/users/:userId"
        element={
          <Layout>
            <UserProfile user={currentUser} />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Authenticator.Provider>
      <Router>
        <AppContent />
      </Router>
    </Authenticator.Provider>
  );
}
