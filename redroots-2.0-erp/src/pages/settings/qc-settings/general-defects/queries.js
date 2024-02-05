import { gql } from '@apollo/client'

export const AQL_CRITERIA_GENERALS = gql`
  query($activeOnly: Boolean) {
    aqlCriteriaGenerals(activeOnly: $activeOnly) {
      id
      defect_name
      critical_threshold
      major_threshold
      minor_threshold
    }
  }
`

export const AQL_CRITERIA_GENERAL = gql`
  query($id: ID) {
    aqlCriteriaGeneral(id: $id) {
      id
      defect_name
      critical_threshold
      major_threshold
      minor_threshold
    }
  }
`

export const UPSERT_AQL_CRITERIA_GENERALS = gql`
  mutation(
    $upsertType: String!
    $id: ID
    $defectName: String!
    $criticalThreshold: Int!
    $majorThreshold: Int!
    $minorThreshold: Int!
  ) {
    upsertAQLCriteriaGeneral(
      upsertType: $upsertType
      id: $id
      defect_name: $defectName
      critical_threshold: $criticalThreshold
      major_threshold: $majorThreshold
      minor_threshold: $minorThreshold
    )
  }
`
