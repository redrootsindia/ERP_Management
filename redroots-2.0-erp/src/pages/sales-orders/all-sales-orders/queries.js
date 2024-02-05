import { gql } from '@apollo/client'

export const BUYER_GROUPS_LIST = gql`
  query {
    buyerGroups {
      id
      name
    }
  }
`

export const BUYER_NAME_LIST = gql`
  query ($buyerGroupIDs: [ID], $buyerIDs: [ID], $searchString: String, $entireList: Boolean) {
    buyerNames(
      buyerGroupIDs: $buyerGroupIDs
      buyerIDs: $buyerIDs
      searchString: $searchString
      entireList: $entireList
    ) {
      id
      name
      marketplace_channel
    }
  }
`

export const BRAND_LIST = gql`
  query {
    brands {
      id
      name
    }
  }
`

export const VARIANTS = gql`
  query {
    variants {
      id
      code
      ean
      asin
    }
  }
`

export const VARIANTS_BY_BRAND_ID = gql`
  query ($brand_id: ID) {
    variantsByBrandID(brand_id: $brand_id) {
      id
      code
      ean
      asin
    }
  }
`

export const BUYER_WAREHOUSE_LIST = gql`
  query ($buyer_group_id: ID) {
    buyerGroupWarehousesByBuyerGroupID(buyer_group_id: $buyer_group_id) {
      id
      name
    }
  }
`

export const SALES_ORDERS = gql`
  query ($createdAtFilter: [String], $searchString: String, $limit: Int, $offset: Int) {
    salesOrders(
      createdAtFilter: $createdAtFilter
      searchString: $searchString
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        type
        name
        buyer_group_name
        buyer_id
        buyer_name
        brand_id
        buyer_warehouse_id
        buyer_warehouse
        brand_name
        expected_delivery_date
        status
        total_quantity
        total_cost
        quantity_scheduled_to_pick
      }
    }
  }
`

export const SALES_ORDER = gql`
  query ($id: ID, $includeSalesOrderData: Boolean) {
    salesOrder(id: $id, includeSalesOrderData: $includeSalesOrderData) {
      id
      status
      name
      buyer_name
      buyer_id
      brand_id
      createdAt
      buyer_group_name
      expected_delivery_date
      sales_order_data {
        id
        product_variant_id
        variant_code
        quantity
        image
        unit_cost
      }
    }
  }
`

export const ADD_SALES_ORDER = gql`
  mutation (
    $type: String!
    $name: String!
    $buyer_id: Int!
    $brand_id: Int!
    $buyer_warehouse_id: Int!
    $expected_delivery_date: String!
    $sales_order_data: [SalesOrderDataInput]
  ) {
    addSalesOrder(
      type: $type
      name: $name
      buyer_id: $buyer_id
      brand_id: $brand_id
      buyer_warehouse_id: $buyer_warehouse_id
      expected_delivery_date: $expected_delivery_date
      sales_order_data: $sales_order_data
    )
  }
`

export const ADD_MARKETPLACE_SALES_ORDER = gql`
  mutation ($type: String!, $name: String!, $sales_order_data: [SalesOrderDataMarketplaceInput]) {
    addMarketplaceSalesOrder(type: $type, name: $name, sales_order_data: $sales_order_data)
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

export const SO_DATA_FOR_PICK_LISTS = gql`
  query ($id: ID, $warehouse_id: ID) {
    salesOrderDataToCreatePickList(id: $id, warehouse_id: $warehouse_id) {
      id
      sales_order_id
      variant_code
      product_variant_id
      image
      quantity
      scheduled_quantity
      stock_quantity
      picked_quantity
    }
  }
`

export const UPSERT_PICK_LIST = gql`
  mutation (
    $upsertType: String!
    $pack_id: ID!
    $sales_order_id: ID!
    $warehouse_id: ID!
    $pick_list_data: [PickListDataInput]
  ) {
    upsertPickList(
      upsertType: $upsertType
      pack_id: $pack_id
      sales_order_id: $sales_order_id
      warehouse_id: $warehouse_id
      pick_list_data: $pick_list_data
    )
  }
`

export const SALES_ORDER_NAMES_LIST = gql`
  query ($salesOrderIDs: [ID], $status: [String], $searchString: String, $brand_id: Int) {
    salesOrderNames(
      salesOrderIDs: $salesOrderIDs
      status: $status
      searchString: $searchString
      brand_id: $brand_id
    ) {
      id
      name
      buyer_name
    }
  }
`
