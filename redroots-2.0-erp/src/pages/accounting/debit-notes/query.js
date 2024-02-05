import { gql } from '@apollo/client'

export const DEBIT_NOTES = gql`
  query (
    $searchString: String
    $vendorIDs: [ID]
    $materialIDs: [ID]
    $limit: Int
    $offset: Int
    $sortBy: String
  ) {
    debitNotes(
      searchString: $searchString
      vendorIDs: $vendorIDs
      materialIDs: $materialIDs
      limit: $limit
      offset: $offset
      sortBy: $sortBy
    ) {
      count
      rows {
        id
        purchase_order_id
        vendor_id
        vendor_name
        material_name
        material_sent
        material_use_by_vendor
        status
        date
        comment
        batch_code
        labour_cast
      }
    }
  }
`
export const DEBIT_NOTE = gql`
  query ($id: ID) {
    debitNote(id: $id) {
      id
      purchase_order_id
      vendor_name
      vendor_id
      material_id
      material_name
      material_sent
      material_use_by_vendor
      status
      date
      comment
      batch_code
      labour_cast
    }
  }
`
export const UPSERT_DEBIT_NOTE = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $purchase_order_id: Int!
    $vendor_id: ID!
    $material_id: ID!
    $material_sent: String
    $material_use_by_vendor: String
    $status: Boolean
    $date: String
    $comment: String
    $batch_code: Int!
    $labour_cast: Float!
  ) {
    upsertDebitNote(
      upsertType: $upsertType
      id: $id
      purchase_order_id: $purchase_order_id
      vendor_id: $vendor_id
      material_id: $material_id
      material_sent: $material_sent
      material_use_by_vendor: $material_use_by_vendor
      status: $status
      date: $date
      comment: $comment
      batch_code: $batch_code
      labour_cast: $labour_cast
    )
  }
`

export const MATERIALS = gql`
  query ($searchString: String) {
    materials(searchString: $searchString) {
      count
      rows {
        id
        name
        material_code
      }
    }
  }
`
