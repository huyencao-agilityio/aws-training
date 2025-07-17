export const updateUser = `
  mutation UpdateUser(
    $id: String!
    $name: String
    $email: AWSEmail
    $address: String
    $avatar: String
    $thumbnail: String
  ) {
    updateUser(
      id: $id
      name: $name
      email: $email
      address: $address
      avatar: $avatar
      thumbnail: $thumbnail
    ) {
      id
      name
      email
      address
      avatar
      thumbnail
    }
  }
`;
