import { gql } from '@apollo/client';

export const GET_TRAINERS = gql`
  query GetTrainers($filter: TrainerFilterInput, $pagination: PaginationInput) {
    trainers(filter: $filter, pagination: $pagination) {
      trainers {
        id
        gymUuid
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

export const GET_TRAINER = gql`
  query GetTrainer($id: ID!) {
    trainer(id: $id) {
      id
      gymUuid
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
      createdAt
      updatedAt
    }
  }
`;

export const GET_TRAINERS_COUNT = gql`
  query GetTrainersCount {
    trainersCount
  }
`;

export const CREATE_TRAINER = gql`
  mutation CreateTrainer($input: TrainerInput!) {
    createTrainer(input: $input) {
      id
      gymUuid
      firstName
      lastName
      email
      phone
      specializations
      certifications
      experience
      bio
      hourlyRate
      status
      profileImage
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TRAINER = gql`
  mutation UpdateTrainer($id: ID!, $input: TrainerUpdateInput!) {
    updateTrainer(id: $id, input: $input) {
      id
      gymUuid
      firstName
      lastName
      email
      phone
      specializations
      certifications
      experience
      bio
      hourlyRate
      status
      profileImage
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_TRAINER = gql`
  mutation DeleteTrainer($id: ID!) {
    deleteTrainer(id: $id)
  }
`;
