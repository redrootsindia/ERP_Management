import { gql } from '@apollo/client'

const MATERIAL_DASHBOARD = gql`
  query ($status: String, $active: String) {
    materialDashboard(status: $status, active: $active) {
      count
      material_ids
    }
  }
`

export default MATERIAL_DASHBOARD
