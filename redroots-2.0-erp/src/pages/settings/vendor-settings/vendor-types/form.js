import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { VENDOR_TYPE, UPSERT_VENDOR_TYPE } from './queries'

const VendorTypesForm = (props) => {
  // prettier-ignore
  const { type, id, changesMadeInForm, setChangesMadeInForm, discardTableState, permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [vendorTypesID, setVendorTypesID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [vendortype, setvendorType] = useState(undefined)
  const [vendortypeError, setVendorTypeError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(vendorTypesID ? 'Save' : 'Create')

  const showActionButtons =
    id &&
    ((action === 'create' && permissions.includes('createSettings')) ||
      (action === 'update' && permissions.includes('updateSettings')))

  const [upsertVendorTypes] = useMutation(UPSERT_VENDOR_TYPE)
  const {
    loading: VendorTypesLoad,
    error: VendorTypesErr,
    data: VendorTypesData,
  } = useQuery(VENDOR_TYPE, { variables: { id: vendorTypesID } })

  useEffect(() => {
    if (VendorTypesData && VendorTypesData.vendorType)
      setvendorType(VendorTypesData.vendorType.type)
  }, [VendorTypesData])

  useEffect(() => {
    setVendorTypesID(id)
    setVendorTypeError(false)
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
    setVendorTypesID(undefined)
    setAction('create')
    setOkText(vendorTypesID ? 'Save' : 'Create')
    setvendorType(undefined)
    setVendorTypeError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setVendorTypeError(undefined)

    let isError = false
    if (!vendortype) {
      isError = true
      setVendorTypeError('VendorTypes name cannot be empty')
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

    upsertVendorTypes({
      variables: {
        upsertType: vendorTypesID ? 'update' : 'create',
        id: vendorTypesID,
        type: vendortype,
      },
    })
      .then(() => {
        setOkText(vendorTypesID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(vendorTypesID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving vendor-type.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (vendortypeError) return `Error occured while fetching data: ${VendorTypesErr.message}`

  return (
    <div>
      <Spin spinning={VendorTypesLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{vendorTypesID ? 'Edit' : 'Add'} Vendor Types</strong>
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
                  Type<span className="custom-error-text"> *</span>
                </div>

                <Input
                  value={vendortype}
                  onChange={({ target: { value } }) => {
                    setvendorType(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={
                    vendortypeError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                />
                <div className="custom-error-text mb-4">{vendortypeError || ''}</div>
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

export default VendorTypesForm
