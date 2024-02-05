import React, { useEffect, useState } from 'react'
import { Link, Switch, useParams, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Spin, Select, DatePicker, Input, Button, notification } from 'antd'
import Error403 from 'components/Errors/403'
import TextArea from 'antd/lib/input/TextArea'
import { useMutation, useQuery } from '@apollo/client'
import {
  EMPLOYEE_LIST,
  ORGANIZATION,
  UPSERT_ADD_FUND,
  FUNDS_LISTS,
  // TRANSACTION_HISTORY,
} from './query'
import FundTransfer from './fund-transfer'

const mapStateToProps = ({ user }) => ({ user })
const { Option } = Select
const ExpenseFund = ({ user: { permissions } }) => {
  const { action } = useParams()
  const [fundState, setFundState] = useState(true)
  const [employeeList, setEmployeeList] = useState([])
  const [organizationList, setOrganizationList] = useState([])
  const [fundTo, setFundTo] = useState(null)
  const [fundToError, setFundToError] = useState(undefined)
  const [date, setDate] = useState(undefined)
  const [dateError, setDateError] = useState(undefined)
  const [transactionId, setTransactionId] = useState('')
  const [paymentMode, setPaymentMode] = useState(undefined)
  const [paymentModeError, setPaymentModeError] = useState(undefined)
  const [accountNo, setAccountNo] = useState()
  const [transferAmount, setTransferAmount] = useState()
  const [transferAmountError, setTransferAmountError] = useState(undefined)
  const [companyName, SetCompanyName] = useState(undefined)
  const [companyID, setCompanyID] = useState('1')
  const [companyNameError, SetCompanyNameError] = useState(undefined)
  // const [totalFund, SetTotalFund] = useState()
  const [remark, setRemark] = useState()
  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateMaterial')),
  )
  const [upsertAddFund] = useMutation(UPSERT_ADD_FUND)

  // const [transactionHistoryAmount, setTransactionHistoryAmount] = useState(0)
  // fund transfer history to calculate remain fund
  // const {
  //   loading: transactionHistoryLoad,
  //   data: TransactionHistoryData,
  //   error: transactionHistoryError,
  // } = useQuery(TRANSACTION_HISTORY)

  // useEffect(() => {
  //   if (
  //     !transactionHistoryLoad &&
  //     TransactionHistoryData &&
  //     TransactionHistoryData.fundHistory &&
  //     TransactionHistoryData.fundHistory.length
  //   ) {
  //     setTransactionHistoryAmount(
  //       TransactionHistoryData.fundHistory.reduce((acc, obj) => acc + obj.amount, 0),
  //     )
  //   }
  // }, [transactionHistoryLoad, TransactionHistoryData])
  // fund list
  const [totalFundAmt, setTotalFundAmt] = useState([])
  const { loading: fundListLoad, data: fundListData, error: fundListError } = useQuery(FUNDS_LISTS)
  useEffect(() => {
    if (!fundListLoad && fundListData && fundListData.addFunds && fundListData.addFunds.length) {
      const open_bal = fundListData.addFunds.filter((el) => el.company_name === companyID)
      setTotalFundAmt(open_bal)
    }
  }, [fundListLoad, fundListData, companyID])
  // end fund list
  // const {
  //   loading: totalFundLoad,
  //   data: totalFundData,
  //   error: totalFundError,
  // } = useQuery(TOTAL_FUNDS)
  // useEffect(() => {
  //   if (
  //     !totalFundLoad &&
  //     totalFundData &&
  //     totalFundData.fundAmount &&
  //     totalFundData.fundAmount.length
  //   ) {
  //     // const total_fun_amt = totalFundData.fundAmount.find((el) => el.id === employee_id)
  //     // const remainingFund = total_fun_amt.total_funds - transactionHistoryAmount
  //     // SetTotalFund(remainingFund)
  //     if (companyID) {
  //       console.log(totalFundData.fundAmount.filter((el) => el.company_name === companyID))
  //     }
  //     SetTotalFund(totalFundData.fundAmount.reduce((acc, obj) => acc + obj.total_funds, 0))
  //   }
  // }, [totalFundLoad, totalFundData, transactionHistoryAmount])

  const {
    loading: employeeListLoad,
    data: employeeListLoadData,
    error: employeeListError,
  } = useQuery(EMPLOYEE_LIST)
  useEffect(() => {
    if (
      !employeeListLoad &&
      employeeListLoadData &&
      employeeListLoadData.employees &&
      employeeListLoadData.employees.rows &&
      employeeListLoadData.employees.rows.length
    )
      setEmployeeList(employeeListLoadData.employees.rows)
  }, [employeeListLoad, employeeListLoadData])

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

  const handleFundTransfer = () => {
    setFundState(false)
  }
  const handleAddFund = () => {
    setFundState(true)
  }

  const onSubmit = () => {
    setDateError(undefined)
    setFundToError(undefined)
    setPaymentModeError(undefined)
    setTransferAmountError(undefined)
    SetCompanyNameError(undefined)
    let isError = false
    if (!fundTo) {
      isError = true
      setFundToError('Select employee To Pay')
    }
    if (!date) {
      isError = true
      setDateError('Plaese select date!')
    }
    if (!paymentMode) {
      isError = true
      setPaymentModeError('Please Select Pay Mode!')
    }
    if (!companyName) {
      isError = true
      SetCompanyNameError('Please Select company!')
    }
    if (!transferAmount) {
      isError = true
      setTransferAmountError('Transfer amount can not be empty!')
    }
    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    upsertAddFund({
      variables: {
        upsertType: 'create',
        employee_id: String(fundTo),
        date: String(date.unix() * 1000),
        total_amount: Number(transferAmount),
        transaction_id: String(transactionId),
        payment_mode: paymentMode,
        account_no: String(accountNo),
        company_name: companyName,
        // remarks: remark,
        // image: paidImage,
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        setFundTo(null)
        setDate(undefined)
        setTransactionId('')
        setPaymentMode(undefined)
        setAccountNo('')
        setTransferAmount('')
        setRemark('')
        SetCompanyName(undefined)
        // setPaidImage(null)
        // refetch()
      })
      .catch((error) => {
        notification.error({
          message: 'Error occured while saving AQL Levels.',
          description: error.message || 'Please contact system administrator.',
        })
      })
  }
  if (!permissions.includes('createAccountFunds')) return <Error403 />
  if (organizationsError) return `Error occured while fetching data: ${organizationsError.message}`
  if (employeeListError) return `Error occured while fetching data: ${employeeListError.message}`
  // if (totalFundError) return `Error occured while fetching data: ${totalFundError.message}`
  if (fundListError) return `Error occured while fetching data: ${fundListError.message}`
  // if (transactionHistoryError)
  //   return `Error occured while fetching data: ${transactionHistoryError.message}`

  return (
    <div>
      <Helmet title="Expense Funds" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between">
                  <h5 className="mb-2">
                    <strong>Expense Fund</strong>
                  </h5>

                  {/* <h3 className="pull-right">TOTAL FUNDS :{totalFund ? totalFund.total_funds : 0}</h3> */}
                  <h3 className="pull-right">
                    TOTAL FUNDS :{totalFundAmt.reduce((acc, obj) => acc + obj.total_amount, 0)}
                  </h3>
                </div>
                <div className="row">
                  <div className="col-lg-3">
                    <div className="mb-2">
                      Company<span className="custom-error-text"> *</span>
                    </div>
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
                  </div>
                </div>
              </div>
              {action === 'update' && permissions.includes('updateAccountFunds') ? (
                <div className="col-1 pull-right">
                  <Switch
                    checked={editMode}
                    onChange={(checked) => {
                      setEditMode(checked)
                      // setDisabled(!checked)
                    }}
                  />
                  &ensp;Edit
                </div>
              ) : null}
              <div className="card-body">
                <div className="btn-group-fund pull-right">
                  <Link
                    to="/accounting/expense-funds/transaction-history"
                    className="btn btn-primary mr-3"
                  >
                    History
                  </Link>
                  <Button onClick={handleAddFund} className="btn btn-primary mr-2">
                    Add Fund
                  </Button>
                  <Button onClick={handleFundTransfer} className="btn btn-primary">
                    Fund Transfer
                  </Button>
                </div>
                {fundState ? (
                  <div className="wrapper">
                    <h4>Add Fund</h4>
                    <div className="row">
                      <div className="col-lg-4 mb-3">
                        <div className="mb-2">
                          Fund To
                          <span className="custom-error-text"> *</span>
                        </div>
                        <Select
                          value={fundTo}
                          style={{ width: '100%' }}
                          placeholder="select name to pay"
                          onChange={(value) => setFundTo(value)}
                          className="custom-pad-r1"
                          showSearch
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {employeeList && employeeList.length
                            ? employeeList.map((obj) => (
                                <Select.Option key={String(obj.id)} value={String(obj.id)}>
                                  {obj.name}
                                </Select.Option>
                              ))
                            : null}
                        </Select>
                        <div className="custom-error-text mb-4">{fundToError || ''}</div>
                      </div>
                      <div className="col-lg-4 mb-3">
                        <div className="mb-2">
                          Company<span className="custom-error-text"> *</span>
                        </div>
                        <Select
                          key="sortBy"
                          value={companyName}
                          style={{ width: '100%' }}
                          placeholder="Select Company"
                          onChange={(value) => SetCompanyName(value)}
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
                        <div className="custom-error-text mb-4">{companyNameError || ''}</div>
                      </div>

                      <div className="col-lg-4 mb-3">
                        <div className="mb-2">
                          Payment Mode<span className="custom-error-text"> *</span>
                        </div>
                        <Select
                          value={paymentMode}
                          style={{ width: '100%' }}
                          placeholder="Payment Mode"
                          onChange={(value) => setPaymentMode(value)}
                          className="custom-pad-r1"
                          showSearch
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          <Option value="cash">Cash</Option>
                          <Option value="neft">NEFT</Option>
                          <Option value="Gpay">G-pay</Option>
                          <Option value="paytm">Paytm</Option>
                        </Select>
                        <div className="custom-error-text mb-4">{paymentModeError || ''}</div>
                      </div>
                      <div className="col-lg-4 mb-3">
                        <div className="mb-2">
                          Date<span className="custom-error-text"> *</span>
                        </div>
                        <DatePicker
                          style={{ width: '100%' }}
                          value={date}
                          format="Do MMM YYYY"
                          onChange={(value) => setDate(value)}
                        />
                        <div className="custom-error-text mb-4">{dateError || ''}</div>
                      </div>
                      <div className="col-lg-4 mb-3">
                        <div className="mb-2">
                          Transaction ID<span className="custom-error-text"> *</span>
                        </div>
                        <Input
                          value={transactionId}
                          onChange={({ target: { value } }) => setTransactionId(value)}
                          placeholder="Transaction ID"
                        />
                      </div>

                      <div className="col-lg-4 mb-3">
                        <div className="mb-2">
                          Account No<span className="custom-error-text"> *</span>
                        </div>
                        <Input
                          value={accountNo}
                          onChange={({ target: { value } }) => setAccountNo(value)}
                          placeholder="Account no."
                        />
                      </div>
                      <div className="col-lg-4 mb-3">
                        <div className="mb-2">
                          Paid Amount<span className="custom-error-text"> *</span>
                        </div>
                        <Input
                          value={transferAmount}
                          onChange={({ target: { value } }) => setTransferAmount(value)}
                          placeholder="Paid Amount"
                        />
                        <div className="custom-error-text mb-4">{transferAmountError || ''}</div>
                      </div>

                      <div className="col-lg-4">
                        <div className="mb-2">
                          remark<span className="custom-error-text"> *</span>
                        </div>
                        <TextArea
                          value={remark}
                          rows={2}
                          onChange={({ target: { value } }) => setRemark(value)}
                          placeholder="Remarks"
                          maxLength={200}
                        />
                      </div>
                    </div>
                    <Button onClick={onSubmit} className="btn btn-primary">
                      save
                    </Button>
                  </div>
                ) : (
                  <FundTransfer />
                )}
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(ExpenseFund))
