import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import ImageUpload from 'components/ImageUpload'
import Error403 from 'components/Errors/403'
import { VENDOR, VENDOR_TYPES, UPSERT_VENDOR } from './queries'
import { ROLES } from '../../settings/roles/queries'
import { PAYMENT_TERMS } from '../../settings/vendor-settings/payment-terms/queries'
import statesList from './states'

const { Option } = Select

/* eslint no-unused-vars: "off" */
const mapStateToProps = ({ user }) => ({ user })

const VendorForm = ({ user: { permissions, type, vendor_id } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(undefined)
  const [email, setEmail] = useState(undefined)
  const [emailError, setEmailError] = useState(undefined)
  const [company, setCompany] = useState(undefined)
  const [companyError, setCompanyError] = useState(undefined)
  const [state, setState] = useState(undefined)
  const [stateError, setStateError] = useState(undefined)
  const [city, setCity] = useState(undefined)
  const [cityError, setCityError] = useState(undefined)
  const [address, setAddress] = useState(undefined)
  const [addressError, setAddressError] = useState(undefined)

  const [paymentTermID, setPaymentTermID] = useState(undefined)
  const [paymentTermIDError, setPaymentTermIDError] = useState(undefined)
  const [paymentTermsList, setPaymentTermsList] = useState([])

  const [vendorTypeIDs, setVendorTypeIDs] = useState([])
  const [vendorTypeIDsError, setVendorTypeIDsError] = useState(undefined)
  const [vendorTypesList, setVendorTypesList] = useState([])

  const [bankName1, setBankName1] = useState(undefined)
  const [bankName1Error, setBankName1Error] = useState(undefined)
  const [bankAccount1, setBankAccount1] = useState(undefined)
  const [bankAccount1Error, setBankAccount1Error] = useState(undefined)
  const [bankIFSC1, setBankIFSC1] = useState(undefined)
  const [bankIFSC1Error, setBankIFSC1Error] = useState(undefined)
  const [bankBranch1, setBankBranch1] = useState(undefined)
  const [bankBranch1Error, setBankBranch1Error] = useState(undefined)

  const [phone, setPhone] = useState(undefined)
  const [altPhone, setAltPhone] = useState(undefined)

  const [bankName2, setBankName2] = useState(undefined)
  const [bankAccount2, setBankAccount2] = useState(undefined)
  const [bankIFSC2, setBankIFSC2] = useState(undefined)
  const [bankBranch2, setBankBranch2] = useState(undefined)

  const [bankName3, setBankName3] = useState(undefined)
  const [bankAccount3, setBankAccount3] = useState(undefined)
  const [bankIFSC3, setBankIFSC3] = useState(undefined)
  const [bankBranch3, setBankBranch3] = useState(undefined)

  const [password, setPassword] = useState(undefined)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [passwordError, setPasswordError] = useState(undefined)

  const [roleID, setRoleID] = useState(undefined)
  const [roleIDError, setRoleIDError] = useState(undefined)
  const [rolesList, setRolesList] = useState([])

  const [profilePic, setProfilePic] = useState(undefined)
  const [existingProfileImages, setExistingProfileImages] = useState([])
  const [profilePicChanged, setProfilePicChanged] = useState(false)

  const [pan, setPan] = useState(undefined)
  const [panError, setPanError] = useState(false)
  const [panImage, setPanImage] = useState(undefined)
  const [existingPanImages, setExistingPanImages] = useState([])
  const [panImageChanged, setPanImageChanged] = useState(false)

  const [gst, setGST] = useState(undefined)
  const [gstError, setGSTError] = useState(false)
  const [gstImage, setGSTImage] = useState(undefined)
  const [existingGSTImages, setExistingGSTImages] = useState([])
  const [gstImageChanged, setGSTImageChanged] = useState(false)

  const [aadhar, setAadhar] = useState(undefined)
  const [aadharImage, setAadharImage] = useState(undefined)
  const [existingAadharImages, setExistingAadharImages] = useState([])
  const [aadharImageChanged, setAadharImageChanged] = useState(false)

  const [editMode, setEditMode] = useState(
    action === 'create' ||
      (action === 'update' && permissions.includes('updateVendor')) ||
      type === 'vendor',
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertVendor] = useMutation(UPSERT_VENDOR)
  const { loading: roleLoad, error: roleErr, data: roleData } = useQuery(ROLES)
  const { loading: termLoad, error: termErr, data: pTermData } = useQuery(PAYMENT_TERMS)
  const { loading: vTypeLoad, error: vTypeErr, data: vTypeData } = useQuery(VENDOR_TYPES)
  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(VENDOR, {
    variables: { id },
  })

  useEffect(() => {
    if (vendorData && vendorData.vendor) {
      // prettier-ignore
      const { profile_pic, role_id, alt_phone, vendor_type_ids, bank_name_1, bank_account_1, bank_ifsc_1,
          bank_branch_1, bank_name_2, bank_account_2, bank_ifsc_2, bank_branch_2, bank_name_3, bank_account_3,
          bank_ifsc_3, bank_branch_3, gst_image, pan_image, aadhar_image, payment_term_id }
        = vendorData.vendor

      if (role_id) setRoleID(String(role_id))
      if (alt_phone) setAltPhone(alt_phone)
      if (payment_term_id) setPaymentTermID(String(payment_term_id))
      if (bank_name_1) setBankName1(bank_name_1)
      if (bank_account_1) setBankAccount1(bank_account_1)
      if (bank_ifsc_1) setBankIFSC1(bank_ifsc_1)
      if (bank_branch_1) setBankBranch1(bank_branch_1)
      if (bank_name_2) setBankName2(bank_name_2)
      if (bank_account_2) setBankAccount2(bank_account_2)
      if (bank_ifsc_2) setBankIFSC2(bank_ifsc_2)
      if (bank_branch_2) setBankBranch2(bank_branch_2)
      if (bank_name_3) setBankName3(bank_name_3)
      if (bank_account_3) setBankAccount3(bank_account_3)
      if (bank_ifsc_3) setBankIFSC3(bank_ifsc_3)
      if (bank_branch_3) setBankBranch3(bank_branch_3)

      if (vendor_type_ids && vendor_type_ids.length)
        setVendorTypeIDs(vendor_type_ids.map((typeID) => String(typeID)))

      if (vendorData.vendor.name) setName(vendorData.vendor.name)
      if (vendorData.vendor.email) setEmail(vendorData.vendor.email)
      if (vendorData.vendor.password) setPassword(vendorData.vendor.password)
      if (vendorData.vendor.phone) setPhone(vendorData.vendor.phone)
      if (vendorData.vendor.company) setCompany(vendorData.vendor.company)
      if (vendorData.vendor.state) setState(vendorData.vendor.state)
      if (vendorData.vendor.city) setCity(vendorData.vendor.city)
      if (vendorData.vendor.address) setAddress(vendorData.vendor.address)
      if (vendorData.vendor.pan) setPan(vendorData.vendor.pan)
      if (vendorData.vendor.gst) setGST(vendorData.vendor.gst)
      if (vendorData.vendor.aadhar) setAadhar(vendorData.vendor.aadhar)

      if (profile_pic) {
        setProfilePic(profile_pic)
        setExistingProfileImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_PROFILE_PIC_URL}${profile_pic}`,
        ])
      }

      if (gst_image) {
        setGSTImage(gst_image)
        setExistingGSTImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_VENDOR_URL}${gst_image}`,
        ])
      }

      if (pan_image) {
        setPanImage(pan_image)
        setExistingPanImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_VENDOR_URL}${pan_image}`,
        ])
      }

      if (aadhar_image) {
        setAadharImage(aadhar_image)
        setExistingAadharImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_VENDOR_URL}${aadhar_image}`,
        ])
      }
    }
  }, [vendorData])

  useEffect(() => {
    if (!roleLoad && roleData && roleData.roles && roleData.roles.length)
      setRolesList(roleData.roles)
  }, [roleData, roleLoad])

  useEffect(() => {
    if (!termLoad && pTermData && pTermData.paymentTerms && pTermData.paymentTerms.length)
      setPaymentTermsList(pTermData.paymentTerms)
  }, [pTermData, termLoad])

  useEffect(() => {
    if (!vTypeLoad && vTypeData && vTypeData.vendorTypes && vTypeData.vendorTypes.length)
      setVendorTypesList(vTypeData.vendorTypes)
  }, [vTypeData, vTypeLoad])

  const onSubmit = () => {
    setNameError(undefined)
    setEmailError(undefined)
    setPasswordError(undefined)
    setRoleIDError(undefined)
    setCompanyError(undefined)
    setVendorTypeIDsError(undefined)
    setStateError(undefined)
    setCityError(undefined)
    setAddressError(undefined)
    setPaymentTermIDError(undefined)
    setBankAccount1Error(undefined)
    setBankName1Error(undefined)
    setBankIFSC1Error(undefined)
    setBankBranch1Error(undefined)
    setPanError(undefined)
    setGSTError(undefined)

    let isError = false
    if (!name) {
      isError = true
      setNameError('Vendor name cannot be empty')
    }
    if (!email) {
      isError = true
      setEmailError('Login email cannot be empty')
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
    if (!password) {
      isError = true
      setPasswordError('Login password cannot be empty')
    }
    if (type === 'admin' && permissions.includes('updateVendor')) {
      if (!roleID || Number(roleID) === 0) {
        isError = true
        setRoleIDError('Please assign a role')
      }
    }
    if (!company) {
      isError = true
      setCompanyError('Company cannot be empty')
    }
    if (!vendorTypeIDs || !vendorTypeIDs.length) {
      isError = true
      setVendorTypeIDsError('Please select one or more vendor-types')
    }
    if (!paymentTermID || Number(paymentTermID) === 0) {
      isError = true
      setPaymentTermIDError('Please select a payment term')
    }
    if (!state) {
      isError = true
      setStateError('Please select a state')
    }
    if (!city) {
      isError = true
      setCityError('City cannot be empty')
    }
    if (!address) {
      isError = true
      setAddressError('Address cannot be empty')
    }
    // if (!bankName1) {
    //   isError = true
    //   setBankName1Error('Name of Bank-1 cannot be empty')
    // }
    // if (!bankAccount1) {
    //   isError = true
    //   setBankAccount1Error('Account of Bank-1 cannot be empty')
    // }
    // if (!bankIFSC1) {
    //   isError = true
    //   setBankIFSC1Error('IFSC Code of Bank-1 cannot be empty')
    // }
    // if (!bankBranch1) {
    //   isError = true
    //   setBankBranch1Error('Branch of Bank-1 cannot be empty')
    // }
    // if (!pan) {
    //   isError = true
    //   setPanError('PAN No. cannot be empty')
    // }
    // if (!gst) {
    //   isError = true
    //   setGSTError('GST No. cannot be empty')
    // }

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

    upsertVendor({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        name,
        email,
        password,
        company,
        state,
        city,
        address,
        phone,
        alt_phone: altPhone,
        role_id: Number(roleID),
        vendor_type_ids: vendorTypeIDs.map((typeID) => Number(typeID)),
        profile_pic: profilePic,
        is_profile_pic_changed: profilePicChanged,
        bank_name_1: bankName1,
        bank_account_1: bankAccount1,
        bank_ifsc_1: bankIFSC1,
        bank_branch_1: bankBranch1,
        bank_name_2: bankName2,
        bank_account_2: bankAccount2,
        bank_ifsc_2: bankIFSC2,
        bank_branch_2: bankBranch2,
        bank_name_3: bankName3,
        bank_account_3: bankAccount3,
        bank_ifsc_3: bankIFSC3,
        bank_branch_3: bankBranch3,
        gst,
        gst_image: gstImage,
        is_gst_image_changed: gstImageChanged,
        pan,
        pan_image: panImage,
        is_pan_image_changed: panImageChanged,
        aadhar,
        aadhar_image: aadharImage,
        is_aadhar_image_changed: aadharImageChanged,
        payment_term_id: Number(paymentTermID),
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/accounts/vendors')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving vendor.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }
  if (type === 'vendor' && Number(id) !== Number(vendor_id)) return <Error403 />
  if (type === 'admin' && !permissions.includes('updateVendor')) return <Error403 />
  if (!permissions.includes('readVendor')) return <Error403 />
  if (action === 'create' && !permissions.includes('createVendor')) return <Error403 />
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (roleErr) return `Error occured while fetching data: ${roleErr.message}`
  if (termErr) return `Error occured while fetching data: ${termErr.message}`
  if (vTypeErr) return `Error occured while fetching data: ${vTypeErr.message}`

  return (
    <div>
      <Helmet title="Vendors" />

      <Spin spinning={vendorLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Vendor</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateVendor') ? (
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
                      Vendor Name<span className="custom-error-text"> *</span>
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
                      Company<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={company}
                      onChange={({ target: { value } }) => setCompany(value)}
                      disabled={disabled}
                      className={
                        companyError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{companyError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      Vendor Types<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      mode="multiple"
                      showSearch
                      value={vendorTypeIDs}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setVendorTypeIDs(value)}
                      className={
                        vendorTypeIDsError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select types"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {vendorTypesList && vendorTypesList.length
                        ? vendorTypesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.type}
                            </Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{vendorTypeIDsError || ''}</div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">
                      Payment Term<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={paymentTermID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setPaymentTermID(value)}
                      className={
                        paymentTermIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select one"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {paymentTermsList && paymentTermsList.length
                        ? paymentTermsList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.title}
                            </Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{paymentTermIDError || ''}</div>
                  </div>

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
                      City<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      autoComplete="new-password"
                      value={city}
                      onChange={({ target: { value } }) => setCity(value)}
                      disabled={disabled}
                      className={
                        cityError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{cityError || ''}</div>
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

                <div className="row mb-3">
                  <div className="col-lg-6">
                    <div className="mb-2">Phone</div>
                    <Input
                      autoComplete="new-password"
                      value={phone}
                      onChange={({ target: { value } }) => setPhone(value)}
                      disabled={disabled}
                      className={disabled ? 'disabledStyle' : ''}
                    />
                  </div>

                  <div className="col-lg-6">
                    <div className="mb-2">Alternate Phone</div>
                    <Input
                      autoComplete="new-password"
                      value={altPhone}
                      onChange={({ target: { value } }) => setAltPhone(value)}
                      disabled={disabled}
                      className={disabled ? 'disabledStyle' : ''}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h6 className="text-black mb-4">
                  <strong>BANK DETAILS</strong>
                </h6>

                <div className="row mb-2">
                  <div className="col-lg-1">
                    <h6 className="text-black">
                      <strong>BANK 1</strong>
                    </h6>
                  </div>
                  <div className="col-lg-11">
                    <div className="row">
                      <div className="col-lg-3">
                        <div className="mb-2">Bank Name</div>
                        <Input
                          value={bankName1}
                          onChange={({ target: { value } }) => setBankName1(value)}
                          disabled={disabled}
                          className={
                            bankName1Error ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                        />
                        <div className="custom-error-text mb-4">{bankName1Error || ''}</div>
                      </div>

                      <div className="col-lg-3">
                        <div className="mb-2">Bank Account</div>
                        <Input
                          value={bankAccount1}
                          onChange={({ target: { value } }) => setBankAccount1(value)}
                          disabled={disabled}
                          className={
                            bankAccount1Error
                              ? 'custom-error-border'
                              : disabled
                              ? 'disabledStyle'
                              : ''
                          }
                        />
                        <div className="custom-error-text mb-4">{bankAccount1Error || ''}</div>
                      </div>

                      <div className="col-lg-3">
                        <div className="mb-2">Bank IFSC Code</div>
                        <Input
                          value={bankIFSC1}
                          onChange={({ target: { value } }) => setBankIFSC1(value)}
                          disabled={disabled}
                          className={
                            bankIFSC1Error ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                        />
                        <div className="custom-error-text mb-4">{bankIFSC1Error || ''}</div>
                      </div>

                      <div className="col-lg-3">
                        <div className="mb-2">Bank Branch</div>
                        <Input
                          value={bankBranch1}
                          onChange={({ target: { value } }) => setBankBranch1(value)}
                          disabled={disabled}
                          className={
                            bankBranch1Error
                              ? 'custom-error-border'
                              : disabled
                              ? 'disabledStyle'
                              : ''
                          }
                        />
                        <div className="custom-error-text mb-4">{bankBranch1Error || ''}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-lg-1">
                    <h6 className="text-black">
                      <strong>BANK 2</strong>
                    </h6>
                  </div>
                  <div className="col-lg-11">
                    <div className="row">
                      <div className="col-lg-3">
                        <div className="mb-2">Bank Name</div>
                        <Input
                          value={bankName2}
                          onChange={({ target: { value } }) => setBankName2(value)}
                          disabled={disabled}
                          className={disabled ? 'disabledStyle' : ''}
                        />
                      </div>

                      <div className="col-lg-3">
                        <div className="mb-2">Bank Account</div>
                        <Input
                          value={bankAccount2}
                          onChange={({ target: { value } }) => setBankAccount2(value)}
                          disabled={disabled}
                          className={disabled ? 'disabledStyle' : ''}
                        />
                      </div>

                      <div className="col-lg-3">
                        <div className="mb-2">Bank IFSC Code</div>
                        <Input
                          value={bankIFSC2}
                          onChange={({ target: { value } }) => setBankIFSC2(value)}
                          disabled={disabled}
                          className={disabled ? 'disabledStyle' : ''}
                        />
                      </div>

                      <div className="col-lg-3">
                        <div className="mb-2">Bank Branch</div>
                        <Input
                          value={bankBranch2}
                          onChange={({ target: { value } }) => setBankBranch2(value)}
                          disabled={disabled}
                          className={disabled ? 'disabledStyle' : ''}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-lg-1">
                    <h6 className="text-black">
                      <strong>BANK 3</strong>
                    </h6>
                  </div>
                  <div className="col-lg-11">
                    <div className="row">
                      <div className="col-lg-3">
                        <div className="mb-2">Bank Name</div>
                        <Input
                          value={bankName3}
                          onChange={({ target: { value } }) => setBankName3(value)}
                          disabled={disabled}
                          className={disabled ? 'disabledStyle' : ''}
                        />
                      </div>

                      <div className="col-lg-3">
                        <div className="mb-2">Bank Account</div>
                        <Input
                          value={bankAccount3}
                          onChange={({ target: { value } }) => setBankAccount3(value)}
                          disabled={disabled}
                          className={disabled ? 'disabledStyle' : ''}
                        />
                      </div>

                      <div className="col-lg-3">
                        <div className="mb-2">Bank IFSC Code</div>
                        <Input
                          value={bankIFSC3}
                          onChange={({ target: { value } }) => setBankIFSC3(value)}
                          disabled={disabled}
                          className={disabled ? 'disabledStyle' : ''}
                        />
                      </div>

                      <div className="col-lg-3">
                        <div className="mb-2">Bank Branch</div>
                        <Input
                          value={bankBranch3}
                          onChange={({ target: { value } }) => setBankBranch3(value)}
                          disabled={disabled}
                          className={disabled ? 'disabledStyle' : ''}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h6 className="text-black mb-4">
                  <strong>BUSINESS DETAILS</strong>
                </h6>

                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">PAN No.</div>
                    <Input
                      value={pan}
                      onChange={({ target: { value } }) => setPan(value)}
                      disabled={disabled}
                      className={panError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                    />
                    <div className="custom-error-text mb-4">{panError || ''}</div>

                    <div className="mb-2">PAN Image</div>
                    <ImageUpload
                      existingImages={existingPanImages} // Always pass an array. If not empty, it should have fully-formed URLs of images
                      placeholderType="general" // Accepted values: 'general' or 'profile'
                      onUploadCallback={(imgFile) => {
                        setPanImage(imgFile)
                        setPanImageChanged(true)
                      }}
                      onRemoveCallback={() => {
                        setPanImage(null)
                        setPanImageChanged(true)
                      }}
                      maxImages={1}
                      editMode={!disabled}
                    />
                    <div className="custom-error-text mb-4" />
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">GST No.</div>
                    <Input
                      value={gst}
                      onChange={({ target: { value } }) => setGST(value)}
                      disabled={disabled}
                      className={gstError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                    />
                    <div className="custom-error-text mb-4">{gstError || ''}</div>

                    <div className="mb-2">GST Image</div>
                    <ImageUpload
                      existingImages={existingGSTImages} // Always pass an array. If not empty, it should have fully-formed URLs of images
                      placeholderType="general" // Accepted values: 'general' or 'profile'
                      onUploadCallback={(imgFile) => {
                        setGSTImage(imgFile)
                        setGSTImageChanged(true)
                      }}
                      onRemoveCallback={() => {
                        setGSTImage(null)
                        setGSTImageChanged(true)
                      }}
                      maxImages={1}
                      editMode={!disabled}
                    />
                    <div className="custom-error-text mb-4" />
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">Aadhar No.</div>
                    <Input
                      value={aadhar}
                      onChange={({ target: { value } }) => setAadhar(value)}
                      disabled={disabled}
                      className={disabled ? 'disabledStyle' : ''}
                    />
                    <div className="custom-error-text mb-4" />

                    <div className="mb-2">Aadhar Image</div>
                    <ImageUpload
                      existingImages={existingAadharImages} // Always pass an array. If not empty, it should have fully-formed URLs of images
                      placeholderType="general" // Accepted values: 'general' or 'profile'
                      onUploadCallback={(imgFile) => {
                        setAadharImage(imgFile)
                        setAadharImageChanged(true)
                      }}
                      onRemoveCallback={() => {
                        setAadharImage(null)
                        setAadharImageChanged(true)
                      }}
                      maxImages={1}
                      editMode={!disabled}
                    />
                    <div className="custom-error-text mb-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-12">
            <div className="card">
              <div className="card-body">
                <h6 className="text-black mb-4">
                  <strong>ACCOUNT DETAILS</strong>
                </h6>
                <div className="mb-2">Profile Pic</div>
                <ImageUpload
                  existingImages={existingProfileImages} // Always pass an array. If not empty, it should have fully-formed URLs of images
                  placeholderType="profile" // Accepted values: 'general' or 'profile'
                  onUploadCallback={(imgFile) => {
                    setProfilePic(imgFile)
                    setProfilePicChanged(true)
                  }}
                  onRemoveCallback={() => {
                    setProfilePic(null)
                    setProfilePicChanged(true)
                  }}
                  maxImages={1}
                  editMode={!disabled}
                />
                <div className="mb-2" />

                <div className="mb-2">
                  e-mail<span className="custom-error-text"> *</span>
                </div>
                <Input
                  autoComplete="off"
                  value={email}
                  onChange={({ target: { value } }) => setEmail(value)}
                  disabled={disabled}
                  className={emailError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{emailError || ''}</div>

                <div className="mb-2">
                  Password<span className="custom-error-text"> *</span>
                </div>
                <Input.Password
                  autoComplete="new-password"
                  value={password}
                  onChange={({ target: { value } }) => {
                    setPassword(value)
                    setPasswordChanged(true)
                  }}
                  disabled={disabled}
                  visibilityToggle={passwordChanged}
                  className={
                    passwordError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                />
                <div className="custom-error-text mb-4">{passwordError || ''}</div>
                {type === 'admin' && permissions.includes('updateVendor') && (
                  <>
                    <div className="mb-2">
                      Role<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={roleID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setRoleID(value)}
                      className={
                        roleIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select a role"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {rolesList && rolesList.length
                        ? rolesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.title}
                            </Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{roleIDError || ''}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createVendor')) ||
          (action === 'update' && permissions.includes('updateVendor')) ||
          type === 'vendor' ? (
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

export default withRouter(connect(mapStateToProps)(VendorForm))
