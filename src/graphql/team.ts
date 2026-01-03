import { gql } from '@apollo/client';

export const GET_TEAM_MEMBERS = gql`
  query GetTeamMembers($filter: TrainerFilterInput, $pagination: PaginationInput) {
    trainers(filter: $filter, pagination: $pagination) {
      trainers {
        id
        firstName
        lastName
        email
        phone
        role
        specializations
        certifications
        experience
        bio
        salary
        joiningDate
        availability {
          days
          startTime
          endTime
        }
        status
        profileImage
        address {
          street
          city
          state
          zipCode
          country
        }
        emergencyContact {
          name
          phone
          relation
        }
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
      stats {
        total
        active
        trainers
        totalSalary
      }
    }
  }
`;

export const GET_TEAM_MEMBER = gql`
  query GetTeamMember($id: ID!) {
    trainer(id: $id) {
      id
      firstName
      lastName
      email
      phone
      role
      specializations
      certifications
      experience
      bio
      salary
      joiningDate
      availability {
        days
        startTime
        endTime
      }
      status
      profileImage
      address {
        street
        city
        state
        zipCode
        country
      }
      emergencyContact {
        name
        phone
        relation
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_TEAM_MEMBERS_COUNT = gql`
  query GetTeamMembersCount {
    trainersCount
  }
`;

export const CREATE_TEAM_MEMBER = gql`
  mutation CreateTeamMember($input: TrainerInput!) {
    createTrainer(input: $input) {
      id
      firstName
      lastName
      email
      phone
      role
      specializations
      certifications
      experience
      salary
      joiningDate
      availability {
        days
        startTime
        endTime
      }
      status
      createdAt
    }
  }
`;

export const UPDATE_TEAM_MEMBER = gql`
  mutation UpdateTeamMember($id: ID!, $input: TrainerUpdateInput!) {
    updateTrainer(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      phone
      role
      specializations
      certifications
      experience
      bio
      salary
      joiningDate
      availability {
        days
        startTime
        endTime
      }
      status
      profileImage
      address {
        street
        city
        state
        zipCode
        country
      }
      emergencyContact {
        name
        phone
        relation
      }
      updatedAt
    }
  }
`;

export const DELETE_TEAM_MEMBER = gql`
  mutation DeleteTeamMember($id: ID!) {
    deleteTrainer(id: $id)
  }
`;

export const SEARCH_TEAM_SUGGESTIONS = gql`
  query SearchTeamSuggestions($search: String!, $limit: Int) {
    teamSearchSuggestions(search: $search, limit: $limit) {
      id
      firstName
      lastName
      email
      phone
      role
      status
      availability {
        days
      }
    }
  }
`;
