import React from 'react'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { UserOutlined } from '@ant-design/icons'
import { Menu, Dropdown, Avatar } from 'antd'
import styles from './style.module.scss'

const mapStateToProps = ({ user }) => ({ user })

const ProfileMenu = ({ dispatch, user }) => {
  const history = useHistory()

  const logout = (e) => {
    e.preventDefault()
    dispatch({ type: 'user/LOGOUT' })
  }

  const editProfile = (e) => {
    e.preventDefault()
    history.push(
      `/accounts/${user.type === 'admin' ? 'employees' : 'vendors'}/update/${
        user.type === 'admin' ? user.employee_id : user.vendor_id
      }`,
    )
  }

  const menu = (
    <Menu selectable={false}>
      <Menu.Item>
        <strong>{user.name || 'Anonymous'}</strong>
        <div>
          <strong>
            <FormattedMessage id="topBar.profileMenu.email" />:{' '}
          </strong>
          {user.email || '—'}
        </div>
        <div>
          <strong>
            <FormattedMessage id="topBar.profileMenu.role" />:{' '}
          </strong>
          {user.role || '—'}
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <a href="#" onClick={editProfile}>
          <i className="fe fe-user mr-2" />
          <FormattedMessage id="topBar.profileMenu.editProfile" />
        </a>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <a href="#" onClick={logout}>
          <i className="fe fe-log-out mr-2" />
          <FormattedMessage id="topBar.profileMenu.logout" />
        </a>
      </Menu.Item>
    </Menu>
  )
  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      placement="bottomRight"
      overlayClassName="topbar-avatar-dropdown-lower"
    >
      <div className={styles.dropdown}>
        <Avatar className={styles.avatar} shape="circle" size="large" icon={<UserOutlined />} />
      </div>
    </Dropdown>
  )
}

export default connect(mapStateToProps)(ProfileMenu)
