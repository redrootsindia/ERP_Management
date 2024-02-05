import { gql } from '@apollo/client'

export const PACKS = gql`
  query($createdAtFilter: [String], $searchString: String, $limit: Int, $offset: Int) {
    packs(
      createdAtFilter: $createdAtFilter
      searchString: $searchString
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        pack_of
        brand_id
        brand_name
        category_id
        category_name
        sub_category_id
        sub_category_name
        vendors
        products
        description
        sp
        tp
        mrp
        vendor_ids
        hsn_id
        active
      }
    }
  }
`

export const PACK = gql`
  query($id: ID) {
    pack(id: $id) {
      id
      pack_of
      brand_id
      category_id
      sub_category_id
      contains_same_product
      description
      sp
      tp
      mrp
      vendor_ids
      hsn_id
      packs {
        id
        pack_master_id
        code
        ean
        asin
        image
        pack_variant_detail {
          id
          pack_id
          product_id
          variant_id
        }
      }
    }
  }
`

export const PRODUCTS = gql`
  query($brandIDs: [ID], $categoryIDs: [ID], $subcategoryIDs: [ID]) {
    products(brandIDs: $brandIDs, categoryIDs: $categoryIDs, subcategoryIDs: $subcategoryIDs) {
      count
      rows {
        id
        name
        code
        image
      }
    }
  }
`
export const PRODUCT = gql`
  query($id: ID) {
    product(id: $id) {
      id
      name
      code
      image
      variants {
        id
        code
        ean
        asin
        image
        attribute_value_ids
      }
    }
  }
`

export const UPSERT_PACK = gql`
  mutation(
    $upsertType: String!
    $id: ID
    $brand_id: ID
    $category_id: ID
    $sub_category_id: ID
    $pack_of: Int!
    $contains_same_product: Boolean
    $description: String
    $sp: Float
    $tp: Float
    $mrp: Float
    $vendor_ids: [ID]
    $hsn_id: ID
    $pack_input: [PackInput]
  ) {
    upsertPack(
      upsertType: $upsertType
      id: $id
      brand_id: $brand_id
      category_id: $category_id
      sub_category_id: $sub_category_id
      pack_of: $pack_of
      pack_input: $pack_input
      contains_same_product: $contains_same_product
      description: $description
      sp: $sp
      tp: $tp
      mrp: $mrp
      vendor_ids: $vendor_ids
      hsn_id: $hsn_id
    )
  }
`
export const CHANGE_STATUS = gql`
  mutation($id: ID!, $status: Boolean!) {
    changePackStatus(id: $id, status: $status)
  }
`
