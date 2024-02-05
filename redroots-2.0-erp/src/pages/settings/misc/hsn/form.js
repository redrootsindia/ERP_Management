import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, notification, InputNumber } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { HSN, UPSERT_HSN } from './queries'

const HSNForm = (props) => {
  // prettier-ignore
  const { type, id, changesMadeInForm, setChangesMadeInForm, discardTableState, permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [hsnID, setHSNID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(false)

  const [sgst, setSGST] = useState(undefined)
  const [sgstError, setSGSTError] = useState(false)

  const [cgst, setCGST] = useState(undefined)
  const [cgstError, setCGSTError] = useState(false)

  const [igst, setIGST] = useState(undefined)
  const [igstError, setIGSTError] = useState(false)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(hsnID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertHSN] = useMutation(UPSERT_HSN)
  const { loading: hsnLoad, error: hsnErr, data: hsnData } = useQuery(HSN, {
    variables: { id: hsnID },
  })

  useEffect(() => {
    if (hsnData && hsnData.hsn) {
      if (hsnData.hsn.name) setName(hsnData.hsn.name)
      setSGST(hsnData.hsn.sgst)
      setCGST(hsnData.hsn.cgst)
      setIGST(hsnData.hsn.igst)
    }
  }, [hsnData])

  useEffect(() => {
    setHSNID(id)
    setNameError(false)
    setSGSTError(false)
    setCGSTError(false)
    setIGSTError(false)
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
    setHSNID(undefined)
    setAction('create')
    setOkText(hsnID ? 'Save' : 'Create')
    setName(undefined)
    setNameError(false)
    setSGST(undefined)
    setSGSTError(false)
    setCGST(undefined)
    setCGSTError(false)
    setIGST(undefined)
    setIGSTError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setNameError(undefined)
    setSGSTError(false)
    setCGSTError(false)
    setIGSTError(false)

    let isError = false
    if (!name) {
      isError = true
      setNameError('UoM name cannot be empty')
    }
    if (sgst === undefined || sgst === null || Number(sgst) < 0) {
      isError = true
      setSGSTError('SGST should be a positive number')
    }
    if (cgst === undefined || cgst === null || Number(cgst) < 0) {
      isError = true
      setCGSTError('CGST should be a positive number')
    }
    if (igst === undefined || igst === null || Number(igst) < 0) {
      isError = true
      setIGSTError('IGST should be a positive number')
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

    upsertHSN({
      variables: { upsertType: hsnID ? 'update' : 'create', id: hsnID, name, sgst, cgst, igst },
    })
      .then(() => {
        setOkText(hsnID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(hsnID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving hsn.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (hsnErr) return `Error occured while fetching data: ${hsnErr.message}`

  return (
    <div>
      <Spin spinning={hsnLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{hsnID ? 'Edit' : 'Add'} HSN</strong>
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
                  HSN Name<span className="custom-error-text"> *</span>
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
                  SGST<span className="custom-error-text"> *</span>
                </div>
                <InputNumber
                  min={0}
                  value={sgst}
                  onChange={(value) => {
                    setSGST(value)
                    setIGST(value + (cgst || 0))
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={sgstError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{sgstError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">
                  CGST<span className="custom-error-text"> *</span>
                </div>
                <InputNumber
                  min={0}
                  value={cgst}
                  onChange={(value) => {
                    setCGST(value)
                    setIGST(value + (sgst || 0))
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={cgstError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{cgstError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">
                  IGST<span className="custom-error-text"> *</span>
                </div>
                <InputNumber
                  min={0}
                  value={igst}
                  onChange={(value) => {
                    setIGST(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={igstError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{igstError || ''}</div>
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

export default HSNForm
