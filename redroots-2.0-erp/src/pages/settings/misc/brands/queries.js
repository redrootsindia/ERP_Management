import { gql } from '@apollo/client'

export const BRANDS = gql`
  query {
    brands {
      id
      name
      organization_id
      active
    }
  }
`

export const BRAND = gql`
  query($id: ID) {
    brand(id: $id) {
      id
      name
      organization_id
      active
    }
  }
`

export const UPSERT_BRAND = gql`
  mutation($upsertType: String!, $id: ID, $name: String!, $organization_id: Int!) {
    upsertBrand(upsertType: $upsertType, id: $id, name: $name, organization_id: $organization_id)
  }
`

export const ORGANIZATIONS = gql`
  query {
    organizations {
      id
      name
    }
  }
`
