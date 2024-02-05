import { gql } from '@apollo/client'

export const MATERIAL_COLORS = gql`
  query ($searchString: String) {
    materialColors(searchString: $searchString) {
      id
      name
    }
  }
`

export const MATERIAL_COLOR = gql`
  query ($id: ID) {
    materialColor(id: $id) {
      id
      name
    }
  }
`

export const UPSERT_MATERIAL_COLOR = gql`
  mutation ($upsertType: String!, $id: ID, $name: String!) {
    upsertMaterialColor(upsertType: $upsertType, id: $id, name: $name)
  }
`
