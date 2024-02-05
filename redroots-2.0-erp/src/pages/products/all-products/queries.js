import { gql } from '@apollo/client'

export const PRODUCTS = gql`
  query (
    $vendorIDs: [ID]
    $brandIDs: [ID]
    $categoryIDs: [ID]
    $subcategoryIDs: [ID]
    $statusFilter: String
    $searchString: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    products(
      vendorIDs: $vendorIDs
      brandIDs: $brandIDs
      categoryIDs: $categoryIDs
      subcategoryIDs: $subcategoryIDs
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
        code
        image
        brand
        product_subcategory
        product_category
        sp
        tp
        mrp
        vendors
        hsn
        product_description
        product_length
        product_width
        product_height
        product_weight
        package_length
        package_width
        package_height
        package_weight
        active
      }
    }
  }
`

export const PRODUCT = gql`
  query ($id: ID) {
    product(id: $id) {
      id
      name
      code
      image
      brand_id
      product_category_id
      product_subcategory_id
      sp
      tp
      mrp
      vendor_ids
      hsn_id
      product_description
      product_length
      product_width
      product_height
      product_weight
      package_length
      package_width
      package_height
      package_weight
      attribute_value_ids
      variant_attribute_ids
      append_to_name_attribute_ids
      active
      variants {
        id
        code
        ean
        asin
        image
        attribute_value_ids
      }
      product_qc_specs {
        id
        product_id
        specs_id
        specs_expected_value
        uom_id
        specs_threshold
        active
      }
      version
      photoshoot_videos
      photoshoot_images
    }
  }
`

export const PRODUCTS_BY_IDS = gql`
  query ($ids: [ID]) {
    productsByIDs(ids: $ids) {
      id
      name
      code
      image
      brand_id
      product_category_id
      product_subcategory_id
      sp
      tp
      mrp
      vendor_ids
      hsn_id
      product_description
      product_length
      product_width
      product_height
      product_weight
      package_length
      package_width
      package_height
      package_weight
      attribute_value_ids
      variant_attribute_ids
      append_to_name_attribute_ids
      active
      variants {
        id
        code
        ean
        asin
        image
        attribute_value_ids
      }
      product_qc_specs {
        id
        product_id
        specs_id
        specs_expected_value
        uom_id
        specs_threshold
        active
      }
    }
  }
`

export const UPSERT_PRODUCT = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $name: String!
    $code: String!
    $image: Upload
    $is_image_changed: Boolean
    $brand_id: Int!
    $product_category_id: Int!
    $product_subcategory_id: Int!
    $sp: Float
    $tp: Float
    $mrp: Float
    $product_description: String
    $product_length: Float
    $product_width: Float
    $product_height: Float
    $product_weight: Float
    $package_length: Float
    $package_width: Float
    $package_height: Float
    $package_weight: Float
    $vendor_ids: [Int]
    $attribute_value_ids: [Int]
    $variant_attribute_ids: [Int]
    $append_to_name_attribute_ids: [Int]
    $hsn_id: Int!
    $variants: [VariantInput]
    $product_qc_specs: [ProductSpecsDataInput]
    $buyer_margin: [BuyerMarginInput]
    $vendor_margin: [VendorMarginInput]
    $deleted_buyer_margin_ids: [ID]
    $deleted_vendor_margin_ids: [ID]
    $photoshoot_images: [Upload]
    $deleted_photoshoot_images: [String]
    $photoshoot_videos: [Upload]
    $deleted_photoshoot_videos: [String]
  ) {
    upsertProduct(
      upsertType: $upsertType
      id: $id
      name: $name
      code: $code
      image: $image
      is_image_changed: $is_image_changed
      brand_id: $brand_id
      product_category_id: $product_category_id
      product_subcategory_id: $product_subcategory_id
      sp: $sp
      tp: $tp
      mrp: $mrp
      vendor_ids: $vendor_ids
      hsn_id: $hsn_id
      product_description: $product_description
      product_length: $product_length
      product_width: $product_width
      product_height: $product_height
      product_weight: $product_weight
      package_length: $package_length
      package_width: $package_width
      package_height: $package_height
      package_weight: $package_weight
      attribute_value_ids: $attribute_value_ids
      variant_attribute_ids: $variant_attribute_ids
      append_to_name_attribute_ids: $append_to_name_attribute_ids
      variants: $variants
      product_qc_specs: $product_qc_specs
      buyer_margin: $buyer_margin
      vendor_margin: $vendor_margin
      deleted_buyer_margin_ids: $deleted_buyer_margin_ids
      deleted_vendor_margin_ids: $deleted_vendor_margin_ids
      photoshoot_images: $photoshoot_images
      deleted_photoshoot_images: $deleted_photoshoot_images
      photoshoot_videos: $photoshoot_videos
      deleted_photoshoot_videos: $deleted_photoshoot_videos
    )
  }
`

export const CHANGE_STATUS = gql`
  mutation ($id: ID!, $status: Boolean!) {
    changeProductStatus(id: $id, status: $status)
  }
`

export const PROD_SUBCATS = gql`
  query {
    productSubcategories {
      id
      name
      product_category_id
      active
    }
  }
`

export const GROUPED_ATTRIBUTE_VALUES = gql`
  query {
    groupedAttributeValues {
      attribute_id
      attribute_name
      attribute_values {
        id
        name
      }
    }
  }
`

export const ATTRIBUTE_VALUES = gql`
  query {
    attributeValues {
      id
      name
      attribute_id
    }
  }
`

export const MARGIN_BY_PRODUCT_ID = gql`
  query ($product_id: ID) {
    marginsByProductID(product_id: $product_id) {
      buyer_margin {
        id
        product_id
        buyer_id
        mrp
        discount_value
        target_selling_price
        margin_percent
      }
      vendor_margin {
        id
        product_id
        vendor_id
        cost_price
        transport_cost
        margin_percent
        transfer_price_marketing
        packaging
        photoshoot
        brand_marketing
      }
    }
  }
`

export const PRODUCTS_BY_BRAND_ID = gql`
  query (
    $product_plan_id: ID
    $brand_id: ID
    $includeType: Boolean
    $plan_type: String
    $transfer_plan_id: ID
  ) {
    productsByBrandID(
      product_plan_id: $product_plan_id
      brand_id: $brand_id
      includeType: $includeType
      transfer_plan_id: $transfer_plan_id
      plan_type: $plan_type
    ) {
      id
      name
      image
      product_category
      product_subcategory
      product_category_id
      product_subcategory_id
      hsn
      sp
      type
    }
  }
`

export const VARIANT_CODES = gql`
  query {
    variantCodes {
      id
      code
      image
    }
  }
`
