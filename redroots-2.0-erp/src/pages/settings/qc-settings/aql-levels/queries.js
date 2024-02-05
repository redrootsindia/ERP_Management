import { gql } from '@apollo/client'

export const AQLMAINS = gql`
  query {
    aqlMains {
      id
      level_name
      active
    }
  }
`

export const AQLMAIN = gql`
  query($id: ID) {
    aqlMain(id: $id) {
      id
      level_name
      active
      detail {
        id
        aql_main_id
        fail_size
        pass_size
        sample_size
        batch_size_min
        batch_size_max
      }
    }
  }
`

export const UPSERT_AQLMAIN = gql`
  mutation(
    $upsertType: String!
    $id: ID
    $levelName: String!
    $detail: [AQLCeriteriaSampleDetailInput]
  ) {
    upsertAQLMain(upsertType: $upsertType, id: $id, level_name: $levelName, detail: $detail)
  }
`
export const CHANGE_STATUS = gql`
  mutation($id: ID!, $status: Boolean!) {
    changeOrganizationStatus(id: $id, status: $status)
  }
`
