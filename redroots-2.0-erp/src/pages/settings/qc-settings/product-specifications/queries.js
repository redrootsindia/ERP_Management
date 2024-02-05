import { gql } from '@apollo/client'

export const PRODUCT_SPECIFICATIONS = gql`
  query {
    productSpecificationNames {
      id
      specs_name
      active
    }
  }
`

export const PRODUCT_SPECIFICATION = gql`
  query($id: ID) {
    productSpecificationName(id: $id) {
      id
      specs_name
      active
    }
  }
`

export const UPSERT_PRODUCT_SPECIFICATION = gql`
  mutation($upsertType: String!, $id: ID, $specs_name: String!) {
    upsertProductSpecificationName(upsertType: $upsertType, id: $id, specs_name: $specs_name)
  }
`
