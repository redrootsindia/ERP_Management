import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { PRODUCT_SPECIFICATION, UPSERT_PRODUCT_SPECIFICATION } from './queries'

const ProductSpecidicationForm = (props) => {
  const {
    type,
    id,
    changesMadeInForm,
    setChangesMadeInForm,
    discardTableState,
    permissions,
    refetch,
  } = props

  const [action, setAction] = useState(type)
  const [productSpecificationID, setProductSpecificationID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [specificationName, setSpecificationName] = useState(undefined)
  const [specificationNameError, setSpecificationNameError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(productSpecificationID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertProductSpecification] = useMutation(UPSERT_PRODUCT_SPECIFICATION)
  const { loading: productSpecLoad, error: productSpecErr, data: productSpecData } = useQuery(
    PRODUCT_SPECIFICATION,
    {
      variables: { id: productSpecificationID },
    },
  )

  useEffect(() => {
    if (
      productSpecData &&
      productSpecData.productSpecificationName &&
      productSpecData.productSpecificationName.specs_name
    )
      setSpecificationName(productSpecData.productSpecificationName.specs_name)
  }, [productSpecData])

  useEffect(() => {
    setProductSpecificationID(id)
    setSpecificationNameError(false)

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
    setProductSpecificationID(undefined)
    setAction('create')
    setOkText(productSpecificationID ? 'Save' : 'Create')
    setSpecificationName(undefined)
    setSpecificationNameError(false)

    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setSpecificationNameError(undefined)

    let isError = false
    if (!specificationName) {
      isError = true
      setSpecificationNameError('Title cannot be empty')
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

    upsertProductSpecification({
      variables: {
        upsertType: productSpecificationID ? 'update' : 'create',
        id: productSpecificationID,
        specs_name: specificationName,
      },
    })
      .then(() => {
        setOkText(productSpecificationID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(productSpecificationID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product-specification.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (productSpecErr) return `Error occured while fetching data: ${productSpecErr.message}`

  return (
    <div>
      <Spin spinning={productSpecLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{productSpecificationID ? 'Edit' : 'Add'} Product Specification</strong>
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
                  Specification Name<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={specificationName}
                  onChange={({ target: { value } }) => {
                    setSpecificationName(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={
                    specificationNameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                />
                <div className="custom-error-text mb-4">{specificationNameError || ''}</div>
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

export default ProductSpecidicationForm
