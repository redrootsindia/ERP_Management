import { gql } from '@apollo/client'

export const DASHBOARD_CALENDAR = gql`
  query ($calendarDateFilter: [String]) {
    dashboardCalendar(calendarDateFilter: $calendarDateFilter) {
      id
      pack
      due_date
      po_type
    }
  }
`

export const INCOMPLETE_PRODUCTS = gql`
  query {
    incompleteProducts {
      id
      name
      brand_name
      category_name
      subcategory_name
      missing
    }
  }
`

export const INCOMPLETE_VENDORS = gql`
  query {
    incompleteVendors {
      id
      name
      company
    }
  }
`
export const INCOMPLETE_MATERIALS = gql`
  query {
    incompleteMaterials {
      id
    }
  }
`
export const INCOMPLETE_POD = gql`
  query {
    incompleteProofOfDeliveries {
      id
    }
  }
`
