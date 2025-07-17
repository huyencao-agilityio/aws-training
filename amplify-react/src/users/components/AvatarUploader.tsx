import { useRef, useState } from 'react';
import { FiCamera } from 'react-icons/fi';
import { remove, uploadData } from 'aws-amplify/storage';

import defaultAvatar from '../../assets/default-avatar.png';
import outputs  from '../../../amplify_outputs.json';

export const CLOUD_FRONT_DOMAIN = `https://${outputs.custom.cloudfrontDistribution}`;

export default function AvatarUploader(
  {
    user,
    onAvatarUploaded
  }: {
    user: any,
    onAvatarUploaded: (path: string) => void
  }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_MB = 2;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Handles the file change event for the avatar uploader.
   *
   * @param e The change event from the file input.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const extension = selectedFile.type.split('/')[1];
    const path = `avatars/${user.username}/img-${Date.now()}.${extension}`;

    // Validate
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Only JPG, PNG or WEBP files are allowed');
      return;
    }

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image size must be less than ${MAX_SIZE_MB}MB`);
      return;
    }

    setError(null);

    // Upload avatar
    try {
      await uploadData({
        path,
        data: selectedFile,
        options: { contentType: extension },
      }).result;

      const oldAvatar = user.avatar;
      const oldThumbnail = user.thumbnail;

      if (oldAvatar) {
        await remove({ path: oldAvatar });
      }

      if (oldThumbnail) {
        await remove({ path: oldThumbnail });
      }

      setAvatarUrl(`${CLOUD_FRONT_DOMAIN}/${path}`);

      onAvatarUploaded(path);
    } catch (err) {
      console.error('Upload failed', err);
      setError('Upload failed. Please try again.');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <img
        src={avatarUrl || defaultAvatar}
        alt="Avatar"
        style={{
          width: 120,
          height: 120,
          borderRadius: 12,
          objectFit: 'cover',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
        onClick={handleClick}
        onError={() => setAvatarUrl(null)}
      />

      {/* Upload icon overlay */}
      <div
        onClick={handleClick}
        style={{
          position: 'absolute',
          bottom: 5,
          right: 5,
          backgroundColor: '#fff',
          borderRadius: '50%',
          padding: 6,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          cursor: 'pointer',
        }}
      >
        <FiCamera size={16} />
      </div>

      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
    </div>
  );
}
