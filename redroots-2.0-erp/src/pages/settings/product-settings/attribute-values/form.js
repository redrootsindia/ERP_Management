import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { ATTRIBUTE_VALUE, UPSERT_ATTRIBUTE_VALUE } from './queries'

const { Option } = Select

const AttributeValueForm = (props) => {
  // prettier-ignore
  const { type, id, attributes, changesMadeInForm, setChangesMadeInForm, discardTableState,
          permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [attributeValueID, setAttributeValueID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(false)

  const [attributeID, setattributeID] = useState(undefined)
  const [attributeIDError, setattributeIDError] = useState(false)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(attributeValueID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertAttributeValue] = useMutation(UPSERT_ATTRIBUTE_VALUE)
  const {
    loading: attributeValueLoad,
    error: attributeValueErr,
    data: attributeValueData,
  } = useQuery(ATTRIBUTE_VALUE, {
    variables: { id: attributeValueID },
  })

  useEffect(() => {
    setAttributeValueID(id)
    setOkText(id ? 'Save' : 'Create')
    setAction(type)
  }, [id, type])

  useEffect(() => {
    if (attributeValueData && attributeValueData.attributeValue) {
      const { attribute_id } = attributeValueData.attributeValue
      if (attributeValueData.attributeValue.name) setName(attributeValueData.attributeValue.name)
      if (attribute_id) setattributeID(String(attribute_id))
    }
  }, [attributeValueData])

  const showDiscardModal = () => {
    if (changesMadeInForm) setDiscardModalVisible(true)
    else discardChanges()
  }

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) discardChanges()
  }

  const discardChanges = () => {
    setAttributeValueID(undefined)
    setAction('create')
    setOkText(attributeValueID ? 'Save' : 'Create')
    setName(undefined)
    setNameError(false)
    setattributeID(undefined)
    setattributeIDError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setNameError(false)
    setattributeIDError(false)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Attribute value cannot be empty')
    }
    if (!attributeID || Number(attributeID) === 0) {
      isError = true
      setattributeIDError('Please select an attribute')
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

    upsertAttributeValue({
      variables: {
        upsertType: attributeValueID ? 'update' : 'create',
        id: attributeValueID,
        name,
        attribute_id: Number(attributeID),
      },
    })
      .then(() => {
        setOkText(attributeValueID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(attributeValueID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving attribute-value.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (attributeValueErr) return `Error occured while fetching data: ${attributeValueErr.message}`

  return (
    <div>
      <Spin spinning={attributeValueLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{attributeValueID ? 'Edit' : 'Add'} Attribute Value</strong>
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
                  Attribute<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={attributeID}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setattributeID(value)
                    setChangesMadeInForm(true)
                  }}
                  className={
                    attributeIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select one"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {attributes && attributes.length
                    ? attributes.map((obj) => (
                        <Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{attributeIDError || ''}</div>
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

export default AttributeValueForm
