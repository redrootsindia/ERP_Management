import { gql } from '@apollo/client'

export const ATTRIBUTE_VALUES = gql`
  query {
    attributeValues {
      id
      name
      attribute_id
    }
  }
`

export const ATTRIBUTE_VALUE = gql`
  query($id: ID) {
    attributeValue(id: $id) {
      id
      name
      attribute_id
    }
  }
`

export const ATTRIBUTE_VALUE_BY_ATTRIBUTE_ID = gql`
  query($attribute_id: ID) {
    attributeValueByattributeID(attribute_id: $attribute_id) {
      id
      name
      active
    }
  }
`

export const UPSERT_ATTRIBUTE_VALUE = gql`
  mutation($upsertType: String!, $id: ID, $name: String!, $attribute_id: Int!) {
    upsertAttributeValue(upsertType: $upsertType, id: $id, name: $name, attribute_id: $attribute_id)
  }
`
