import { useState } from 'react';
import { TextField, Button, View, Flex, Heading } from '@aws-amplify/ui-react';

export default function UserProfileForm(
  { onSubmit }: { onSubmit: (data: any) => void }
) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  return (
    <View
      padding="2rem"
      backgroundColor="white"
      borderRadius="1rem"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
      maxWidth="500px"
      margin="auto">
        <Heading level={4} marginBottom="1rem">
          Update user info
        </Heading>
      <Flex direction="column" gap="1rem">
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          inputStyles={{
            textAlign: 'left',
          }}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          inputStyles={{
            textAlign: 'left',
          }}
        />
        <TextField
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
          inputStyles={{
            textAlign: 'left',
          }}
        />
      </Flex>
      <Button
        variation="primary"
        marginTop="1rem"
        onClick={() => {
          onSubmit({ name, email, address });
        }}
      >
        Submit
      </Button>
    </View>
  );
}
