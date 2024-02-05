import { gql } from '@apollo/client'

export const MATERIAL_INWARDS = gql`
  query (
    $inwardDateFilter: [ID]
    $vendorIDs: [ID]
    $statusFilter: String
    $sortBy: String
    $searchString: String
    $limit: Int
    $offset: Int
  ) {
    materialInwards(
      inwardDateFilter: $inwardDateFilter
      vendorIDs: $vendorIDs
      searchString: $searchString
      limit: $limit
      statusFilter: $statusFilter
      sortBy: $sortBy
      offset: $offset
    ) {
      count
      rows {
        id
        inward_date
        vendor_id
        vendor_name
        purchase_order_id
        ordered_quantity
        received_quantity
        pending_quantity
        po_date
        invoice_number
        inward_date
        due_date
        po_status
        challan_image
        invoice_image
      }
    }
  }
`
export const MATERIAL_INWARD = gql`
  query ($id: ID) {
    materialInward(id: $id) {
      id
      inward_date
      vendor_id
      purchase_order_id
      invoice_number
      warehouse_id
      checklist_company_name
      checklist_address
      checklist_gst
      checklist_stamp
      checklist_total_quantity
      checklist_total_amount
      checklist_rri_company
      checklist_rri_address
      checklist_rri_gst
      checklist_rri_po
      checklist_vendor_sign
      challan_image
      invoice_image
      batch_data {
        id
        material_id
        material_name
        material_code
        ordered_quantity
        pending_quantity
        batches {
          id

          quantity
        }
      }
    }
  }
`

export const VENDOR_NAMES_LIST = gql`
  query ($searchString: String, $vendorIDs: [ID]) {
    vendorNames(vendorTypeIDs: ["2", "3"], searchString: $searchString, vendorIDs: $vendorIDs) {
      id
      name
    }
  }
`
export const PURCHASE_ORDER_ID_MATERIAL_INWARD = gql`
  query ($vendor_id: ID) {
    purchaseOrderIDsForMaterialInward(vendor_id: $vendor_id) {
      id
    }
  }
`
export const WAREHOUSES = gql`
  query {
    warehouses {
      id
      name
    }
  }
`
export const PURCHASE_ORDER_DATA_MATERIAL_INWARD = gql`
  query ($purchase_order_id: ID) {
    purchaseOrderDataForMaterialInward(purchase_order_id: $purchase_order_id) {
      id
      material_id
      material_name
      material_code
      image
      quantity
      ordered_quantity
      pending_quantity
      batches {
        id
        quantity
      }
      active
      createdAt
    }
  }
`

export const UPSERT_MATERIAL_INWARD = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $inward_data: MaterialInwardDataInput
    $batch_data: [MaterialInwardBatchDataInput]
  ) {
    upsertMaterialInward(
      upsertType: $upsertType
      id: $id
      inward_data: $inward_data
      batch_data: $batch_data
    )
  }
`

export const BATCH_DATA_BY_INWARD_ID = gql`
  query ($inward_id: ID) {
    batchDataByInwardID(inward_id: $inward_id) {
      id
      material_id
      material_name
      material_code
      quantity
      image
    }
  }
`
export const MATERIAL_NAMES_LIST = gql`
  query ($searchString: String) {
    materials(searchString: $searchString) {
      count
      rows {
        id
        name
        material_code
        image
      }
    }
  }
`
export const UPSERT_MATERIAL_INWARD_GENERAL = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $inward_data: MaterialInwardGeneralDataInput
    $batch_data: [MaterialInwardBatchDataInput]
  ) {
    upsertMaterialInwardGeneral(
      upsertType: $upsertType
      id: $id
      inward_data: $inward_data
      batch_data: $batch_data
    )
  }
`
export const MATERIAL_INWARD_GRN_PDF_DATA = gql`
  query ($inward_id: ID!) {
    materialInwardPDFData(inward_id: $inward_id) {
      id
      purchase_order_id
      inward_date
      same_state
      invoice_number
      warehouse_data {
        name
        location
      }
      material_data {
        material_id
        image
        material_name
        material_code
        po_quantity
        quantity
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
export const MATERIAL_INWARD_PIVOT_DATA = gql`
  query {
    materialInwardPivotData {
      batch_no
      createdAt
      inward_qty
      material_category_name
      material_code
      material_subcategory_name
      purchase_order_id
      unit_cost
      vendor_company
    }
  }
`
