import { gql } from '@apollo/client'

export const BRANDS = gql`
  query {
    brands {
      id
      name
    }
  }
`

export const PRODUCT_VENDOR_NAMES_LIST = gql`
  query ($searchString: String, $vendorIDs: [ID]) {
    vendorNames(vendorTypeIDs: [1, 2], searchString: $searchString, vendorIDs: $vendorIDs) {
      id
      name
      company
      state
      active
    }
  }
`
export const PROFORMA_INVOICES = gql`
  query ($searchString: String, $brandIDs: [ID]) {
    proformaInvoices(brandIDs: $brandIDs, searchString: $searchString) {
      count
      rows {
        id
        brand_name
      }
    }
  }
`

export const LEAD_TIMES = gql`
  query {
    leadTimes {
      id
      title
      dueInDays
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
      image
    }
  }
`

export const VARIANT = gql`
  query ($id: ID, $vendor_id: ID) {
    variant(id: $id, vendor_id: $vendor_id) {
      id
      code
      ean
      asin
      product_category_name
      product_subcategory_name
      hsn_name
      cgst
      sgst
      igst
      image
      product_name
      cost_price
    }
  }
`

export const VARIANT_BY_CODES = gql`
  query ($codes: [String]) {
    variantByCodes(codes: $codes) {
      id
      code
      image
      ean
      asin
      product_category_name
      product_subcategory_name
      hsn_name
      cgst
      sgst
      igst
    }
  }
`

export const VARIANTS_BY_BRAND_ID = gql`
  query ($searchString: String, $brand_id: ID) {
    variantsByBrandID(brand_id: $brand_id, searchString: $searchString) {
      id
      code
      image
      ean
      asin
      product_category_name
      product_subcategory_name
      hsn_name
      cgst
      sgst
      igst
    }
  }
`

export const PRODUCT_CATEGORIES = gql`
  query {
    productCategories {
      id
      name
    }
  }
`

export const PRODUCT_SUBCATEGORIES = gql`
  query {
    productSubcategories {
      id
      name
    }
  }
`

export const PRODUCT_SUBCATEGORY_BY_CATEGORY_ID = gql`
  query ($product_category_id: ID) {
    productSubcategoryByCategoryID(product_category_id: $product_category_id) {
      id
      name
      active
    }
  }
`
export const PRODUCT_COLORS = gql`
  query {
    productColors {
      id
      name
    }
  }
`

export const UOMS = gql`
  query {
    uoms {
      id
      name
    }
  }
`

export const PRODUCT_PURCHASE_ORDER = gql`
  query ($id: ID) {
    productPurchaseOrder(id: $id) {
      id
      brand_id
      brand_name
      vendor_id
      vendor_name
      lead_time_id
      lead_time
      po_date
      due_date
      proforma_invoice_id
      aql_main_id
      pack
      reject_reason
      terms_conditions
      sales_order_ids
      detail {
        id
        variant_id
        product_name
        image
        product_category_name
        product_subcategory_name
        quantity
        unit_cost
        hsn_name
        cgst
        sgst
        igst
        comment
      }
      status
      same_state
      active
    }
  }
`

export const UPSERT_PRODUCT_PURCHASE_ORDER = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $brand_id: Int
    $vendor_id: Int
    $lead_time_id: Int
    $lead_time: Float
    $po_date: String
    $proforma_invoice_id: Int
    $due_date: String
    $status: String
    $changes_made: Boolean
    $same_state: Boolean
    $aql_main_id: Int!
    $pack: Boolean!
    $reject_reason: String
    $terms_conditions: String
    $sales_order_ids: [Int]
    $detail: [ProductPurchaseOrderDetailInput]
  ) {
    upsertProductPurchaseOrder(
      upsertType: $upsertType
      id: $id
      purchase_order_type: "FOB"
      brand_id: $brand_id
      vendor_id: $vendor_id
      lead_time_id: $lead_time_id
      lead_time: $lead_time
      po_date: $po_date
      proforma_invoice_id: $proforma_invoice_id
      due_date: $due_date
      status: $status
      same_state: $same_state
      changes_made: $changes_made
      aql_main_id: $aql_main_id
      pack: $pack
      reject_reason: $reject_reason
      terms_conditions: $terms_conditions
      sales_order_ids: $sales_order_ids
      detail: $detail
    )
  }
`

export const CHANGE_STATUS = gql`
  mutation ($id: ID!, $active: Boolean!) {
    changeProductPurchaseOrderStatus(id: $id, active: $active)
  }
`

export const PRODUCT_PURCHASE_ORDERS = gql`
  query (
    $vendorIDs: [ID]
    $brandIDs: [ID]
    $statusFilter: String
    $activeFilter: String
    $searchString: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    productPurchaseOrders(
      vendorIDs: $vendorIDs
      brandIDs: $brandIDs
      statusFilter: $statusFilter
      activeFilter: $activeFilter
      searchString: $searchString
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        brand_id
        brand_name
        vendor_id
        proforma_invoice_id
        vendor_name
        vendor_company
        lead_time_id
        lead_time
        po_date
        due_date
        status
        same_state
        pack
        active
        employee_name
      }
    }
  }
`

export const PRODUCT_PURCHASE_ORDER_PDF = gql`
  query ($id: ID) {
    productPurchaseOrderPDFData(id: $id) {
      id
      brand_id
      brand_name
      vendor_id
      vendor_name
      lead_time_id
      lead_time
      po_date
      due_date
      terms_conditions
      detail {
        id
        variant_id
        variant_code
        product_name
        image
        product_category_name
        product_subcategory_name
        quantity
        unit_cost
        hsn_name
        cgst
        sgst
        igst
        comment
      }
      status
      same_state
      active
      organization_data {
        name
        email
        state
        address
        gst
      }
      vendor_data {
        company
        gst
        address
      }
    }
  }
