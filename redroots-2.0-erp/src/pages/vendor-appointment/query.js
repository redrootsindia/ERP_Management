import { gql } from '@apollo/client'

export const VENDOR_APPOINTMENTS = gql`
  query ($transporterIDs: [ID], $brandIDs: [ID], $searchString: String, $limit: Int, $offset: Int) {
    vendorAppointments(
      transporterIDs: $transporterIDs
      brandIDs: $brandIDs
      searchString: $searchString
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        appointment_date
        appointment_time
        dispatch_date
        brand_id
        TSC
        AMS
        shipped_from
        shipping_destination
        shipping_status
        delivery_date
        transporter_name
        HSN_number
      }
    }
  }
`
export const VENDOR_APPOINTMENT = gql`
  query ($id: ID) {
    vendorAppointment(id: $id) {
      id
      appointment_date
      appointment_time
      dispatch_date
      brand_id
      TSC
      AMS
      shipped_from
      shipping_destination
      shipping_status
      delivery_date
      transporter_id
      transporter_name
      HSN_number
    }
  }
`
export const UPSERT_VENDOR_APPOINTMENT = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $appointment_date: String
    $appointment_time: String
    $dispatch_date: String
    $TSC: String
    $AMS: String
    $brand_id: ID
    $shipped_from: String
    $shipping_destination: String
    $shipping_status: String
    $delivery_date: String
    $transporter_id: Int
    $HSN_number: String
  ) {
    upsertVendorAppointment(
      upsertType: $upsertType
      id: $id
      appointment_date: $appointment_date
      appointment_time: $appointment_time
      dispatch_date: $dispatch_date
      TSC: $TSC
      AMS: $AMS
      brand_id: $brand_id
      shipped_from: $shipped_from
      shipping_destination: $shipping_destination
      shipping_status: $shipping_status
      delivery_date: $delivery_date
      transporter_id: $transporter_id
      HSN_number: $HSN_number
    )
  }
`
