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
        specializations
        certifications
        experience
        bio
        hourlyRate
        availability {
          monday { start end }
          tuesday { start end }
          wednesday { start end }
          thursday { start end }
          friday { start end }
          saturday { start end }
          sunday { start end }
        }
        status
        profileImage
        rating
        totalClients
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
      specializations
      certifications
      experience
      bio
      hourlyRate
      availability {
        monday { start end }
        tuesday { start end }
        wednesday { start end }
        thursday { start end }
        friday { start end }
        saturday { start end }
        sunday { start end }
      }
      status
      profileImage
      rating
      totalClients
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
