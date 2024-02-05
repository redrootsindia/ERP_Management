import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { BRAND, UPSERT_BRAND } from './queries'

const { Option } = Select

const BrandForm = (props) => {
  // prettier-ignore
  const { type, id, organizations, changesMadeInForm, setChangesMadeInForm, discardTableState,
          permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [brandID, setBrandID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(false)

  const [organizationID, setOrganizationID] = useState(undefined)
  const [organizationIDError, setOrganizationIDError] = useState(false)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(brandID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertBrand] = useMutation(UPSERT_BRAND)
  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRAND, {
    variables: { id: brandID },
  })

  useEffect(() => {
    setBrandID(id)
    setOkText(id ? 'Save' : 'Create')
    setAction(type)
  }, [id, type])

  useEffect(() => {
    if (brandData && brandData.brand) {
      const { organization_id } = brandData.brand
      if (brandData.brand.name) setName(brandData.brand.name)
      if (organization_id) setOrganizationID(String(organization_id))
    }
  }, [brandData])

  const showDiscardModal = () => {
    if (changesMadeInForm) setDiscardModalVisible(true)
    else discardChanges()
  }

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) discardChanges()
  }

  const discardChanges = () => {
    setBrandID(undefined)
    setAction('create')
    setOkText(brandID ? 'Save' : 'Create')
    setName(undefined)
    setNameError(false)
    setOrganizationID(undefined)
    setOrganizationIDError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setNameError(false)
    setOrganizationIDError(false)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Brand name cannot be empty')
    }
    if (!organizationID || Number(organizationID) === 0) {
      isError = true
      setOrganizationIDError('Please select an organization')
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

    upsertBrand({
      variables: {
        upsertType: brandID ? 'update' : 'create',
        id: brandID,
        name,
        organization_id: Number(organizationID),
      },
    })
      .then(() => {
        setOkText(brandID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(brandID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving brand.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`

  return (
    <div>
      <Spin spinning={brandLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{brandID ? 'Edit' : 'Add'} Brand</strong>
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
                  Organization<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={organizationID}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setOrganizationID(value)
                    setChangesMadeInForm(true)
                  }}
                  className={
                    organizationIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select one"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {organizations && organizations.length
                    ? organizations.map((obj) => (
                        <Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{organizationIDError || ''}</div>
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

export default BrandForm
