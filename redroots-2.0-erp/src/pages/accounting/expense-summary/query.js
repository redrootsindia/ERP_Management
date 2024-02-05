import { gql } from '@apollo/client'

export const EXPENSE_SUMMARY = gql`
  query {
    expenseSummery {
      id
      name
      approved
      inreview
      rejected
      paid_amount
      amount
    }
  }
`
export const EMPLOYEE_LIST = gql`
  query {
    employees {
      count
      rows {
        id
        name
      }
    }
  }
`
export const UPSERT_EXPENSE_PAID = gql`
  mutation (
    $upsertType: String!
    $date: String
    $transaction_id: String!
    $payment_mode: String!
    $paid_amount: Float!
    $account_no: String
    $company_name: String!
    $remarks: String!
    $image: Upload!
    $employee_id: String
  ) {
    upsertPaidAmount(
      upsertType: $upsertType
      date: $date
      transaction_id: $transaction_id
      payment_mode: $payment_mode
      paid_amount: $paid_amount
      account_no: $account_no
      company_name: $company_name
      remarks: $remarks
      image: $image
      employee_id: $employee_id
    )
  }
`
