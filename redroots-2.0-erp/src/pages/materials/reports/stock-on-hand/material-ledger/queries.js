import { gql } from '@apollo/client'

const MATERIAL_LEDGER_REPORT = gql`
  query ($materialID: ID!, $batchID: ID) {
    materialLedgerReport(materialID: $materialID, batchID: $batchID) {
      material_data {
        material_id
        material_name
        material_code
        image
        price_per_uom
      }
      material_stocks {
        key
        purchase_order_id
        warehouse
        quantity
        type
        date
      }
    }
  }
`

export default MATERIAL_LEDGER_REPORT
