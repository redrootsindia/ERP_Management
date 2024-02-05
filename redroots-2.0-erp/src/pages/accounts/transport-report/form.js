import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory, useParams, withRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { Input, Spin, Switch, Select, Button, notification, DatePicker } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Error403 from 'components/Errors/403'
import moment from 'moment'
import { useMutation, useQuery } from '@apollo/client'
import ImageUpload from 'components/ImageUpload'
import { BRANDS } from '../../purchase-orders/product/queries'
import { UPSERT_TRANSPORT_REPORT, TRANSPORT_REPORT } from './query'

const mapStateToProps = ({ user }) => ({ user })

const TransportReportform = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()
  const [transporterName, setTransporterName] = useState('')
  const [transportNameError, setTransportNameError] = useState(undefined)

  const [brandIDError, setBrandIDError] = useState(undefined)
  const [brandID, setBrandID] = useState(undefined)
  const [brandList, setBrandList] = useState([])

  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleNumberError, setVehicleNumberError] = useState(undefined)

  const [contactNumber, setContactNumber] = useState('')
  const [contactNumberError, setContactNumberError] = useState(undefined)

  const [bookingDate, setBookingDate] = useState(undefined)
  const [bookingDateError, setBookingDateError] = useState(undefined)

  const [image, setImage] = useState(undefined)
  const [existingImages, setExistingImages] = useState([])
  // const [imageChanged, setImageChanged] = useState(false)
  const [fircDocNumber, setFircDocNumber] = useState('')
  const [fircDocNumError, setFircDocNumError] = useState(undefined)
  const [shippingNumber, setShippingNumber] = useState()
  const [shippingNumberError, setShippingNumberError] = useState(undefined)

  const [mmCopyStatus, setMmCopyStatus] = useState('Not Recieved')
  const [vcInvoiceStatus, setVcInvoiceStatus] = useState('Not Recieved')
  const [fircCopyStatus, setFircCopyStatus] = useState('Not Recieved')

  const [invoiceCreationDate, setInvoiceCreationDate] = useState(undefined)
  const [invoiceCreationDateError, setInvoiceCreationDateError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateTransportReport')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertTransportReport] = useMutation(UPSERT_TRANSPORT_REPORT)

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length)
      setBrandList(brandData.brands)
  }, [brandData, brandLoad])

  const {
    loading: tranportReportLoad,
    data: transportReportData,
    error: transportReportError,
  } = useQuery(TRANSPORT_REPORT, { variables: { id } })
  useEffect(() => {
    if (!tranportReportLoad && transportReportData && transportReportData.transportReport) {
      const {
        booking_date,
        brand_id,
        contact_number,
        e_way_bill,
        firc_copy,
        firc_doc_number,
        invoice_creation_date,
        mm_copy_status,
        shipping_bill_number,
        transporter_name,
        vc_inv_creation_status,
        vehicle_number,
      } = transportReportData.transportReport

      if (booking_date) setBookingDate(moment(Number(booking_date)))
      if (brand_id) setBrandID(brand_id)
      if (contact_number) setContactNumber(contact_number)
      if (firc_copy) setFircCopyStatus(firc_copy)
      if (firc_doc_number) setFircDocNumber(firc_doc_number)
      if (invoice_creation_date) setInvoiceCreationDate(moment(Number(invoice_creation_date)))
      if (mm_copy_status) setMmCopyStatus(mm_copy_status)
      if (shipping_bill_number) setShippingNumber(shipping_bill_number)
      if (transporter_name) setTransporterName(transporter_name)
      if (vc_inv_creation_status) setVcInvoiceStatus(vc_inv_creation_status)
      if (vehicle_number) setVehicleNumber(vehicle_number)
      // if (e_way_bill) setExistingImages(e_way_bill)
      if (e_way_bill) {
        setImage(e_way_bill)
        setExistingImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_MATERIAL_URL}${e_way_bill}`,
        ])
      }
    }
  }, [tranportReportLoad, transportReportData])
  const onSubmit = () => {
    setTransportNameError(undefined)
    setBrandIDError(undefined)
    setVehicleNumberError(undefined)
    setContactNumberError(undefined)
    setBookingDateError(undefined)
    setInvoiceCreationDateError(undefined)
    setFircDocNumError(undefined)
    setShippingNumberError(undefined)

    let isError = false
    if (!transporterName) {
      isError = true
      setTransportNameError('name cannot be empty')
    }
    if (!brandID) {
      isError = true
      setBrandIDError('Please select a brand')
    }
    if (!vehicleNumber) {
      isError = true
      setVehicleNumberError('vehicle no. cannot be empty')
    }
    if (!contactNumber) {
      isError = true
      setContactNumberError('Please fill contact no.')
    }
    if (!bookingDate) {
      isError = true
      setBookingDateError('please select a date')
    }
    if (!fircDocNumber) {
      isError = true
      setFircDocNumError('please enter FIRC Doc No.')
    }
    if (!shippingNumber) {
      isError = true
      setShippingNumberError('please enter shipping No.')
    }
    if (!invoiceCreationDate) {
      isError = true
      setInvoiceCreationDateError('please select date')
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

    upsertTransportReport({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        transporter_name: transporterName,
        brand_id: Number(brandID),
        vehicle_number: vehicleNumber,
        contact_number: contactNumber,
        e_way_bill: image,
        firc_copy: fircCopyStatus,
        firc_doc_number: String(fircDocNumber),
        booking_date: String(bookingDate.valueOf()),
        shipping_bill_number: shippingNumber,
        mm_copy_status: mmCopyStatus,
        invoice_creation_date: String(invoiceCreationDate.valueOf()),
        vc_inv_creation_status: vcInvoiceStatus,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/accounts/transport-report')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving material.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readTransportReport')) return <Error403 />
  if (action === 'create' && !permissions.includes('createTransportReport')) return <Error403 />
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (transportReportError)
    return `Error occured while fetching data: ${transportReportError.message}`

  return (
    <div>
      <Helmet title="Trasnport Report" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Transport Report</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateTransportReport') ? (
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
              <div className="col-10">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">
                      Transporter Name<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={transporterName}
                      onChange={({ target: { value } }) => setTransporterName(value)}
                      disabled={disabled}
                      className={
                        transportNameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{transportNameError || ''}</div>
                  </div>

                  <div className="col-lg-4 col-6">
                    <div className="mb-2">
                      Brand<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={brandID}
                      disabled={action === 'update' || disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setBrandID(value)
                      }}
                      className={
                        brandIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select an brand"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {brandList && brandList.length
                        ? brandList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{brandIDError || ''}</div>
                  </div>
                  <div className="col-lg-3 col-6">
                    <div className="mb-2">
                      Booking Date<span className="custom-error-text"> *</span>
                    </div>
                    <DatePicker
                      style={{ width: '100%' }}
                      value={bookingDate}
                      format="DD-MM-YYYY"
                      className={
                        bookingDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      onChange={(value) => {
                        setBookingDate(value)
                      }}
                      disabled={disabled}
                    />
                    <div className="custom-error-text mb-4">{bookingDateError || ''}</div>
                  </div>
                  <div className="col-lg-4">
                    <div className="mb-2">
                      Vehicle Number<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={vehicleNumber}
                      onChange={({ target: { value } }) => setVehicleNumber(value)}
                      disabled={disabled}
                      className={
                        vehicleNumberError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{vehicleNumberError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      Shipping Number<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={shippingNumber}
                      onChange={({ target: { value } }) => setShippingNumber(value)}
                      disabled={disabled}
                      className={
                        shippingNumberError
                          ? 'custom-error-border'
                          : disabled
                          ? 'disabledStyle'
                          : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{shippingNumberError || ''}</div>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      Contact Number<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={contactNumber}
                      onChange={({ target: { value } }) => setContactNumber(value)}
                      disabled={disabled}
                      className={
                        contactNumberError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{contactNumberError || ''}</div>
                  </div>
                  <div className="col-lg-4">
                    <div className="mb-2">
                      FIRC Copy Status<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={fircCopyStatus}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setFircCopyStatus(value)}
                      placeholder="select FIRC copy status"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Select.Option key="1" value="Not Recieved">
                        Not Recieved
                      </Select.Option>
                      <Select.Option key="2" value="Recieved">
                        {' '}
                        Recieved
                      </Select.Option>
                    </Select>
                  </div>
                  <div className="col-lg-4">
                    <div className="mb-2">
                      FIRC DOC NO.<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      value={fircDocNumber}
                      onChange={({ target: { value } }) => setFircDocNumber(value)}
                      disabled={disabled}
                      className={
                        fircDocNumError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{fircDocNumError || ''}</div>
                  </div>
                  <div className="col-lg-3 col-6">
                    <div className="mb-2">
                      Invoice Creation Date<span className="custom-error-text"> *</span>
                    </div>
                    <DatePicker
                      style={{ width: '100%' }}
                      value={invoiceCreationDate}
                      format="DD-MM-YYYY"
                      className={
                        invoiceCreationDateError
                          ? 'custom-error-border'
                          : disabled
                          ? 'disabledStyle'
                          : ''
                      }
                      onChange={(value) => {
                        setInvoiceCreationDate(value)
                      }}
                      disabled={disabled}
                    />
                    <div className="custom-error-text mb-4">{invoiceCreationDateError || ''}</div>
                  </div>
                  <div className="col-lg-4">
                    <div className="mb-2">
                      MM Copy Status<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={mmCopyStatus}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setMmCopyStatus(value)}
                      placeholder="MM copy status"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Select.Option key="1" value="Not Recieved">
                        Not Recieved
                      </Select.Option>
                      <Select.Option key="2" value="Recieved">
                        {' '}
                        Recieved
                      </Select.Option>
                    </Select>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">
                      VC Invoice Status<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={vcInvoiceStatus}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => setVcInvoiceStatus(value)}
                      placeholder="vcinvoice status"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Select.Option key="1" value="Not Recieved">
                        Not Recieved
                      </Select.Option>
                      <Select.Option key="2" value="Recieved">
                        {' '}
                        Recieved
                      </Select.Option>
                    </Select>
                  </div>
                  <div className="col-2">
                    <div className="mb-2">Image</div>
                    <ImageUpload
                      existingImages={existingImages} // Always pass an array. If not empty, it should have fully-formed URLs of images
                      placeholderType="general" // Accepted values: 'general' or 'general'
                      onUploadCallback={(imgFile) => {
                        setImage(imgFile)
                        // setImageChanged(true)
                      }}
                      onRemoveCallback={() => {
                        setImage(null)
                        // setImageChanged(true)
                      }}
                      maxImages={1}
                      editMode={!disabled}
                    />
                    <div className="mb-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createTransportReport')) ||
          (action === 'update' && permissions.includes('updateTransportReport')) ? (
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

export default withRouter(connect(mapStateToProps)(TransportReportform))