`
export const AQL_LEVELS = gql`
  query {
    aqlMains {
      id
      level_name
    }
  }
`

export const PRODUCT_PO_PIVOT_DATA = gql`
  query {
    productPurchaseOrderPivotData {
      id
      purchase_order_id
      quantity
      received_quantity
      variant_code
      brand
      product
      product_category
      product_subcategory
      vendor
      plan_quarter
      plan_year
      purchase_order_type
      status
    }
  }
`

export const PACK_VARIANTS_BY_BRAND_ID = gql`
  query ($brand_id: ID) {
    packVariantsByBrandID(brand_id: $brand_id) {
      id
      code
      image
      ean
      asin
      product_category_name
      product_subcategory_name
      hsn_name
      cgst
      sgst
      igst
    }
  }
`

export const PACK_VARIANT = gql`
  query ($id: ID) {
    packVariant(id: $id) {
      id
      code
      ean
      asin
      product_category_name
      product_subcategory_name
      hsn_name
      cgst
      sgst
      igst
      image
    }
  }
`
export const PACK_VARIANT_BY_CODES = gql`
  query ($codes: [String]) {
    packVariantByCodes(codes: $codes) {
      id
      code
      image
      ean
      asin
      product_category_name
      product_subcategory_name
      hsn_name
      cgst
      sgst
      igst
    }
  }
`
export const UPSERT_PACK_PURCHASE_ORDER = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $brand_id: Int
    $vendor_id: Int
    $lead_time_id: Int
    $lead_time: Float
    $po_date: String
    $due_date: String
    $status: String
    $same_state: Boolean
    $aql_main_id: Int!
    $pack: Boolean!
    $reject_reason: String
    $sales_order_ids: [Int]
    $terms_conditions: String
    $detail: [PackPurchaseOrderDetailInput]
  ) {
    upsertPackPurchaseOrder(
      upsertType: $upsertType
      id: $id
      purchase_order_type: "FOB"
      brand_id: $brand_id
      vendor_id: $vendor_id
      lead_time_id: $lead_time_id
      lead_time: $lead_time
      po_date: $po_date
      due_date: $due_date
      status: $status
      same_state: $same_state
      aql_main_id: $aql_main_id
      pack: $pack
      reject_reason: $reject_reason
      terms_conditions: $terms_conditions
      sales_order_ids: $sales_order_ids
      detail: $detail
    )
  }
`
export const PACK_PURCHASE_ORDER = gql`
  query ($id: ID) {
    packPurchaseOrder(id: $id) {
      id
      brand_id
      brand_name
      vendor_id
      vendor_name
      lead_time_id
      lead_time
      po_date
      due_date
      aql_main_id
      pack
      reject_reason
      sales_order_ids
      terms_conditions
      pack_detail {
        id
        pack_id
        product_name
        image
        product_category_name
        product_subcategory_name
        quantity
        unit_cost
        hsn_name
        cgst
        sgst
        igst
        comment
      }
      status
      same_state
      active
    }
  }
`

export const PACK_PURCHASE_ORDER_PDF = gql`
  query ($id: ID) {
    packPurchaseOrderPDFData(id: $id) {
      id
      brand_id
      brand_name
      vendor_id
      vendor_name
      lead_time_id
      lead_time
      po_date
      due_date
      terms_conditions
      pack_detail {
        id
        pack_id
        pack_code
        product_name
        image
        product_category_name
        product_subcategory_name
        quantity
        unit_cost
        hsn_name
        cgst
        sgst
        igst
        comment
      }
      status
      same_state
      active
      organization_data {
        name
        email
        state
        address
        gst
      }
      vendor_data {
        company
        gst
        address
      }
    }
  }
`
export const PRODUCT_PURCHASE_ORDER_BARCODE = gql`
  query ($id: ID, $type: String) {
    barcodesForProductPO(id: $id, type: $type) {
      id
      code
      ean
      name
      asin
    }
  }
`

export const PRODUCT_PURCHASE_ORDER_REJECT = gql`
  mutation ($id: ID!, $approved: Boolean!, $vendor_id: ID, $reject_reason: String) {
    productPurchaseOrderReject(
      id: $id
      approved: $approved
      vendor_id: $vendor_id
      reject_reason: $reject_reason
    )
  }
`
export const PRODUCT_PURCHASE_ORDER_STATUS_COUNT = gql`
  query ($status: String) {
    statusWisePurchaseOrderCount(status: $status) {
      count
    }
  }
`
export const VARIANTS_BY_PO_ID = gql`
  query ($purchase_order_id: ID) {
    variantsByPOID(purchase_order_id: $purchase_order_id) {
      id
      code
      image
      ean
      asin
      product_category_name
      product_subcategory_name
      hsn_name
      cgst
      sgst
      igst
    }
  }
`
export const PACK_VARIANTS_BY_PO_ID = gql`
  query ($purchase_order_id: ID) {
    packVariantsByPOID(purchase_order_id: $purchase_order_id) {
      id
      code
      image
      ean
      asin
      product_category_name
      product_subcategory_name
      hsn_name
      cgst
      sgst
      igst
    }
  }
`

// export const VENDOR_CP_BY_PRODUCT_ID=gql`
//   query (product_id:ID,vendor_id:ID){
//     vendorMarginByProductID(product_id: $product_id,vendor_id:$vendor_id){
//       cost_price
//     }
//   }
// `
