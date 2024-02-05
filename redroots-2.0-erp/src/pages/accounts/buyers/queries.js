import { gql } from '@apollo/client'

export const BUYERS = gql`
  query (
    $buyerGroupIDs: [ID]
    $statusFilter: String
    $searchString: String
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    buyers(
      buyerGroupIDs: $buyerGroupIDs
      statusFilter: $statusFilter
      searchString: $searchString
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      count
      rows {
        id
        buyer_group
        name
        phone
        email
        payment_term
        payment_term_post_grn
        marketplace_channel
        active
      }
    }
  }
`

export const BUYER = gql`
  query ($id: ID) {
    buyer(id: $id) {
      id
      buyer_group_id
      name
      phone
      email
      payment_term_id
      payment_term_id_post_grn
      marketplace_channel
      active
    }
  }
`

export const UPSERT_BUYER = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $buyer_group_id: Int!
    $name: String!
    $email: String
    $phone: String
    $marketplace_channel: String
    $payment_term_id: Int
    $payment_term_id_post_grn: Int
  ) {
    upsertBuyer(
      upsertType: $upsertType
      id: $id
      buyer_group_id: $buyer_group_id
      name: $name
      email: $email
      phone: $phone
      marketplace_channel: $marketplace_channel
      payment_term_id: $payment_term_id
      payment_term_id_post_grn: $payment_term_id_post_grn
    )
  }
`

export const CHANGE_STATUS = gql`
  mutation ($id: ID!, $status: Boolean!) {
    changeBuyerStatus(id: $id, status: $status)
  }
`
export const BUYER_NAMES = gql`
  query {
    buyerNames {
      id
      name
    }
  }
`
