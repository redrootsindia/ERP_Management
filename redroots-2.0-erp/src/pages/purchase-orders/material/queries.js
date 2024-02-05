import { gql } from '@apollo/client'

export const ORGANIZATIONS = gql`
  query {
    organizations {
      id
      name
      email
      phone
      state
      address
      gst
      active
    }
  }
`

export const VENDOR_NAMES_LIST = gql`
  query ($searchString: String, $vendorIDs: [ID]) {
    vendorNames(vendorTypeIDs: ["3"], searchString: $searchString, vendorIDs: $vendorIDs) {
      id
      name
      company
      state
      active
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

export const MATERIALS = gql`
  query (
    $materialCategoryIDs: [ID]
    $materialSubcategoryIDs: [ID]
    $materialColorIDs: [ID]
    $statusFilter: String
    $searchString: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    materials(
      materialCategoryIDs: $materialCategoryIDs
      materialSubcategoryIDs: $materialSubcategoryIDs
      materialColorIDs: $materialColorIDs
      statusFilter: $statusFilter
      searchString: $searchString
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        name
        material_category_id
        material_category_name
        material_subcategory_id
        material_subcategory_name
        material_color_id
        material_color_name
        material_code
        uom_id
        uom_name
        price_per_uom
        panna
        moq
        msq
        image
        active
      }
    }
  }
`

export const MATERIAL_CATEGORIES = gql`
  query {
    materialCategories {
      id
      name
    }
  }
`

export const MATERIAL_SUBCATEGORIES = gql`
  query {
    materialSubcategories {
      id
      name
    }
  }
`

export const MATERIAL_SUBCATEGORY_BY_CATEGORY_ID = gql`
  query ($material_category_id: ID) {
    materialSubcategoryByCategoryID(material_category_id: $material_category_id) {
      id
      name
      active
    }
  }
`

export const MATERIAL_COLORS = gql`
  query {
    materialColors {
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

export const MATERIAL = gql`
  query ($id: ID) {
    material(id: $id) {
      id
      name
      material_category_id
      material_category_name
      material_subcategory_id
      material_subcategory_name
      material_color_id
      material_color_name
      material_code
      uom_id
      uom_name
      price_per_uom
      panna
      moq
      msq
      image
      active
      hsn_name
      cgst
      sgst
      igst
    }
  }
`

export const MATERIAL_BY_CODES = gql`
  query ($codes: [String]) {
    materialByCodes(codes: $codes) {
      id
      name
      material_category_id
      material_category_name
      material_subcategory_id
      material_subcategory_name
      material_color_id
      material_color_name
      material_code
      uom_id
      uom_name
      price_per_uom
      panna
      moq
      msq
      image
      active
      hsn_name
      cgst
      sgst
      igst
    }
  }
`

export const MATERIAL_PURCHASE_ORDER = gql`
  query ($id: ID) {
    materialPurchaseOrder(id: $id) {
      id
      organization_id
      organization_name
      vendor_id
      vendor_name
      lead_time_id
      lead_time
      po_date
      due_date
      detail {
        id
        material_id
        material_name
        image
        panna
        material_category_name
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

export const UPSERT_MATERIAL_PURCHASE_ORDER = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $organization_id: Int
    $vendor_id: Int
    $lead_time_id: Int
    $lead_time: Float
    $po_date: String
    $due_date: String
    $status: String
    $same_state: Boolean
    $detail: [MaterialPurchaseOrderDetailInput]
  ) {
    upsertMaterialPurchaseOrder(
      upsertType: $upsertType
      id: $id
      organization_id: $organization_id
      vendor_id: $vendor_id
      lead_time_id: $lead_time_id
      lead_time: $lead_time
      po_date: $po_date
      due_date: $due_date
      status: $status
      same_state: $same_state
      detail: $detail
    )
  }
`

export const CHANGE_STATUS = gql`
  mutation ($id: ID!, $active: Boolean!) {
    changeMaterialPurchaseOrderStatus(id: $id, active: $active)
  }
`

export const MATERIAL_PURCHASE_ORDERS = gql`
  query (
    $vendorIDs: [ID]
    $organizationIDs: [ID]
    $statusFilter: String
    $activeFilter: String
    $searchString: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    materialPurchaseOrders(
      vendorIDs: $vendorIDs
      organizationIDs: $organizationIDs
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
        organization_id
        organization_name
        vendor_id
        vendor_name
        vendor_company
        lead_time_id
        lead_time
        po_date
        due_date
        status
        same_state
        active
        employee_name
      }
    }
  }
`

export const MATERIAL_PURCHASE_ORDER_PDF = gql`
  query ($id: ID) {
    materialPurchaseOrderPDFData(id: $id) {
      id
      organization_id
      organization_data {
        name
        email
        state
        address
        gst
      }
      vendor_id
      vendor_data {
        company
        gst
        address
      }
      lead_time_id
      lead_time
      po_date
      due_date
      detail {
        id
        material_id
        material_name
        image
        panna
        material_category_name
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
export const MATERIAL_PO_PIVOT_DATA = gql`
  query {
    materialPurchaseOrderPivotData {
      id
      purchase_order_id
      quantity
      received_quantity
      material_name
      material_category
      material_subcategory
      organization
      vendor
      status
      plan_quarter
      plan_year
    }
  }
`
