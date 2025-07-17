import { Authenticator, View } from '@aws-amplify/ui-react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect, useState } from 'react';

import './App.css';
import AuthProvider from './auth/AuthProvider';
import ProductList from './products/Product';
import { getCurrentUser, type AuthUser } from 'aws-amplify/auth';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const isLoggedIn = !!currentUser;

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, []);

  useEffect(() => {
    if (isLoggedIn && isLoginPage) {
      navigate('/');
    }
  }, [isLoggedIn, isLoginPage, navigate]);

  return (
    <View>
      <View style={{ padding: '1rem' }}>
          {isLoginPage ? (
            <Link
              to="/"
              style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#e0f7e0',
                color: '#333',
                textDecoration: 'none',
                zIndex: 1000,
              }}
            >
              Go Home Page
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9',
                color: '#333',
                textDecoration: 'none',
                zIndex: 1000,
              }}
            >
              Login
            </Link>
          )}
      </View>
      <Routes>
        <Route path="/login" element={<AuthProvider />} />

        <Route
          path="/"
          element={
            <ProductList />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </View>
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
