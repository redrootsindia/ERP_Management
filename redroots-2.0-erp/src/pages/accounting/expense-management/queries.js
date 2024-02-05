import { gql } from '@apollo/client'

export const EXPENSES = gql`
  query (
    $limit: Int
    $offset: Int
    $expenseDateFilter: [String]
    $statusFilter: [String]
    $sortBy: String
    $tabType: String
  ) {
    expenses(
      limit: $limit
      offset: $offset
      expenseDateFilter: $expenseDateFilter
      statusFilter: $statusFilter
      sortBy: $sortBy
      tabType: $tabType
    ) {
      count
      rows {
        id
        expense_date
        expense_due_date
        total_amount
        raised_by
        status
      }
    }
  }
`

export const EXPENSE = gql`
  query ($id: ID) {
    expense(id: $id) {
      id
      expense_date
      expense_due_date
      status
      detail {
        id
        description
        start_date
        end_date
        expense_subcategory_id
        amount
        bill_number
        company_name
        voucher_date
        expense_image
        brand_id
        status
      }
    }
  }
`

export const EXPENSE_SUBCATS = gql`
  query {
    expenseSubcategories {
      id
      name
      expense_category_id
      expense_category
    }
  }
`

export const BRANDS = gql`
  query {
    brands {
      id
      name
    }
  }
`

export const UPSERT_EXPENSE = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $expense_date: String!
    $expense_due_date: String!
    $status: String!
    $changes_made: Boolean
    $is_status_changed: Boolean
    $detail: [ExpenseManagementInput]
  ) {
    upsertExpense(
      upsertType: $upsertType
      id: $id
      expense_date: $expense_date
      expense_due_date: $expense_due_date
      status: $status
      changes_made: $changes_made
      is_status_changed: $is_status_changed
      detail: $detail
    )
  }
`
export const CHANGE_STATUS = gql`
  mutation ($id: ID!, $status: Boolean!) {
    changeOrganizationStatus(id: $id, status: $status)
  }
`
