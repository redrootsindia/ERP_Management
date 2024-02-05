import { gql } from '@apollo/client'

export const UPSERT_TRANSPORT_REPORT = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $transporter_name: String!
    $brand_id: Int!
    $vehicle_number: String!
    $contact_number: String!
    $e_way_bill: Upload
    $firc_copy: String
    $firc_doc_number: String
    $booking_date: String
    $shipping_bill_number: String
    $mm_copy_status: String
    $invoice_creation_date: String
    $vc_inv_creation_status: String
  ) {
    upsertTransportReport(
      upsertType: $upsertType
      id: $id
      transporter_name: $transporter_name
      brand_id: $brand_id
      vehicle_number: $vehicle_number
      contact_number: $contact_number
      e_way_bill: $e_way_bill
      firc_copy: $firc_copy
      firc_doc_number: $firc_doc_number
      booking_date: $booking_date
      shipping_bill_number: $shipping_bill_number
      mm_copy_status: $mm_copy_status
      invoice_creation_date: $invoice_creation_date
      vc_inv_creation_status: $vc_inv_creation_status
    )
  }
`
export const TRANSPORT_REPORTS = gql`
  query ($brandIDs: [ID], $statusFilter: String, $searchString: String, $limit: Int, $offset: Int) {
    transportReports(
      brandIDs: $brandIDs
      statusFilter: $statusFilter
      searchString: $searchString
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        transporter_name
        brand_name
        vehicle_number
        contact_number
        e_way_bill
        firc_copy
        firc_doc_number
        booking_date
        shipping_bill_number
        mm_copy_status
        invoice_creation_date
        vc_inv_creation_status
      }
    }
  }
`
export const TRANSPORT_REPORT = gql`
  query ($id: ID) {
    transportReport(id: $id) {
      id
      transporter_name
      brand_name
      brand_id
      vehicle_number
      contact_number
      e_way_bill
      firc_copy
      firc_doc_number
      booking_date
      shipping_bill_number
      mm_copy_status
      invoice_creation_date
      vc_inv_creation_status
    }
  }
`
