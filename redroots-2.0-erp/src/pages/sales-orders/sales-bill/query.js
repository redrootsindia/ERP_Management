import { gql } from '@apollo/client'

export const SALES_BILLS = gql`
  query ($statusFilter: String, $searchString: String, $sortBy: String, $limit: Int, $offset: Int) {
    salesBills(
      statusFilter: $statusFilter
      searchString: $searchString
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        invoice_date
        invoice_due_date
        company_name
        company_id
        gst_number
        brand_name
        brand_id
        vendor_name
        vendor_id
        buyer_name
        buyer_name
        buyer_id
        buyer_group_id
        status
        invoice_number
        reference_number
        detail {
          sale_bill_id
          description
          quantity
          rate
          amount
          cgst
          sgst
          igst
        }
      }
    }
  }
`
export const UPSERT_SALES_BILL = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $invoice_date: String!
    $invoice_due_date: String!
    $company_id: Int!
    $brand_id: Int!
    $vendor_id: Int
    $buyer_id: Int!
    $buyer_group_id: Int
    $invoice_number: String!
    $proforma_invoice_id: Int
    $sales_order_id: Int
    $status: String
    $detail: [SaleBillDetailInput]
  ) {
    upsertSaleBill(
      upsertType: $upsertType
      id: $id
      invoice_date: $invoice_date
      invoice_due_date: $invoice_due_date
      company_id: $company_id
      brand_id: $brand_id
      vendor_id: $vendor_id
      buyer_id: $buyer_id
      buyer_group_id: $buyer_group_id
      invoice_number: $invoice_number
      proforma_invoice_id: $proforma_invoice_id
      sales_order_id: $sales_order_id
      status: $status
      detail: $detail
    )
  }
`
export const SALES_BILL = gql`
  query ($id: ID) {
    saleBill(id: $id) {
      id
      invoice_date
      invoice_due_date
      company_id
      company_name
      gst_number
      brand_id
      brand_name
      vendor_id
      vendor_name
      buyer_id
      buyer_group_id
      buyer_name
      invoice_number
      reference_number
      proforma_invoice_id
      sales_order_id
      status
      buyer_name
      detail {
        sale_bill_id
        description
        quantity
        sale_bill_quantity
        rate
        amount
        cgst
        sgst
        igst
      }
    }
  }
`
export const SALES_ORDER_NUMBER = gql`
  query {
    salesOrderNames {
      id
      name
    }
  }
`
export const PI_NUMBER = gql`
  query {
    proformaInvoices {
      count
      rows {
        id
      }
    }
  }
`
