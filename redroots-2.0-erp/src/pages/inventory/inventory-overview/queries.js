import { gql } from '@apollo/client'

const INVENTORY_OVERVIEW = gql`
  query (
    $brandIDs: [ID]
    $categoryIDs: [ID]
    $subcategoryIDs: [ID]
    $productIDs: [ID]
    $bomCodeIDs: [ID]
    $getAll: Boolean
    $inputCode: String
  ) {
    inventoryOverview(
      brandIDs: $brandIDs
      categoryIDs: $categoryIDs
      subcategoryIDs: $subcategoryIDs
      productIDs: $productIDs
      bomCodeIDs: $bomCodeIDs
      getAll: $getAll
      inputCode: $inputCode
    ) {
      variant_image
      brand
      product_name
      purchase_order_id
      product_category
      product_subcategory
      code
      unit_cost
      warehouse
      location
      rack
      shelf
      salable_quantity
      unsalable_quantity
      total_quantity
    }
  }
`

export default INVENTORY_OVERVIEW
