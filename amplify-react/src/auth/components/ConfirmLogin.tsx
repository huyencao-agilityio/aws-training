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

  const handleSubmit = async () => {
    await customHandleConfirmSignIn({ challengeResponse });

    const user = await getCurrentUser();
    onAuthenticated(user);
  };

  return (
    <View padding="2rem" maxWidth="400px" margin="auto">
      <Heading level={4}>Enter Challenge Response</Heading>

      <TextField
        label="Challenge Response"
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
