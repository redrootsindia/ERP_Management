import { gql } from '@apollo/client'

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
export const ORGANIZATION = gql`
  query {
    organizations {
      id
      name
    }
  }
`
export const TOTAL_FUNDS = gql`
  query {
    fundAmount {
      total_funds
    }
  }
`
export const UPSERT_ADD_FUND = gql`
  mutation (
    $upsertType: String
    $employee_id: String
    $total_amount: Float
    $date: String
    $remarks: String
    $transaction_id: String
    $account_no: String
    $company_name: String
    $payment_mode: String
  ) {
    upsertAddFund(
      upsertType: $upsertType
      employee_id: $employee_id
      total_amount: $total_amount
      date: $date
      remarks: $remarks
      transaction_id: $transaction_id
      account_no: $account_no
      company_name: $company_name
      payment_mode: $payment_mode
    )
  }
`

export const UPSERT_FUND_TRANSFER = gql`
  mutation (
    $upsertType: String
    $employee_id: String
    $amount: Float
    $date: String
    $transaction_id: String
    $account_no: String
    $paid_to: String
    $voucher_number: String
    $company_name: String
    $description: String
    $payment_mode: String
    $image: Upload
  ) {
    upsertFundTransfer(
      upsertType: $upsertType
      employee_id: $employee_id
      amount: $amount
      date: $date
      transaction_id: $transaction_id
      account_no: $account_no
      paid_to: $paid_to
      voucher_number: $voucher_number
      company_name: $company_name
      description: $description
      payment_mode: $payment_mode
      image: $image
    )
  }
`
export const TRANSACTION_HISTORY = gql`
  query {
    fundHistory {
      id
      employee_id
      employee_name
      amount
      paid_to
      voucher_number
      description
      company_name
      date
      created_name
      created_by
    }
  }
`
export const FUNDS_LISTS = gql`
  query {
    addFunds {
      id
      employee_id
      total_amount
      date
      transaction_id
      account_no
      company_name
      payment_mode
      remarks
      image
      created_by
      updated_by
    }
  }
`
