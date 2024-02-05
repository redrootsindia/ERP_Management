import { gql } from '@apollo/client'

export const RETURN_REASON_CATEGORIES = gql`
  query {
    returnReasonCategories {
      id
      name
      active
    }
  }
`

export const RETURN_REASON_CATEGORY = gql`
  query($id: ID) {
    returnReasonCategory(id: $id) {
      id
      name
      active
    }
  }
`

export const UPSERT_RETURN_REASON_CATEGORY = gql`
  mutation($upsertType: String!, $id: ID, $name: String!) {
    upsertReturnReasonCategory(upsertType: $upsertType, id: $id, name: $name)
  }
`
