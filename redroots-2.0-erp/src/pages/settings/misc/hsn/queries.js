import { gql } from '@apollo/client'

export const HSNS = gql`
  query {
    hsns {
      id
      name
      sgst
      cgst
      igst
    }
  }
`

export const HSN = gql`
  query($id: ID) {
    hsn(id: $id) {
      id
      name
      sgst
      cgst
      igst
    }
  }
`

export const UPSERT_HSN = gql`
  mutation(
    $upsertType: String!
    $id: ID
    $name: String!
    $sgst: Float!
    $cgst: Float!
    $igst: Float!
  ) {
    upsertHSN(upsertType: $upsertType, id: $id, name: $name, sgst: $sgst, cgst: $cgst, igst: $igst)
  }
`
export const CHANGE_STATUS = gql`
  mutation($id: ID!, $status: Boolean!) {
    changeHSNStatus(id: $id, status: $status)
  }
`
