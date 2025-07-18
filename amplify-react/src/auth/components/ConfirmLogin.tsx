import { Button, Heading, TextField, View } from '@aws-amplify/ui-react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useState } from 'react';

import { customHandleConfirmSignIn } from '../services/signIn';

export default function ConfirmLogin({
  onAuthenticated,
}: {
  onAuthenticated: (user: any) => void;
}
) {
  const [challengeResponse, setChallengeResponse] = useState('');

  /**
   * Handles the submission of the challenge response
   */
  const handleSubmit = async () => {
    await customHandleConfirmSignIn({ challengeResponse });

    const user = await getCurrentUser();
    onAuthenticated(user);
  };

  return (
    <View
      padding="2rem"
      maxWidth="400px"
      margin="auto"
      style={{
        borderRadius: '1rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
      }}
    >
      <Heading level={4}>Enter Verification Code</Heading>
      <TextField
        label=""
        placeholder="Enter your response"
        value={challengeResponse}
        onChange={(e) => setChallengeResponse(e.target.value)}
        marginTop="1rem"
      />
      <Button
        variation="primary"
        marginTop="1rem"
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </View>
  );
}
