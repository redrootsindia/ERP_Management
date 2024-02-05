import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { BUYER_GROUP, UPSERT_BUYER_GROUP } from './queries'

const BuyerGroupForm = (props) => {
  // prettier-ignore
  const { type, id, changesMadeInForm, setChangesMadeInForm, discardTableState, permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [buyerGroupID, setBuyerGroupID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(buyerGroupID ? 'Save' : 'Create')

  const showActionButtons =
    id &&
    ((action === 'create' && permissions.includes('createSettings')) ||
      (action === 'update' && permissions.includes('updateSettings')))

  const [upsertBuyerGroup] = useMutation(UPSERT_BUYER_GROUP)
  const { loading: bgLoad, error: bgErr, data: buyerGroupData } = useQuery(BUYER_GROUP, {
    variables: { id: buyerGroupID },
  })

  useEffect(() => {
    if (buyerGroupData && buyerGroupData.buyerGroup && buyerGroupData.buyerGroup.name)
      setName(buyerGroupData.buyerGroup.name)
  }, [buyerGroupData])

  useEffect(() => {
    setBuyerGroupID(id)
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
    setBuyerGroupID(undefined)
    setAction('create')
    setOkText(buyerGroupID ? 'Save' : 'Create')
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

    upsertBuyerGroup({
      variables: { upsertType: buyerGroupID ? 'update' : 'create', id: buyerGroupID, name },
    })
      .then(() => {
        setOkText(buyerGroupID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(buyerGroupID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving buyer-group.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (bgErr) return `Error occured while fetching data: ${bgErr.message}`

  return (
    <div>
      <Spin spinning={bgLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{buyerGroupID ? 'Edit' : 'Add'} Buyer Group</strong>
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

export default BuyerGroupForm
