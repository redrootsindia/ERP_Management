import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { ATTRIBUTE, UPSERT_ATTRIBUTE } from './queries'

const AttributeForm = (props) => {
  // prettier-ignore
  const { type, id, changesMadeInForm, setChangesMadeInForm, discardTableState, permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [attributeID, setAttributeID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(attributeID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertAttribute] = useMutation(UPSERT_ATTRIBUTE)
  const { loading: attributeLoad, error: attributeErr, data: attributeData } = useQuery(ATTRIBUTE, {
    variables: { id: attributeID },
  })

  useEffect(() => {
    if (attributeData && attributeData.attribute && attributeData.attribute.name)
      setName(attributeData.attribute.name)
  }, [attributeData])

  useEffect(() => {
    setAttributeID(id)
    setNameError(false)
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
    setAttributeID(undefined)
    setAction('create')
    setOkText(attributeID ? 'Save' : 'Create')
    setName(undefined)
    setNameError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setNameError(undefined)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Name cannot be empty')
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

    upsertAttribute({
      variables: { upsertType: attributeID ? 'update' : 'create', id: attributeID, name },
    })
      .then(() => {
        setOkText(attributeID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(attributeID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving attribute.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (attributeErr) return `Error occured while fetching data: ${attributeErr.message}`

  return (
    <div>
      <Spin spinning={attributeLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{attributeID ? 'Edit' : 'Add'} Attribute</strong>
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

export default AttributeForm
