import { gql } from '@apollo/client'

export const PAYMENT_TERMS = gql`
  query {
    paymentTerms {
      id
      title
      dueInDays
    }
  }
`

export const PAYMENT_TERM = gql`
  query($id: ID) {
    paymentTerm(id: $id) {
      id
      title
      dueInDays
    }
  }
`

export const UPSERT_PAYMENT_TERM = gql`
  mutation($upsertType: String!, $id: ID, $title: String!, $dueInDays: Int!) {
    upsertPaymentTerm(upsertType: $upsertType, id: $id, title: $title, dueInDays: $dueInDays)
  }
`
