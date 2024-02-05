import { gql } from '@apollo/client'

export const VENDORS = gql`
  query (
    $vendorTypeIDs: [ID]
    $statusFilter: String
    $searchString: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    vendors(
      vendorTypeIDs: $vendorTypeIDs
      statusFilter: $statusFilter
      searchString: $searchString
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        name
        email
        phone
        profile_pic
        role
        company
        vendor_types
        active
      }
    }
  }
`

export const VENDOR_NAMES_LIST = gql`
  query ($vendorTypeIDs: [ID], $vendorIDs: [ID], $searchString: String) {
    vendorNames(vendorTypeIDs: $vendorTypeIDs, vendorIDs: $vendorIDs, searchString: $searchString) {
      id
      name
      company
      active
    }
  }
`

export const VENDOR_TYPES = gql`
  query {
    vendorTypes {
      id
      type
    }
  }
`

export const VENDOR = gql`
  query ($id: ID) {
    vendor(id: $id) {
      id
      user_id
      email
      password
      role_id
      name
      company
      vendor_type_ids
      phone
      alt_phone
      profile_pic
      state
      city
      address
      bank_name_1
      bank_account_1
      bank_ifsc_1
      bank_branch_1
      bank_name_2
      bank_account_2
      bank_ifsc_2
      bank_branch_2
      bank_name_3
      bank_account_3
      bank_ifsc_3
      bank_branch_3
      gst
      gst_image
      pan
      pan_image
      aadhar
      aadhar_image
      payment_term_id
      active
    }
  }
`

export const UPSERT_VENDOR = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $name: String!
    $email: String!
    $password: String!
    $role_id: ID!
    $company: String!
    $vendor_type_ids: [Int!]!
    $phone: String
    $alt_phone: String
    $profile_pic: Upload
    $is_profile_pic_changed: Boolean
    $state: String!
    $city: String!
    $address: String!
    $bank_name_1: String
    $bank_account_1: String
    $bank_ifsc_1: String
    $bank_branch_1: String
    $bank_name_2: String
    $bank_account_2: String
    $bank_ifsc_2: String
    $bank_branch_2: String
    $bank_name_3: String
    $bank_account_3: String
    $bank_ifsc_3: String
    $bank_branch_3: String
    $gst: String
    $gst_image: Upload
    $is_gst_image_changed: Boolean
    $pan: String
    $pan_image: Upload
    $is_pan_image_changed: Boolean
    $aadhar: String
    $aadhar_image: Upload
    $is_aadhar_image_changed: Boolean
    $payment_term_id: Int!
  ) {
    upsertVendor(
      upsertType: $upsertType
      id: $id
      name: $name
      email: $email
      password: $password
      role_id: $role_id
      company: $company
      vendor_type_ids: $vendor_type_ids
      phone: $phone
      alt_phone: $alt_phone
      profile_pic: $profile_pic
      is_profile_pic_changed: $is_profile_pic_changed
      state: $state
      city: $city
      address: $address
      bank_name_1: $bank_name_1
      bank_account_1: $bank_account_1
      bank_ifsc_1: $bank_ifsc_1
      bank_branch_1: $bank_branch_1
      bank_name_2: $bank_name_2
      bank_account_2: $bank_account_2
      bank_ifsc_2: $bank_ifsc_2
      bank_branch_2: $bank_branch_2
      bank_name_3: $bank_name_3
      bank_account_3: $bank_account_3
      bank_ifsc_3: $bank_ifsc_3
      bank_branch_3: $bank_branch_3
      gst: $gst
      gst_image: $gst_image
      is_gst_image_changed: $is_gst_image_changed
      pan: $pan
      pan_image: $pan_image
      is_pan_image_changed: $is_pan_image_changed
      aadhar: $aadhar
      aadhar_image: $aadhar_image
      is_aadhar_image_changed: $is_aadhar_image_changed
      payment_term_id: $payment_term_id
    )
  }
`
export const CHANGE_STATUS = gql`
  mutation ($id: ID!, $status: Boolean!) {
    changeVendorStatus(id: $id, status: $status)
  }
`
