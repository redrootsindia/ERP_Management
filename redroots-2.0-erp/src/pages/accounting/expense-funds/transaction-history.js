import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Spin, Table, Select } from 'antd'
import Error403 from 'components/Errors/403'
import moment from 'moment'
import { useQuery } from '@apollo/client'
import { TRANSACTION_HISTORY, FUNDS_LISTS, ORGANIZATION } from './query'

const mapStateToProps = ({ user }) => ({ user })

const TransactionHistory = ({ user: { permissions, name } }) => {
  const [transactionHistoryList, setTransactionHistoryList] = useState([])
  const [organizationList, setOrganizationList] = useState([])
  const [companyID, setCompanyID] = useState('1')
  const [totalFundAmt, setTotalFundAmt] = useState([])
  const { loading: fundListLoad, data: fundListData, error: fundListError } = useQuery(FUNDS_LISTS)
  useEffect(() => {
    if (!fundListLoad && fundListData && fundListData.addFunds && fundListData.addFunds.length) {
      const open_bal = fundListData.addFunds.filter((el) => el.company_name === companyID)
      setTotalFundAmt(open_bal)
    }
  }, [fundListLoad, fundListData, companyID])
  const {
    loading: transactionHistoryLoad,
    data: TransactionHistoryData,
    error: transactionHistoryError,
  } = useQuery(TRANSACTION_HISTORY)

  useEffect(() => {
    if (
      !transactionHistoryLoad &&
      TransactionHistoryData &&
      TransactionHistoryData.fundHistory &&
      TransactionHistoryData.fundHistory.length
    ) {
      const temp = TransactionHistoryData.fundHistory.filter(
        (el) => Number(companyID) === el.company_name,
      )
      let amt = totalFundAmt.reduce((acc, obj) => acc + obj.total_amount, 0)
      const tempdata = temp.map((el) => {
        const opening_bal = amt
        const running_balance = amt - el.amount
        amt = running_balance
        return { ...el, running_balance, opening_bal }
      })

      setTransactionHistoryList(tempdata)
    }
  }, [transactionHistoryLoad, TransactionHistoryData, companyID, totalFundAmt])

  const {
    loading: organizationsLoading,
    data: organizationsData,
    error: organizationsError,
  } = useQuery(ORGANIZATION)
  useEffect(() => {
    if (
      !organizationsLoading &&
      organizationsData &&
      organizationsData.organizations &&
      organizationsData.organizations.length
    )
      setOrganizationList(organizationsData.organizations)
  }, [organizationsLoading, organizationsData])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Paid To',
      dataIndex: 'paid_to',
      key: 'paid_to',
    },
    {
      title: 'Voucher Number',
      dataIndex: 'voucher_number',
      key: 'voucher_number',
      render: (text, record) => (
        <Link to={`/accounting/expense-management/update/${record.voucher_number}`}>{text}</Link>
      ),
    },
    {
      title: 'Opening Bal',
      dataIndex: 'opening_bal',
      key: 'opening_bal',
    },
    {
      title: 'Amount Paid',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => {
        return {
          props: {
            style: { background: record.created_by === name ? '#e2b6b6' : '#afe2a2' },
          },
          children: <span>{text}</span>,
        }
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Paid By',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
    {
      title: 'Running Balance',
      dataIndex: 'running_balance',
      key: 'running_balance',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ]

  if (!permissions.includes('readAccountFunds')) return <Error403 />
  if (transactionHistoryError)
    return `Error occured while fetching data: ${transactionHistoryError.message}`
  // if (totalFundError) return `Error occured while fetching data: ${totalFundError.message}`
  if (fundListError) return `Error occured while fetching data: ${fundListError.message}`
  if (organizationsError) return `Error occured while fetching data: ${organizationsError.message}`

  return (
    <div>
      <Helmet title="Transaction History" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>TRANSACTION HISTORY</strong>
                </h5>
                <div className="col-lg-3">
                  <Select
                    key="sortBy"
                    value={companyID}
                    style={{ width: '100%' }}
                    placeholder="Select Company"
                    onChange={(value) => {
                      setCompanyID(value)
                    }}
                    className="custom-pad-r1"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {organizationList && organizationList.length
                      ? organizationList.map((el) => (
                          <Select.Option key={el.id} value={el.id}>
                            {el.name}
                          </Select.Option>
                        ))
                      : null}
                  </Select>
                  {/* <div className="custom-error-text mb-4">{companyNameError || ''}</div> */}
                </div>
              </div>

              <div className="card-body">
                <Table columns={columns} dataSource={transactionHistoryList} />
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(TransactionHistory))
