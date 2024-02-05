import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { UNSALABLE_REASON, UPSERT_UNSALABLE_REASONS } from './queries'

const UnsalableForm = (props) => {
  // prettier-ignore
  const { type, id, changesMadeInForm, setChangesMadeInForm, discardTableState, permissions, refetch } = props

  const [action, setAction] = useState(type)

  const [unsalableReasonID, setunsalableReasonID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [unsalableReason, setunsalableReason] = useState(undefined)

  const [unsalableReasonError, setunsalableReasonError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(unsalableReasonID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertUnsalableReason] = useMutation(UPSERT_UNSALABLE_REASONS)
  const {
    loading: unsalableReasonLoad,
    error: unsalableReasonErr,
    data: unsalableReasonData,
  } = useQuery(UNSALABLE_REASON, {
    variables: { id: unsalableReasonID },
  })

  useEffect(() => {
    if (unsalableReasonData && unsalableReasonData.unsalableReason)
      setunsalableReason(unsalableReasonData.unsalableReason.name)
  }, [unsalableReasonData])

  useEffect(() => {
    setunsalableReasonID(id)
    setunsalableReasonError(false)
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
    setunsalableReasonID(undefined)
    setAction('create')
    setOkText(unsalableReasonID ? 'Save' : 'Create')
    setunsalableReason(undefined)
    setunsalableReasonError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setunsalableReasonError(undefined)

    let isError = false
    if (!unsalableReason) {
      isError = true
      setunsalableReasonError('VendorTypes name cannot be empty')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entry.',
      })
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertUnsalableReason({
      variables: {
        upsertType: unsalableReasonID ? 'update' : 'create',
        id: unsalableReasonID,
        name: unsalableReason,
      },
    })
      .then(() => {
        setOkText(unsalableReasonID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(unsalableReasonID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving unsalable-reason.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (unsalableReasonError)
    return `Error occured while fetching data: ${unsalableReasonErr.message}`

  return (
    <div>
      <Spin spinning={unsalableReasonLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{unsalableReasonID ? 'Edit' : 'Add'} Unsalable Reason</strong>
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
                  Name<span className="custom-error-text"> *</span>
                </div>

                <Input
                  value={unsalableReason}
                  onChange={({ target: { value } }) => {
                    setunsalableReason(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={
                    unsalableReasonError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                />
                <div className="custom-error-text mb-4">{unsalableReasonError || ''}</div>
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

export default UnsalableForm
