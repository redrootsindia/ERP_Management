import React, { useState, useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useMutation, useQuery } from '@apollo/client'
import {
  Table,
  Spin,
  Pagination,
  DatePicker,
  Space,
  Button,
  Input,
  Select,
  Tooltip,
  notification,
  Modal,
} from 'antd'
import { SearchOutlined, CheckOutlined, CloseOutlined, EditTwoTone } from '@ant-design/icons'
import { debounce } from 'lodash'
import moment from 'moment'
import Error403 from 'components/Errors/403'

import {
  QC_APPOINTMENTS,
  QC_APPOINTMENT_STATUS,
  APPROVED_INSPECTION,
  BOOK_FULL_QC,
  APPROVED_INSPECTION_MULTIPLE,
} from './queries'

const { Option } = Select
const { RangePicker } = DatePicker

const mapStateToProps = ({ user }) => ({ user })

const Appointments = ({ user: { permissions, type } }) => {
  const [bookedappointmentsList, setBookedAppointmentsList] = useState([])

  const [currentPage, setCurrentPage] = useState(1)

  const [pageSize, setPageSize] = useState(20)

  const [recordCount, setRecordCount] = useState(0)

  const [limit, setLimit] = useState(20)

  const [offset, setOffset] = useState(0)

  const [searchString, setSearchString] = useState('')

  // const [date, setDate] = useState(undefined)
  const [sortBy, setSortBy] = useState('appointmentDateDesc')
  const [dateRange, setDateRange] = useState([])
  // const appointmentDateFilter = dateRange.map((e) => Date.parse(e).toString())
  const appointmentDateFilter = dateRange.map((e) =>
    String(moment(e, 'Do MMM YYYY hh:mm:ss a').valueOf()),
  )

  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const [statusFilter, setStatusFilter] = useState('')

  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)

  const [rowID, setRowID] = useState(undefined)

  const [dueDate, setDueDate] = useState(undefined)

  const [bookFullQC] = useMutation(BOOK_FULL_QC)

  const onSubmit = () => {
    setFullQCDateError(undefined)
    let isError = false
    if (!fullQCDate) {
      isError = true
      setFullQCDateError('Date cannot be empty')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    bookFullQC({
      variables: {
        id: rowID,
        appointment_date: String(fullQCDate.valueOf()),
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        setRowID(null)
        setFullQCDate(null)
        setFullQCDateError(undefined)
        setIsModalVisible(false)
        refetch()
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while performing Full QC.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const handleCancel = () => {
    setRowID(null)
    setFullQCDate(null)
    setIsModalVisible(false)
  }

  const [fullQCDate, setFullQCDate] = useState(undefined)
  const [fullQCDateError, setFullQCDateError] = useState(undefined)

  const {
    loading: bookedQcAppLoad,
    error: bookedQcAppErr,
    data: bookedQcAppData,
    refetch,
  } = useQuery(QC_APPOINTMENTS, {
    variables: { appointmentDateFilter, statusFilter, sortBy, searchString, limit, offset },
  })

  const [bookedStatus] = useMutation(QC_APPOINTMENT_STATUS)

  const [approvedInspection] = useMutation(APPROVED_INSPECTION)
  const [approvedInspectionMultiple] = useMutation(APPROVED_INSPECTION_MULTIPLE)

  useEffect(() => {
    if (
      !bookedQcAppLoad &&
      bookedQcAppData &&
      bookedQcAppData.productQCAppointments.rows &&
      bookedQcAppData.productQCAppointments.rows.length
    ) {
      setBookedAppointmentsList(bookedQcAppData.productQCAppointments.rows)
      setRecordCount(bookedQcAppData.productQCAppointments.count)
    }
  }, [bookedQcAppData, bookedQcAppLoad])

  const tableColumns = [
    {
      title: 'Req. ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'QC Date',
      dataIndex: 'appointment_date',
      key: 'appointment_date',
      render: (text) => moment(Number(text)).format('Do MMM YYYY'),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
    },
    {
      title: 'PO #',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
    },
    {
      title: 'PO Type',
      dataIndex: 'pack',
      key: 'pack',
      render: (pack) => (pack ? 'Pack' : 'Product'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (record.approved === false ? 'Insp. Rejected' : text),
    },
    {
      title: 'Re-booked',
      dataIndex: 'rebooked',
      key: 'rebooked',
      render: (rebooked) => (rebooked ? 'Yes' : '-'),
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          {record.status === 'Booked' || record.status === 'Partial' ? (
            <Link to={`/qc/inspections/${record.id}`}>
              <Button
                style={{ background: '#b7eb8f', borderColor: '#86d65f', color: '#800080' }}
                disabled={record.status !== 'Booked' && record.status !== 'Partial'}
              >
                Perform QC
              </Button>
            </Link>
          ) : null}

          <Link to={`/qc/appointments/update/${record.id}`}>
            <Button danger disabled={record.rebooked}>
              <EditTwoTone />
              Edit
            </Button>
          </Link>

          {permissions.includes('approveQCAppointment') && record.status === 'Scheduled' && (
            <Button
              type="primary"
              onClick={() =>
                bookedStatus({ variables: { appointment_id: record.id, status: 'Booked' } })
                  .then(() => {
                    notification.success({ description: 'Status Changed Successfully' })
                    refetch()
                  })
                  .catch((err) => {
                    notification.error({
                      message: 'Error occured while changing status.',
                      description: err.message || 'Please contact system administrator.',
                    })
                  })
              }
            >
              Book
            </Button>
          )}

          {type === 'admin' && record.status !== 'Scheduled' && (
            <Button
              type="dashed"
              danger
              disabled={record.rebooked}
              onClick={() => {
                showModal()
                setRowID(record.id)
                setDueDate(moment(Number(record.due_date)))
              }}
            >
              Re-Inspect
            </Button>
          )}

          {permissions.includes('approveQCAppointment') && record.status !== 'Cancelled' && (
            <Button
              type="primary"
              onClick={() =>
                bookedStatus({ variables: { appointment_id: record.id, status: 'Cancelled' } })
                  .then(() => {
                    notification.success({ description: 'Status Changed Successfully' })
                    refetch()
                  })
                  .catch((err) => {
                    notification.error({
                      message: 'Error occured while changing status.',
                      description: err.message || 'Please contact system administrator.',
                    })
                  })
              }
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: 'Approve Insp.',
      dataIndex: 'approved',
      key: 'approved',
      render: (text, record) => {
        return (
          <Space size="small">
            {record.status === 'Booked' ||
            record.status === 'Partial' ||
            record.status === 'Pass' ||
            record.status === 'Fail' ? (
              record.approved === false ? (
                '-'
              ) : (
                <>
                  <Tooltip title={record.approved === true ? 'Approved' : 'Approve'}>
                    <Button
                      danger
                      onClick={() =>
                        approvedInspection({
                          variables: { appointment_id: record.id, approved: true },
                        })
                          .then(() => {
                            notification.success({ description: 'Status Changed Successfully' })
                            refetch()
                          })
                          .catch((err) => {
                            notification.error({
                              message: 'Error occured while changing status.',
                              description: err.message || 'Please contact system administrator.',
                            })
                          })
                      }
                      type={record.approved === true && 'primary'}
                      shape="circle"
                      icon={<CheckOutlined />}
                    />
                  </Tooltip>
                  <Tooltip title="Reject">
                    <Button
                      danger
                      onClick={() =>
                        approvedInspection({
                          variables: { appointment_id: record.id, approved: false },
                        })
                          .then(() => {
                            notification.success({ description: 'Status Changed Successfully' })
                            refetch()
                          })
                          .catch((err) => {
                            notification.error({
                              message: 'Error occured while changing status.',
                              description: err.message || 'Please contact system administrator.',
                            })
                          })
                      }
                      shape="circle"
                      icon={<CloseOutlined />}
                    />
                  </Tooltip>
                </>
              )
            ) : (
              '-'
            )}
          </Space>
        )
      },
    },
    {
      title: (
        <>
          <i className="fa fa-truck" style={{ fontSize: 'large' }} /> Book/View
        </>
      ),
      dataIndex: 'approved',
      key: 'approved',
      render: (approved, record) => (
        <>
          {approved ? (
            <Link to={`/delivery/appointments/from-qc/create/${record.id}`}>
              <Button type="primary">Delivery Appointment</Button>
            </Link>
          ) : (
            '-'
          )}
        </>
      ),
    },
  ]

  if (type === 'vendor') {
    tableColumns.splice(2, 1)
    tableColumns.splice(5, 1)
  }

  if (type === 'admin' && !permissions.includes('approveQCInspection')) tableColumns.splice(7, 1)

  const rowSelection = {
    onChange: (selectedRowKey) => {
      setSelectedRowKeys(selectedRowKey)
    },
    getCheckboxProps: (record) => ({
      disabled:
        record.status === 'Scheduled' ||
        record.status === 'Reinspect' ||
        record.status === 'Cancelled' ||
        record.approved === false ||
        record.approved === true,
    }),
  }

  const onChangeDate = (value, dateString) => setDateRange(dateString)

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const disabledDate = (current) =>
    current &&
    (current < moment().endOf('day') ||
      moment(Number(dueDate)).subtract(1, 'week').endOf('day') < current)

  if (!permissions.includes('readQCAppointment')) return <Error403 />
  if (bookedQcAppErr) return `Error occured while fetching data: ${bookedQcAppErr.message}`

  return (
    <div>
      <Helmet title="QC-Appointments" />

      <Spin spinning={bookedQcAppLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-4">
                  <strong>QC Appointments</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createQCAppointment') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/qc/appointments/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  <div className="col-lg-3">
                    <RangePicker
                      allowClear={false}
                      id="date"
                      format="Do MMM YYYY hh:mm:ss a"
                      placeholder={['Starting Date', 'Ending Date']}
                      onChange={onChangeDate}
                    />
                  </div>
                  <div className="col-lg-2">
                    <Select
                      key="statusFilter"
                      style={{ width: '100%' }}
                      placeholder="Sort by Status"
                      onChange={(value) => setStatusFilter(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="Scheduled" value="Scheduled">
                        Scheduled
                      </Option>
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
                    </Select>
                  </div>
                  <div className="col-lg-3">
                    <Select
                      key="sortBy"
                      value={sortBy || 'appointmentDateDesc'}
                      // style={{ width: '30%' }}
                      placeholder="Sort by QC Date - Latest first"
                      onChange={(value) => setSortBy(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="appointmentDateDesc" value="appointmentDateDesc">
                        Sort by QC Date - Latest first
                      </Option>
                      <Option key="appointmentDateAsc" value="appointmentDateAsc">
                        Sort by QC Date - Oldest first
                      </Option>
                      <Option key="purchaseOrderAsc" value="purchaseOrderAsc">
                        Sort by Purchase Order - Ascending
                      </Option>
                      <Option key="purchaseOrderDesc" value="purchaseOrderDesc">
                        Sort by Purchase Order - Descending
                      </Option>
                    </Select>
                  </div>
                  <div className="col-lg-3">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search"
                      onChange={({ target: { value } }) => debouncedInputSearch(value)}
                      allowClear
                    />
                  </div>
                </div>

                {permissions.includes('approveQCAppointment') ? (
                  <>
                    <div className="row mt-4">
                      <div className="col-lg-2 ">
                        <Button
                          type="primary"
                          onClick={() =>
                            approvedInspectionMultiple({
                              variables: {
                                appointment_ids: selectedRowKeys.map(Number),
                                approved: true,
                              },
                            })
                              .then(() => {
                                notification.success({ description: 'Status Changed Successfully' })
                                refetch()
                              })
                              .catch((err) => {
                                notification.error({
                                  message: 'Error occured while changing status.',
                                  description:
                                    err.message || 'Please contact system administrator.',
                                })
                              })
                          }
                        >
                          Approve All
                        </Button>
                      </div>
                      <div className="col-lg-2 ">
                        <Button
                          type="primary"
                          onClick={() =>
                            approvedInspectionMultiple({
                              variables: {
                                appointment_ids: selectedRowKeys.map(Number),
                                approved: false,
                              },
                            })
                              .then(() => {
                                notification.success({ description: 'Status Changed Successfully' })
                                refetch()
                              })
                              .catch((err) => {
                                notification.error({
                                  message: 'Error occured while changing status.',
                                  description:
                                    err.message || 'Please contact system administrator.',
                                })
                              })
                          }
                        >
                          Reject All
                        </Button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={bookedappointmentsList}
                    pagination={false}
                    rowSelection={rowSelection}
                    // onHeaderRow={() => ({ className: 'custom-header-small-font' })}
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
            title="Full QC Appointment"
            visible={isModalVisible}
            onOk={onSubmit}
            centered
            width={300}
            onCancel={handleCancel}
          >
            <div className="text-center">
              <DatePicker
                showTime
                value={fullQCDate}
                format="Do MMM YYYY hh:mm:ss a"
                className={fullQCDateError ? 'custom-error-border' : ''}
                onChange={(value) => {
                  setFullQCDate(value)
                }}
                style={{ width: '100%' }}
                disabledDate={disabledDate}
              />
              <div className="custom-error-text mb-4">{fullQCDateError || ''}</div>
            </div>
          </Modal>
        </div>
      </Spin>
    </div>
  )
}
export default withRouter(connect(mapStateToProps)(Appointments))
