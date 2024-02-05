import { gql } from '@apollo/client'

const SIGN_IN = gql`
  mutation ($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      userDetails {
        id
        type
        vendor_id
        employee_id
        name
        email
        role_id
        role
        permissions
      }
    }
  }
`
export default SIGN_IN
