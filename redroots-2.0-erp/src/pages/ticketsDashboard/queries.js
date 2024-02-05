import { gql } from '@apollo/client'

const TICKETS_COUNT = gql`
  query ($status: String, $un_assigned: Boolean, $type: String, $raised_by: String) {
    ticketsCount(status: $status, un_assigned: $un_assigned, type: $type, raised_by: $raised_by) {
      id
    }
  }
`

export default TICKETS_COUNT
