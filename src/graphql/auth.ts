import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        firstName
        lastName
        email
        phone
        role
        gymUuid
        gymName
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup(
    $firstName: String!
    $lastName: String!
    $email: String!
    $phone: String
    $password: String!
    $role: String
    $gymName: String
  ) {
    signup(
      firstName: $firstName
      lastName: $lastName
      email: $email
      phone: $phone
      password: $password
      role: $role
      gymName: $gymName
    ) {
      token
      user {
        id
        firstName
        lastName
        email
        phone
        role
        gymUuid
        gymName
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      firstName
      lastName
      email
      phone
      role
      gymUuid
      gymName
    }
  }
`;
