import { useAuthenticator } from '@aws-amplify/ui-react';

export default function ConfirmSignUp() {
  const { resendCode, toSignIn, user } = useAuthenticator();

  const handleResend = async () => {
    try {
      await resendCode({ username: user?.username || '' });
    } catch (err) {
      console.error(err);
      alert('Failed to resend confirmation email');
    }
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">Verify email</h2>
      <p className="mb-4">
        <span>We have sent a verification email to your email address.</span>
        <span>Please check your email and click the verification link.</span>
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={toSignIn}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to login
        </button>
        <button
          onClick={handleResend}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Resend verification email
        </button>
      </div>
    </div>
  );
}
