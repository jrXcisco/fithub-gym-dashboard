import { gql } from '@apollo/client';

export const GET_MEMBERS = gql`
  query GetMembers($filter: MemberFilterInput, $pagination: PaginationInput) {
    members(filter: $filter, pagination: $pagination) {
      members {
        id
        firstName
        lastName
        email
        phone
        dateOfBirth
        gender
        address {
          street
          city
          state
          zipCode
          country
        }
        membershipType
        customPlanMonths
        customPlanAmountPerMonth
        membershipStartDate
        membershipEndDate
        status
        emergencyContact {
          name
          phone
          relationship
        }
        healthInfo {
          height
          weight
          bloodGroup
          medicalConditions
        }
        payment {
          method
          methodAmounts {
            cash
            card
            upi
          }
          amount
          paidAmount
          status
          dueDate
          nextDueDate
          lastPaymentDate
          discount
          applyTaxes
          taxRate
          cgst
          sgst
          totalTax
        }
        paymentHistory {
          id
          amount
          method
          date
          notes
          receiptNumber
        }
        workoutProgram {
          goal
          startDate
          trainerId
          notes
        }
        specialRequirements
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
        inactive
        expired
      }
    }
  }
`;

export const GET_MEMBER = gql`
  query GetMember($id: ID!) {
    member(id: $id) {
      id
      firstName
      lastName
      email
      phone
      dateOfBirth
      gender
      address {
        street
        city
        state
        zipCode
        country
      }
      membershipType
      customPlanMonths
      customPlanAmountPerMonth
      membershipStartDate
      membershipEndDate
      status
      emergencyContact {
        name
        phone
        relationship
      }
      healthInfo {
        height
        weight
        bloodGroup
        medicalConditions
      }
      payment {
        method
        methodAmounts {
          cash
          card
          upi
        }
        amount
        paidAmount
        status
        dueDate
        nextDueDate
        lastPaymentDate
        discount
        applyTaxes
        taxRate
        cgst
        sgst
        totalTax
      }
      paymentHistory {
        id
        amount
        method
        date
        notes
        receiptNumber
      }
      workoutProgram {
        goal
        startDate
        trainerId
        notes
      }
      specialRequirements
      createdAt
      updatedAt
    }
  }
`;

export const GET_MEMBERS_COUNT = gql`
  query GetMembersCount {
    membersCount
  }
`;

export const CREATE_MEMBER = gql`
  mutation CreateMember($input: MemberInput!) {
    createMember(input: $input) {
      id
      firstName
      lastName
      email
      phone
      membershipType
      membershipStartDate
      membershipEndDate
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_MEMBER = gql`
  mutation UpdateMember($id: ID!, $input: MemberUpdateInput!) {
    updateMember(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      phone
      membershipType
      membershipStartDate
      membershipEndDate
      status
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_MEMBER = gql`
  mutation DeleteMember($id: ID!) {
    deleteMember(id: $id)
  }
`;

export const ADD_PAYMENT = gql`
  mutation AddPayment($memberId: ID!, $payment: PaymentRecordInput!) {
    addPayment(memberId: $memberId, payment: $payment) {
      id
      payment {
        method
        amount
        paidAmount
        status
        dueDate
        nextDueDate
        lastPaymentDate
        discount
        applyTaxes
        taxRate
        cgst
        sgst
        totalTax
      }
      paymentHistory {
        id
        amount
        method
        date
        notes
        receiptNumber
      }
      status
    }
  }
`;

export const SEARCH_MEMBER_SUGGESTIONS = gql`
  query SearchMemberSuggestions($search: String!, $limit: Int) {
    memberSearchSuggestions(search: $search, limit: $limit) {
      id
      firstName
      lastName
      email
      phone
      status
      membershipType
    }
  }
`;
