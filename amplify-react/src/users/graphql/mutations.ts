export const updateUser = `
  mutation UpdateUser(
    $id: String!
    $name: String
    $email: AWSEmail
    $address: String) {
    updateUser(
      id: $id
      name: $name
      email: $email
      address: $address
    ) {
      name
      email
      address
      avatar
      thumbnail
    }
  }
`;
