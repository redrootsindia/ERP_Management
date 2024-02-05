import { gql } from '@apollo/client'

export const TICKETS = gql`
  query (
    $ticketIDs: [ID]
    $tabType: String
    $assignedToIDs: [ID]
    $ticketTypes: [String]
    $raisedBy: String
    $status: [String]
    $role: String
    $limit: Int
    $offset: Int
    $searchString: String
    $dateRange: [String]
  ) {
    tickets(
      ticketIDs: $ticketIDs
      tabType: $tabType
      assignedToIDs: $assignedToIDs
      ticketTypes: $ticketTypes
      raisedBy: $raisedBy
      status: $status
      role: $role
      limit: $limit
      offset: $offset
      searchString: $searchString
      dateRange: $dateRange
    ) {
      count
      rows {
        id
        type
        purchase_order_type
        raised_by
        title
        assigned_to
        description
        status
        remark
        createdAt
        days
        updatedAt
        priority
      }
    }
  }
`

export const TICKET = gql`
  query ($id: ID) {
    ticket(id: $id) {
      id
      type
      raised_by
      title
      purchase_order_type
      purchase_order_ids
      description
      status
      assigned_to
      files
      user_ids
      created_by
      priority
      asignedHistory {
        id
        assignee
        reassignee
        createdAt
      }
    }
  }
`

export const UPSERT_TICKET = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $type: String
    $purchase_order_type: String
    $purchase_order_ids: [Int]
    $raised_by: String
    $title: String
    $description: String
    $status: String
    $assigned_to: Int
    $files: [Upload]
    $deleted_files: [String]
    $user_ids: [Int]
    $priority: String
  ) {
    upsertTicket(
      upsertType: $upsertType
      id: $id
      type: $type
      purchase_order_type: $purchase_order_type
      purchase_order_ids: $purchase_order_ids
      raised_by: $raised_by
      title: $title
      description: $description
      status: $status
      assigned_to: $assigned_to
      files: $files
      deleted_files: $deleted_files
      user_ids: $user_ids
      priority: $priority
    )
  }
`
export const CHANGE_TICKET_STATUS = gql`
  mutation ($id: ID!, $status: String) {
    changeTicketStatus(id: $id, status: $status)
  }
`

export const ASSIGNED_TO_EMPLOYEE = gql`
  query {
    ticketsAssignedToNamesList {
      id
      name
    }
  }
`
export const ADD_COMMENT = gql`
  mutation ($ticket_id: ID, $text: String, $files: [Upload]) {
    addComment(ticket_id: $ticket_id, text: $text, files: $files)
  }
`
export const COMMENTS_LIST = gql`
  query ($ticket_id: ID) {
    commentsList(ticket_id: $ticket_id) {
      id
      name
      profile_pic
      files
      text
      createdAt
    }
  }
`
export const DELETE_COMMENT = gql`
  mutation ($id: ID) {
    deleteComment(id: $id)
  }
`
export const USERS = gql`
  query {
    users {
      id
      employee_id
      vendor_id
      name
    }
  }
`
