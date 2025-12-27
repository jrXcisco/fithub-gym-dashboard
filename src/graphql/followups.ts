import { gql } from '@apollo/client';

export const GET_FOLLOWUPS = gql`
  query GetFollowups($filter: FollowupFilterInput, $pagination: PaginationInput) {
    followups(filter: $filter, pagination: $pagination) {
      followups {
        id
        gymUuid
        member {
          id
          firstName
          lastName
          email
        }
        trainer {
          id
          firstName
          lastName
        }
        type
        title
        description
        scheduledDate
        completedDate
        status
        priority
        notes
        outcome
        createdBy {
          id
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_FOLLOWUP = gql`
  query GetFollowup($id: ID!) {
    followup(id: $id) {
      id
      gymUuid
      member {
        id
        firstName
        lastName
        email
      }
      trainer {
        id
        firstName
        lastName
      }
      type
      title
      description
      scheduledDate
      completedDate
      status
      priority
      notes
      outcome
      createdBy {
        id
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_UPCOMING_FOLLOWUPS = gql`
  query GetUpcomingFollowups($days: Int) {
    upcomingFollowups(days: $days) {
      id
      gymUuid
      member {
        id
        firstName
        lastName
        email
      }
      trainer {
        id
        firstName
        lastName
      }
      type
      title
      description
      scheduledDate
      status
      priority
      createdAt
    }
  }
`;

export const GET_FOLLOWUPS_COUNT = gql`
  query GetFollowupsCount {
    followupsCount
  }
`;

export const CREATE_FOLLOWUP = gql`
  mutation CreateFollowup($input: FollowupInput!) {
    createFollowup(input: $input) {
      id
      gymUuid
      member {
        id
        firstName
        lastName
      }
      trainer {
        id
        firstName
        lastName
      }
      type
      title
      description
      scheduledDate
      status
      priority
      notes
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_FOLLOWUP = gql`
  mutation UpdateFollowup($id: ID!, $input: FollowupUpdateInput!) {
    updateFollowup(id: $id, input: $input) {
      id
      gymUuid
      member {
        id
        firstName
        lastName
      }
      trainer {
        id
        firstName
        lastName
      }
      type
      title
      description
      scheduledDate
      completedDate
      status
      priority
      notes
      outcome
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_FOLLOWUP = gql`
  mutation DeleteFollowup($id: ID!) {
    deleteFollowup(id: $id)
  }
`;

export const COMPLETE_FOLLOWUP = gql`
  mutation CompleteFollowup($id: ID!, $outcome: String) {
    completeFollowup(id: $id, outcome: $outcome) {
      id
      status
      completedDate
      outcome
    }
  }
`;
