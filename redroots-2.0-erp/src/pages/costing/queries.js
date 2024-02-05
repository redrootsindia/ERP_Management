import { gql } from '@apollo/client'

export const UPSERT_PRODUCT_COSTING = gql`
  mutation (
    $product_id: Int
    $comment: String
    $product_costing_subcategory: [ProductCostingSubcategoryInput]
    $product_costing_main: [ProductCostingMainInput]
    $product_costing_total: [ProductCostingTotalInput]
  ) {
    upsertProductCosting(
      product_id: $product_id
      comment: $comment
      product_costing_subcategory: $product_costing_subcategory
      product_costing_main: $product_costing_main
      product_costing_total: $product_costing_total
    )
  }
`
export const PRODUCT_COSTING_VERSION = gql`
  query ($version: ID, $product_id: ID) {
    productCostingVersion(version: $version, product_id: $product_id) {
      product_costing_subcategory {
        id
        width
        length
        comment
        subcategory_id
        wastage_percent
        product_costing_subcategory_data {
          id
          width
          length
          panel
          part
        }
      }
      product_costing_main {
        id
        subcategory_id
        quantity
        rate
        other_category
        category_id
        product_costing_subcategory_id
      }
      product_costing_total {
        row_key
        total
      }
    }
  }
`
export const PRODUCT_COSTING_VERSION_HISTORY = gql`
  query ($product_id: ID) {
    productCostingVersionHistory(product_id: $product_id) {
      id
      version
      comment
      name
      createdAt
    }
  }
`
export const PRODUCT_COSTING_VERSIONS = gql`
  query (
    $vendorIDs: [ID]
    $brandIDs: [ID]
    $categoryIDs: [ID]
    $subcategoryIDs: [ID]
    $statusFilter: String
    $searchString: String
    $limit: Int
    $offset: Int
  ) {
    productCostingVersions(
      vendorIDs: $vendorIDs
      brandIDs: $brandIDs
      categoryIDs: $categoryIDs
      subcategoryIDs: $subcategoryIDs
      statusFilter: $statusFilter
      searchString: $searchString
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        brand
        product
        category
        subcategory
        vendors
        year
        quarter
        cp
        image
        status
        version
        employee_name
      }
    }
  }
`
export const PRODUCT_COSTING_APPROVAL = gql`
  query {
    productCostingApproval {
      id
      image
      product
      brand
      category
      subcategory
      employee_name
    }
  }
`
export const PRODUCT_DETAIL_BY_ID = gql`
  query ($id: ID) {
    productDetailsByID(id: $id) {
      id
      name
      image
      brand
      product_category
      product_subcategory
      vendors
    }
  }
`
