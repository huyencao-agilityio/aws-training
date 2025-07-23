import {
  Button,
  Flex,
  Heading,
  useAuthenticator
} from '@aws-amplify/ui-react';
import { View } from '@aws-amplify/ui-react';
import { resendSignUpCode } from 'aws-amplify/auth';

export default function ConfirmSignUp({
  onClose
}: {
  onClose: () => void
}) {
  const { username } = useAuthenticator((context) => [context.username]);

  /**
   * Handles the resend of the verification email
     */
  const handleResend = async () => {
    try {
      await resendSignUpCode({ username: username || '' });
      alert(`Verification email have resent to ${username}`);
    } catch (err) {
      console.error(err);
      alert('Failed to resend confirmation email');
    }
  };

    return (
      <View
        display="flex"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          backgroundColor="white"
          padding="2rem"
          maxWidth="400px"
          borderRadius="1rem"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
          position="relative"
          textAlign="center"
        >
          <Heading level={2}>Verify email</Heading>
          <View marginBottom="1.5rem">
              We have sent a verification email to your email address.
              Please check your inbox and click the verification link.
          </View>

          <Flex gap="1rem" justifyContent="center">
            <Button variation="primary" onClick={onClose}>
              Back to Sign In
            </Button>
            <Button onClick={handleResend}>
              Resend email
            </Button>
          </Flex>
        </View>
      </View>
  );
}
