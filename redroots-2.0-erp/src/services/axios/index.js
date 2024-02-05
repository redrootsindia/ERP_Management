import axios from 'axios'
import store from 'store'
import { notification } from 'antd'

const apiClient = axios.create({ baseURL: process.env.REACT_APP_HTTP_URL })

apiClient.interceptors.request.use((request) => {
  const tokenHeaderVar = 'x-token'
  const token = store.get('token')
  if (token) request.headers[tokenHeaderVar] = token
  return request
})

apiClient.interceptors.response.use(undefined, (error) => {
  // Errors handling
  const { response } = error
  const { data } = response
  if (data) notification.warning({ message: data })
})

export default apiClient
