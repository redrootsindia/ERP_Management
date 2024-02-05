import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { RETURN_REASON_CATEGORY, UPSERT_RETURN_REASON_CATEGORY } from './queries'

const ReturnReasonCategoryForm = (props) => {
  // prettier-ignore
  const { type, id, changesMadeInForm, setChangesMadeInForm, discardTableState, permissions, refetch } = props

  const [action, setAction] = useState(type)

  const [returnReasonCategoryID, setReturnReasonCategoryID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [returnReasonCategory, setReturnReasonCategory] = useState(undefined)

  const [returnReasonCategoryError, setReturnReasonCategoryError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(returnReasonCategoryID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertReturnReasonCategory] = useMutation(UPSERT_RETURN_REASON_CATEGORY)
  const {
    loading: returnReasonCategoryLoad,
    error: returnReasonCategoryErr,
    data: returnReasonCategoryData,
  } = useQuery(RETURN_REASON_CATEGORY, {
    variables: { id: returnReasonCategoryID },
  })

  useEffect(() => {
    if (returnReasonCategoryData && returnReasonCategoryData.returnReasonCategory)
      setReturnReasonCategory(returnReasonCategoryData.returnReasonCategory.name)
  }, [returnReasonCategoryData])

  useEffect(() => {
    setReturnReasonCategoryID(id)
    setReturnReasonCategoryError(false)
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
    setReturnReasonCategoryID(undefined)
    setAction('create')
    setOkText(returnReasonCategoryID ? 'Save' : 'Create')
    setReturnReasonCategory(undefined)
    setReturnReasonCategoryError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setReturnReasonCategoryError(undefined)

    let isError = false
    if (!returnReasonCategory) {
      isError = true
      setReturnReasonCategoryError('VendorTypes name cannot be empty')
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

    upsertReturnReasonCategory({
      variables: {
        upsertType: returnReasonCategoryID ? 'update' : 'create',
        id: returnReasonCategoryID,
        name: returnReasonCategory,
      },
    })
      .then(() => {
        setOkText(returnReasonCategoryID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(returnReasonCategoryID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving return-reason category.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (returnReasonCategoryError)
    return `Error occured while fetching data: ${returnReasonCategoryErr.message}`

  return (
    <div>
      <Spin spinning={returnReasonCategoryLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{returnReasonCategoryID ? 'Edit' : 'Add'} Return Reason Category</strong>
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
                  value={returnReasonCategory}
                  onChange={({ target: { value } }) => {
                    setReturnReasonCategory(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={
                    returnReasonCategoryError
                      ? 'custom-error-border'
                      : disabled
                      ? 'disabledStyle'
                      : ''
                  }
                />
                <div className="custom-error-text mb-4">{returnReasonCategoryError || ''}</div>
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

export default ReturnReasonCategoryForm
