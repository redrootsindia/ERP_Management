import { gql } from '@apollo/client'

export const MATERIAL_AGEING_REPORT = gql`
  query (
    $categoryIDs: [ID]
    $subcategoryIDs: [ID]
    $limit: Int
    $offset: Int
    $interval_length: Int
    $searchString: String
  ) {
    materialAgeingReport(
      categoryIDs: $categoryIDs
      subcategoryIDs: $subcategoryIDs
      limit: $limit
      offset: $offset
      interval_length: $interval_length
      searchString: $searchString
    ) {
      count
      rows {
        image
        name
        category
        subcategory
        code
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

export const MATERIAL_AGEING_REPORT_PIVOT_DATA = gql`
  query ($interval_length: Int) {
    materialAgeingReportPivotData(interval_length: $interval_length) {
      name
      category
      subcategory
      code
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
