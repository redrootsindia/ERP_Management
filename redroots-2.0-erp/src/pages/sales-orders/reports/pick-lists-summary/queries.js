import { gql } from '@apollo/client'

export const PICK_LISTS_REPORT = gql`
  query(
    $createdAtFilter: [String]
    $deliveryDateFilter: [String]
    $typeFilter: String
    $limit: Int
    $offset: Int
  ) {
    salesOrdersSummaryForPickLists(
      createdAtFilter: $createdAtFilter
      deliveryDateFilter: $deliveryDateFilter
      typeFilter: $typeFilter
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        sales_order_id
        sales_order_name
        type
        buyer_group
        buyer
        buyer_warehouse
        created_at
        expected_delivery_date
        sales_order_quantity
        available_stock
        total_scheduled_to_pick
        picked_quantity
      }
    }
  }
`

export const SALES_ORDER_INVENTORY_BREAKDOWN = gql`
  query($id: ID) {
    salesOrderInventoryBreakdown(id: $id) {
      pick_list_status
      inventory_breakdown {
        id
        warehouse
        available_stock
        total_scheduled_to_pick
        picked_quantity
      }
    }
  }
`
