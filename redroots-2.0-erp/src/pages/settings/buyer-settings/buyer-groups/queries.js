import { gql } from '@apollo/client'

export const BUYER_GROUPS = gql`
  query {
    buyerGroups {
      id
      name
      active
    }
  }
`

export const BUYER_GROUP = gql`
  query($id: ID) {
    buyerGroup(id: $id) {
      id
      name
      active
    }
  }
`

export const UPSERT_BUYER_GROUP = gql`
  mutation($upsertType: String!, $id: ID, $name: String!) {
    upsertBuyerGroup(upsertType: $upsertType, id: $id, name: $name)
  }
`
