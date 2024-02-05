import { gql } from '@apollo/client'

export const PUT_AWAYS = gql`
  query (
    $createdAtFilter: [String]
    $limit: Int
    $offset: Int
    $statusType: String
    $searchString: String
  ) {
    putAways(
      createdAtFilter: $createdAtFilter
      limit: $limit
      offset: $offset
      statusType: $statusType
      searchString: $searchString
    ) {
      count
      rows {
        id
        purchase_order_id
        warehouse_name
        total_quantity
        scanned_quantity
        status
        in_progress
        active
        createdAt
      }
    }
  }
`

export const PUT_AWAY = gql`
  query ($id: ID) {
    putAway(id: $id) {
      id
      purchase_order_id
      pack
      status
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
      vendor_data {
        id
        name
        company
      }
      items_list {
        id
        quantity
        productVariantData {
          id
          code
          ean
        }
      }
    }
  }
`

export const PARTIAL_PUT_AWAY = gql`
  query ($id: ID) {
    partialPutAwayByID(id: $id) {
      id
      product_variant_id
      pack_id
      quantity
      put_away_shelf_mapping {
        id
        shelf_id
        quantity
      }
      productVariantData {
        code
      }
    }
  }
`

export const CHANGE_STATUS = gql`
  mutation ($id: ID!, $status: String!) {
    changePutAwayStatus(id: $id, status: $status)
  }
`

export const CHANGE_PROCESSING_STATE = gql`
  mutation ($id: ID!, $in_progress: Boolean!) {
    changePutAwayProcessing(id: $id, in_progress: $in_progress)
  }
`

export const ADD_PUT_AWAY = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $type: String!
    $ref_table_id: ID
    $pack: Boolean
    $is_partial: Boolean
    $is_excess: Boolean
    $put_away_array: [PutAwayArrayInput]
    $excess_qty_array: [PutAwayArrayInput]
    $unsalable_qty_array: [UnsalableQtyArrayInput]
  ) {
    upsertPutAway(
      upsertType: $upsertType
      id: $id
      type: $type
      ref_table_id: $ref_table_id
      pack: $pack
      is_partial: $is_partial
      is_excess: $is_excess
      put_away_array: $put_away_array
      excess_qty_array: $excess_qty_array
      unsalable_qty_array: $unsalable_qty_array
    )
  }
`

export const PRODUCT_GRN = gql`
  query ($put_away_id: ID!) {
    productGRN(put_away_id: $put_away_id) {
      id
      purchase_order_id
      delivery_date
      same_state
      invoice_number
      warehouse_data {
        name
        location
      }
      item_data {
        item_id
        code
        image
        product_name
        product_image
        product_category_name
        product_subcategory_name
        po_quantity
        accepted_quantity
        dispatched_quantity
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
