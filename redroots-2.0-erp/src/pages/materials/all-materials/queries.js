import { gql } from '@apollo/client'

export const MATERIALS = gql`
  query (
    $materialCategoryIDs: [ID]
    $materialIDs: [ID]
    $materialSubcategoryIDs: [ID]
    $materialColorIDs: [ID]
    $statusFilter: String
    $searchString: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    materials(
      materialCategoryIDs: $materialCategoryIDs
      materialIDs: $materialIDs
      materialSubcategoryIDs: $materialSubcategoryIDs
      materialColorIDs: $materialColorIDs
      statusFilter: $statusFilter
      searchString: $searchString
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        name
        material_category_id
        material_category_name
        material_subcategory_id
        material_subcategory_name
        material_color_id
        material_color_name
        material_code
        uom_id
        uom_name
        price_per_uom
        panna
        moq
        msq
        image
        active
      }
    }
  }
`

export const MATERIAL_CATEGORIES = gql`
  query {
    materialCategories {
      id
      name
    }
  }
`
export const MATERIAL_SUBCATEGORIES = gql`
  query {
    materialSubcategories {
      id
      name
      material_category_id
    }
  }
`

export const MATERIAL_SUBCATEGORY_BY_CATEGORY_ID = gql`
  query ($material_category_id: ID) {
    materialSubcategoryByCategoryID(material_category_id: $material_category_id) {
      id
      name
      active
    }
  }
`

export const MATERIAL_COLORS = gql`
  query {
    materialColors {
      id
      name
    }
  }
`
export const UOMS = gql`
  query {
    uoms {
      id
      name
    }
  }
`

export const MATERIAL = gql`
  query ($id: ID) {
    material(id: $id) {
      id
      name
      material_category_id
      material_category_name
      material_subcategory_id
      material_subcategory_name
      material_color_id
      material_color_name
      material_code
      uom_id
      uom_name
      price_per_uom
      panna
      moq
      msq
      image
      active
    }
  }
`

export const UPSERT_MATERIAL = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $name: String!
    $material_category_id: Int!
    $material_subcategory_id: Int!
    $material_color_id: Int!
    $material_code: String!
    $uom_id: Int!
    $price_per_uom: Float!
    $panna: Float!
    $moq: Float!
    $msq: Float!
    $image: Upload
    $is_image_changed: Boolean
  ) {
    upsertMaterial(
      upsertType: $upsertType
      id: $id
      name: $name
      material_category_id: $material_category_id
      material_subcategory_id: $material_subcategory_id
      material_color_id: $material_color_id
      material_code: $material_code
      uom_id: $uom_id
      price_per_uom: $price_per_uom
      panna: $panna
      moq: $moq
      msq: $msq
      image: $image
      is_image_changed: $is_image_changed
    )
  }
`
export const CHANGE_STATUS = gql`
  mutation ($id: ID!, $status: Boolean!) {
    changeMaterialStatus(id: $id, status: $status)
  }
`
