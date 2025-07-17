import { Flex, View } from '@aws-amplify/ui-react';
import { generateClient, type GraphQLResult } from 'aws-amplify/api';
import { getCurrentUser, updateUserAttributes } from 'aws-amplify/auth';

import { updateUser } from './graphql/mutations';
import AvatarUploader from './components/AvatarUploader';
import UserProfileForm from './components/UserProfileForm';
import { useState } from 'react';
import VerifyEmailModal from './components/VerifyEmailModal';

const client = generateClient();

export default function UserProfile({ user }: { user: any }) {
  const [currentUser, setCurrentUser] = useState(user);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  /**
   * Updates the user's info.
   *
   * @param input The input to update the user's info.
   */
  const updateUserInfo = async (input: any) => {
    try {
      const { userId } = await getCurrentUser();

      const filtered = Object.fromEntries(
        Object.entries(input).filter(
          ([_, v]) =>
            v !== null &&
            v !== undefined &&
            typeof v === 'string' &&
            v.trim() !== ''
        )
      ) as Record<string, string>;

      const hasEmailChanged = filtered.email && filtered.email !== currentUser.email;

      const { email, ...rest } = filtered;

      await updateUserAttributes({
        userAttributes: filtered,
      });

      if (email && hasEmailChanged) {
        setPendingEmail(email);
        setShowVerifyModal(true);
      }

      if (Object.keys(rest).length > 0) {
        await updateUserToDB(userId, rest);
      }

    } catch (err) {
      console.error('Error uploading user info:', err);
    }
  };

  /**
   * Handles the avatar uploaded event.
   *
   * @param path The path of the avatar.
   */
  const handleAvatarUploaded = async (path: string) => {
    const thumbnailPath = path.replace(/^avatars\//, 'thumbnails/');

    await updateUserInfo({
      avatar: path,
      thumbnail: thumbnailPath,
    });
  };

  /**
   * Updates the user's info to the database.
   *
   * @param userId The user's id.
   * @param input The input to update the user's info.
   */
  const updateUserToDB = async (userId: string, input: any) => {
    const result = await client.graphql({
      query: updateUser,
      variables: { id: userId, ...input },
    });

    const data = (result as GraphQLResult<any>).data;

    setCurrentUser(data.updateUser);
  };

  /**
   * Handles the verified email after user updates their email.
   */
  const handleVerifyEmail = async () => {
    setShowVerifyModal(false);

    if (pendingEmail) {
      await updateUserToDB(currentUser.id, { email: pendingEmail });

      setCurrentUser((prev) => ({
        ...prev,
        email: pendingEmail,
      }));

      setPendingEmail(null);
    }
  };

  return (
    <View as="div" padding="1rem">
      <Flex direction="row" alignItems="flex-start">
        <AvatarUploader user={currentUser} onAvatarUploaded={handleAvatarUploaded} />
        <UserProfileForm onSubmit={updateUserInfo}/>
      </Flex>
      <VerifyEmailModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={handleVerifyEmail}
      />
    </View>
  )
}
