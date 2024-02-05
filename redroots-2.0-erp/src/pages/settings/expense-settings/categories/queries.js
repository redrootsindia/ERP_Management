import { gql } from '@apollo/client'

export const EXPENSE_CATS = gql`
  query {
    expenseCategories {
      id
      name
      description
      active
    }
  }
`

export const EXPENSE_CAT = gql`
  query($id: ID) {
    expenseCategory(id: $id) {
      id
      name
      description
      active
    }
  }
`

export const UPSERT_EXPENSE_CAT = gql`
  mutation($upsertType: String!, $id: ID, $name: String!, $description: String) {
    upsertExpenseCategory(upsertType: $upsertType, id: $id, name: $name, description: $description)
  }
`
