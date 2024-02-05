import { gql } from '@apollo/client'

export const PICK_LISTS = gql`
  query (
    $pickListIDs: [ID]
    $createdAtFilter: [String]
    $searchString: String
    $limit: Int
    $offset: Int
  ) {
    pickLists(
      pickListIDs: $pickListIDs
      createdAtFilter: $createdAtFilter
      searchString: $searchString
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        sales_order_id
        sales_order_name
        warehouse_id
        warehouse_name
        buyer_name
        expected_delivery_date
        total_quantity_to_pick
        pick_list_status
        packaging_status
        packaging_id
      }
    }
  }
`

export const PICK_LIST = gql`
  query ($id: ID, $scanMode: Boolean) {
    pickList(id: $id, scanMode: $scanMode) {
      id
      sales_order_name
      warehouse_name
      expected_delivery_date
      sales_order_id
      buyer_name
      warehouse_id
      status
      pick_list_data {
        id
        pick_list_id
        warehouse_id
        sales_order_quantity
        product_variant_id
        variant_code
        image
        scheduled_quantity
        picked_quantity
        stock_quantity
        quantity_to_pick
      }
      warehouse_data {
        id
        name
        location
        racks {
          id
          name
          shelves {
            id
            name
          }
        }
      }
    }
  }
`

export const UPSERT_PICK_LIST = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $sales_order_id: ID!
    $warehouse_id: ID!
    $pick_list_data: [PickListDataInput]
  ) {
    upsertPickList(
      upsertType: $upsertType
      id: $id
      sales_order_id: $sales_order_id
      warehouse_id: $warehouse_id
      pick_list_data: $pick_list_data
    )
  }
`

export const PARTIAL_PICKED_DATA = gql`
  query ($pick_list_id: ID) {
    partialPickedItems(pick_list_id: $pick_list_id) {
      id
      picked_item_id
      product_variant_id
      pack_id
      created_by
      updated_by
      status
      picked_item_shelf_mapping_data {
        id
        picked_item_bom_id
        shelf_id
        quantity
      }
      variant_data {
        id
        code
        ean
      }
    }
  }
`

export const ADD_PICKED_ITEMS = gql`
  mutation ($pick_list_id: ID!, $isPartial: Boolean, $picked_data: [PickedDataInput]!) {
    addPickedItems(pick_list_id: $pick_list_id, isPartial: $isPartial, picked_data: $picked_data)
  }
`

export const UPSERT_PACKAGING_LIST = gql`
  mutation (
    $pick_list_id: ID!
    $isPack: Boolean
    $isPartial: Boolean
    $packaging_list_data: [PackagingDataInput]!
    $deleted_box_ids: [ID]
    $deleted_box_data_ids: [ID]
  ) {
    upsertPackagingList(
      pick_list_id: $pick_list_id
      isPack: $isPack
      isPartial: $isPartial
      packaging_list_data: $packaging_list_data
      deleted_box_ids: $deleted_box_ids
      deleted_box_data_ids: $deleted_box_data_ids
    )
  }
`

export const PARTIAL_PACKAGED_DATA = gql`
  query ($pick_list_id: ID) {
    partialPackagedData(pick_list_id: $pick_list_id) {
      id
      box_code
      detail {
        id
        product_variant_id
        quantity
      }
    }
  }
`

export const PACKAGING_STATUS = gql`
  mutation ($id: ID!, $status: String!) {
    changePackagingStatus(id: $id, status: $status)
  }
`

export const SALES_ORDER_DELIVERY = gql`
  query ($id: ID) {
    salesOrderDelivery(id: $id) {
      id
      proof_of_delivery_images
      grn_images
      packaging_list_id
    }
  }
`

export const PROOF_OF_DELIVERY = gql`
  mutation (
    $packaging_list_id: Int
    $proof_of_delivery_images: [Upload]
    $grn_images: [Upload]
    $deleted_proof_of_delivery_images: [String]
    $deleted_grn_images: [String]
  ) {
    proofOfDelivery(
      packaging_list_id: $packaging_list_id
      proof_of_delivery_images: $proof_of_delivery_images
      grn_images: $grn_images
      deleted_proof_of_delivery_images: $deleted_proof_of_delivery_images
      deleted_grn_images: $deleted_grn_images
    )
  }
`
