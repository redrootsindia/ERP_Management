import React, { useState, useEffect } from 'react'
import { Dropdown, Badge } from 'antd'
import { useSubscription } from '@apollo/client'
import { connect } from 'react-redux'
import NotificationsList from './NotificationsList'
import styles from './style.module.scss'
import {
  PURCHASE_ORDER_ASSIGNED_FOR_VENDOR,
  PURCHASE_ORDER_UPDATED_BY_VENDOR,
  EXPENSE_MANAGEMENT_CREATED,
  EXPENSE_MANAGEMENT_UPDATED,
} from './queries'

const mapStateToProps = ({ user }) => ({ user })

const Actions = ({ user }) => {
  const [count, setCount] = useState(user.notificationCount)

  const {
    loading: purchaseOrderCreatedLoad,
    error: purchaseOrderCreatedErr,
    data: purchaseOrderCreatedData,
  } = useSubscription(PURCHASE_ORDER_ASSIGNED_FOR_VENDOR, { skip: user.type === 'admin' })

  const {
    loading: purchaseOrderUpdatedLoad,
    error: purchaseOrderUpdatedErr,
    data: purchaseOrderUpdatedData,
  } = useSubscription(PURCHASE_ORDER_UPDATED_BY_VENDOR, { skip: user.type === 'vendor' })

  const {
    loading: expenseManagementCreatedLoad,
    error: expenseManagementCreatedErr,
    data: expenseManagementCreatedData,
  } = useSubscription(EXPENSE_MANAGEMENT_CREATED, { skip: user.type === 'vendor' })

  const {
    loading: expenseManagementUpdatedLoad,
    error: expenseManagementUpdatedErr,
    data: expenseManagementUpdatedData,
  } = useSubscription(EXPENSE_MANAGEMENT_UPDATED, { skip: user.type === 'vendor' })

  useEffect(() => {
    if (!purchaseOrderCreatedLoad && purchaseOrderCreatedData) {
      setCount(count + 1)
    }
  }, [purchaseOrderCreatedLoad, purchaseOrderCreatedData])

  useEffect(() => {
    if (!purchaseOrderUpdatedLoad && purchaseOrderUpdatedData) {
      setCount(count + 1)
    }
  }, [purchaseOrderUpdatedLoad, purchaseOrderUpdatedData])

  useEffect(() => {
    if (!expenseManagementCreatedLoad && expenseManagementCreatedData) {
      setCount(count + 1)
    }
  }, [expenseManagementCreatedLoad, expenseManagementCreatedData])

  useEffect(() => {
    if (!expenseManagementUpdatedLoad && expenseManagementUpdatedData) {
      setCount(count + 1)
    }
  }, [expenseManagementUpdatedLoad, expenseManagementUpdatedData])

  if (purchaseOrderCreatedErr)
    return `Error occured while fetching data: ${purchaseOrderCreatedErr.message}`
  if (purchaseOrderUpdatedErr)
    return `Error occured while fetching data: ${purchaseOrderUpdatedErr.message}`
  if (expenseManagementCreatedErr)
    return `Error occured while fetching data: ${expenseManagementCreatedErr.message}`
  if (expenseManagementUpdatedErr)
    return `Error occured while fetching data: ${expenseManagementUpdatedErr.message}`

  const menu = (
    <React.Fragment>
      <div className="card vb__utils__shadow width-350 border-0">
        <div className="card-body p-0">
          <NotificationsList type={user.type} />
        </div>
      </div>
    </React.Fragment>
  )
  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
      <div className={styles.dropdown}>
        <Badge count={count} className={styles.badge}>
          <i className={`${styles.icon} fe fe-bell`} />
        </Badge>
      </div>
    </Dropdown>
  )
}

export default connect(mapStateToProps)(Actions)
