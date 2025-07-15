import AvatarUploader from "./components/AvatarUploader";

export default function UserProfile({ user }: { user: any }) {
  return (
    <AvatarUploader user={user} />
  )
}
