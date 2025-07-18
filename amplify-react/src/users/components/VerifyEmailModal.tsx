import { View, TextField, Button, Text } from '@aws-amplify/ui-react';
import { confirmUserAttribute } from 'aws-amplify/auth';
import { useState } from 'react';

export default function VerifyEmailModal({
  isOpen,
  onClose,
  onVerified,
}: {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  /**
   * Handles the verification when user is updating their email.
   */
  const handleVerify = async () => {
    setLoading(true);
    setError('');

    try {
      await confirmUserAttribute({
        userAttributeKey: 'email',
        confirmationCode: code,
      });
      onVerified();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      backgroundColor="rgba(0,0,0,0.5)"
      display="flex"
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        backgroundColor="white"
        padding="2rem"
        borderRadius="1rem"
        boxShadow="0 4px 12px rgba(0,0,0,0.2)"
        minWidth="300px"
      >
        <Text fontWeight="bold" marginBottom="1rem">
          Verify your email
        </Text>
        <TextField
          label="Confirmation Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code sent to your email"
        />
        {error && <Text color="red" fontSize="small">{error}</Text>}
        <View marginTop="1rem">
          <Button
            variation="primary"
            onClick={handleVerify}
            isLoading={loading}
          >
            Verify
          </Button>
          <Button
            variation="link"
            onClick={onClose}
            marginLeft="1rem"
          >
            Cancel
          </Button>
        </View>
      </View>
    </View>
  );
}
