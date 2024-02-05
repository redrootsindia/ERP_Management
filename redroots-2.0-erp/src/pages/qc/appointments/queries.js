import { gql } from '@apollo/client'

export const QC_APPOINTMENTS = gql`
  query(
    $appointmentDateFilter: [String]
    $statusFilter: String
    $sortBy: String
    $searchString: String
    $limit: Int
    $offset: Int
  ) {
    productQCAppointments(
      appointmentDateFilter: $appointmentDateFilter
      searchString: $searchString
      limit: $limit
      statusFilter: $statusFilter
      sortBy: $sortBy
      offset: $offset
    ) {
      count
      rows {
        id
        vendor_id
        vendor
        due_date
        purchase_order_id
        appointment_date
        status
        rebooked
        pack
        approved
      }
    }
  }
`

export const VENDOR_NAMES_LIST = gql`
  query($vendorIDs: [ID]) {
    vendorNames(vendorTypeIDs: ["1", "2"], vendorIDs: $vendorIDs) {
      id
      name
      company
    }
  }
`

export const PURCHASE_ORDER_IDS = gql`
  query($vendor_id: ID) {
    purchaseOrderIDsForProductQC(vendor_id: $vendor_id) {
      id
    }
  }
`

export const PURCHASE_ORDER = gql`
  query($purchase_order_id: ID) {
    productPurchaseOrderQCDetails(purchase_order_id: $purchase_order_id) {
      id
      due_date
      pack
      detail {
        id
        variant_id
        variant_code
        image
        quantity
        booked_quantity
      }
      pack_detail {
        id
        pack_id
        pack_code
        image
        quantity
        booked_quantity
      }
    }
  }
`

export const QC_APPOINTMENT = gql`
  query($id: ID, $toInspect: Boolean, $getAppointmentData: Boolean) {
    productQCAppointment(id: $id, toInspect: $toInspect, getAppointmentData: $getAppointmentData) {
      id
      due_date
      appointment_date
      status
      approved
      vendor_id
      purchase_order_id
      pack
      qc_details {
        id
        image
        booked_quantity
        variant_id
        variant_code
        pack_id
        pack_code
        quantity
        appointment_quantity
      }
      items_to_inspect {
        qc_inspection_id
        qc_inspection_variant_id
        product_variant_id
        variant_code
        image
        product_id
        product_name
        brand_name
        pack_id
        pack_code
      }
      specs_data {
        id
        specs_id
        specs_name
        is_garment
        specs_expected_value
        specs_threshold
        qc_inspection_id
        qc_inspection_variant_id
        specs_inspected_id
        specs_inspected_value
        specs_inspected_status
      }
      general_criteria_data {
        id
        qc_inspection_id
        qc_inspection_variant_id
        aql_criteria_general_id
        defect_name
        aql_criteria_general_status
        aql_criteria_general_image
        status
      }
    }
  }
`

export const BOOK_QC = gql`
  mutation(
    $upsertType: String!
    $id: ID
    $vendor_id: ID
    $purchase_order_id: ID!
    $appointment_date: String!
    $status: String!
    $is_pack: Boolean!
    $qc_details: [ProductQCAppointmentDataInput]
  ) {
    bookProductQCAppointment(
      upsertType: $upsertType
      id: $id
      vendor_id: $vendor_id
      status: $status
      purchase_order_id: $purchase_order_id
      appointment_date: $appointment_date
      is_pack: $is_pack
      qc_details: $qc_details
    )
  }
`

export const QC_APPOINTMENT_STATUS = gql`
  mutation($appointment_id: ID!, $status: String!) {
    changeProductQCAppointmentStatus(appointment_id: $appointment_id, status: $status)
  }
`

export const APPROVED_INSPECTION = gql`
  mutation($appointment_id: ID!, $approved: Boolean!) {
    changeProductQCAppointmentApproved(appointment_id: $appointment_id, approved: $approved)
  }
`

export const APPROVED_INSPECTION_MULTIPLE = gql`
  mutation($appointment_ids: [Int], $approved: Boolean!) {
    changeProductQCAppointmentApprovedMultiple(
      appointment_ids: $appointment_ids
      approved: $approved
    )
  }
`

export const BOOK_FULL_QC = gql`
  mutation($id: ID!, $appointment_date: String!) {
    bookFullQC(id: $id, appointment_date: $appointment_date)
  }
`
