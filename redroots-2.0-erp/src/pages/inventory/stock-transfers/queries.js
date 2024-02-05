import { gql } from '@apollo/client'

export const STOCK_TRANSFERS = gql`
  query($limit: Int, $offset: Int) {
    stockTransfers(limit: $limit, offset: $offset) {
      count
      rows {
        id
        total_quantity
        createdAt
        from_warehouse_id
        from_warehouse
        to_warehouse_id
        to_warehouse
        put_away_status
        put_away_in_progress
      }
    }
  }
`

export const ADD_STOCK_TRANSFER = gql`
  mutation(
    $from_warehouse_id: ID!
    $to_warehouse_id: ID!
    $stockTransferArray: [StockTransferArray]!
  ) {
    addStockTransfer(
      from_warehouse_id: $from_warehouse_id
      to_warehouse_id: $to_warehouse_id
      stockTransferArray: $stockTransferArray
    )
  }
`
