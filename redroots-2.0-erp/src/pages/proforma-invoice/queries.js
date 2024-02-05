import { gql } from '@apollo/client'

export const UPSERT_PROFORMA_INVOICE = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $brand_id: Int
    $buyer_id: Int
    $buyer_group_id: Int
    $expiry_date: String
    $status: String
    $detail: [ProformaInvoiceDetailInput]
  ) {
    upsertProformaInvoice(
      upsertType: $upsertType
      id: $id
      brand_id: $brand_id
      buyer_id: $buyer_id
      buyer_group_id: $buyer_group_id
      expiry_date: $expiry_date
      status: $status
      detail: $detail
    )
  }
`
export const PROFORMA_INVOICES = gql`
  query (
    $brandIDs: [ID]
    $buyerIDs: [ID]
    $statusFilter: String
    $searchString: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    proformaInvoices(
      brandIDs: $brandIDs
      buyerIDs: $buyerIDs
      statusFilter: $statusFilter
      searchString: $searchString
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        brand_name
        buyer_name
        same_state
        buyer_group
        status
        employee_name
        expiry_date
        created_by
        createdAt
      }
    }
  }
`
export const PROFORMA_INVOICE = gql`
  query ($id: ID) {
    proformaInvoice(id: $id) {
      id
      brand_id
      brand_name
      buyer_id
      buyer_group_id
      buyer_name
      buyer_name
      same_state
      expiry_date
      status
      detail {
        id
        proforma_invoice_id
        variant_id
        variant_code
        product_name
        image
        product_category_name
        product_subcategory_name
        quantity
        mrp
        unit_cost
        hsn_name
        gst
        comment
      }
    }
  }
`
export const PROFORMA_INVOICE_PIVOT_DATA = gql`
  query {
    proformaInvoicePivoteData {
      id
      brand_name
      buyer_name
      expiry_date
      buyer_group
      status
      quantity
      product_category_name
      product_subcategory_name
      product_name
      variant_code
      hsn_name
    }
  }
`

// export default UPSERT_PROFORMA_INVOICE
