import { gql } from '@apollo/client'

export const PRODUCT_SUBCATS = gql`
  query {
    productSubcategories {
      id
      name
      product_category_id
    }
  }
`

export const PRODUCT_SUBCAT = gql`
  query($id: ID) {
    productSubcategory(id: $id) {
      id
      name
      product_category_id
    }
  }
`

export const PRODUCT_SUBCAT_BY_CAT_ID = gql`
  query($product_category_id: ID) {
    productSubcategoryByCategoryID(product_category_id: $product_category_id) {
      id
      name
      active
    }
  }
`

export const PRODUCT_SUBCAT_BY_CAT_IDS = gql`
  query($categoryIDs: [ID]) {
    productSubcategoryByCategoryIDs(categoryIDs: $categoryIDs) {
      id
      name
      active
    }
  }
`

export const UPSERT_PRODUCT_SUBCAT = gql`
  mutation($upsertType: String!, $id: ID, $name: String!, $product_category_id: Int!) {
    upsertProductSubcategory(
      upsertType: $upsertType
      id: $id
      name: $name
      product_category_id: $product_category_id
    )
  }
`
