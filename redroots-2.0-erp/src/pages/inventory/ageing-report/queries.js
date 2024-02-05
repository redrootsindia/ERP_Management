import { gql } from '@apollo/client'

export const AGEING_REPORT = gql`
  query (
    $brandIDs: [ID]
    $categoryIDs: [ID]
    $subcategoryIDs: [ID]
    $limit: Int
    $offset: Int
    $interval_length: Int
    $searchString: String
  ) {
    ageingReport(
      brandIDs: $brandIDs
      categoryIDs: $categoryIDs
      subcategoryIDs: $subcategoryIDs
      limit: $limit
      offset: $offset
      interval_length: $interval_length
      searchString: $searchString
    ) {
      count
      rows {
        variant_image
        product_name
        brand
        product_category
        product_subcategory
        variant_code
        days30
        days60
        days90
        days120
        days180
        days360
        days360plus
      }
    }
  }
`

export const AGEING_REPORT_PIVOT_DATA = gql`
  query ($interval_length: Int) {
    ageingReportPivotData(interval_length: $interval_length) {
      product_name
      brand
      product_category
      product_subcategory
      variant_code
      days30
      days60
      days90
      days120
      days180
      days360
      days360plus
      quantity
    }
  }
`
