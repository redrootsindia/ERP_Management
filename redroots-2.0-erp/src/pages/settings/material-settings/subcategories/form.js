import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, InputNumber, Button, Spin, Switch, Select, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { MATERIAL_SUBCAT, UPSERT_MATERIAL_SUBCAT } from './queries'

const { Option } = Select

const MaterialSubcatForm = (props) => {
  // prettier-ignore
  const { type, id, categories, hsnList, changesMadeInForm, setChangesMadeInForm, discardTableState,
          permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [subCatID, setSubCatID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(false)

  const [categoryID, setCategoryID] = useState(undefined)
  const [categoryIDError, setCategoryIDError] = useState(false)

  const [hsnID, setHSNID] = useState(undefined)
  const [hsnIDError, setHSNIDError] = useState(false)

  const [panna, setPanna] = useState(1)
  const [pannaError, setPannaError] = useState(false)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(subCatID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertMaterialSubcategory] = useMutation(UPSERT_MATERIAL_SUBCAT)
  const { loading: subcatLoad, error: subcatErr, data: subcatData } = useQuery(MATERIAL_SUBCAT, {
    variables: { id: subCatID },
  })

  useEffect(() => {
    setSubCatID(id)
    setOkText(id ? 'Save' : 'Create')
    setAction(type)
  }, [id, type])

  useEffect(() => {
    if (subcatData && subcatData.materialSubcategory) {
      const { material_category_id, hsn_id } = subcatData.materialSubcategory
      if (subcatData.materialSubcategory.name) setName(subcatData.materialSubcategory.name)
      if (material_category_id) setCategoryID(String(material_category_id))
      if (hsn_id) setHSNID(String(hsn_id))
      setPanna(subcatData.materialSubcategory.panna)
    }
  }, [subcatData])

  const showDiscardModal = () => {
    if (changesMadeInForm) setDiscardModalVisible(true)
    else discardChanges()
  }

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) discardChanges()
  }

  const discardChanges = () => {
    setSubCatID(undefined)
    setAction('create')
    setOkText(subCatID ? 'Save' : 'Create')
    setName(undefined)
    setNameError(false)
    setCategoryID(undefined)
    setCategoryIDError(false)
    setPanna(1)
    setPannaError(false)
    setHSNID(undefined)
    setHSNIDError(false)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setNameError(false)
    setCategoryIDError(false)
    setPannaError(false)
    setHSNIDError(false)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Sub-category name cannot be empty')
    }
    if (!categoryID || Number(categoryID) === 0) {
      isError = true
      setCategoryIDError('Please select a category')
    }
    if (panna === undefined || panna === null || Number(panna) < 0) {
      isError = true
      setPannaError('Panna should be a positive number')
    }
    if (!hsnID || Number(hsnID) === 0) {
      isError = true
      setHSNIDError('Please select a HSN')
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

    upsertMaterialSubcategory({
      variables: {
        upsertType: subCatID ? 'update' : 'create',
        id: subCatID,
        name,
        material_category_id: Number(categoryID),
        hsn_id: Number(hsnID),
        panna,
      },
    })
      .then(() => {
        setOkText(subCatID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(subCatID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving material-subcategory.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`

  return (
    <div>
      <Spin spinning={subcatLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{subCatID ? 'Edit' : 'Add'} Material Subcategory</strong>
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
                  Parent Category<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={categoryID}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setCategoryID(value)
                    setChangesMadeInForm(true)
                  }}
                  className={
                    categoryIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select one"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {categories && categories.length
                    ? categories.map((obj) => (
                        <Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{categoryIDError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">
                  Panna<span className="custom-error-text"> *</span>
                </div>
                <InputNumber
                  value={panna}
                  onChange={(value) => {
                    setPanna(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={pannaError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{pannaError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">
                  HSN<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={hsnID}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setHSNID(value)
                    setChangesMadeInForm(true)
                  }}
                  className={hsnIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                  placeholder="Select one"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {hsnList && hsnList.length
                    ? hsnList.map((obj) => (
                        <Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{hsnIDError || ''}</div>
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

export default MaterialSubcatForm
