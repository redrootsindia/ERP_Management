import { gql } from '@apollo/client'

const BRAND_WISE_PURCHASE_ORDER = gql`
  query {
    brandWiseListPurchaseOrder {
      brand_id
      name
      draft_count
      draft_value
      progress_count
      progress_value
      assigned_count
      assigned_value
      closed_value
      closed_count
      force_closed_count
      force_closed_value
      rejected_by_vendor_value
      rejected_by_vendor_count
    }
  }
`

export default BRAND_WISE_PURCHASE_ORDER
