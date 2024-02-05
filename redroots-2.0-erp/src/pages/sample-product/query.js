import { gql } from '@apollo/client'

export const PRODUCTS = gql`
  query {
    productNames {
      id
      name
    }
  }
`
export const VENDORS = gql`
  query {
    vendors {
      count
      rows {
        id
        name
      }
    }
  }
`
export const SAMPLE_PRODUCTS = gql`
  query {
    sampleProducts {
      count
      rows {
        id
        product_id
        product_name
        vendor_name
        date
        quantity
        image
        status
      }
    }
  }
`
export const SAMPLE_PRODUCT = gql`
  query ($id: ID) {
    sampleProduct(id: $id) {
      id
      product_id
      product_name
      vendor_id
      date
      image
      quantity
      status
    }
  }
`
export const UPSERT_SAMPLE_PRODUCT = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $product_id: ID
    $vendor_id: ID
    $date: String
    $quantity: Float
    $image: Upload
    $status: String
  ) {
    upsertSampleProduct(
      upsertType: $upsertType
      id: $id
      product_id: $product_id
      vendor_id: $vendor_id
      date: $date
      quantity: $quantity
      image: $image
      status: $status
    )
  }
`
