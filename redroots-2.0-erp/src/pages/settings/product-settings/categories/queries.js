import { gql } from '@apollo/client'

export const PRODUCT_CATS = gql`
  query {
    productCategories {
      id
      name
      active
    }
  }
`

export const PRODUCT_CAT = gql`
  query($id: ID) {
    productCategory(id: $id) {
      id
      name
      active
    }
  }
`

export const UPSERT_PRODUCT_CAT = gql`
  mutation($upsertType: String!, $id: ID, $name: String!) {
    upsertProductCategory(upsertType: $upsertType, id: $id, name: $name)
  }
`
