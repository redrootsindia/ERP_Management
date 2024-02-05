import { gql } from '@apollo/client'

export const UPDATE_INSPECTION_PRODUCT = gql`
  mutation($qc_appointment_id: ID!, $inspectData: [ProductQCInspectInput]!) {
    updateProductInspectionData(qc_appointment_id: $qc_appointment_id, inspectData: $inspectData)
  }
`

export const UPDATE_INSPECTION_PACK = gql`
  mutation($qc_appointment_id: ID!, $inspectData: [PackQCInspectInput]!) {
    updatePackInspectionData(qc_appointment_id: $qc_appointment_id, inspectData: $inspectData)
  }
`
