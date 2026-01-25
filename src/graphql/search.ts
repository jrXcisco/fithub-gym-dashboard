import { gql } from '@apollo/client';

export const GLOBAL_SEARCH = gql`
  query GlobalSearch($search: String!, $limit: Int) {
    memberSearchSuggestions(search: $search, limit: $limit) {
      id
      firstName
      lastName
      email
      phone
      status
      membershipType
    }
    followupSearchSuggestions(search: $search, limit: $limit) {
      id
      title
      type
      status
      priority
      scheduledDate
      member {
        id
        firstName
        lastName
      }
    }
  }
`;
