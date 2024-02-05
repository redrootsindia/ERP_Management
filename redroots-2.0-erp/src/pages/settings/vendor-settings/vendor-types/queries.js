import { gql } from '@apollo/client'

export const VENDOR_TYPES = gql`
  query {
    vendorTypes {
      id
      type
      active
    }
  }
`

export const VENDOR_TYPE = gql`
  query($id: ID) {
    vendorType(id: $id) {
      id
      type
      active
    }
  }
`

export const UPSERT_VENDOR_TYPE = gql`
  mutation($upsertType: String!, $id: ID, $type: String!) {
    upsertVendorType(upsertType: $upsertType, id: $id, type: $type)
  }
`
