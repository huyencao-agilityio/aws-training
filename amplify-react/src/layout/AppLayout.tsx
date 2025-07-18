import { Button, Flex, Heading, View } from '@aws-amplify/ui-react';
import { getCurrentUser, signOut, type AuthUser } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [path, setPath] = useState(pathname);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, [pathname]);

  useEffect(() => {
    setPath(pathname);
  }, [pathname]);

  const onSignOut = async () => {
    await signOut();
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <View minHeight="100vh" backgroundColor="neutral.10" color="neutral.100">
      <Flex direction="column" alignItems="center">
        {/* Header */}
        <View backgroundColor="brand.primary.80" color="white" width="100%">
          <Flex
          as="header"
          justifyContent="space-between"
          alignItems="center"
          padding="1.5rem"
          maxWidth="40rem"
          margin="0 auto"
        >
          <Heading level={4}>Amplify App</Heading>
          <Flex gap="1rem" alignItems="center">
            {currentUser ? (
              <>
                {path === `/users/${currentUser.userId}` ? (
                  <Link to="/">Go to Home</Link>
                ) : (
                  <Link to={`/users/${currentUser.userId}`}>Edit Profile</Link>
                )}
                <Button variation="link" onClick={onSignOut}>
                  Logout
                </Button>
              </>
            ) : (
              path === '/login' ? (
                <Link to="/">Back to Home</Link>
              ) : (
                <Link to="/login">Login</Link>
              )
            )}
          </Flex>
        </Flex>
      </View>

      {/* Main */}
      <View as="main" padding="2rem" maxWidth="40rem" margin="0 auto" flex="1">
        {children}
      </View>

      {/* Footer */}
      <View
        padding="1rem"
        textAlign="center"
      >
        © 2025 Amplify App. All rights reserved.
      </View>
    </Flex>
  </View>
  );
  // return (
  //   <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
  //     {/* Header */}
  //     <header className="bg-indigo-600 text-white px-6 py-4 shadow">
  //       <div className="max-w-4xl mx-auto flex justify-between items-center">
  //         <h1 className="text-xl font-bold">Amplify App</h1>
  //         <div className="flex gap-4 items-center">
  //           {currentUser ? (
  //             <>
  //               <Link to={`/users/${currentUser.userId}`} className="underline">Edit Profile</Link>
  //               <button onClick={onSignOut} className="underline">Logout</button>
  //             </>
  //           ) : (
  //             <Link to="/login" className="underline">Login</Link>
  //           )}
  //         </div>
  //       </div>
  //     </header>

  //     {/* Main */}
  //     <main className="flex-1 px-6 py-8 max-w-4xl mx-auto">
  //       {children}
  //     </main>

  //     {/* Footer */}
  //     <footer className="bg-gray-100 text-center text-sm text-gray-600 py-4 border-t">
  //       <div className="max-w-4xl mx-auto">
  //         © 2025 Amplify app. All rights reserved.
  //       </div>
  //     </footer>
  //   </div>
  // );
}
