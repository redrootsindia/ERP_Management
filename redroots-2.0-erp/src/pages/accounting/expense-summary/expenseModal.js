import React, { useEffect, useState } from 'react'
import { Button, Modal, DatePicker, Select, Input, notification } from 'antd'
import ImageUpload from 'components/ImageUpload'
import { useMutation, useQuery } from '@apollo/client'
import { UPSERT_EXPENSE_PAID, EMPLOYEE_LIST } from './query'

const { TextArea } = Input
const { Option } = Select

function PaidModal({ refetch, emp_name }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paidDate, setPaidDate] = useState(undefined)
  const [paidDateError, setPaidDateError] = useState(undefined)
  const [transactionId, setTransactionId] = useState('')
  const [transactionIdError, setTransactionIdError] = useState(undefined)
  const [paymentMode, setPaymentMode] = useState(undefined)
  const [accountNo, setAccountNo] = useState()
  const [accountNumberError, setAccountNumberError] = useState(undefined)
  const [paidAmount, setPaidAmount] = useState()
  const [paidAmountError, setPaidAmountError] = useState(undefined)
  const [remark, setRemark] = useState()
  const [company, setCompany] = useState(undefined)
  const [paidTo, setPaidTo] = useState(null)
  const [paidToError, setPaidToError] = useState(undefined)
  const [paidImage, setPaidImage] = useState(null)
  const [employeeList, setEmployeeList] = useState([])

  const [upsertPaidAmount] = useMutation(UPSERT_EXPENSE_PAID)

  const { loading, data } = useQuery(EMPLOYEE_LIST)
  useEffect(() => {
    if (!loading && data && data.employees && data.employees.rows && data.employees.rows.length)
      setEmployeeList(data.employees.rows)
  }, [loading, data])
  const showModal = () => {
    setIsModalOpen(true)
    employeeList.forEach((el) => {
      if (el.name === emp_name) {
        setPaidTo(el.id)
      }
    })
  }

  const handleSubmit = () => {
    setPaidAmountError(undefined)
    setPaidDateError(undefined)
    setTransactionIdError(undefined)
    setAccountNumberError(undefined)
    let isError = false
    if (paymentMode !== 'cash' && !transactionId) {
      isError = true
      setTransactionIdError('TransactionID can not be empty')
    }
    if (!paidDate) {
      isError = true
      setPaidDateError(`Paid Date can not be empty`)
    }
    if (!paidTo) {
      isError = true
      setPaidToError('Paid To can not be empty')
    }
    if (paymentMode !== 'cash' && !accountNo) {
      isError = true
      setAccountNumberError('Account Number can not be empty')
    }
    if (!paidAmount) {
      isError = true
      setPaidAmountError('Paid Amt can not be empty')
    }
    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    upsertPaidAmount({
      variables: {
        upsertType: 'create',
        date: String(paidDate.unix() * 1000),
        transaction_id: String(transactionId),
        payment_mode: paymentMode,
        paid_amount: Number(paidAmount),
        account_no: accountNo,
        company_name: company,
        remarks: remark,
        image: paidImage,
        employee_id: paidTo,
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        setIsModalOpen(false)
        setPaidDate(undefined)
        setTransactionId('')
        setPaymentMode(undefined)
        setAccountNo('')
        setPaidAmount('')
        setRemark('')
        setCompany(undefined)
        setPaidImage(null)
        setPaidTo(null)
        refetch()
      })
      .catch((error) => {
        notification.error({
          message: 'Error occured while saving AQL Levels.',
          description: error.message || 'Please contact system administrator.',
        })
      })
  }
  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Paid
      </Button>
      {isModalOpen && (
        <Modal
          title="Expense Modal"
          width={900}
          style={{ top: 20 }}
          visible={isModalOpen}
          onOk={handleSubmit}
          onCancel={handleCancel}
        >
          <div className="row">
            <div className="col-lg-4 mb-3">
              <div className="mb-2">
                Paid To
                <span className="custom-error-text"> *</span>
              </div>
              <Select
                value={paidTo}
                style={{ width: '100%' }}
                placeholder="select name to pay"
                onChange={(value) => setPaidTo(value)}
                className="custom-pad-r1"
                disabled
              >
                {employeeList && employeeList.length
                  ? employeeList.map((obj) => (
                      <Select.Option key={String(obj.id)} value={String(obj.id)}>
                        {obj.name}
                      </Select.Option>
                    ))
                  : null}
              </Select>
              <div className="custom-error-text mb-4">{paidToError || ''}</div>
            </div>

            <div className="col-lg-3 mb-3">
              <div className="mb-2">
                Date<span className="custom-error-text"> *</span>
              </div>
              <DatePicker
                style={{ width: '100%' }}
                value={paidDate}
                format="Do MMM YYYY"
                // className={paidDateError ? 'custom-error-border' : 'disabledStyle'}
                onChange={(value) => setPaidDate(value)}
              />
              <div className="custom-error-text mb-4">{paidDateError || ''}</div>
            </div>

            <div className="col-lg-4 mb-3">
              <div className="mb-2">
                Transaction ID<span className="custom-error-text"> *</span>
              </div>
              <Input
                value={transactionId}
                onChange={({ target: { value } }) => setTransactionId(value)}
                // disabled={disabled}
                // className={nameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                placeholder="Transaction ID"
              />
              <div className="custom-error-text mb-4">{transactionIdError || ''}</div>
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
              >
                <Option value="cash">Cash</Option>
                <Option value="neft">NEFT</Option>
                <Option value="Gpay">G-pay</Option>
                <Option value="paytm">Paytm</Option>
              </Select>
            </div>
            <div className="col-lg-3 mb-3">
              <div className="mb-2">
                Account No<span className="custom-error-text"> *</span>
              </div>
              <Input
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="Account no."
                //   disabled={paymentMode}
                // className={accountNumberError ? 'custom-error-border' : 'disabledStyle'}
              />
              <div className="custom-error-text mb-4">{accountNumberError || ''}</div>
            </div>
            <div className="col-lg-4 mb-3">
              <div className="mb-2">
                Paid Amount<span className="custom-error-text"> *</span>
              </div>
              <Input
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="Paid Amount"
                // className={paidAmountError ? 'custom-error-border' : 'disabledStyle'}
              />
              <div className="custom-error-text mb-4">{paidAmountError || ''}</div>
            </div>
            <div className="col-lg-4 mb-3">
              <div className="mb-2">
                Company<span className="custom-error-text"> *</span>
              </div>
              <Select
                key="sortBy"
                value={company}
                style={{ width: '100%' }}
                placeholder="Company"
                onChange={(value) => setCompany(value)}
                className="custom-pad-r1"
              >
                <Option key="redroots" value="redroots">
                  Redroots
                </Option>
                <Option key="RedTurk" value="RedTurk">
                  RedTurk
                </Option>
                <Option key="threearrows" value="threearrows">
                  Threearrows
                </Option>
              </Select>
            </div>

            <div className="col-lg-4">
              <div className="mb-2">
                remark<span className="custom-error-text"> *</span>
              </div>
              <TextArea
                value={remark}
                rows={2}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Remarks"
                maxLength={200}
              />
            </div>
            <div className="col-lg-3">
              <ImageUpload
                existingImages={paidImage}
                placeholderType="general" // Accepted values: 'general' or 'general'
                onUploadCallback={(imgFile) => {
                  setPaidImage(imgFile)
                }}
                onRemoveCallback={() => {
                  setPaidImage(null)
                }}
                maxImages={1}
                editMode={isModalOpen}
                className="border-blue"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default PaidModal
