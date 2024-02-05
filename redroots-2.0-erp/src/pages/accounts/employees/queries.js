import { gql } from '@apollo/client'

export const EMPLOYEES = gql`
  query ($limit: Int, $offset: Int) {
    employees(limit: $limit, offset: $offset) {
      count
      rows {
        id
        name
        email
        phone
        profile_pic
        role
        active
      }
    }
  }
`

export const EMPLOYEE = gql`
  query ($id: ID) {
    employee(id: $id) {
      id
      name
      phone
      profile_pic
      user_id
      email
      password
      role_id
      active
      departments
    }
  }
`

export const UPSERT_EMPLOYEE = gql`
  mutation (
    $upsertType: String!
    $id: ID
    $name: String!
    $email: String!
    $password: String!
    $role_id: ID!
    $phone: String
    $profile_pic: Upload
    $is_profile_pic_changed: Boolean
    $departments: [String]
  ) {
    upsertEmployee(
      upsertType: $upsertType
      id: $id
      name: $name
      email: $email
      password: $password
      role_id: $role_id
      phone: $phone
      profile_pic: $profile_pic
      is_profile_pic_changed: $is_profile_pic_changed
      departments: $departments
    )
  }
`
export const CHANGE_STATUS = gql`
  mutation ($id: ID!, $status: Boolean!) {
    changeEmployeeStatus(id: $id, status: $status)
  }
`
export const EMPLOYEE_NAMES_LIST = gql`
  query ($employeeIDs: [ID], $department_id: Int, $searchString: String) {
    employeeNames(employeeIDs: $employeeIDs, searchString: $searchString) {
      id
      name
      active
    }
  }
`
export const EMPLOYEE_NAMES_LIST_DEPARTMENT_WISE = gql`
  query ($department: String) {
    employeeNamesDepartmentWise(department: $department) {
      id
      name
    }
  }
`
