import { gql } from '@apollo/client'

export const BUYER_GROUP_WAREHOUSES = gql`
  query {
    buyerGroupWarehouses {
      id
      buyer_group_id
      name
      email
      phone
      state
      city
      gst
      active
    }
  }
`

export const BUYER_GROUP_WAREHOUSE = gql`
  query($id: ID) {
    buyerGroupWarehouse(id: $id) {
      id
      buyer_group_id
      name
      email
      phone
      state
      city
      gst
    }
  }
`

export const UPSERT_BUYER_GROUP_WAREHOUSE = gql`
  mutation(
    $upsertType: String!
    $id: ID
    $buyer_group_id: ID!
    $name: String!
    $email: String
    $phone: String
    $state: String!
    $city: String!
    $gst: String
  ) {
    upsertBuyerGroupWarehouse(
      upsertType: $upsertType
      id: $id
      buyer_group_id: $buyer_group_id
      name: $name
      email: $email
      phone: $phone
      state: $state
      city: $city
      gst: $gst
    )
  }
`
