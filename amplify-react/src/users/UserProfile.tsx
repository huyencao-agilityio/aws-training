import { Flex, View } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

import { updateUser } from './graphql/mutations';
import AvatarUploader from './components/AvatarUploader';
import UserProfileForm from './components/UserProfileForm';

const client = generateClient();

export default function UserProfile({ user }: { user: any }) {
  const updateUserInfo = async (input: any) => {
    try {
      const { userId } = await getCurrentUser();

      const filtered = Object.fromEntries(
        Object.entries(input).filter(([_, v]) => typeof v === 'string' && v.trim() !== '')
      );

      const result = await client.graphql({
        query: updateUser,
        variables: { id: userId, ...filtered   },
      });

      console.log('User info updated:', result);
    } catch (err) {
      console.error('Error uploading user info:', err);
    }
  };

  const handleAvatarUploaded = async (path: string) => {
    const thumbnailPath = path.replace(/^avatars\//, 'thumbnails/');

    await updateUserInfo({
      avatar: path,
      thumbnail: thumbnailPath,
    });
  };

  return (
    <View as="div" padding="1rem">
      <Flex direction="row" alignItems="flex-start">
        <AvatarUploader user={user} onAvatarUploaded={handleAvatarUploaded} />
        <UserProfileForm onSubmit={updateUserInfo}/>
      </Flex>
    </View>
  )
}
