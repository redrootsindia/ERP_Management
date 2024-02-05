import { gql } from '@apollo/client'

export const MATERIAL_CATS = gql`
  query {
    materialCategories {
      id
      name
    }
  }
`

export const MATERIAL_CAT = gql`
  query($id: ID) {
    materialCategory(id: $id) {
      id
      name
    }
  }
`

export const UPSERT_MATERIAL_CAT = gql`
  mutation($upsertType: String!, $id: ID, $name: String!) {
    upsertMaterialCategory(upsertType: $upsertType, id: $id, name: $name)
  }
`
