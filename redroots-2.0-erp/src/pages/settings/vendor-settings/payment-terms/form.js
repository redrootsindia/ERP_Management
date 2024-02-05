import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, InputNumber, Button, Spin, Switch, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { PAYMENT_TERM, UPSERT_PAYMENT_TERM } from './queries'

const PaymentTermForm = (props) => {
  // prettier-ignore
  const { type, id, changesMadeInForm, setChangesMadeInForm, discardTableState, permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [paymentTermID, setPaymentTermID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [title, setTitle] = useState(undefined)
  const [titleError, setTitleError] = useState(undefined)

  const [dueInDays, setDueInDays] = useState(undefined)
  const [dueInDaysError, setDueInDaysError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(paymentTermID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertPaymentTerm] = useMutation(UPSERT_PAYMENT_TERM)
  const { loading: payTermLoad, error: payTermErr, data: payTermData } = useQuery(PAYMENT_TERM, {
    variables: { id: paymentTermID },
  })

  useEffect(() => {
    if (payTermData && payTermData.paymentTerm) {
      if (payTermData.paymentTerm.title) setTitle(payTermData.paymentTerm.title)
      setDueInDays(payTermData.paymentTerm.dueInDays || 0)
    }
  }, [payTermData])

  useEffect(() => {
    setPaymentTermID(id)
    setTitleError(false)
    setDueInDaysError(false)
    setOkText(id ? 'Save' : 'Create')
    setAction(type)
  }, [id, type])

  const showDiscardModal = () => {
    if (changesMadeInForm) setDiscardModalVisible(true)
    else discardChanges()
  }

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) discardChanges()
  }

  const discardChanges = () => {
    setPaymentTermID(undefined)
    setAction('create')
    setOkText(paymentTermID ? 'Save' : 'Create')
    setTitle(undefined)
    setTitleError(false)
    setDueInDays(undefined)
    setDueInDaysError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setTitleError(undefined)

    let isError = false
    if (!title) {
      isError = true
      setTitleError('Title cannot be empty')
    }
    if (dueInDays === undefined || dueInDays === null || Number(dueInDays) < 0) {
      isError = true
      setDueInDaysError('Due-in-days should be a positive number')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertPaymentTerm({
      variables: {
        upsertType: paymentTermID ? 'update' : 'create',
        id: paymentTermID,
        title,
        dueInDays,
      },
    })
      .then(() => {
        setOkText(paymentTermID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(paymentTermID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving payment-term.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (payTermErr) return `Error occured while fetching data: ${payTermErr.message}`

  return (
    <div>
      <Spin spinning={payTermLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{paymentTermID ? 'Edit' : 'Add'} Payment Term</strong>
                </h5>
              </div>

              {action === 'update' && permissions.includes('updateSettings') ? (
                <div className="col-3 pull-right">
                  <Switch
                    checked={editMode}
                    onChange={(checked) => {
                      setEditMode(checked)
                      setDisabled(!checked)
                    }}
                  />
                  &ensp;Edit
                </div>
              ) : null}
            </div>
          </div>

          <div className="card-body">
            <div className="row">
              <div className="col-12">
                <div className="mb-2">
                  Title<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={title}
                  onChange={({ target: { value } }) => {
                    setTitle(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={titleError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{titleError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">
                  Due in days<span className="custom-error-text"> *</span>
                </div>
                <InputNumber
                  value={dueInDays}
                  onChange={(value) => {
                    setDueInDays(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={
                    dueInDaysError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                />
                <div className="custom-error-text mb-4">{dueInDaysError || ''}</div>
              </div>
            </div>

            <div className="row mt-4 mb-4 ml-2">
              {showActionButtons ? (
                <>
                  <Button type="primary" onClick={onSubmit} disabled={disabled}>
                    {okText}
                  </Button>
                  &emsp;
                  <Button danger onClick={showDiscardModal}>
                    Discard
                  </Button>
                  <ConfirmDiscard
                    discardModalVisible={discardModalVisible}
                    discardModalVisibleCallback={discardModalVisibleCallback}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default PaymentTermForm
