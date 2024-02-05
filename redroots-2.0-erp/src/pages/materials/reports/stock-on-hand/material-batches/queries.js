import { gql } from '@apollo/client'

export const All_BATCHES_STOCK_BY_MATERIALID = gql`
  query($materialID: ID!, $sortBy: String, $limit: Int, $offset: Int) {
    allBatchesStockByMaterialID(
      materialID: $materialID
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      count
      material_data {
        material_id
        material_name
        material_code
        image
        price_per_uom
      }
      material_stocks {
        material_inward_batch_id
        purchase_order_id
        warehouse
        quantity
        booked_quantity
        written_off_quantity
      }
    }
  }
`

export const MATERIAL_SUBCATS = gql`
  query {
    materialSubcategories {
      id
      name
      material_category_id
      hsn_id
      panna
    }
  }
`
export const ADD_MATERIAL_WRITE_OFF = gql`
  mutation(
    $material_inward_batch_id: ID!
    $material_id: ID!
    $written_off_quantity: Float!
    $reason: String!
  ) {
    addMaterialWriteOff(
      material_inward_batch_id: $material_inward_batch_id
      material_id: $material_id
      written_off_quantity: $written_off_quantity
      reason: $reason
    )
  }
`
