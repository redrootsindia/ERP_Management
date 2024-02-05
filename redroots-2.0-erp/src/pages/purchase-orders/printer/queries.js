import { gql } from '@apollo/client'

export const UPSERT_PRINTER_PRODUCT_PURCHASE_ORDER = gql`
  mutation (
    $upsertType: String!
    $parent_purchase_order_id: ID
    $purchase_order_name: String
    $id: ID
    $vendor_id: Int
    $po_date: String
    $due_date: String
    $status: String
    $pack: Boolean!
    $terms_conditions: String
    $detail: [PrinterProductPODetailInput]
  ) {
    upsertPrinterProductPurchaseOrder(
      upsertType: $upsertType
      id: $id
      parent_purchase_order_id: $parent_purchase_order_id
      purchase_order_name: $purchase_order_name
      vendor_id: $vendor_id
      po_date: $po_date
      due_date: $due_date
      status: $status
      pack: $pack
      terms_conditions: $terms_conditions
      detail: $detail
    )
  }
`

export const UPSERT_PRINTER_PACK_PURCHASE_ORDER = gql`
  mutation (
    $upsertType: String!
    $parent_purchase_order_id: ID
    $purchase_order_name: String
    $id: ID
    $vendor_id: Int
    $po_date: String
    $due_date: String
    $status: String
    $pack: Boolean!
    $terms_conditions: String
    $detail: [PrinterPackPODetailInput]
  ) {
    upsertPrinterPackPurchaseOrder(
      upsertType: $upsertType
      id: $id
      parent_purchase_order_id: $parent_purchase_order_id
      purchase_order_name: $purchase_order_name
      vendor_id: $vendor_id
      po_date: $po_date
      due_date: $due_date
      status: $status
      pack: $pack
      terms_conditions: $terms_conditions
      detail: $detail
    )
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
export const PRINTER_PRODUCT_PURCHASE_ORDER = gql`
  query ($id: ID) {
    printerProductPO(id: $id) {
      id
      parent_purchase_order_id
      vendor_id
      po_date
      due_date
      status
      pack
      terms_conditions
      purchase_order_name
      detail {
        id
        printer_purchase_order_id
        variant_id
        product_name
        image
        product_category_name
        product_subcategory_name
        quantity
        unit_cost
        cgst
        sgst
        igst
        comment
        quantity
        fulfilled_quantity
      }
      active
    }
  }
`
export const PRINTER_PACK_PURCHASE_ORDER = gql`
  query ($id: ID) {
    printerPackPO(id: $id) {
      id
      parent_purchase_order_id
      vendor_id
      po_date
      due_date
      status
      pack
      purchase_order_name
      terms_conditions
      pack_detail {
        id
        printer_purchase_order_id
        pack_id
        product_name
        image
        product_category_name
        product_subcategory_name
        quantity
        unit_cost
        cgst
        sgst
        igst
        comment
        quantity
        fulfilled_quantity
      }
      active
    }
  }
`

export const PRINTER_PURCHASE_ORDERS = gql`
  query (
    $dateFilter: [String]
    $statusFilter: String
    $searchString: String
    $limit: Int
    $offset: Int
  ) {
    printerPurchaseOrders(
      statusFilter: $statusFilter
      dateFilter: $dateFilter
      searchString: $searchString
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        parent_purchase_order_id
        purchase_order_name
        vendor_name
        po_date
        due_date
        pack
        status
      }
    }
  }
`
export const PRINTER_PRODUCT_PURCHASE_ORDER_PDF = gql`
  query ($id: ID) {
    printerProductPOPDFData(id: $id) {
      id
      parent_purchase_order_id
      vendor_id
      po_date
      due_date
      status
      terms_conditions
      purchase_order_name
      detail {
        id
        printer_purchase_order_id
        variant_id
        variant_code
        product_name
        image
        product_category_name
        product_subcategory_name
        unit_cost
        cgst
        sgst
        igst
        comment
        fulfilled_quantity
      }
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
      active
    }
  }
`

export const PRINTER_PACK_PURCHASE_ORDER_PDF = gql`
  query ($id: ID) {
    printerPackPOPDFData(id: $id) {
      id
      vendor_id
      po_date
      due_date
      status
      terms_conditions
      purchase_order_name
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
        cgst
        sgst
        igst
        comment
        quantity
        fulfilled_quantity
      }
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
      active
    }
  }
`
