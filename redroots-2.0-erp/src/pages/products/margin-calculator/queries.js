import { gql } from '@apollo/client'

export const MARGIN_REPORT = gql`
  query (
    $noOfProduct: Int
    $productIDs: [ID]
    $categoryIDs: [ID]
    $subcategoryIDs: [ID]
    $csvFilter: Boolean
  ) {
    marginReport(
      noOfProduct: $noOfProduct
      productIDs: $productIDs
      categoryIDs: $categoryIDs
      subcategoryIDs: $subcategoryIDs
      csvFilter: $csvFilter
    ) {
      product {
        id
        name
        image
        product_category
        product_subcategory
        igst
      }
      buyer_margin {
        id
        product_id
        buyer_id
        buyer_name
        mrp
        discount_value
        target_selling_price
        margin_percent
      }
      vendor_margin {
        id
        product_id
        vendor_id
        vendor_name
        cost_price
        transport_cost
        margin_percent
        transfer_price_marketing
        packaging
        photoshoot
        brand_marketing
      }
    }
  }
`

export const PRODUCT_NAMES = gql`
  query (
    $vendorIDs: [ID]
    $brandIDs: [ID]
    $categoryIDs: [ID]
    $subcategoryIDs: [ID]
    $productIDs: [ID]
    $statusFilter: String
    $searchString: String
  ) {
    productNames(
      vendorIDs: $vendorIDs
      brandIDs: $brandIDs
      categoryIDs: $categoryIDs
      subcategoryIDs: $subcategoryIDs
      productIDs: $productIDs
      statusFilter: $statusFilter
      searchString: $searchString
    ) {
      id
      name
      code
    }
  }
`
