import { gql } from '@apollo/client'

const MATERIAL_WRITE_OFFS = gql`
  query(
    $limit: Int
    $offset: Int
    $createdAtFilter: [String]
    $sortBy: String
    $searchString: String
  ) {
    materialWriteOffs(
      limit: $limit
      offset: $offset
      createdAtFilter: $createdAtFilter
      searchString: $searchString
      sortBy: $sortBy
    ) {
      count
      rows {
        id
        material_category
        material_subcategory
        purchase_order_id
        material_inward_batch_id
        material_code
        written_off_quantity
        reason
        createdAt
        user_name
      }
    }
  }
`
export default MATERIAL_WRITE_OFFS
