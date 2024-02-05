import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import { EXPENSE_SUBCAT, UPSERT_EXPENSE_SUBCAT } from './queries'

const { Option } = Select

const ExpenseSubcatForm = (props) => {
  // prettier-ignore
  const { type, id, categories, changesMadeInForm, setChangesMadeInForm, discardTableState,
          permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [subCatID, setSubCatID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(false)

  const [categoryID, setCategoryID] = useState(undefined)
  const [categoryIDError, setCategoryIDError] = useState(false)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(subCatID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertExpenseSubcategory] = useMutation(UPSERT_EXPENSE_SUBCAT)
  const { loading: subcatLoad, error: subcatErr, data: subcatData } = useQuery(EXPENSE_SUBCAT, {
    variables: { id: subCatID },
  })

  useEffect(() => {
    setSubCatID(id)
    setOkText(id ? 'Save' : 'Create')
    setAction(type)
  }, [id, type])

  useEffect(() => {
    if (subcatData && subcatData.expenseSubcategory) {
      const { expense_category_id } = subcatData.expenseSubcategory
      if (subcatData.expenseSubcategory.name) setName(subcatData.expenseSubcategory.name)
      if (expense_category_id) setCategoryID(String(expense_category_id))
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
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setNameError(false)
    setCategoryIDError(false)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Sub-category name cannot be empty')
    }
    if (!categoryID || Number(categoryID) === 0) {
      isError = true
      setCategoryIDError('Please select a category')
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

    upsertExpenseSubcategory({
      variables: {
        upsertType: subCatID ? 'update' : 'create',
        id: subCatID,
        name,
        expense_category_id: Number(categoryID),
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
          message: 'Error occured while saving Expense-subcategory.',
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
                  <strong>{subCatID ? 'Edit' : 'Add'} Expense Subcategory</strong>
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
                  Expense Category<span className="custom-error-text"> *</span>
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

export default ExpenseSubcatForm
