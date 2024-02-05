import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Spin, Table } from 'antd'
import Error403 from 'components/Errors/403'
import { useQuery } from '@apollo/client'
import { EXPENSE_SUMMARY } from './query'
import PaidModal from './expenseModal'

const mapStateToProps = ({ user }) => ({ user })

const ExpenseSummary = ({ user: { permissions } }) => {
  const [expenseSummaryList, setExpenseSummaryList] = useState([])
  const { loading, data, refetch } = useQuery(EXPENSE_SUMMARY)
  useEffect(() => {
    if (!loading && data && data.expenseSummery && data.expenseSummery.length) {
      setExpenseSummaryList(data.expenseSummery)
    } else {
      setExpenseSummaryList([])
    }
  }, [loading, data])

  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Total Voucher Val',
      dataIndex: 'amount',
      key: 'amount',
      // render: (text, record) => (
      //   <span>{}</span>
      // ),
    },
    {
      title: 'Approved Amt',
      dataIndex: 'approved',
      key: 'approved',
    },

    {
      title: 'Rejected Amt',
      dataIndex: 'rejected',
      key: 'rejected',
    },
    {
      title: 'Partial/In Review Amt',
      dataIndex: 'inreview',
      key: 'inreview',
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paid_amount',
      key: 'paid_amount',
    },
    {
      title: 'Approval Pending',
      dataIndex: 'approval_pending',
      key: 'approval_pending',
      render: (text, record) => <span>{record.rejected + record.inreview}</span>,
    },
    {
      title: 'Balance To be Paid',
      dataIndex: 'payable',
      key: 'payable',
      render: (text, record) => (
        <span style={{ color: 'red' }}>{record.approved - record.paid_amount}</span>
      ),
    },
    {
      title: 'Paid',
      dataIndex: 'paid',
      key: 'paid',
      render: (text, record) => <PaidModal emp_name={record.name} refetch={refetch} />,
    },
  ]

  if (!permissions.includes('readExpenseManagement')) return <Error403 />

  return (
    <div>
      <Helmet title="Expense Management" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>Expense Summary</strong>
                </h5>
              </div>

              <div className="card-body">
                <Table columns={tableColumns} dataSource={expenseSummaryList} />
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(ExpenseSummary))
