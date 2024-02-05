import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Error403 from 'components/Errors/403'
import { BUYER, UPSERT_BUYER } from './queries'
import { PAYMENT_TERMS } from '../../settings/vendor-settings/payment-terms/queries'
import { BUYER_GROUPS } from '../../settings/buyer-settings/buyer-groups/queries'

const mapStateToProps = ({ user }) => ({ user })

const BuyerForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [buyerGroupID, setBuyerGroupID] = useState(undefined)
  const [buyerGroupIDError, setBuyerGroupIDError] = useState(false)
  const [buyerGroupsList, setBuyerGroupsList] = useState([])

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(undefined)

  const [email, setEmail] = useState(undefined)
  const [emailError, setEmailError] = useState(false)

  const [phone, setPhone] = useState(undefined)

  const [channel, setChannel] = useState(undefined)
  const [channelError, setChannelError] = useState(false)

  const [paymentTermID, setPaymentTermID] = useState(undefined)
  const [paymentTermIDError, setPaymentTermIDError] = useState(false)
  const [paymentTermPostGRNID, setPaymentTermPostGRNID] = useState(undefined)
  const [paymentTermPostGRNIDError, setPaymentTermPostGRNIDError] = useState(false)
  const [paymentTermsList, setPaymentTermsList] = useState([])

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateBuyer')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertBuyer] = useMutation(UPSERT_BUYER)

  const { loading: bgLoad, error: bgErr, data: bgData } = useQuery(BUYER_GROUPS)
  const { loading: ptLoad, error: ptErr, data: paymentTermsData } = useQuery(PAYMENT_TERMS)
  const { loading: buyerLoad, error: buyerErr, data: buyerData } = useQuery(BUYER, {
    variables: { id },
  })

  useEffect(() => {
    if (buyerData && buyerData.buyer) {
      // prettier-ignore
      const { buyer_group_id, payment_term_id, payment_term_id_post_grn, marketplace_channel } = buyerData.buyer

      if (buyer_group_id) setBuyerGroupID(String(buyer_group_id))
      if (payment_term_id) setPaymentTermID(String(payment_term_id))
      if (payment_term_id_post_grn) setPaymentTermPostGRNID(payment_term_id_post_grn)
      if (marketplace_channel) setChannel(marketplace_channel)

      if (buyerData.buyer.name) setName(buyerData.buyer.name)
      if (buyerData.buyer.email) setEmail(buyerData.buyer.email)
      if (buyerData.buyer.phone) setPhone(buyerData.buyer.phone)
    }
  }, [buyerData])

  useEffect(() => {
    if (!bgLoad && bgData && bgData.buyerGroups && bgData.buyerGroups.length)
      setBuyerGroupsList(bgData.buyerGroups)
  }, [bgData, bgLoad])

  useEffect(() => {
    if (
      !ptLoad &&
      paymentTermsData &&
      paymentTermsData.paymentTerms &&
      paymentTermsData.paymentTerms.length
    )
      setPaymentTermsList(paymentTermsData.paymentTerms)
  }, [paymentTermsData, ptLoad])

  const onSubmit = () => {
    setNameError(undefined)
    setBuyerGroupIDError(undefined)
    setPaymentTermIDError(undefined)
    setPaymentTermPostGRNIDError(undefined)
    setEmailError(undefined)
    setChannelError(undefined)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Buyer name cannot be empty')
    }
    if (!buyerGroupID || Number(buyerGroupID) === 0) {
      isError = true
      setBuyerGroupIDError('Please select a buyer group')
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
    if (buyerGroupID && Number(buyerGroupID) === 1 && !channel) {
      isError = true
      setChannelError('Marketplace Channel cannot be empty')
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

    upsertBuyer({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        name,
        email,
        phone,
        buyer_group_id: Number(buyerGroupID),
        payment_term_id: Number(paymentTermID),
        payment_term_id_post_grn: Number(paymentTermPostGRNID),
        marketplace_channel: channel,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/accounts/buyers')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving buyer.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readBuyer')) return <Error403 />
  if (action === 'create' && !permissions.includes('createBuyer')) return <Error403 />
  if (buyerErr) return `Error occured while fetching data: ${buyerErr.message}`
  if (bgErr) return `Error occured while fetching data: ${bgErr.message}`
  if (ptErr) return `Error occured while fetching data: ${ptErr.message}`

  return (
    <div>
      <Helmet title="Buyers" />

      <Spin spinning={buyerLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Buyer</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateBuyer') ? (
            <div className="col-1 pull-right">
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

        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-12">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">
                      Buyer Group<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={buyerGroupID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setBuyerGroupID(value)}
                      className={
                        buyerGroupIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select a category"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {buyerGroupsList && buyerGroupsList.length
                        ? buyerGroupsList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{buyerGroupIDError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      Buyer Name<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={name}
                      onChange={({ target: { value } }) => setName(value)}
                      disabled={disabled}
                      className={
                        nameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{nameError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">e-mail</div>
                    <Input
                      autoComplete="new-password"
                      value={email}
                      onChange={({ target: { value } }) => setEmail(value)}
                      disabled={disabled}
                      className={
                        emailError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{emailError || ''}</div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">Phone</div>
                    <Input
                      autoComplete="new-password"
                      value={phone}
                      onChange={({ target: { value } }) => setPhone(value)}
                      disabled={disabled}
                      className={disabled ? 'disabledStyle' : ''}
                    />
                    <div className="custom-error-text mb-4" />
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">Payment Term</div>
                    <Select
                      showSearch
                      value={paymentTermID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setPaymentTermID(value)}
                      className={
                        paymentTermIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select a payment term"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {paymentTermsList && paymentTermsList.length
                        ? paymentTermsList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.title}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{paymentTermIDError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">Payment Term Post-GRN</div>
                    <Select
                      showSearch
                      value={paymentTermPostGRNID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setPaymentTermPostGRNID(value)}
                      className={
                        paymentTermPostGRNIDError
                          ? 'custom-error-border'
                          : disabled
                          ? 'disabledStyle'
                          : ''
                      }
                      placeholder="Select a payment term"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {paymentTermsList && paymentTermsList.length
                        ? paymentTermsList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.title}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{paymentTermPostGRNIDError || ''}</div>
                  </div>
                </div>

                {buyerGroupID && Number(buyerGroupID) === 1 ? (
                  <div className="row">
                    <div className="col-lg-4">
                      <div className="mb-2">
                        Marketplace Channel<span className="custom-error-text"> *</span>
                      </div>
                      <Input
                        value={channel}
                        onChange={({ target: { value } }) => setChannel(value)}
                        disabled={disabled}
                        className={
                          channelError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                        }
                      />
                      <div className="custom-error-text mb-4">{channelError || ''}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createBuyer')) ||
          (action === 'update' && permissions.includes('updateBuyer')) ? (
            <Button type="primary" onClick={onSubmit} disabled={disabled}>
              {okText}
            </Button>
          ) : null}
          &emsp;
          <Button danger onClick={() => history.goBack()}>
            Back
          </Button>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(BuyerForm))
