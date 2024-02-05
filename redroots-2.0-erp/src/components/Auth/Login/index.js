import React from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import { Input, Button, Form } from 'antd'
import { Link } from 'react-router-dom'
import style from '../style.module.scss'
import SIGN_IN from './queries'

const mapStateToProps = ({ user, settings, dispatch }) => ({
  dispatch,
  user,
  authProvider: settings.authProvider,
  logo: settings.logo,
  version: settings.version,
})

const Login = ({ dispatch, user }) => {
  const [signIn] = useMutation(SIGN_IN)

  const onFinish = (values) => dispatch({ type: 'user/LOGIN', payload: { ...values, signIn } })

  const onFinishFailed = (errorInfo) => console.log('Failed:', errorInfo)

  return (
    <div>
      <div className="pt-2 pb-5 text-center">
        <div className={style.logo}>
          <img src="resources/images/logo/banner_logo.png" alt="logo" />
        </div>
      </div>
      <div className={`card ${style.container}`}>
        <div className="text-dark font-size-32 mb-3">Sign In</div>
        <Form
          layout="vertical"
          hideRequiredMark
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          className="mb-4"
          initialValues={{ email: 'admin@admin.com', password: 'qwerty1234' }}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your e-mail address' }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password' }]}
          >
            <Input type="password" />
          </Form.Item>
          <Button
            type="primary"
            className="text-center w-100 btn btn-success"
            htmlType="submit"
            loading={user.loading}
          >
            <strong>Sign in</strong>
          </Button>
        </Form>
        <Link to="/auth/forgot-password" className="vb__utils__link">
          Forgot Password?
        </Link>
      </div>
      {/* <div className="text-center pt-2 mb-auto">
        <span className="mr-2">Don&#39;t have an account?</span>
        <Link to="/auth/register" className="vb__utils__link">
          Sign up
        </Link>
      </div> */}
    </div>
  )
}

export default connect(mapStateToProps)(Login)
