import { gql } from '@apollo/client'

export const BRANDS = gql`
  query {
    brands {
      id
      name
    }
  }
`
export const PRODUCT_VENDOR_NAMES_LIST = gql`
  query ($searchString: String, $vendorIDs: [ID]) {
    vendorNames(vendorTypeIDs: [1, 2], searchString: $searchString, vendorIDs: $vendorIDs) {
      id
      name
      company
      state
      active
    }
  }
`
export const BUYER_NAME_LIST = gql`
  query ($buyerGroupIDs: [ID], $buyerIDs: [ID], $searchString: String, $entireList: Boolean) {
    buyerNames(
      buyerGroupIDs: $buyerGroupIDs
      buyerIDs: $buyerIDs
      searchString: $searchString
      entireList: $entireList
    ) {
      id
      name
      marketplace_channel
    }
  }
`
export const BRAND_PAYMENTS = gql`
  query (
    $vendorIDs: [ID]
    $buyerIDs: [ID]
    $companyIDs: [ID]
    $brandIDs: [ID]
    $statusFilter: String
    $activeFilter: String
    $searchString: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    brandPaymentSBs(
      vendorIDs: $vendorIDs
      buyerIDs: $buyerIDs
      companyIDs: $companyIDs
      brandIDs: $brandIDs
      statusFilter: $statusFilter
      activeFilter: $activeFilter
      searchString: $searchString
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        vendor_name
        brand_name
        company_name
        buyer_name
        invoice_date
        sales_type
        invoice_number
        buyer_po
        lr_number
        so_number
        invoice_quantity
        base_value
        tax_value
        gst
        total_value
        e_way_bill
        grn_no
      }
    }
  }
`
// export default BRANDS
