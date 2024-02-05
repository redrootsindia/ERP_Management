import { gql } from '@apollo/client'

export const LEAD_TIMES = gql`
  query {
    leadTimes {
      id
      title
      dueInDays
    }
  }
`

export const LEAD_TIME = gql`
  query($id: ID) {
    leadTime(id: $id) {
      id
      title
      dueInDays
    }
  }
`

export const UPSERT_LEAD_TIME = gql`
  mutation($upsertType: String!, $id: ID, $title: String!, $dueInDays: Int!) {
    upsertLeadTime(upsertType: $upsertType, id: $id, title: $title, dueInDays: $dueInDays)
  }
`
