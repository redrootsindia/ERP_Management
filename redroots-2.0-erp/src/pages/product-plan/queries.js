import { gql } from '@apollo/client'

export const CATEGORIES_BY_BRAND_ID = gql`
  query ($brand_id: ID) {
    categoriesByBrandID(brand_id: $brand_id) {
      category_id
      category_name
    }
  }
`

export const UPSERT_PRODUCT_PLAN = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $quarter: String
    $year: String
    $brand_id: ID
    $budget_new_product: Float
    $budget_repeat_product: Float
    $product_plan_categories: [ProductPlanCategoryInput]
  ) {
    upsertProductPlan(
      upsertType: $upsertType
      id: $id
      quarter: $quarter
      year: $year
      brand_id: $brand_id
      budget_new_product: $budget_new_product
      budget_repeat_product: $budget_repeat_product
      product_plan_categories: $product_plan_categories
    )
  }
`
export const PRODUCT_PLAN = gql`
  query ($id: ID) {
    productPlan(id: $id) {
      id
      quarter
      year
      brand_id
      budget_new_product
      budget_repeat_product
      product_plan_categories {
        id
        category_id
        subcategories {
          id
          subcategory_id
          new_product_budget
          repeat_product_budget
        }
      }
    }
  }
`

export const PRODUCT_PLANS = gql`
  query ($limit: Int, $offset: Int) {
    productPlans(limit: $limit, offset: $offset) {
      count
      rows {
        id
        year
        quarter
        brand_id
        styles
        planned_quantity
        brand_name
        budget_new_product
        budget_repeat_product
      }
    }
  }
`

export const PRODUCT_PLAN_PIVOT_DATA = gql`
  query {
    productPlanPivotData {
      quarter
      year
      brand_name
      product_category_name
      product_subcategory_name
      new_product_budget
      repeat_product_budget
    }
  }
`
export const SUBCATEGORIES_BY_PLAN_ID = gql`
  query ($product_plan_id: ID) {
    subCategoriesByPlanID(product_plan_id: $product_plan_id) {
      id
      subcategory_id
      new_product_budget
      repeat_product_budget
    }
  }
`

export const USED_BUDGET_BY_PLAN_ID = gql`
  query ($product_plan_id: ID) {
    usedBudgetByPlanID(product_plan_id: $product_plan_id) {
      subcategory_id
      used_budget
      type
    }
  }
`
export const ADD_PRODUCT_PLAN_STYLES = gql`
  mutation ($product_plan_id: ID, $styles: [ProductPlanStylesInput], $transfer_plan_id: ID) {
    addProductPlanStyle(
      styles: $styles
      product_plan_id: $product_plan_id
      transfer_plan_id: $transfer_plan_id
    )
  }
`

export const PRODUCT_PLAN_STYLES = gql`
  query ($limit: Int, $offset: Int, $product_plan_id: ID) {
    productPlanStyles(limit: $limit, offset: $offset, product_plan_id: $product_plan_id) {
      count
      rows {
        id
        name
        image
        product_subcategory
        product_category
        sp
        tp
        mrp
        vendors
        quantity
        type
      }
    }
  }
`
export const PLANS_TO_TRANSFER = gql`
  query ($product_plan_id: ID, $brand_id: ID) {
    plansToTransfer(product_plan_id: $product_plan_id, brand_id: $brand_id) {
      id
      year
      quarter
    }
  }
`
export const REMAINING_BUDGET_FOR_PRODUCT_STYLE = gql`
  query ($product_plan_id: ID, $product_id: ID) {
    remainingBudgetForProductStyle(product_plan_id: $product_plan_id, product_id: $product_id) {
      alloted_budget
      used_budget
    }
  }
`
export const PRODUCT_DETAIL_WITH_PLAN_STYLES = gql`
  query ($product_plan_id: ID, $product_id: ID) {
    productDetailWithPlanStyles(product_plan_id: $product_plan_id, product_id: $product_id) {
      image
      name
      year
      quarter
      vendor_ids
      hsn_id
      sp
      tp
      mrp
      createdAt
      user_name
      product_category
      product_subcategory
      type
      quantity
      status
      remainingBudget
    }
  }
`
export const UPSERT_PRODUCT_DETAIL_WITH_PLAN_STYLE = gql`
  mutation (
    $product_id: ID
    $product_plan_id: ID
    $sp: Float
    $quantity: Int
    $vendor_ids: [Int]
    $hsn_id: Int
    $image: Upload
    $is_image_changed: Boolean
    $changesMadeForProduct: Boolean
    $changesMadeForPlanStyles: Boolean
    $status: Boolean
  ) {
    upsertProductDetailWithPlanStyle(
      product_id: $product_id
      product_plan_id: $product_plan_id
      sp: $sp
      quantity: $quantity
      vendor_ids: $vendor_ids
      hsn_id: $hsn_id
      image: $image
      is_image_changed: $is_image_changed
      changesMadeForProduct: $changesMadeForProduct
      changesMadeForPlanStyles: $changesMadeForPlanStyles
      status: $status
    )
  }
`
