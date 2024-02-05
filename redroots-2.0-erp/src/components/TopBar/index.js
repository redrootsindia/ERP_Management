import React from 'react'
import { Row, Col } from 'antd'
import Breadcrumbs from 'components/Breadcrumbs'
import Notifications from './Notifications'
import UserMenu from './UserMenu'
import style from './style.module.scss'

const TopBar = () => {
  return (
    <Row>
      <Col span={1} />
      <Col span={20}>
        <div className={style.topbar}>
          <Breadcrumbs />
        </div>
      </Col>
      <Col span={2}>
        <div className={style.notifications}>
          <Notifications />
        </div>
      </Col>
      <Col span={1}>
        <div className={style.userMenu}>
          <UserMenu />
        </div>
      </Col>
    </Row>
  )
}

export default TopBar
