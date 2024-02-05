import React, { useState, useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import {
  Table,
  Spin,
  Pagination,
  DatePicker,
  Input,
  Space,
  Button,
  notification,
  Tag,
  Tooltip,
  Popconfirm,
  Modal,
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import moment from 'moment'
import {
  PRODUCT_DELIVERY_APPOINTMENTS,
  CHANGE_PRODUCT_DELIVERY_APPOINTMENT_STATUS,
} from './queries'
// import GRNDownload from './grnDownload'

const { RangePicker } = DatePicker

const mapStateToProps = ({ user }) => ({ user })

const ProductDeliveryAppointment = ({ user: { permissions, type } }) => {
  const [productDeliveryManagement, setProductDeliveryManagement] = useState([])

  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)

  const [visible, setVisible] = useState(false)

  const [confirmLoading, setConfirmLoading] = useState(false)

  const [deliveryAppointmentDate, setDeliveryAppointmentDate] = useState(undefined)
  const [deliveryAppointmentDateError, setDeliveryAppointmentDateError] = useState(undefined)

  const [productDeliveryAppointmentID, setProductDeliveryAppointmentID] = useState(undefined)

  const [searchString, setSearchString] = useState('')
  const [createdAtFilter, setCreatedAtFilter] = useState([])

  const {
    loading: productDeliveryManagementLoad,
    error: productDeliveryManagementErr,
    data: productDeliveryManagementData,
    refetch,
  } = useQuery(PRODUCT_DELIVERY_APPOINTMENTS, {
    variables: { limit, offset, createdAtFilter, searchString },
  })

  const [changeProductDeliveryAppointmentStatus] = useMutation(
    CHANGE_PRODUCT_DELIVERY_APPOINTMENT_STATUS,
  )

  useEffect(() => {
    if (
      !productDeliveryManagementLoad &&
      productDeliveryManagementData &&
      productDeliveryManagementData.productDeliveryAppointments &&
      productDeliveryManagementData.productDeliveryAppointments.rows &&
      productDeliveryManagementData.productDeliveryAppointments.rows.length
    ) {
      setProductDeliveryManagement(productDeliveryManagementData.productDeliveryAppointments.rows)
      setRecordCount(productDeliveryManagementData.productDeliveryAppointments.count)
    }
  }, [productDeliveryManagementData, productDeliveryManagementLoad])

  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Link
          to={`/delivery/appointments/${
            record.qc_appointment_id
              ? `from-qc/update/${record.qc_appointment_id}/${record.id}`
              : `skip-qc/update/${record.id}`
          }`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'QC',
      dataIndex: 'qc_appointment_id',
      key: 'qc_appointment_id',
      render: (text) => <span>{text || '-'}</span>,
    },
    {
      title: 'P.O',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Appointment Date',
      dataIndex: 'delivery_appointment_date',
      key: 'delivery_appointment_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Qty. to dispatch',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Dispatched Qty.',
      dataIndex: 'total_dispatched_quantity',
      key: 'total_dispatched_quantity',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) =>
        text === 'Scheduled' ? (
          <Tag color="blue">{text}</Tag>
        ) : text === 'Booked' ? (
          <Tag color="cyan">{text}</Tag>
        ) : text === 'Delivered' ? (
          <Tag color="green">{text}</Tag>
        ) : (
          <Tag color="red">{text}</Tag>
        ),
    },
    {
      title: '',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <Space size="small">
          {text === 'Scheduled' ? (
            <Tooltip title="Book Appointment">
              <Button
                type="primary"
                onClick={() => updateStatus(record.id, 'Booked')}
                style={{ padding: '4px 8px' }}
              >
                <i className="fa fa-calendar-check-o" style={{ fontSize: 'large' }} />
              </Button>
            </Tooltip>
          ) : null}

          {text === 'Booked' ? (
            <Tooltip title="Confirm Delivery">
              <Button
                type="primary"
                onClick={() => updateStatus(record.id, 'Delivered')}
                style={{ padding: '4px 8px' }}
              >
                <i className="fa fa-sign-in" style={{ fontSize: 'large' }} />
              </Button>
            </Tooltip>
          ) : null}

          {
            text === 'Scheduled' || text === 'Booked' ? (
              <Tooltip title="Cancel">
                <Popconfirm
                  title="Sure to Cancel"
                  onConfirm={() => updateStatus(record.id, 'Cancelled')}
                >
                  <Button type="primary" style={{ padding: '4px 8px' }}>
                    <i className="fa fa-times" style={{ fontSize: 'large' }} />
                  </Button>
                </Popconfirm>
              </Tooltip>
            ) : null
            // : text === 'Delivered' ? (
            //   <GRNDownload id={record.id} />
            // ) : (
            //   '-'
            // )
          }
        </Space>
      ),
    },
    {
      title: '',
      dataIndex: 'qc_appointment_id',
      key: 'qc_appointment_id',
      render: (text, record) => (
        <>
          <Space size="small">
            {record.status === 'Scheduled' || record.status === 'Booked' ? (
              <Tooltip title="Reschedule">
                <Button
                  type="primary"
                  // onClick={() => updateStatus(record.id, 'Cancelled')}
                  onClick={() => showModal(record.id)}
                  style={{ padding: '4px 8px' }}
                >
                  <i className="fa fa-history" style={{ fontSize: 'large' }} />
                </Button>
              </Tooltip>
            ) : null}

            {/* <Link
              to={`/delivery/appointments/skip-qc/update/${record.id}${
                record.qc_appointment_id ? `/${record.qc_appointment_id}` : ''
              }`}
            > */}
            <Link
              to={`/delivery/appointments/${
                record.qc_appointment_id
                  ? `from-qc/update/${record.qc_appointment_id}/${record.id}`
                  : `skip-qc/update/${record.id}`
              }`}
            >
              <Button type="primary">View / Edit</Button>
            </Link>
          </Space>
        </>
      ),
    },
  ]

  if (type === 'vendor') {
    tableColumns.splice(0, 1)
    tableColumns.splice(7, 1)
  }

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const updateStatus = (id, status, date) => {
    changeProductDeliveryAppointmentStatus({
      variables: { id, status, date },
    })
      .then(() => {
        notification.success({ description: 'Status Changed Successfully.' })
        refetch()
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while changing status.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const showModal = (ID) => {
    setProductDeliveryAppointmentID(ID)
    setDeliveryAppointmentDate(undefined)
    setDeliveryAppointmentDateError(undefined)
    setVisible(true)
  }

  const reScheduleProductDeliveryAppointment = async () => {
    setConfirmLoading(true)
    if (!deliveryAppointmentDate) {
      setDeliveryAppointmentDateError('Please select delivery appiontment date')
      setVisible(true)
      setConfirmLoading(false)
      return
    }
    await updateStatus(
      productDeliveryAppointmentID,
      'Scheduled',
      String(deliveryAppointmentDate.valueOf()),
    )
    setConfirmLoading(false)
    setVisible(false)
  }

  if (!permissions.includes('readDeliveryAppointment')) return <Error403 />
  if (productDeliveryManagementErr)
    return `Error occured while fetching data: ${productDeliveryManagementErr.message}`

  return (
    <div>
      <Helmet title="Product Delivery Appointments" />

      <Spin spinning={productDeliveryManagementLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>Product Delivery Appointments</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createDeliveryAppointment') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/delivery/appointments/skip-qc/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  <div className="col-lg-7">
                    <RangePicker
                      allowClear={false}
                      id="date"
                      format="YYYY-MM-DD"
                      placeholder={['Starting Date', 'Ending Date']}
                      onChange={(value, dateString) => setCreatedAtFilter(dateString)}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search"
                      onChange={({ target: { value } }) => debouncedInputSearch(value)}
                      allowClear
                    />
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={productDeliveryManagement}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Delivery Appointments Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                  />
                  <Pagination
                    current={currentPage}
                    showTotal={(total) => `Total ${total} items`}
                    total={recordCount}
                    pageSize={pageSize}
                    pageSizeOptions={[20, 50, 100]}
                    className="custom-pagination"
                    onChange={(page) => {
                      setCurrentPage(page)
                      setOffset((page - 1) * limit)
                    }}
                    showSizeChanger
                    onShowSizeChange={(current, selectedSize) => {
                      setPageSize(selectedSize)
                      setCurrentPage(1)
                      setLimit(selectedSize)
                      setOffset(0)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <Modal
            title="Reschedule Product Delivery Appointment"
            visible={visible}
            onOk={reScheduleProductDeliveryAppointment}
            confirmLoading={confirmLoading}
            onCancel={() => setVisible(false)}
          >
            <div className="mb-2">
              Delivery Appointment Date<span className="custom-error-text"> *</span>
            </div>
            <DatePicker
              format="Do MMM YYYY"
              value={deliveryAppointmentDate}
              className={deliveryAppointmentDateError ? 'custom-error-border' : ''}
              onChange={(value) => setDeliveryAppointmentDate(value)}
              style={{ width: '100%' }}
            />
            <div className="custom-error-text mb-4">{deliveryAppointmentDateError || ''}</div>
          </Modal>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(ProductDeliveryAppointment))
