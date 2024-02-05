import { gql } from '@apollo/client'

export const WEEKLY_PAYMENT_TO_VENDORS = gql`
  query ($brandIDs: [ID], $dueDateFilter: [ID]) {
    weeklyPaymentPurchaseBills(brandIDs: $brandIDs, dueDateFilter: $dueDateFilter) {
      count
      rows {
        id
        due_date
        brand_name
        brand_id
        invoice_number
        vendor_id
        vendor_name
        total_amount
        against_po
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
export const WEEKLY_PAYMENT_FROM_BUYER = gql`
  query ($dueDateFilter: [ID], $searchString: String) {
    weeklyPaymentSaleBills(dueDateFilter: $dueDateFilter, searchString: $searchString) {
      count
      rows {
        id
        due_date
        brand_name
        invoice_number
        vendor_id
        vendor_name
        total_amount
        against_so
      }
    }
  }
`
