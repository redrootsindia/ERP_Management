import { gql } from '@apollo/client'

export const UOMS = gql`
  query {
    uoms {
      id
      name
      active
    }
  }
`

export const UOM = gql`
  query($id: ID) {
    uom(id: $id) {
      id
      name
      active
    }
  }
`

export const UPSERT_UOM = gql`
  mutation($upsertType: String!, $id: ID, $name: String!) {
    upsertUoM(upsertType: $upsertType, id: $id, name: $name)
  }
`
export const CHANGE_STATUS = gql`
  mutation($id: ID!, $status: Boolean!) {
    changeUoMStatus(id: $id, status: $status)
  }
`
