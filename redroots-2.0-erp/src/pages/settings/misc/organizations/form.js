import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ImageUpload from 'components/ImageUpload'
import Error403 from 'components/Errors/403'
import { ORGANIZATION, UPSERT_ORGANIZATION } from './queries'
import statesList from './states'

const { Option } = Select

/* eslint no-unused-vars: "off" */
const mapStateToProps = ({ user }) => ({ user })

const OrganizationForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(undefined)
  const [email, setEmail] = useState(undefined)
  const [emailError, setEmailError] = useState(undefined)
  const [phone, setPhone] = useState(undefined)
  const [phoneError, setPhoneError] = useState(undefined)
  const [state, setState] = useState(undefined)
  const [stateError, setStateError] = useState(undefined)
  const [address, setAddress] = useState(undefined)
  const [addressError, setAddressError] = useState(undefined)
  const [gst, setGST] = useState(undefined)
  const [gstError, setGSTError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSettings')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertOrganization] = useMutation(UPSERT_ORGANIZATION)
  const { loading: organizationLoad, error: organizationErr, data: organizationData } = useQuery(
    ORGANIZATION,
    {
      variables: { id },
    },
  )

  useEffect(() => {
    if (organizationData && organizationData.organization) {
      // prettier-ignore

      if (organizationData.organization.name) setName(organizationData.organization.name)
      if (organizationData.organization.email) setEmail(organizationData.organization.email)
      if (organizationData.organization.phone) setPhone(organizationData.organization.phone)
      if (organizationData.organization.state) setState(organizationData.organization.state)
      if (organizationData.organization.address) setAddress(organizationData.organization.address)
      if (organizationData.organization.gst) setGST(organizationData.organization.gst)
    }
  }, [organizationData])

  const onSubmit = () => {
    setNameError(undefined)
    setEmailError(undefined)
    setPhoneError(undefined)
    setStateError(undefined)
    setAddressError(undefined)
    setGSTError(undefined)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Organization name cannot be empty')
    }
    if (!email) {
      isError = true
      setEmailError('Email cannot be empty')
    } else {
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
    if (!phone) {
      isError = true
      setPhoneError('Phone cannot be empty')
    }
    if (!state) {
      isError = true
      setStateError('Please select a state')
    }
    if (!address) {
      isError = true
      setAddressError('Address cannot be empty')
    }
    if (!gst) {
      isError = true
      setGSTError('GST cannot be empty')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect / Incomplete Data',
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

    upsertOrganization({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        name,
        email,
        phone,
        state,
        address,
        gst,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/settings/misc/organizations')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving organization.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSettings')) return <Error403 />
  if (action === 'create' && !permissions.includes('createSettings')) return <Error403 />
  if (organizationErr) return `Error occured while fetching data: ${organizationErr.message}`

  return (
    <div>
      <Helmet title="Organizations" />

      <Spin spinning={organizationLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Organization</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateSettings') ? (
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

        <div className="row">
          <div className="col-xl-9 col-lg-12">
            <div className="card">
              <div className="card-body">
                <h6 className="text-black mb-4">
                  <strong>GENERAL DETAILS</strong>
                </h6>
                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">
                      Organization Name<span className="custom-error-text"> *</span>
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
                    <div className="mb-2">
                      Phone<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={phone}
                      onChange={({ target: { value } }) => setPhone(value)}
                      disabled={disabled}
                      className={
                        phoneError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{phoneError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      e-mail<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      autoComplete="off"
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
                    <div className="mb-2">
                      State<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      autoComplete="new-password"
                      showSearch
                      value={state}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setState(value)}
                      className={
                        stateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
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

                  <div className="col-lg-4">
                    <div className="mb-2">
                      GST<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      autoComplete="new-password"
                      value={gst}
                      onChange={({ target: { value } }) => setGST(value)}
                      disabled={disabled}
                      className={gstError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                    />
                    <div className="custom-error-text mb-4">{gstError || ''}</div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-12">
                    <div className="mb-2">
                      Address<span className="custom-error-text"> *</span>
                    </div>
                    <Input.TextArea
                      autoComplete="new-password"
                      value={address}
                      onChange={({ target: { value } }) => setAddress(value)}
                      disabled={disabled}
                      className={
                        addressError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{addressError || ''}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createSettings')) ||
          (action === 'update' && permissions.includes('updateSettings')) ? (
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

export default withRouter(connect(mapStateToProps)(OrganizationForm))
