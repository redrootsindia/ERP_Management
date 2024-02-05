import { gql } from '@apollo/client'

export const ROLES = gql`
  query {
    roles {
      id
      title
    }
  }
`

export const ROLE = gql`
  query($id: ID) {
    role(id: $id) {
      id
      title
      permissions
    }
  }
`

export const UPSERT_ROLE = gql`
  mutation($upsertType: String!, $id: ID, $title: String!, $permissions: [String!]!) {
    upsertRole(upsertType: $upsertType, id: $id, title: $title, permissions: $permissions)
  }
`
