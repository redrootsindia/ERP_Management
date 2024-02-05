import { gql } from '@apollo/client'

export const MATERIAL_SUBCATS = gql`
  query ($searchString: String) {
    materialSubcategories(searchString: $searchString) {
      id
      name
      material_category_id
      hsn_id
      panna
    }
  }
`

export const MATERIAL_SUBCAT = gql`
  query ($id: ID) {
    materialSubcategory(id: $id) {
      id
      name
      material_category_id
      hsn_id
      panna
    }
  }
`

export const UPSERT_MATERIAL_SUBCAT = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $name: String!
    $material_category_id: Int!
    $hsn_id: Int!
    $panna: Float!
  ) {
    upsertMaterialSubcategory(
      upsertType: $upsertType
      id: $id
      name: $name
      material_category_id: $material_category_id
      hsn_id: $hsn_id
      panna: $panna
    )
  }
`
