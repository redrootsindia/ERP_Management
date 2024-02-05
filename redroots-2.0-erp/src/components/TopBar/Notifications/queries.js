import { gql } from '@apollo/client'

export const NOTIFICATIONS = gql`
  query($notificationType: String!, $limit: Int, $offset: Int) {
    notifications(notificationType: $notificationType, limit: $limit, offset: $offset) {
      id
      reference_table
      reference_id
      vendor_id
      vendor_name
      employee_id
      employee_name
      status
      read
      type
      active
      createdAt
    }
  }
`

export const PURCHASE_ORDER_ASSIGNED_FOR_VENDOR = gql`
  subscription {
    purchaseOrderAssignedForVendor {
      id
      reference_table
      reference_id
      employee_id
      status
    }
  }
`

export const PURCHASE_ORDER_UPDATED_BY_VENDOR = gql`
  subscription {
    purchaseOrderUpdatedByVendor {
      id
      reference_table
      reference_id
      employee_id
      status
    }
  }
`

export const EXPENSE_MANAGEMENT_CREATED = gql`
  subscription {
    expenseManagementCreated {
      id
      reference_table
      reference_id
      employee_id
      status
    }
  }
`

export const EXPENSE_MANAGEMENT_UPDATED = gql`
  subscription {
    expenseManagementUpdated {
      id
      reference_table
      reference_id
      employee_id
      status
    }
  }
`
