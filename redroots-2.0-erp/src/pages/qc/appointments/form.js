/* eslint "no-unused-vars":"off" */
import React, { useState, useEffect } from 'react'
import { withRouter, useParams, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useLazyQuery, useMutation } from '@apollo/client'
// prettier-ignore
import { Table, Spin, DatePicker, Select, InputNumber, Switch, Button, notification, Image } from 'antd'
import { LoadingOutlined, EyeOutlined } from '@ant-design/icons'
import moment from 'moment'
import { cloneDeep } from 'lodash'
import Error403 from 'components/Errors/403'
// prettier-ignore
import { VENDOR_NAMES_LIST, PURCHASE_ORDER_IDS, PURCHASE_ORDER, BOOK_QC, QC_APPOINTMENT } from './queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const AppointmentsForms = ({ user: { permissions, vendor_id: loginID, type } }) => {
  const { action, id } = useParams()
  const history = useHistory()

  const [pack, setPack] = useState(false)

  const [appointmentsList, setAppointmentsList] = useState([])

  const [vendorNameID, setVendorNameID] = useState(
    type === 'vendor' && loginID ? loginID : undefined,
  )
  const [vendorNameLists, setVendorNameLists] = useState([])

  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [purchaseOrderID, setPurchaseOrderID] = useState([])

  const [dateDisabled, setDateDisabled] = useState(true)
  const [dueDate, setDueDate] = useState(undefined)

  const [qcAppointmentStatus, setQcAppointmentStatus] = useState('Scheduled')

  const [dateAndTimeError, setDateAndTimeError] = useState(undefined)

  const [bookedAppointmentDate, setBookedAppointmentDate] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateQCAppointment')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save Appointment' : 'Book Appointment')

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + image}
            height={image ? 35 : 20}
            width={image ? 35 : 20}
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Item Code',
      dataIndex: pack ? 'pack_code' : 'variant_code',
      key: 'item_code',
    },
    {
      title: 'Purchase Order Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Pending Quantity',
      dataIndex: 'pending_quantity',
      key: 'pending_quantity',
      render: (text, record) => record.quantity - record.booked_quantity,
    },
    {
      title: 'Booked Quantity',
      dataIndex: 'booked_quantity',
      key: 'booked_quantity',
    },
    {
      title: 'Appointment Quantity',
      dataIndex: 'appointment_quantity',
      key: 'appointment_quantity',
      render: (text, record) => (
        <>
          <InputNumber
            value={text}
            min={0}
            max={record.quantity - record.booked_quantity}
            onChange={(e) => {
              setAppointmentQuantity(e, record.id)
            }}
          />
        </>
      ),
    },
  ]

  const [tableColumns, setTableColumns] = useState([
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + image}
            height={image ? 35 : 20}
            width={image ? 35 : 20}
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Item Code',
      dataIndex: pack ? 'pack_code' : 'variant_code',
      key: 'item_code',
    },
    {
      title: 'Purchase Order Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Pending Quantity',
      dataIndex: 'pending_quantity',
      key: 'pending_quantity',
      render: (text, record) => record.quantity - record.booked_quantity,
    },
    {
      title: 'Booked Quantity',
      dataIndex: 'booked_quantity',
      key: 'booked_quantity',
    },
    {
      title: 'Appointment Quantity',
      dataIndex: 'appointment_quantity',
      key: 'appointment_quantity',
      render: (text, record) => (
        <>
          <InputNumber
            value={text}
            min={0}
            max={record.quantity - record.booked_quantity}
            onChange={(e) => {
              console.log('1 -- ', appointmentsList)
              setAppointmentQuantity(e, record.id)
            }}
          />
        </>
      ),
    },
  ])

  const [bookQC] = useMutation(BOOK_QC)

  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(VENDOR_NAMES_LIST, { variables: { vendorIDs: vendorNameID ? [vendorNameID] : [] } })

  const {
    loading: poIDsLoad,
    error: poIDsErr,
    data: poIDsData,
  } = useQuery(PURCHASE_ORDER_IDS, { variables: { vendor_id: vendorNameID } })

  const [generatePoTable, { loading: poLoad, error: poErr, data: poData }] = useLazyQuery(
    PURCHASE_ORDER,
    { variables: { purchase_order_id: purchaseOrderID } },
  )

  const {
    loading: qcAppointmentLoad,
    data: qcAppointmentData,
    error: qcAppointmentErr,
  } = useQuery(QC_APPOINTMENT, { variables: { id, toInspect: false, getAppointmentData: true } })

  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorNameLists(vendorData.vendorNames)
  }, [vendorData, vendorLoad])

  useEffect(() => {
    if (poIDsData && poIDsData.purchaseOrderIDsForProductQC)
      setPurchaseOrders(poIDsData.purchaseOrderIDsForProductQC)
  }, [poIDsData, poIDsLoad])

  useEffect(() => {
    if (action === 'update' && qcAppointmentData && qcAppointmentData.productQCAppointment) {
      // prettier-ignore
      const { qc_details, vendor_id, due_date, status, purchase_order_id, appointment_date, pack: isPack }
        = qcAppointmentData.productQCAppointment

      const newColumns = cloneDeep(columns)
      newColumns[1] = {
        title: 'Item Code',
        dataIndex: isPack ? 'pack_code' : 'variant_code',
        key: 'item_code',
      }
      setTableColumns(newColumns)

      setPurchaseOrderID(purchase_order_id)
      setAppointmentsList(qc_details)
      if (vendor_id) setVendorNameID(String(vendor_id))
      if (due_date) setDueDate(moment(Number(due_date)))
      if (appointment_date) setBookedAppointmentDate(moment(Number(appointment_date)))
      if (status) setQcAppointmentStatus(status)
      if (isPack) setPack(true)
    }
  }, [qcAppointmentData, qcAppointmentLoad, action])

  useEffect(() => {
    if (poData && poData.productPurchaseOrderQCDetails) {
      const { detail, pack_detail, due_date, pack: isPack } = poData.productPurchaseOrderQCDetails

      const newColumns = cloneDeep(columns)
      newColumns[1] = {
        title: 'Item Code',
        dataIndex: isPack ? 'pack_code' : 'variant_code',
        key: 'item_code',
      }
      setTableColumns(newColumns)

      if (detail && detail.length) if (due_date) setDueDate(due_date)
      if (isPack) setPack(true)
      setAppointmentsList(isPack ? pack_detail : detail)
    }
  }, [poData])

  const disabledDate = (current) =>
    current &&
    (current < moment().endOf('day') ||
      moment(Number(dueDate)).subtract(1, 'week').endOf('day') < current)

  const setAppointmentQuantity = (quantity, recordID) => {
    // console.log('IN USE 3', quantity, recordID)
    // console.log('IN USE 3 appointmentsList', appointmentsList)
    const tempAppointments = cloneDeep(appointmentsList)
    const foundIndex = tempAppointments.findIndex((e) => Number(e.id) === Number(recordID))
    if (foundIndex > -1) tempAppointments[foundIndex].appointment_quantity = quantity
    setAppointmentsList(tempAppointments)
  }

  const onSubmit = () => {
    setDateAndTimeError(undefined)

    let isError = false
    let appointmentQuantityError = false
    let tempAppointments = cloneDeep(appointmentsList)

    if (!bookedAppointmentDate) {
      isError = true
      setDateAndTimeError('Date and Time cannot be empty')
    }

    tempAppointments = tempAppointments.map((e) => {
      if (e.appointment_quantity) {
        if (
          Number(e.appointment_quantity) < 0 ||
          Number(e.appointment_quantity) > Number(e.pending_quantity)
        ) {
          appointmentQuantityError = true
          return { ...e, appointmentQuantityError: true }
        }
        return e
      }
      return e
    })
    if (appointmentQuantityError) setAppointmentsList(tempAppointments)

    const detail = []
    tempAppointments.forEach((e) => {
      detail.push({
        product_variant_id: !pack ? Number(e.variant_id) : null,
        pack_id: pack ? Number(e.pack_id) : null,
        appointment_quantity: Number(e.appointment_quantity),
      })
    })

    if (isError || appointmentQuantityError) {
      if (isError)
        notification.error({
          message: 'Incorrect Data',
          description:
            'Please make sure all the mandatory fields are filled and have valid entries.',
        })
      if (appointmentQuantityError)
        notification.error({
          message: 'Incorrect Data',
          description:
            'Please make sure all the appointments quantities are not greater than pending quantities.',
        })
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    bookQC({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        vendor_id: vendorNameID,
        purchase_order_id: purchaseOrderID,
        appointment_date: String(bookedAppointmentDate.valueOf()),
        qc_details: detail,
        status: qcAppointmentStatus,
        is_pack: pack,
      },
    })
      .then(() => {
        setOkText(id ? 'Save Appointment' : 'Book Appointment')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/qc/appointments')
      })
      .catch((err) => {
        setOkText(id ? 'Save Appointment' : 'Book Appointment')
        notification.error({
          message: 'Error occured while saving role.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('createQCAppointment')) return <Error403 />
  if (action === 'create' && !permissions.includes('createQCAppointment')) return <Error403 />
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (poErr) return `Error occured while fetching data: ${poErr.message}`
  if (qcAppointmentErr) return `Error occured while fetching data: ${qcAppointmentErr.message}`
  if (poIDsErr) return `Error occured while fetching data: ${poIDsErr.message}`

  // console.log('columns -- ', columns)
  // console.log('tableColumns -- ', tableColumns)
  // console.log('appointmentsList -- ', appointmentsList)

  return (
    <div>
      <Helmet title="QC-Appointments" />

      <div className="row mb-4 mr-2 ml-2">
        <div className="col-11">
          <h5 className="mb-2">
            <strong>{id ? 'Edit' : 'Add'} QC Appointments</strong>
          </h5>
        </div>

        {action === 'update' && permissions.includes('updateQCAppointment') ? (
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
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="row">
                {type === 'admin' ? (
                  <div className="col-lg-3">
                    <div className="mb-2">Select Vendor </div>
                    <Select
                      value={vendorNameID || []}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setVendorNameID(value)
                        setPurchaseOrderID(undefined)
                        setAppointmentsList([])
                      }}
                      placeholder="Select Vendor"
                      className="custom-pad-r1"
                      disabled={action === 'update'}
                    >
                      {vendorNameLists && vendorNameLists.length
                        ? vendorNameLists.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {`${obj.company} (${obj.name})`}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </div>
                ) : null}

                <div className="col-lg-3">
                  <div className="mb-2">Against P.O.</div>
                  <Select
                    value={purchaseOrderID || []}
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      setPurchaseOrderID(value)
                      setDateDisabled(false)
                      generatePoTable()
                    }}
                    disabled={action === 'update'}
                    placeholder="Select P.O."
                    className="custom-pad-r1"
                  >
                    {purchaseOrders && purchaseOrders.length
                      ? purchaseOrders.map((obj) => (
                          <Option key={obj.id} value={obj.id}>
                            {obj.id}
                          </Option>
                        ))
                      : null}
                  </Select>
                </div>

                <div className="col-lg-3">
                  <div className="mb-2">Date & Time</div>
                  <DatePicker
                    showTime
                    format="Do MMM YYYY hh:mm:ss a"
                    value={bookedAppointmentDate}
                    onChange={(value) => setBookedAppointmentDate(value)}
                    disabled={action === 'create' ? dateDisabled : disabled}
                    disabledDate={disabledDate}
                  />
                  <div className="custom-error-text mb-4">{dateAndTimeError || ''}</div>
                </div>

                {type === 'admin' && permissions.includes('approveQCAppointment') ? (
                  <div className="col-lg-3">
                    <div className="mb-2">Status</div>
                    <Select
                      key="qcAppointmentStatus"
                      value={qcAppointmentStatus || 'Scheduled'}
                      style={{ width: '100%' }}
                      disabled={disabled}
                      placeholder="Sort by Status"
                      onChange={(value) => setQcAppointmentStatus(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="Scheduled" value="Scheduled">
                        Scheduled
                      </Option>
                      {type !== 'vendor' ? (
                        <>
                          <Option key="Booked" value="Booked">
                            Booked
                          </Option>
                          <Option key="Partial" value="Partial">
                            Partial
                          </Option>
                          <Option key="Pass" value="Pass">
                            Pass
                          </Option>
                          <Option key="Fail" value="Fail">
                            Fail
                          </Option>
                          <Option key="Reinspect" value="Reinspect">
                            Reinspect
                          </Option>
                          <Option key="Cancelled" value="Cancelled">
                            Cancelled
                          </Option>
                        </>
                      ) : null}
                    </Select>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="card">
            <Spin spinning={poLoad} tip="Loading..." size="large">
              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={columns}
                    dataSource={appointmentsList}
                    pagination={{
                      defaultPageSize: 50,
                      showSizeChanger: true,
                      pageSizeOptions: ['50', '100', '150'],
                    }}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No QC Appointments</h5>
                          </div>
                        </div>
                      ),
                    }}
                  />
                </div>
                <div className="text-right m-3">
                  {(action === 'create' && permissions.includes('createQCAppointment')) ||
                  (action === 'update' && permissions.includes('updateQCAppointment')) ? (
                    <Button type="primary" onClick={onSubmit} disabled={disabled}>
                      {okText}
                    </Button>
                  ) : null}
                </div>
              </div>
            </Spin>
          </div>
        </div>
      </div>
    </div>
  )
}
export default withRouter(connect(mapStateToProps)(AppointmentsForms))
