import { gql } from '@apollo/client';

export const GET_REPORT_MEMBERS = gql`
  query GetReportMembers($filter: MemberFilterInput, $pagination: PaginationInput) {
    members(filter: $filter, pagination: $pagination) {
      members {
        id
        firstName
        lastName
        email
        phone
        membershipType
        membershipStartDate
        membershipEndDate
        status
        payment {
          method
          amount
          paidAmount
          status
          dueDate
          lastPaymentDate
          discount
          applyTaxes
          taxRate
          cgst
          sgst
          totalTax
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
        inactive
        expired
      }
    }
  }
`;

export const SEARCH_REPORT_SUGGESTIONS = gql`
  query SearchReportSuggestions($search: String!, $limit: Int) {
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
