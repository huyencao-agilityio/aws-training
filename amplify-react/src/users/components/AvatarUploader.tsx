import { uploadData } from 'aws-amplify/storage';
import { useState } from 'react';

import outputs  from '../../../amplify_outputs.json';

export const CLOUD_FRONT_DOMAIN = `https://${outputs.custom.cloudfrontDistribution}`;

export default function AvatarUploader({ user }: { user: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const MAX_SIZE_MB = 2;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const extension = file?.type.split('/')[1];
  const path = `avatars/${user.username}/avatar.${extension}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Only JPG, PNG or WEBP files are allowed');
      setFile(null);
      return;
    }

    // Validate size
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image size must be less than ${MAX_SIZE_MB}MB`);
      setFile(null);
      return;
    }

    // OK
    setError(null);
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type,
        },
      }).result;

      setFile(null);
      alert('Upload avatar successfully!');
      setAvatarUrl(`${CLOUD_FRONT_DOMAIN}/${path}`);
    } catch (err) {
      console.error('Upload failed', err);
      setError('Upload failed. Please try again.');
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          width={100}
          height={100}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          onError={() => setAvatarUrl(null)}
        />
      ) : (
        <p>No avatar uploaded yet</p>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ marginTop: '1rem' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleUpload} disabled={!file}>
        Upload Avatar
      </button>
    </div>
  );
}
