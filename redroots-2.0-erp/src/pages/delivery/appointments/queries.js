import { gql } from '@apollo/client'

export const PRODUCT_DELIVERY_APPOINTMENTS = gql`
  query ($createdAtFilter: [String], $searchString: String, $limit: Int, $offset: Int) {
    productDeliveryAppointments(
      createdAtFilter: $createdAtFilter
      searchString: $searchString
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        vendor_id
        vendor_name
        purchase_order_id
        qc_appointment_id
        warehouse_id
        warehouse_name
        delivery_appointment_date
        total_quantity
        total_dispatched_quantity
        delivered_at
        status
      }
    }
  }
`

export const PRODUCT_DELIVERY_APPOINTMENT = gql`
  query ($id: ID, $qcID: ID) {
    productDeliveryAppointment(id: $id, qcID: $qcID) {
      id
      warehouse_id
      vendor_id
      purchase_order_id
      qc_appointment_id
      delivery_appointment_date
      invoice_number
      status
      delivered_at
      pack
      product_delivery_appointment_box {
        id
        product_delivery_appointment_id
        box_code
        box_data {
          id
          product_variant_id
          pack_id
          product_delivery_appointment_box_id
          dispatched_quantity
        }
      }
    }
  }
`

export const PRODUCT_QC_APPOINTMENT = gql`
  query ($id: ID) {
    productQCAppointment(id: $id) {
      id
      status
      vendor_id
      purchase_order_id
      pack
      qc_details {
        id
        product_variant_id
        variant_code
        pack_id
        pack_code
        appointment_quantity
        image
      }
    }
  }
`

export const UPSERT_PRODUCT_DELIVERY_APPOINTMENT = gql`
  mutation (
    $id: ID
    $upsertType: String!
    $vendor_id: ID!
    $qc_appointment_id: ID
    $purchase_order_id: ID!
    $pack: Boolean
    $warehouse_id: ID!
    $delivery_appointment_date: String!
    $invoice_number: String!
    $status: String
    $delivered_at: String
    $productDeliveryAppointmentBoxInput: [ProductDeliveryAppointmentBoxInput]
    $deleted_box_ids: [ID]
    $deleted_box_data_ids: [ID]
  ) {
    upsertProductDeliveryAppointment(
      id: $id
      upsertType: $upsertType
      vendor_id: $vendor_id
      qc_appointment_id: $qc_appointment_id
      purchase_order_id: $purchase_order_id
      pack: $pack
      warehouse_id: $warehouse_id
      delivery_appointment_date: $delivery_appointment_date
      delivered_at: $delivered_at
      invoice_number: $invoice_number
      status: $status
      productDeliveryAppointmentBoxInput: $productDeliveryAppointmentBoxInput
      deleted_box_ids: $deleted_box_ids
      deleted_box_data_ids: $deleted_box_data_ids
    )
  }
`

export const WAREHOUSES = gql`
  query ($includeRackShelfData: Boolean) {
    warehouses(includeRackShelfData: $includeRackShelfData) {
      id
      name
      location
    }
  }
`

export const CHANGE_PRODUCT_DELIVERY_APPOINTMENT_STATUS = gql`
  mutation ($id: ID!, $status: String!, $date: String) {
    changeProductDeliveryAppointmentStatus(id: $id, status: $status, date: $date)
  }
`

export const PRODUCT_DELIVERY_INVOICE = gql`
  query ($id: ID = 1) {
    productDeliveryInvoice(id: $id) {
      id
      brand_id
      brand_name
      vendor_id
      vendor_name
      lead_time_id
      lead_time
      po_date
      due_date
      pack
      detail {
        id
        variant_id
        pack_id
        code
        image
        product_name
        quantity
        unit_cost
        hsn_name
        cgst
        sgst
        igst
      }
      status
      same_state
      active
      organization_data {
        name
        email
        state
        address
        gst
      }
      vendor_data {
        company
        gst
        address
      }
    }
  }
`

export const PRODUCT_DELIVERY_GRN_DATA = gql`
  query ($id: ID!) {
    productDeliveryGRNData(id: $id) {
      id
      vendor_id
      purchase_order_id
      delivered_at
      invoice_number
      same_state
      grnDetail {
        variant_id
        variant_code
        image
        product_name
        received_quantity
        purachse_order_quantity
        unit_cost
        hsn_name
        cgst
        sgst
        igst
      }
      organization_data {
        name
        email
        state
        address
        gst
      }
      vendor_data {
        company
        gst
        address
      }
    }
  }
`
export const PURCHASE_ORDER_IDS = gql`
  query ($vendor_id: ID) {
    purchaseOrderIDsForProductDelivery(vendor_id: $vendor_id) {
      id
    }
  }
`
export const PRODUCT_PO_GRN_DISPATCH = gql`
  query ($purchase_order_id: ID) {
    productPOGRNDispatched(purchase_order_id: $purchase_order_id) {
      dispatched_quantity
      product_variant_id
    }
  }
`
