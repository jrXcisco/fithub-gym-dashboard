import { gql } from '@apollo/client';

export const GET_EVENTS = gql`
  query GetEvents($filter: EventFilterInput, $pagination: PaginationInput) {
    events(filter: $filter, pagination: $pagination) {
      events {
        id
        gymUuid
        title
        description
        type
        startDate
        endDate
        location
        maxParticipants
        currentParticipants
        fee
        status
        trainer {
          id
          firstName
          lastName
        }
        image
        notes
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
      stats {
        total
        upcoming
        ongoing
        totalParticipants
      }
    }
  }
`;

export const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      id
      gymUuid
      title
      description
      type
      startDate
      endDate
      location
      maxParticipants
      currentParticipants
      fee
      status
      trainer {
        id
        firstName
        lastName
      }
      image
      notes
      createdAt
      updatedAt
    }
  }
`;

export const GET_EVENTS_COUNT = gql`
  query GetEventsCount {
    eventsCount
  }
`;

export const GET_UPCOMING_EVENTS = gql`
  query GetUpcomingEvents($days: Int) {
    upcomingEvents(days: $days) {
      id
      title
      type
      startDate
      endDate
      location
      status
      trainer {
        id
        firstName
        lastName
      }
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      id
      gymUuid
      title
      description
      type
      startDate
      endDate
      location
      maxParticipants
      currentParticipants
      fee
      status
      trainer {
        id
        firstName
        lastName
      }
      image
      notes
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: EventUpdateInput!) {
    updateEvent(id: $id, input: $input) {
      id
      gymUuid
      title
      description
      type
      startDate
      endDate
      location
      maxParticipants
      currentParticipants
      fee
      status
      trainer {
        id
        firstName
        lastName
      }
      image
      notes
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;
