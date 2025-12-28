import { gql } from '@apollo/client';

export const GET_RESOURCES = gql`
  query GetResources($filter: ResourceFilterInput, $pagination: PaginationInput) {
    resources(filter: $filter, pagination: $pagination) {
      resources {
        id
        gymUuid
        name
        category
        description
        quantity
        availableQuantity
        status
        location
        purchaseDate
        purchasePrice
        maintenanceSchedule {
          lastMaintenance
          nextMaintenance
          frequency
        }
        specifications {
          brand
          model
          serialNumber
          warranty {
            expiryDate
            provider
          }
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
    }
  }
`;

export const GET_RESOURCE = gql`
  query GetResource($id: ID!) {
    resource(id: $id) {
      id
      gymUuid
      name
      category
      description
      quantity
      availableQuantity
      status
      location
      purchaseDate
      purchasePrice
      maintenanceSchedule {
        lastMaintenance
        nextMaintenance
        frequency
      }
      specifications {
        brand
        model
        serialNumber
        warranty {
          expiryDate
          provider
        }
      }
      image
      notes
      createdAt
      updatedAt
    }
  }
`;

export const GET_RESOURCES_COUNT = gql`
  query GetResourcesCount {
    resourcesCount
  }
`;

export const CREATE_RESOURCE = gql`
  mutation CreateResource($input: ResourceInput!) {
    createResource(input: $input) {
      id
      gymUuid
      name
      category
      description
      quantity
      availableQuantity
      status
      location
      purchaseDate
      purchasePrice
      maintenanceSchedule {
        lastMaintenance
        nextMaintenance
        frequency
      }
      specifications {
        brand
        model
        serialNumber
        warranty {
          expiryDate
          provider
        }
      }
      image
      notes
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_RESOURCE = gql`
  mutation UpdateResource($id: ID!, $input: ResourceUpdateInput!) {
    updateResource(id: $id, input: $input) {
      id
      gymUuid
      name
      category
      description
      quantity
      availableQuantity
      status
      location
      purchaseDate
      purchasePrice
      maintenanceSchedule {
        lastMaintenance
        nextMaintenance
        frequency
      }
      specifications {
        brand
        model
        serialNumber
        warranty {
          expiryDate
          provider
        }
      }
      image
      notes
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_RESOURCE = gql`
  mutation DeleteResource($id: ID!) {
    deleteResource(id: $id)
  }
`;
