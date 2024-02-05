import { gql } from '@apollo/client'

export const VARIANT_BY_SALES_ORDERS = gql`
  query ($sales_order_id: [ID]) {
    variantsBySalesOrderID(sales_order_id: $sales_order_id) {
      id
      product_variant_id
      code
      product_id
    }
  }
`

export const RTV_LIST = gql`
  query ($limit: Int, $offset: Int) {
    rtvs(limit: $limit, offset: $offset) {
      count
      rows {
        id
        rtv_name
        custom_buyer_name
        sales_order_ids
        received_on
        status
        buyer_name
        buyer_group_name
        total_return_quantity
        sales_order_names
      }
    }
  }
`

export const RTV = gql`
  query ($id: ID) {
    rtv(id: $id) {
      id
      name
      buyer_id
      custom_buyer_name
      sales_order_ids
      received_on
      warehouse_id
      status
      rtv_bom_detail {
        id
        product_variant_id
      }
      rtv_reason_mapping_detail {
        rtv_bom_id
        return_reason_id
        quantity
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
      organization_data {
        id
        name
        email
        phone
        state
        gst
        address
      }
      items_list {
        id
        quantity
        productVariantData {
          id
          product_id
          code
          ean
          cost_price
          image
        }
      }
      buyer_data {
        name
        phone
        email
        marketplace_channel
      }
    }
  }
`

export const RTV_NAMES = gql`
  query {
    rtvNames {
      id
      name
    }
  }
`

export const UPSERT_RTV = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $name: String!
    $buyer_id: ID
    $custom_buyer_name: String
    $sales_order_ids: [ID]
    $received_on: String!
    $warehouse_id: ID!
    $rtvVariantData: [RTVBomInput]!
    $deleted_row_ids: [ID]
  ) {
    upsertRTV(
      upsertType: $upsertType
      id: $id
      name: $name
      buyer_id: $buyer_id
      custom_buyer_name: $custom_buyer_name
      sales_order_ids: $sales_order_ids
      received_on: $received_on
      warehouse_id: $warehouse_id
      rtvVariantData: $rtvVariantData
      deleted_row_ids: $deleted_row_ids
    )
  }
`
export const RETURN_REASONS = gql`
  query {
    returnReasons {
      id
      name
    }
  }
`
export const SALES_ORDER_NAMES_LIST = gql`
  query {
    allSalesOrderNames {
      id
      name
    }
  }
`
