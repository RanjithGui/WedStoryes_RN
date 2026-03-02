import { gql } from "@apollo/client";

export const GOOGLE_AUTH = gql`
  mutation GoogleAuth(
    $googleId: String!
    $email: String!
    $name: String!
    $avatar: String
  ) {
    googleAuth(
      googleId: $googleId
      email: $email
      name: $name
      avatar: $avatar
    ) {
      _id
      name
      email
      avatar
    }
  }
`;
