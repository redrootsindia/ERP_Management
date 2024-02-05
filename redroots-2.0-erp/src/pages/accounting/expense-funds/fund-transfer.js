import React, { useEffect, useState } from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Select, DatePicker, Input, Button, notification } from 'antd'
import Error403 from 'components/Errors/403'
import { useMutation, useQuery } from '@apollo/client'
import ImageUpload from 'components/ImageUpload'
import TextArea from 'antd/lib/input/TextArea'
import { EMPLOYEE_LIST, ORGANIZATION, UPSERT_FUND_TRANSFER } from './query'

const { Option } = Select
const mapStateToProps = ({ user }) => ({ user })
const FundTransfer = ({ user: { permissions } }) => {
  const history = useHistory()

  //   const [editMode, setEditMode] = useState(false)
  const [employeeList, setEmployeeList] = useState([])
  const [organizationList, setOrganizationList] = useState([])
  const [transferTo, setTransferTo] = useState(null)
  const [transferToError, setTransferToError] = useState(undefined)

  // added for voucher number in transaction history
  const [voucherNumber, setvoucherNumber] = useState(null)

  const [transferDate, setTransferDate] = useState(undefined)
  const [transferDateError, setTransferDateError] = useState(undefined)

  const [transactionId, setTransactionId] = useState('')
  const [paymentMode, setPaymentMode] = useState(undefined)
  const [paymentModeError, setPaymentModeError] = useState(undefined)

  const [accountNo, setAccountNo] = useState()
  const [transferAmount, setTransferAmount] = useState()
  const [transferAmountError, setTransferAmountError] = useState(undefined)

  const [companyName, SetCompanyName] = useState(undefined)
  const [companyNameError, SetCompanyNameError] = useState(undefined)
  const [image, setImage] = useState(undefined)

  const [remark, setRemark] = useState(undefined)
  const [phone_no, setPhone_no] = useState()

  const [amountPaidTo, setAmountPaidTo] = useState(undefined)
  const [paidToError, setPaidToError] = useState(undefined)

  const [upsertFundTransfer] = useMutation(UPSERT_FUND_TRANSFER)
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

  const onSubmit = () => {
    setTransferDateError(undefined)
    setTransferToError(undefined)
    setPaymentModeError(undefined)
    setTransferAmountError(undefined)
    SetCompanyNameError(undefined)
    let isError = false
    if (!transferTo) {
      isError = true
      setTransferToError('Select employee To Pay')
    }
    if (!transferDate) {
      isError = true
      setTransferDateError('Plaese select date!')
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
    if (!amountPaidTo) {
      isError = true
      setPaidToError('Please enter name to Pay')
    }
    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    upsertFundTransfer({
      variables: {
        upsertType: 'create',
        employee_id: String(transferTo),
        date: String(transferDate.unix() * 1000),
        amount: Number(transferAmount),
        transaction_id: String(transactionId),
        payment_mode: paymentMode,
        paid_to: amountPaidTo,
        voucher_number: String(voucherNumber),
        account_no: String(accountNo),
        company_name: companyName,
        description: remark,
        image,
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        history.push('/accounting/expense-funds/transaction-history')
      })
      .catch((error) => {
        notification.error({
          message: 'Error occured while saving AQL Levels.',
          description: error.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readAccountFunds')) return <Error403 />
  if (organizationsError) return `Error occured while fetching data: ${organizationsError.message}`
  if (employeeListError) return `Error occured while fetching data: ${employeeListError.message}`

  return (
    <div className="wrapper">
      <h4>Transfer Fund</h4>
      <div className="row">
        <div className="col-lg-4 mb-3">
          <div className="mb-2">
            Paid By
            <span className="custom-error-text"> *</span>
          </div>
          <Select
            value={transferTo}
            style={{ width: '100%' }}
            placeholder="select name to transfer"
            onChange={(value) => setTransferTo(value)}
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
          <div className="custom-error-text mb-4">{transferToError || ''}</div>
        </div>
        <div className="col-lg-4 mb-3">
          <div className="mb-2">
            Amount Paid To<span className="custom-error-text"> *</span>
          </div>
          <Input
            value={amountPaidTo}
            onChange={({ target: { value } }) => setAmountPaidTo(value)}
            placeholder="enter name"
          />
          <div className="custom-error-text mb-4">{paidToError || ''}</div>
        </div>
        <div className="col-lg-4 mb-3">
          <div className="mb-2">
            Voucher Number <span className="custom-error-text"> *</span>
          </div>
          <Input
            value={voucherNumber}
            onChange={({ target: { value } }) => setvoucherNumber(value)}
            placeholder="enter voucher ID "
          />
          <div className="custom-error-text mb-4">{paidToError || ''}</div>
        </div>
        <div className="col-lg-4 mb-3">
          <div className="mb-2">
            Date<span className="custom-error-text"> *</span>
          </div>
          <DatePicker
            style={{ width: '100%' }}
            value={transferDate}
            format="Do MMM YYYY"
            onChange={(value) => setTransferDate(value)}
          />
          <div className="custom-error-text mb-4">{transferDateError || ''}</div>
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
            <Option value="CASH">CASH</Option>
            <Option value="NEFT">NEFT</Option>
            <Option value="Gpay">G-PAY</Option>
            <Option value="paytm">PAYTM</Option>
          </Select>
          <div className="custom-error-text mb-4">{paymentModeError || ''}</div>
        </div>
        {paymentMode === 'NEFT' && (
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
        )}
        {paymentMode === 'NEFT' && (
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
        )}

        {paymentMode !== 'NEFT' && (
          <div className="col-lg-4 mb-3">
            <div className="mb-2">
              Phone No<span className="custom-error-text"> *</span>
            </div>
            <Input
              value={phone_no}
              onChange={({ value }) => setPhone_no(value)}
              placeholder="Phone no."
            />
          </div>
        )}
        <div className="col-lg-4 mb-3">
          <div className="mb-2">
            Transfer Amount<span className="custom-error-text"> *</span>
          </div>
          <Input
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            placeholder="Transfer Amount"
          />
          <div className="custom-error-text mb-4">{transferAmountError || ''}</div>
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
        <div className="col-lg-4">
          <div className="mb-2">
            Description<span className="custom-error-text"> *</span>
          </div>
          <TextArea
            value={remark}
            rows={2}
            onChange={({ target: { value } }) => setRemark(value)}
            placeholder="Remarks"
            maxLength={200}
          />
        </div>
        <div className="col-lg-4 mb-3">
          <ImageUpload
            existingImages={[]}
            placeholderType="general" // Accepted values: 'general' or 'general'
            onUploadCallback={(imgFile) => {
              setImage(imgFile)
              console.log(imgFile)
            }}
            onRemoveCallback={() => {
              setImage(null)
            }}
            maxImages={1}
            editMode={permissions.includes('createAccountFunds' || 'updateAccountFunds')}
            className="border-blue"
          />
        </div>
      </div>
      <Button onClick={onSubmit} className="btn btn-primary">
        save
      </Button>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(FundTransfer))
