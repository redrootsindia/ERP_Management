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

export const ORGANIZATION = gql`
  query($id: ID) {
    organization(id: $id) {
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

export const UPSERT_ORGANIZATION = gql`
  mutation(
    $upsertType: String!
    $id: ID
    $name: String!
    $email: String!
    $phone: String!
    $state: String!
    $address: String!
    $gst: String!
  ) {
    upsertOrganization(
      upsertType: $upsertType
      id: $id
      name: $name
      email: $email
      phone: $phone
      state: $state
      address: $address
      gst: $gst
    )
  }
`
export const CHANGE_STATUS = gql`
  mutation($id: ID!, $status: Boolean!) {
    changeOrganizationStatus(id: $id, status: $status)
  }
`
