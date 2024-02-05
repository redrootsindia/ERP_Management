import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ConfirmDiscard from 'components/ConfirmDiscardModal'
import statesList from '../../../accounts/vendors/states'
import { BUYER_GROUP_WAREHOUSE, UPSERT_BUYER_GROUP_WAREHOUSE } from './queries'

const { Option } = Select

const BuyerWarehouseForm = (props) => {
  // prettier-ignore
  const { type, id, buyerGroups, changesMadeInForm, setChangesMadeInForm, discardTableState,
          permissions, refetch } = props

  const [action, setAction] = useState(type)
  const [warehoueseID, setWarehoueseID] = useState(id)
  const [discardModalVisible, setDiscardModalVisible] = useState(false)

  const [buyerGroupID, setBuyerGroupID] = useState(undefined)
  const [buyerGroupIDError, setBuyerGroupIDError] = useState(false)
  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(false)
  const [state, setState] = useState(undefined)
  const [stateError, setStateError] = useState(false)
  const [city, setCity] = useState(undefined)
  const [cityError, setCityError] = useState(false)
  const [email, setEmail] = useState(undefined)
  const [emailError, setEmailError] = useState(false)
  const [phone, setPhone] = useState(undefined)
  const [gst, setGST] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(warehoueseID ? 'Save' : 'Create')

  const showActionButtons =
    (action === 'create' && permissions.includes('createSettings')) ||
    (action === 'update' && permissions.includes('updateSettings'))

  const [upsertBuyerGroupWarehouse] = useMutation(UPSERT_BUYER_GROUP_WAREHOUSE)
  const { loading: whLoad, error: whErr, data: whData } = useQuery(BUYER_GROUP_WAREHOUSE, {
    variables: { id: warehoueseID },
  })

  useEffect(() => {
    setWarehoueseID(id)
    setOkText(id ? 'Save' : 'Create')
    setAction(type)
  }, [id, type])

  useEffect(() => {
    if (whData && whData.buyerGroupWarehouse) {
      const { buyer_group_id } = whData.buyerGroupWarehouse
      if (buyer_group_id) setBuyerGroupID(String(buyer_group_id))
      if (whData.buyerGroupWarehouse.name) setName(whData.buyerGroupWarehouse.name)
      if (whData.buyerGroupWarehouse.state) setState(whData.buyerGroupWarehouse.state)
      if (whData.buyerGroupWarehouse.city) setCity(whData.buyerGroupWarehouse.city)
      if (whData.buyerGroupWarehouse.email) setEmail(whData.buyerGroupWarehouse.email)
      if (whData.buyerGroupWarehouse.phone) setPhone(whData.buyerGroupWarehouse.phone)
      if (whData.buyerGroupWarehouse.gst) setGST(whData.buyerGroupWarehouse.gst)
    }
  }, [whData])

  const showDiscardModal = () => {
    if (changesMadeInForm) setDiscardModalVisible(true)
    else discardChanges()
  }

  const discardModalVisibleCallback = (visibility, toDiscard) => {
    setDiscardModalVisible(visibility)
    if (toDiscard) discardChanges()
  }

  const discardChanges = () => {
    setWarehoueseID(undefined)
    setAction('create')
    setOkText(warehoueseID ? 'Save' : 'Create')
    setBuyerGroupID(undefined)
    setBuyerGroupIDError(false)
    setName(undefined)
    setNameError(false)
    setEmail(undefined)
    setEmailError(false)
    setPhone(undefined)
    setState(undefined)
    setStateError(false)
    setCity(undefined)
    setCityError(false)
    setGST(undefined)
    setChangesMadeInForm(false)
    discardTableState()
  }

  const onSubmit = () => {
    setBuyerGroupIDError(false)
    setNameError(false)
    setEmailError(undefined)
    setStateError(undefined)
    setCityError(undefined)

    let isError = false

    if (!buyerGroupID || Number(buyerGroupID) === 0) {
      isError = true
      setBuyerGroupIDError('Please select a buyer group')
    }
    if (!name) {
      isError = true
      setNameError('Warehouse name cannot be empty')
    }
    if (email) {
      const lastAtPos = email.lastIndexOf('@')
      const lastDotPos = email.lastIndexOf('.')
      if (
        !/^[a-zA-Z0-9_]+(\.[_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,15})$/.test(
          email,
        )
      ) {
        isError = true
        setEmailError('Entered email is invalid.')
      } else if (
        !(
          lastAtPos < lastDotPos &&
          lastAtPos > 0 &&
          lastDotPos > 2 &&
          email.length - lastDotPos > 2 &&
          email.indexOf('@@') === -1 &&
          email.indexOf('@-') === -1 &&
          email.indexOf('-.') === -1 &&
          email.indexOf('--') === -1 &&
          email[0] !== '_'
        )
      ) {
        isError = true
        setEmailError('Entered email is invalid.')
      }
    }
    if (!state) {
      isError = true
      setStateError('Please select a state')
    }
    if (!city) {
      isError = true
      setCityError('City cannot be empty')
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

    upsertBuyerGroupWarehouse({
      variables: {
        upsertType: warehoueseID ? 'update' : 'create',
        id: warehoueseID,
        buyer_group_id: Number(buyerGroupID),
        name,
        email,
        phone,
        state,
        city,
        gst,
      },
    })
      .then(() => {
        setOkText(warehoueseID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        discardChanges()
        if (refetch) refetch()
      })
      .catch((err) => {
        setOkText(warehoueseID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving buyer-group warehouse.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return null
  if (action === 'create' && !permissions.includes('createSettings')) return null
  if (whErr) return `Error occured while fetching data: ${whErr.message}`

  return (
    <div>
      <Spin spinning={whLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="row">
              <div className="col-9">
                <h5 className="mb-2">
                  <strong>{warehoueseID ? 'Edit' : 'Add'} Buyer Warehouse</strong>
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
                  Buyer Group<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={buyerGroupID}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setBuyerGroupID(value)
                    setChangesMadeInForm(true)
                  }}
                  className={
                    buyerGroupIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select one"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {buyerGroups && buyerGroups.length
                    ? buyerGroups.map((obj) => (
                        <Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{buyerGroupIDError || ''}</div>
              </div>

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
                <div className="mb-2">e-mail</div>
                <Input
                  autoComplete="new-password"
                  value={email}
                  onChange={({ target: { value } }) => {
                    setEmail(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={emailError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{emailError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">Phone</div>
                <Input
                  autoComplete="new-password"
                  value={phone}
                  onChange={({ target: { value } }) => {
                    setPhone(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4" />
              </div>

              <div className="col-12">
                <div className="mb-2">
                  State<span className="custom-error-text"> *</span>
                </div>
                <Select
                  autoComplete="new-password"
                  showSearch
                  value={state}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setState(value)
                    setChangesMadeInForm(true)
                  }}
                  className={stateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                  placeholder="Select a state"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {statesList && statesList.length
                    ? statesList.map((stateName) => (
                        <Option key={stateName} value={stateName}>
                          {stateName}
                        </Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{stateError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">
                  City<span className="custom-error-text"> *</span>
                </div>
                <Input
                  autoComplete="new-password"
                  value={city}
                  onChange={({ target: { value } }) => {
                    setCity(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={cityError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{cityError || ''}</div>
              </div>

              <div className="col-12">
                <div className="mb-2">GST No.</div>
                <Input
                  value={gst}
                  onChange={({ target: { value } }) => {
                    setGST(value)
                    setChangesMadeInForm(true)
                  }}
                  disabled={disabled}
                  className={disabled ? 'disabledStyle' : ''}
                />
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

export default BuyerWarehouseForm
