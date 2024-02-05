import { gql } from '@apollo/client'

export const RETURN_REASONS = gql`
  query {
    returnReasons {
      id
      name
      return_reason_category_id
      return_reason_category
      active
    }
  }
`

export const RETURN_REASON = gql`
  query($id: ID) {
    returnReason(id: $id) {
      id
      name
      return_reason_category_id
      return_reason_category
      active
    }
  }
`

export const UPSERT_RETURN_REASON = gql`
  mutation($upsertType: String!, $id: ID, $name: String!, $return_reason_category_id: Int!) {
    upsertReturnReason(
      upsertType: $upsertType
      id: $id
      name: $name
      return_reason_category_id: $return_reason_category_id
    )
  }
`
