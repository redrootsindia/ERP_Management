import React, { useEffect, useState } from 'react'
import { withRouter, useParams, useHistory, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Spin, Button, DatePicker, TimePicker, Input, notification, Select } from 'antd'
import Error403 from 'components/Errors/403'
import { useMutation, useQuery } from '@apollo/client'
import moment from 'moment'
import { BRANDS } from 'pages/purchase-orders/product/queries'
import { UPSERT_VENDOR_APPOINTMENT, VENDOR_APPOINTMENT } from './query'

const mapStateToProps = ({ user }) => ({ user })
const VendorAppointment = ({ user: { permissions } }) => {
  const { action, id } = useParams()
  const history = useHistory()
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [appointmnetDate, setAppointmentDate] = useState(undefined)
  const [appointmnetDateError, setAppointmentDateError] = useState(undefined)

  const [appointmnetTime, setAppointmentTime] = useState(undefined)
  const [appointmnetTimeError, setAppointmentTimeError] = useState(undefined)

  const [dispatchDate, setDispatchDate] = useState(undefined)
  const [dispatchDateError, setDispatchDateError] = useState(undefined)

  const [ams, setAms] = useState('')
  const [amsError, setAmsError] = useState(undefined)

  const [shippedFrom, setShippedFrom] = useState('')
  const [shippedFromError, setShippedFromError] = useState('')

  const [shippingDest, setShippingDest] = useState('')
  const [shippingDestError, setShippingDestError] = useState('')

  const [shippingStatus, setShippingStatus] = useState('Not Delivered')
  const [shippingStatusError, setShippingStatusError] = useState(undefined)

  const [deliveryData, setDeliveryDate] = useState(undefined)
  const [deliveryDateError, setDeliveryDateError] = useState(undefined)

  const [hsnNumber, setHsnNumber] = useState(undefined)
  const [hsnNumberError, setHsnNumberError] = useState(undefined)

  const [brandIDError, setBrandIDError] = useState(undefined)
  const [brandID, setBrandID] = useState(undefined)
  const [brandList, setBrandList] = useState([])

  const [tsc, setTsc] = useState('')
  const [tscError, setTscError] = useState(undefined)

  const [transporterID, setTransporterID] = useState()
  const [transporterIDError, setTransporterIDError] = useState(undefined)

  const [upsertVendorAppointment] = useMutation(UPSERT_VENDOR_APPOINTMENT)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateVendorAppointment')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const {
    loading: vendorappointmentLoad,
    data: vendorappointmentData,
    error: vendorappointmentError,
  } = useQuery(VENDOR_APPOINTMENT, {
    variables: { id },
  })

  useEffect(() => {
    if (
      !vendorappointmentLoad &&
      vendorappointmentData &&
      vendorappointmentData.vendorAppointment
    ) {
      const {
        AMS,
        HSN_number,
        brand_id,
        TSC,
        appointment_date,
        appointment_time,
        delivery_date,
        dispatch_date,
        shipped_from,
        shipping_status,
        shipping_destination,
        transporter_id,
      } = vendorappointmentData.vendorAppointment
      if (AMS) setAms(AMS)
      if (HSN_number) setHsnNumber(HSN_number)
      if (brand_id) setBrandID(brand_id)
      if (TSC) setTsc(TSC)
      if (appointment_date) setAppointmentDate(moment(Number(appointment_date)))
      if (appointment_time) setAppointmentTime(moment(Number(appointment_time)))
      if (delivery_date) setDeliveryDate(moment(Number(delivery_date)))
      if (dispatch_date) setDispatchDate(moment(Number(dispatch_date)))
      if (shipped_from) setShippedFrom(shipped_from)
      if (shipping_status) setShippingStatus(shipping_status)
      if (shipping_destination) setShippingDest(shipping_destination)
      if (transporter_id) setTransporterID(transporter_id)
    }
  }, [vendorappointmentData, vendorappointmentLoad])
  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)

  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length)
      setBrandList(brandData.brands)
  }, [brandData, brandLoad])

  const onSubmit = () => {
    setTscError(undefined)
    setAppointmentDateError(undefined)
    setAppointmentTimeError(undefined)
    setDispatchDateError(undefined)
    setAmsError(undefined)
    setShippedFromError(undefined)
    setShippingDestError(undefined)
    setShippingStatusError(undefined)
    setDeliveryDateError(undefined)
    setHsnNumberError(undefined)
    setTransporterIDError(undefined)

    let isError = false

    if (!appointmnetDate) {
      isError = true
      setAppointmentDateError('please select Date')
    }
    if (!appointmnetTime) {
      isError = true
      setAppointmentTimeError('please select Time')
    }
    if (!dispatchDate) {
      isError = true
      setDispatchDateError('please select Dispatch Date')
    }
    if (!tsc) {
      isError = true
      setTscError('Please enter TSC')
    }
    if (!ams) {
      isError = true
      setAmsError('Please enter AMS')
    }
    if (!shippedFrom) {
      isError = true
      setShippedFromError('Enter shipped from')
    }
    if (!shippingDest) {
      isError = true
      setShippingDestError('Enter shipping destination')
    }
    if (!shippingStatus) {
      isError = true
      setShippingStatusError('Select shipping status')
    }
    if (!deliveryData) {
      isError = true
      setDeliveryDateError('Select delivery date')
    }
    if (!hsnNumber) {
      isError = true
      setHsnNumberError('Select hsn number')
    }
    if (!brandID) {
      isError = true
      setBrandIDError('Please select a brand')
    }
    if (!transporterID) {
      isError = true
      setTransporterIDError('Please select a transport ID')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }
    upsertVendorAppointment({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        appointment_date: String(appointmnetDate.valueOf()),
        appointment_time: String(appointmnetTime.valueOf()),
        dispatch_date: String(dispatchDate.valueOf()),
        TSC: tsc,
        AMS: ams,
        brand_id: brandID,
        shipped_from: shippedFrom,
        shipping_destination: shippingDest,
        shipping_status: shippingStatus,
        delivery_date: String(deliveryData.valueOf()),
        transporter_id: Number(transporterID),
        HSN_number: hsnNumber,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/vendor-appointmnet')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }
  if (!permissions.includes('readVendorAppointment')) return <Error403 />
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (vendorappointmentError)
    return `Error occured while fetching data: ${vendorappointmentError.message}`

  return (
    <div>
      <Helmet title=" Vendor Appointment" />
      <Spin spinning={vendorappointmentLoad} tip="Loading..." size="large">
        <div className=" row mb-4 mr-2 ml-2">
          <div className={action === 'create' ? 'col-4' : 'col-3'}>
            <h5 className="mb-2">
              <strong>
                {id ? 'Edit' : 'Create'} Vendor Appointment {id ? `#${id}` : ' '}
              </strong>
            </h5>
          </div>
          <div className=" col-12 pull-right" style={{ textAlign: 'right' }}>
            {action === 'update' && permissions.includes('updateVendorAppointment') && (
              <Switch
                checked={editMode}
                onChange={(checked) => {
                  setEditMode(checked)
                  setDisabled(!checked)
                }}
                className="ml-3"
              >
                Edit
              </Switch>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="row mb-5">
              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Brand<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={brandID}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setBrandID(value)
                  }}
                  className={brandIDError ? 'custom-error-border' : ''}
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
                  Appointment Date<span className="custom-error-text"> *</span>
                </div>
                <DatePicker
                  style={{ width: '100%' }}
                  value={appointmnetDate}
                  format="DD-MM-YYYY"
                  className={
                    appointmnetDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  onChange={(value) => {
                    setAppointmentDate(value)
                  }}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{appointmnetDateError || ''}</div>
              </div>
              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Appointment Time<span className="custom-error-text"> *</span>
                </div>
                <TimePicker
                  use12Hours
                  className={
                    appointmnetTimeError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  style={{ width: '100%' }}
                  value={appointmnetTime}
                  format="h:mm a"
                  onChange={(value) => setAppointmentTime(value)}
                />
                <div className="custom-error-text mb-4">{appointmnetTimeError || ''}</div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Dispatch Date<span className="custom-error-text"> *</span>
                </div>
                <DatePicker
                  style={{ width: '100%' }}
                  value={dispatchDate}
                  format="DD-MM-YYYY"
                  className={
                    dispatchDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  onChange={(value) => {
                    setDispatchDate(value)
                  }}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{dispatchDateError || ''}</div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  TSC<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={tsc}
                  placeholder="TSC"
                  className={tscError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                  onChange={(e) => setTsc(e.target.value)}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{tscError || ''}</div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  AMS<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={ams}
                  placeholder="AMS"
                  className={amsError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                  onChange={(e) => setAms(e.target.value)}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{amsError || ''}</div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Shipped From<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={shippedFrom}
                  placeholder="shipped from"
                  className={
                    shippedFromError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  onChange={(e) => setShippedFrom(e.target.value)}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{shippedFromError || ''}</div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Shipping Destinatoin<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={shippingDest}
                  placeholder="shippping Dest"
                  className={
                    shippingDestError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  onChange={(e) => setShippingDest(e.target.value)}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{shippingDestError || ''}</div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Shipping Status<span className="custom-error-text"> *</span>
                </div>
                <Select
                  value={shippingStatus}
                  onChange={(value) => {
                    setShippingStatus(value)
                  }}
                  className={
                    shippingStatusError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select Status"
                  style={{
                    width: '100%',
                  }}
                  disabled={disabled}
                >
                  <Select.Option key="Delivered" value="Delivered">
                    Delivered
                  </Select.Option>
                  <Select.Option key="Not Delivered" value="Not Delivered">
                    Not Delivered
                  </Select.Option>
                </Select>
                <div className="custom-error-text mb-4">{shippingStatusError || ''}</div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Delivery Date<span className="custom-error-text"> *</span>
                </div>
                <DatePicker
                  style={{ width: '100%' }}
                  value={deliveryData}
                  format="DD-MM-YYYY"
                  className={
                    deliveryDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  onChange={(value) => {
                    setDeliveryDate(value)
                  }}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{deliveryDateError || ''}</div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  HSN Nmber<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={hsnNumber}
                  placeholder="hsn number"
                  className={
                    hsnNumberError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  onChange={(e) => setHsnNumber(e.target.value)}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{hsnNumberError || ''}</div>
              </div>

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Transporter ID<span className="custom-error-text"> *</span>
                </div>
                <Select
                  value={transporterID}
                  onChange={(value) => {
                    setTransporterID(value)
                  }}
                  className={
                    transporterIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select Status"
                  style={{
                    width: '100%',
                  }}
                  disabled={disabled}
                >
                  <Select.Option key="1" value="1">
                    1
                  </Select.Option>
                  <Select.Option key="2" value="2">
                    2
                  </Select.Option>
                  <Select.Option key="3" value="3">
                    3
                  </Select.Option>
                  <Select.Option key="4" value="4">
                    4
                  </Select.Option>
                  <Select.Option key="5" value="5">
                    5
                  </Select.Option>
                </Select>
                <div className="custom-error-text mb-4">{transporterIDError || ''}</div>
              </div>
            </div>

            {/*  <div className="row">
              <div className="col-lg-12">
                <Table
                  dataSource={[]}
                  columns={[]}
                  pagination={false}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                />
              </div>
                </div> */}
            {/* <div className="row mt-4">
              <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
                <span className="mr-3">Total 0</span>
                <Button type="default">Add Row</Button>
              </div>
            </div> */}
          </div>
        </div>
        <div className="row mb-4 ml-2 mr-2 pull-right">
          <div className="col-12">
            <Button className="mr-2" type="primary" onClick={onSubmit} disabled={disabled}>
              {okText}
            </Button>
            <Button danger onClick={() => history.goBack()}>
              Back
            </Button>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(VendorAppointment))
