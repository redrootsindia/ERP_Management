import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import moment from 'moment'
import style from './style.module.scss'
import { NOTIFICATIONS } from '../queries'

const NotificationTab = (props) => {
  const { notificationType, time } = props
  const [notifications, setNotifications] = useState([])

  const { loading, error, data, refetch } = useQuery(NOTIFICATIONS, {
    variables: { notificationType, limit: 20, offset: 0 },
  })

  useEffect(() => {
    if (!loading && data && data.notifications && data.notifications.length) {
      setNotifications(data.notifications)
    }
  }, [loading, data])

  useEffect(() => refetch(), [time])

  /**
   notificationsList.map(obj => {
      if(obj.type === "purchaseORderUpdate") return <></>
      if(obj.type === "expenseUpdate") return <></>
   })

             <ul className="list-unstyled">
            {notifications.map((obj, index) => (
              <li className="mb-3" key={index}>
                <div className={style.head}>
                  <p className={style.title}>
                    Purchase Order Status:
                    <strong className="text-black">{obj.status}</strong>
                  </p>
                  <time className={style.time}>{moment(Number(obj.updatedAt)).fromNow()}</time>
                </div>
                <p>{`Purchase Order ID: ${obj.vendor_id}. is Created`}</p>
              </li>
            ))}
          </ul>
   */

  if (error) return `Error occured while fetching data: ${error.message}`
  return (
    <>
      {notifications && notifications.length ? (
        <div className="text-gray-6">
          <ul className="list-unstyled">
            {notifications.map((obj, index) => {
              switch (obj.type) {
                case 'purchaseOrderAssigned':
                  return (
                    <Link to={`/purchase-orders/product/update/${obj.reference_id}`}>
                      <li className="mb-3" key={index}>
                        <div className={style.head}>
                          <p className={style.title}>
                            New Purchase Order :
                            <strong className="text-black">{obj.reference_id}</strong>
                          </p>
                          <time className={style.time}>
                            {moment(Number(obj.createdAt)).fromNow()}
                          </time>
                        </div>
                        <p>New Purchase Order is Assigned to you. By RedRoots India</p>
                      </li>
                    </Link>
                  )
                case 'purchaseOrderUpdated':
                  return (
                    <Link to={`/purchase-orders/product/update/${obj.reference_id}`}>
                      <li className="mb-3" key={index}>
                        <div className={style.head}>
                          <p className={style.title}>
                            Purchase Order Updated :
                            <strong className="text-black">{obj.reference_id}</strong>
                          </p>
                          <time className={style.time}>
                            {moment(Number(obj.createdAt)).fromNow()}
                          </time>
                        </div>
                        <p>
                          <strong>{obj.vendor_name}</strong> has submited a new Update.
                        </p>
                      </li>
                    </Link>
                  )
                case 'expenseCreated':
                  return (
                    <Link to={`/accounting/expense-management/update/${obj.reference_id}`}>
                      <li className="mb-3" key={index}>
                        <div className={style.head}>
                          <p className={style.title}>New expense created</p>
                          <time className={style.time}>
                            {moment(Number(obj.createdAt)).fromNow()}
                          </time>
                        </div>
                        <p>
                          <strong>{obj.employee_name}</strong> has created a new expense.
                        </p>
                      </li>
                    </Link>
                  )
                case 'expenseUpdated':
                  return (
                    <Link to={`/accounting/expense-management/update/${obj.reference_id}`}>
                      <li className="mb-3" key={index}>
                        {obj.status ? (
                          obj.status === 'Approved' ? (
                            <div className={style.head}>
                              <p className={style.title}>
                                Expense Updated: <strong className="text-success"> Approved</strong>
                              </p>
                              <time className={style.time}>
                                {moment(Number(obj.createdAt)).fromNow()}
                              </time>
                            </div>
                          ) : obj.status === 'Rejected' ? (
                            <div className={style.head}>
                              <p className={style.title}>
                                Expense Updated: <strong className="text-danger"> Rejected</strong>
                              </p>
                              <time className={style.time}>
                                {moment(Number(obj.createdAt)).fromNow()}
                              </time>
                            </div>
                          ) : (
                            <div className={style.head}>
                              <p className={style.title}>
                                Expense Updated: <strong> In Review</strong>
                              </p>
                              <time className={style.time}>
                                {moment(Number(obj.createdAt)).fromNow()}
                              </time>
                            </div>
                          )
                        ) : (
                          <div className={style.head}>
                            <p className={style.title}>Expense Updated</p>
                            <time className={style.time}>
                              {moment(Number(obj.createdAt)).fromNow()}
                            </time>
                          </div>
                        )}

                        <p>
                          <strong>{obj.employee_name}</strong> has updated an expense.
                        </p>
                      </li>
                    </Link>
                  )
                default:
                  return <span>No Actions</span>
              }
            })}
          </ul>
        </div>
      ) : (
        <div className="text-center mb-3 py-4 bg-light rounded">No Actions</div>
      )}
    </>
  )
}

export default NotificationTab
