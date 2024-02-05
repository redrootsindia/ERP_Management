import { gql } from '@apollo/client'

const PRODUCTION_SUMMARY = gql`
  query ($limit: Int) {
    productionSummary(limit: $limit) {
      id
      brand_name
      product_name
      purchase_order_type
      user_name
      po_date
      due_date
      purchase_order_id
      status
      vendor_name
      vendor_company
      ean
      asin
      quantity
      unit_cost
      product_category_name
      product_subcategory_name
      code
      pack_of
      contains_same_product
      pack
      igst
      sgst
      cgst
      po_class
      buyer_group_name
      warehouse_name
      warehouse_location
      buyer_type
      buyer_name
      sales_order_name
      buyer_po_closure
      same_state
      received_quantity
      grn_no
      company_name
    }
  }
`

export default PRODUCTION_SUMMARY
