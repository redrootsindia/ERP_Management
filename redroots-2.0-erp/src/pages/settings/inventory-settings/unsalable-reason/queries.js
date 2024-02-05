import { gql } from '@apollo/client'

export const UNSALABLE_REASONS = gql`
  query {
    unsalableReasons {
      id
      name
      active
    }
  }
`

export const UNSALABLE_REASON = gql`
  query($id: ID) {
    unsalableReason(id: $id) {
      id
      name
      active
    }
  }
`

export const UPSERT_UNSALABLE_REASONS = gql`
  mutation($upsertType: String!, $id: ID, $name: String!) {
    upsertUnsalableReason(upsertType: $upsertType, id: $id, name: $name)
  }
`
