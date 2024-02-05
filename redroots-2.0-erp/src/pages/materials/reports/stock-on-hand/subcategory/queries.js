import { gql } from '@apollo/client'

export const MATERIAL_LIST = gql`
  query(
    $subcategoryID: ID!
    $materialIDs: [ID]
    $searchString: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    materialStockBySubcategoryID(
      subcategoryID: $subcategoryID
      materialIDs: $materialIDs
      searchString: $searchString
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      subcategory_id
      subcategory
      material_stock {
        image
        material_id
        material_name
        material_code
        quantity
        price_per_uom
        booked_quantity
      }
    }
  }
`

export const MATERIAL_SUBCATS = gql`
  query {
    materialSubcategories {
      id
      name
      material_category_id
      hsn_id
      panna
    }
  }
`
