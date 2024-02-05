import { gql } from '@apollo/client'

export const ATTRIBUTES = gql`
  query {
    attributes {
      id
      name
      active
    }
  }
`

export const ATTRIBUTE = gql`
  query($id: ID) {
    attribute(id: $id) {
      id
      name
      active
    }
  }
`

export const UPSERT_ATTRIBUTE = gql`
  mutation($upsertType: String!, $id: ID, $name: String!) {
    upsertAttribute(upsertType: $upsertType, id: $id, name: $name)
  }
`
