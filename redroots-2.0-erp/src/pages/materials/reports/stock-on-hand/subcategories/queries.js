import { gql } from '@apollo/client'

export const STOCK_ON_HAND = gql`
  query ($subcategoryIDs: [ID], $searchString: String, $sortBy: String, $limit: Int, $offset: Int) {
    allMaterialSubcategoriesStock(
      subcategoryIDs: $subcategoryIDs
      searchString: $searchString
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      id
      material_subcategory
      quantity
      price_per_uom
      booked_quantity
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

export const MATERIAL_SOH_PIVOT_DATA = gql`
  query {
    materialSOHReportPivotData {
      batch_no
      inward_qty
      material_category_name
      material_code
      material_subcategory_name
      unit_cost
      booked_quantity
      quantity
      last_po_price
    }
  }
`
