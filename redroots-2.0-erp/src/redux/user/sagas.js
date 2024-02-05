import { all, takeEvery, put, call, select } from 'redux-saga/effects'
import crypto from 'crypto'
// import store from 'store'
import { notification } from 'antd'
import { history } from 'index'
import * as firebase from 'services/firebase'
import * as jwt from 'services/jwt'
import actions from './actions'

const mapAuthProviders = {
  firebase: {
    login: firebase.login,
    register: firebase.register,
    currentAccount: firebase.currentAccount,
    logout: firebase.logout,
  },
  jwt: {
    login: jwt.login,
    register: jwt.register,
    currentAccount: jwt.currentAccount,
    logout: jwt.logout,
  },
}

export function* LOGIN({ payload }) {
  const { email, password, signIn } = payload
  yield put({ type: 'user/SET_STATE', payload: { loading: true } })
  const { authProvider: autProviderName } = yield select((state) => state.settings)

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    'aes-256-ctr',
    Buffer.concat([Buffer.from(process.env.REACT_APP_CRYPTO_SECRET), Buffer.alloc(32)], 32),
    iv,
  )
  let encrypted = cipher.update(password)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const cipheredPass = `${iv.toString('hex')}%%%%${encrypted.toString('hex')}`

  // prettier-ignore
  const userDetails = yield call(mapAuthProviders[autProviderName].login, email, cipheredPass, signIn)

  if (userDetails) {
    // yield put({ type: 'user/LOAD_CURRENT_ACCOUNT' })
    yield put({
      type: 'user/SET_STATE',
      payload: {
        id: userDetails.id,
        type: userDetails.type,
        vendor_id: userDetails.vendor_id,
        employee_id: userDetails.employee_id,
        name: userDetails.name,
        role: userDetails.role,
        email: userDetails.email,
        permissions: userDetails.permissions,
        loading: false,
        authorized: true,
      },
    })
    yield history.push('/')
    notification.success({
      message: 'Logged In',
      description: 'You have successfully logged in!',
    })
  }

  if (!userDetails) {
    yield put({ type: 'user/SET_STATE', payload: { loading: false } })
  }
}

export function* REGISTER({ payload }) {
  const { email, password, name } = payload
  yield put({
    type: 'user/SET_STATE',
    payload: {
      loading: true,
    },
  })
  const { authProvider } = yield select((state) => state.settings)
  const success = yield call(mapAuthProviders[authProvider].register, email, password, name)
  if (success) {
    yield put({
      type: 'user/LOAD_CURRENT_ACCOUNT',
    })
    yield history.push('/')
    notification.success({
      message: 'Succesful Registered',
      description: 'You have successfully registered!',
    })
  }
  if (!success) {
    yield put({
      type: 'user/SET_STATE',
      payload: {
        loading: false,
      },
    })
  }
}

export function* LOAD_CURRENT_ACCOUNT() {
  yield put({ type: 'user/SET_STATE', payload: { loading: true } })

  const { authProvider } = yield select((state) => state.settings)
  const response = yield call(mapAuthProviders[authProvider].currentAccount)

  if (response && Object.keys(response).length) {
    const { id, type, name, role, email, permissions, vendor_id, notificationCount, employee_id } =
      response
    yield put({
      type: 'user/SET_STATE',
      payload: {
        id,
        type,
        vendor_id,
        employee_id,
        name,
        role,
        email,
        permissions,
        notificationCount,
        authorized: true,
      },
    })
  }

  yield put({ type: 'user/SET_STATE', payload: { loading: false } })
}

export function* LOGOUT() {
  const { authProvider } = yield select((state) => state.settings)
  yield call(mapAuthProviders[authProvider].logout)
  yield put({
    type: 'user/SET_STATE',
    payload: {
      id: '',
      name: '',
      role: '',
      email: '',
      avatar: '',
      authorized: false,
      loading: false,
    },
  })
}

export default function* rootSaga() {
  yield all([
    takeEvery(actions.LOGIN, LOGIN),
    takeEvery(actions.REGISTER, REGISTER),
    takeEvery(actions.LOAD_CURRENT_ACCOUNT, LOAD_CURRENT_ACCOUNT),
    takeEvery(actions.LOGOUT, LOGOUT),
    LOAD_CURRENT_ACCOUNT(), // run once on app load to check user auth
  ])
}
