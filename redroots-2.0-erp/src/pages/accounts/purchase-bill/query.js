import { gql } from '@apollo/client'

export const ORGANIZATION = gql`
  query {
    organizations {
      id
      name
    }
  }
`
export const PURCHASE_BILLS = gql`
  query ($searchString: String) {
    purchaseBills(searchString: $searchString) {
      count
      rows {
        id
        invoice_date
        invoice_due_date
        company_name
        brand_name
        vendor_name
        total_quantity
        total_bill_quantity
        total_amount
        buyer_name
        vendor_company_name
        amount
        status
        invoice_number
        reference_number
      }
    }
  }
`
export const PURCHASE_BILL = gql`
  query ($id: ID) {
    purchaseBill(id: $id) {
      id
      invoice_date
      invoice_due_date
      company_id
      purchase_order_id
      company_name
      gst_number
      brand_id
      brand_name
      vendor_id
      buyer_id
      vendor_name
      invoice_number
      reference_number
      status
      buyer_name
      detail {
        purchase_bill_id
        description
        quantity
        bill_quantity
        rate
        cgst
        sgst
        igst
        amount
      }
    }
  }
`
export const UPSERT_PURCHASE_BILL = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $invoice_date: String
    $invoice_due_date: String
    $company_id: Int
    $brand_id: Int
    $vendor_id: Int
    $buyer_id: Int
    $purchase_order_id: Int
    $invoice_number: String
    $reference_number: String
    $gst_number: String
    $pi_number: Int
    $status: String
    $detail: [PurchaseBillDetailInput]
  ) {
    upsertPurchaseBill(
      upsertType: $upsertType
      id: $id
      invoice_date: $invoice_date
      invoice_due_date: $invoice_due_date
      company_id: $company_id
      brand_id: $brand_id
      purchase_order_id: $purchase_order_id
      vendor_id: $vendor_id
      buyer_id: $buyer_id
      invoice_number: $invoice_number
      reference_number: $reference_number
      gst_number: $gst_number
      pi_number: $pi_number
      status: $status
      detail: $detail
    )
  }
`
export const BRANDS = gql`
  query {
    brands {
      id
      name
      organization_id
    }
  }
`
export const PURCHASE_ORDERS_ID = gql`
  query {
    purchaseOrderIDsList {
      id
      brand_id
      brand_name
      status
    }
  }
`
export const PRODUCT_VENDOR_NAMES_LIST = gql`
  query ($searchString: String, $vendorIDs: [ID]) {
    vendorNames(vendorTypeIDs: [1, 2], searchString: $searchString, vendorIDs: $vendorIDs) {
      id
      name
      company
      payment_term_id
      state
      active
    }
  }
`
