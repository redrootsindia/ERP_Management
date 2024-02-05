import React, { useState } from 'react'
import { Tabs } from 'antd'
import NotificationTab from './notificationTab'
import style from './style.module.scss'

const { TabPane } = Tabs

const List2 = (props) => {
  const { type } = props

  const [timePurchaseOrder, setTimePurchaseOrder] = useState(new Date().getTime())
  const [timeExpense, setTimeExpense] = useState(new Date().getTime())
  const [currentTab, setCurrentTab] = useState('1')

  return (
    <div>
      <Tabs
        className={`${style.tabs} vb-tabs-bordered`}
        defaultActiveKey={currentTab}
        onChange={(activeKey) => {
          setCurrentTab(activeKey)
          if (activeKey === '1') setTimePurchaseOrder(new Date().getTime())
          if (activeKey === '2') setTimeExpense(new Date().getTime())
        }}
      >
        <TabPane tab="Purchase Order" key="1">
          <NotificationTab notificationType="purchaseOrder" type={type} time={timePurchaseOrder} />
        </TabPane>
        {type === 'admin' ? (
          <>
            <TabPane tab="Expense Management" key="2">
              <NotificationTab
                notificationType="expenseManagement"
                type={type}
                time={timeExpense}
              />
            </TabPane>
          </>
        ) : null}
        {/* <TabPane tab="Alerts" key="1">
          <div className="text-gray-6">
            <ul className="list-unstyled">
              <li className="mb-3">
                <div className={style.head}>
                  <p className={style.title}>
                    Update Status:
                    <strong className="text-black"> New</strong>
                  </p>
                  <time className={style.time}>5 min ago</time>
                </div>
                <p>Mary has approved your quote.</p>
              </li>
              <li className="mb-3">
                <div className={style.head}>
                  <p className={style.title}>
                    Update Status:
                    <strong className="text-danger"> Rejected</strong>
                  </p>
                  <time className={style.time}>15 min ago</time>
                </div>
                <p>Mary has declined your quote.</p>
              </li>
              <li className="mb-3">
                <div className={style.head}>
                  <p className={style.title}>
                    Payment Received:
                    <strong className="text-black"> $5,467.00</strong>
                  </p>
                  <time className={style.time}>15 min ago</time>
                </div>
                <p>GOOGLE, LLC AUTOMATED PAYMENTS PAYMENT</p>
              </li>
              <li className="mb-3">
                <div className={style.head}>
                  <p className={style.title}>
                    Notification:
                    <strong className="text-danger"> Access Denied</strong>
                  </p>
                  <time className={style.time}>5 Hours ago</time>
                </div>
                <p>The system prevent login to your account</p>
              </li>
              <li className="mb-3">
                <div className={style.head}>
                  <p className={style.title}>
                    Payment Received:
                    <strong className="text-black">$55,829.00</strong>
                  </p>
                  <time className={style.time}>1 day ago</time>
                </div>
                <p>GOOGLE, LLC AUTOMATED PAYMENTS PAYMENT</p>
              </li>
              <li className="mb-3">
                <div className={style.head}>
                  <p className={style.title}>
                    Notification:
                    <strong className="text-danger"> Access Denied</strong>
                  </p>
                  <time className={style.time}>5 Hours ago</time>
                </div>
                <p>The system prevent login to your account</p>
              </li>
            </ul>
          </div>
        </TabPane>
        <TabPane tab="Events" key="2">
          <div className="text-center mb-3 py-4 bg-light rounded">No Events</div>
        </TabPane>
        <TabPane tab="Actions" key="3"> 
          <div className="text-center mb-3 py-4 bg-light rounded">No Actions</div>
        </TabPane> */}
      </Tabs>
    </div>
  )
}

export default List2
