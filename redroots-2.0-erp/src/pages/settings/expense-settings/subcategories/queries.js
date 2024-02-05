import { gql } from '@apollo/client'

export const EXPENSE_SUBCATS = gql`
  query {
    expenseSubcategories {
      id
      name
      expense_category_id
      active
    }
  }
`

export const EXPENSE_SUBCAT = gql`
  query($id: ID) {
    expenseSubcategory(id: $id) {
      id
      name
      expense_category_id
      active
    }
  }
`

export const EXPENSE_SUBCAT_BY_CAT_ID = gql`
  query($expense_category_id: ID) {
    expenseSubcategoryByCategoryID(expense_category_id: $expense_category_id) {
      id
      name
      active
    }
  }
`

export const UPSERT_EXPENSE_SUBCAT = gql`
  mutation($upsertType: String!, $id: ID, $name: String!, $expense_category_id: ID!) {
    upsertExpenseSubcategory(
      upsertType: $upsertType
      id: $id
      name: $name
      expense_category_id: $expense_category_id
    )
  }
`
