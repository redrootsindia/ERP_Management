import apiClient from 'services/axios'
import store from 'store'
import { notification } from 'antd'

const meQuery = `
  query {
    me {
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
        notificationCount
      }
    }
  }
`

export async function login(email, password, signIn) {
  return signIn({ variables: { email, password } })
    .then(async (response) => {
      if (response) {
        const { token, userDetails } = response.data.signIn
        if (token) store.set('token', token)
        return userDetails
      }
      return false
    })
    .catch((err) => {
      notification.error({
        message: 'Error occured while signing in.',
        description: err.message || 'Please contact system administrator.',
      })
    })
}

export async function register(email, password, name) {
  return apiClient
    .post('/auth/register', { email, password, name })
    .then((response) => {
      if (response) {
        const { token } = response.data
        if (token) store.set('token', token)
        return response.data
      }
      return false
    })
    .catch((err) => console.log(err))
}

export async function currentAccount() {
  return apiClient
    .post('', { query: meQuery })
    .then((response) => {
      if (response && response.data && response.data.data && response.data.data.me) {
        const { token, userDetails } = response.data.data.me
        if (token) store.set('token', token)
        return userDetails
      }
      return false
    })
    .catch((err) => {
      notification.error({
        message: 'Error occured while fetching user account.',
        description: err.message || 'Please contact system administrator.',
      })
    })
}

export async function logout() {
  store.remove('token')
  return true
}
