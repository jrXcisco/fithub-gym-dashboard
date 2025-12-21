const typeDefs = `#graphql
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    users: [User!]!
    usersCount: Int!
  }

  type Mutation {
    signup(
      firstName: String!
      lastName: String!
      email: String!
      phone: String
      password: String!
    ): AuthPayload!

    login(email: String!, password: String!): AuthPayload!
  }
`;

module.exports = typeDefs;
