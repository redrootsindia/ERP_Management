import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { RETURN_REASON, UPSERT_RETURN_REASON } from './queries'

const { Option } = Select

const ReturnReasonForm = (props) => {
  // prettier-ignore
  const { type, id, returnCategories, changesMadeInForm, setChangesMadeInForm, discardTableState,
          permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [returnReasonID, setreturnReasonID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(false)

  const [returnReasonCategoriesID, setreturnReasonCategoriesID] = useState(undefined)
  const [returnReasonCategoriesIDError, setreturnReasonCategoriesIDError] = useState(false)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(returnReasonID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertReturnReason] = useMutation(UPSERT_RETURN_REASON)
  const { loading: returnReasonLoad, error: returnReasonErr, data: returnReasonData } = useQuery(
    RETURN_REASON,
    {
      variables: { id: returnReasonID },
    },
  )

  useEffect(() => {
    setreturnReasonID(id)
    setOkText(id ? 'Save' : 'Create')
    setAction(type)
  }, [id, type])

  useEffect(() => {
    if (returnReasonData && returnReasonData.returnReason) {
      const { return_reason_category_id } = returnReasonData.returnReason
      if (returnReasonData.returnReason.name) setName(returnReasonData.returnReason.name)
      if (return_reason_category_id) setreturnReasonCategoriesID(String(return_reason_category_id))
    }
  }, [returnReasonData])

  const showDiscardModal = () => {
    if (changesMadeInForm) setDiscardModalVisible(true)
    else discardChanges()
  }

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) discardChanges()
  }

  const discardChanges = () => {
    setreturnReasonID(undefined)
    setAction('create')
    setOkText(returnReasonID ? 'Save' : 'Create')
    setName(undefined)
    setNameError(false)
    setreturnReasonCategoriesID(undefined)
    setreturnReasonCategoriesIDError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setNameError(false)
    setreturnReasonCategoriesIDError(false)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Brand name cannot be empty')
    }
    if (!returnReasonCategoriesID || Number(returnReasonCategoriesID) === 0) {
      isError = true
      setreturnReasonCategoriesIDError('Please select an organization')
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

    upsertReturnReason({
      variables: {
        upsertType: returnReasonID ? 'update' : 'create',
        id: returnReasonID,
        name,
        return_reason_category_id: Number(returnReasonCategoriesID),
      },
    })
      .then(() => {
        setOkText(returnReasonID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(returnReasonID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving return-reason.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (returnReasonErr) return `Error occured while fetching data: ${returnReasonErr.message}`

  return (
    <div>
      <Spin spinning={returnReasonLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{returnReasonID ? 'Edit' : 'Add'} Reason</strong>
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
                  value={name}
                  onChange={({ target: { value } }) => {
                    setName(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={nameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{nameError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">
                  Return Category<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={returnReasonCategoriesID}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setreturnReasonCategoriesID(value)
                    setChangesMadeInForm(true)
                  }}
                  className={
                    returnReasonCategoriesIDError
                      ? 'custom-error-border'
                      : disabled
                      ? 'disabledStyle'
                      : ''
                  }
                  placeholder="Select one"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {returnCategories && returnCategories.length
                    ? returnCategories.map((obj) => (
                        <Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{returnReasonCategoriesIDError || ''}</div>
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

export default ReturnReasonForm
