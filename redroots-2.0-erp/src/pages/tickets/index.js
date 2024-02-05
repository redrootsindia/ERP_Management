/* eslint "no-unused-vars": "off" */
import React, { useState, useEffect } from 'react'
import { Link, withRouter, useHistory, useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import {
  Button,
  Table,
  Spin,
  Pagination,
  Tag,
  Space,
  notification,
  Tooltip,
  DatePicker,
  Input,
  Select,
  Tabs,
  Switch,
} from 'antd'
import moment from 'moment'
import {
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import PivotTable from 'components/PivotTable'
import TicketTab from './ticketTab'
import { TICKETS, CHANGE_TICKET_STATUS, ASSIGNED_TO_EMPLOYEE } from './queries'
import './style.scss'

const { Option } = Select
const { TabPane } = Tabs
const { RangePicker } = DatePicker

const mapStateToProps = ({ user }) => ({ user })

const Tickets = ({ user: { permissions, role, type } }) => {
  const querySearch = useLocation().search
  const ticketIDs =
    new URLSearchParams(querySearch).get('ticketIDs') !== null
      ? new URLSearchParams(querySearch).get('ticketIDs').split(',')
      : []

  const [tickets, setTickets] = useState([])
  const history = useHistory()

  const [tabType, setTabType] = useState('created')

  const pivotRows = [
    { uniqueName: 'department', caption: 'Department' },
    { uniqueName: 'raised_by', caption: 'Raised By.' },
    { uniqueName: 'assigned_to', caption: 'Assigned To.' },
    { uniqueName: 'ticket_status', caption: 'Status' },
    { uniqueName: 'days', caption: 'Days' },
    { uniqueName: 'priority', caption: 'Priority' },
  ]
  console.log('pivotRows', pivotRows)

  const pivotMeasures = [{ uniqueName: 'department', aggregation: 'sum', caption: 'Tickets Qty.' }]

  const [dateRange, setDateRange] = useState([])

  const [ticketTypes, setTicketTypes] = useState([])
  const [raisedBy, setRaisedBy] = useState(null)
  const [status, setStatus] = useState([])
  const [assignedToList, setAssignedToList] = useState([])
  const [assignedToIDs, setAssignedToIDs] = useState([])

  const isVendor = type === 'vendor'

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [searchString, setSearchString] = useState('')

  const [changeStatus] = useMutation(CHANGE_TICKET_STATUS)

  const [pivotTableData, setPivotTableData] = useState([])
  const [pivotView, setPivotView] = useState(false)

  console.table('pivotTableData', pivotTableData)

  const {
    loading: ticketLoad,
    error: ticketErr,
    data: ticketData,
  } = useQuery(TICKETS, {
    variables: {
      tabType,
      ticketIDs,
      status,
      ticketTypes,
      raisedBy,
      role,
      assignedToIDs,
      limit,
      offset,
      searchString,
      dateRange,
    },
  })

  useEffect(() => {
    if (
      !ticketLoad &&
      ticketData &&
      ticketData.tickets &&
      ticketData.tickets.rows &&
      ticketData.tickets.rows.length
    ) {
      const tempData = []
      ticketData.tickets.rows.forEach((e) => {
        tempData.push({
          ...e,
          assigned_to:
            e.assigned_to && Number(e.assigned_to) !== 0 && assignedToList && assignedToList.length
              ? assignedToList.find(({ id }) => Number(e.assigned_to) === Number(id)).name
              : '-',
        })
      })
      setTickets(tempData)
      console.log('tempdata', tempData)
      setRecordCount(ticketData.tickets.count)
      setPivotTableData(
        tempData.map((e) => ({
          department: e.type,
          raised_by: e.raised_by,
          assigned_to: e.assigned_to,
          ticket_status: e.status,
          priority: e.priority || 'Low',
          days: e.days,
          title: e.title,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        })),
      )
    } else {
      setTickets([])
      setRecordCount(0)
      setPivotTableData([])
    }
  }, [ticketData, ticketLoad, assignedToList])

  const {
    loading: assignedToLoad,
    error: assignedToErr,
    data: assignedToData,
  } = useQuery(ASSIGNED_TO_EMPLOYEE)

  useEffect(() => {
    if (
      !assignedToLoad &&
      assignedToData &&
      assignedToData.ticketsAssignedToNamesList &&
      assignedToData.ticketsAssignedToNamesList.length
    ) {
      setAssignedToList(assignedToData.ticketsAssignedToNamesList)
    }
  }, [assignedToData, assignedToLoad])

  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Created Date ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY, h:mm A') : '-'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },

    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (text.length > 40 ? `${text.substring(0, 40)}...` : text),
    },
    {
      title: 'Raised By',
      dataIndex: 'raised_by',
      key: 'raised_by',
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      // render: (assigned_to) =>
      //   assigned_to && Number(assigned_to) !== 0 && assignedToList && assignedToList.length
      //     ? assignedToList.find(({ id }) => Number(assigned_to) === Number(id)).name
      //     : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) =>
        text === 'In Progress' ? (
          <Tag icon={<SyncOutlined spin />} color="processing">
            In Progress
          </Tag>
        ) : text === 'Closed' ? (
          <Tag icon={<CloseOutlined />} color="red">
            Closed
          </Tag>
        ) : text === 'Answer' ? (
          <Tag icon={<CheckOutlined />} color="green">
            Answered
          </Tag>
        ) : (
          text === 'Need Attention' && (
            <Tag icon={<ExclamationCircleOutlined />} color="warning">
              Need Attention
            </Tag>
          )
        ),
    },
    {
      title: 'Remark',
      dataIndex: 'remark',
      key: 'remark',
      render: (text) => text,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (text) =>
        text === 'High' ? (
          <Tag color="magenta">High</Tag>
        ) : text === 'Low' ? (
          <Tag color="purple">Low</Tag>
        ) : text === 'Medium' ? (
          <Tag color="geekblue">Medium</Tag>
        ) : (
          'NA'
        ),
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
      render: (text) => (text === '00:00:00' ? 'Today' : text),
    },
    {
      title: 'Last Modified ',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text, record) => {
        const diff = record.updatedAt - record.createdAt
        return diff !== 0 ? moment(Number(text)).format('Do MMM YYYY, h:mm A') : '-'
      },
    },
    // {
    //   title: '',
    //   dataIndex: 'action',
    //   key: 'action',
    //   render: (text, record) => (
    //     <Space size="middle">
    //       {record.status === 'Draft' && (
    //         <Button
    //           type="primary"
    //           onClick={(e) => {
    //             e.stopPropagation()
    //             changeStatus({
    //               variables: {
    //                 id: record.id,
    //                 status: 'In Progress',
    //               },
    //             })
    //               .then(() => {
    //                 notification.success({ description: 'Status Changed Successfully.' })
    //                 refetch()
    //               })
    //               .catch((err) => {
    //                 notification.error({
    //                   message: 'Error occured while changing status.',
    //                   description: err.message || 'Please contact system administrator.',
    //                 })
    //               })
    //           }}
    //         >
    //           Submit
    //         </Button>
    //       )}
    //       <Tooltip title="Complete">
    //         <Button
    //           danger
    //           onClick={(e) => {
    //             e.stopPropagation()
    //             changeStatus({
    //               variables: {
    //                 id: record.id,
    //                 status: 'Completed',
    //               },
    //             })
    //               .then(() => {
    //                 notification.success({ description: 'Status Changed Successfully.' })
    //                 refetch()
    //               })
    //               .catch((err) => {
    //                 notification.error({
    //                   message: 'Error occured while changing status.',
    //                   description: err.message || 'Please contact system administrator.',
    //                 })
    //               })
    //           }}
    //           type={record.status === 'Completed' && 'primary'}
    //           disabled={record.status === 'Cancelled'}
    //           shape="circle"
    //           icon={<CheckOutlined />}
    //         />
    //       </Tooltip>
    //       <Tooltip title="Cancelled">
    //         <Button
    //           danger
    //           onClick={(e) => {
    //             e.stopPropagation()
    //             changeStatus({
    //               variables: {
    //                 id: record.id,
    //                 status: 'Cancelled',
    //               },
    //             })
    //               .then(() => {
    //                 notification.success({ description: 'Status Changed Successfully.' })
    //                 refetch()
    //               })
    //               .catch((err) => {
    //                 notification.error({
    //                   message: 'Error occured while changing status.',
    //                   description: err.message || 'Please contact system administrator.',
    //                 })
    //               })
    //           }}
    //           shape="circle"
    //           disabled={record.status === 'Completed'}
    //           icon={<CloseOutlined />}
    //           type={record.status === 'Cancelled' && 'primary'}
    //         />
    //       </Tooltip>
    //     </Space>
    //   ),
    // },
  ]

  const onChange = (key) => {
    if (key === '2') {
      setTabType('assigned')
    } else if (key === '3') {
      setTabType('CC')
    } else if (key === '1') {
      setTabType('created')
    } else if (key === '4') {
      setTabType('ALL')
    } else if (key === '5') setTabType('closed')
  }
  if (isVendor) tableColumns.splice(5, 1)

  const onChangeDate = (value, dateString) => setDateRange(dateString)

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  if (!permissions.includes('readTicket')) return <Error403 />
  if (ticketErr) return `Error occured while fetching data: ${ticketErr.message}`
  if (assignedToErr) return `Error occured while fetching data: ${assignedToErr.message}`

  return (
    <div>
      <Helmet title="Tickets" />
      <Spin spinning={ticketLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>TICKETS</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createTicket') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/tickets/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  <div className="col-lg-3">
                    <RangePicker
                      allowClear={false}
                      id="date"
                      format="YYYY-MM-DD"
                      placeholder={['Starting Date', 'Ending Date']}
                      onChange={onChangeDate}
                    />
                  </div>
                  <div className="col ml-2">
                    <div className="mb-2">Pivot View</div>
                    <Switch
                      className="mr-2"
                      checked={pivotView}
                      onChange={(checked) => {
                        if (checked) {
                          setTabType('ALL')
                        }
                        setPivotView(checked)
                      }}
                    />
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-lg-11">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search"
                      onChange={({ target: { value } }) => debouncedInputSearch(value)}
                      allowClear
                    />
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-lg-3">
                    <div className="mb-2">Types</div>
                    <Select
                      mode="multiple"
                      value={ticketTypes}
                      style={{ width: '100%' }}
                      onChange={(value) => setTicketTypes(value)}
                      placeholder="Select Types"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {/* <Option key="ERP" value="ERP">
                        ERP
                      </Option>
                      <Option key="Purchase Order" value="Purchase Order">
                        Purchase Order
                      </Option>
                      {!isVendor || permissions.includes('approveTicket') ? (
                        <>
                          <Option key="Accounts" value="Accounts">
                            Accounts
                          </Option>
                          <Option key="Production" value="Production">
                            Production
                          </Option>
                        </>
                      ) : null} */}
                      <Select.Option key="Accounts" value="Accounts">
                        Accounts
                      </Select.Option>
                      <Select.Option key="Admin" value="Admin">
                        Admin
                      </Select.Option>
                      <Select.Option key="HR" value="HR">
                        HR
                      </Select.Option>
                      <Select.Option key="E-Commerce" value="E-Commerce">
                        E-Commerce
                      </Select.Option>
                      <Select.Option key="Warehouse" value="Warehouse">
                        Warehouse
                      </Select.Option>
                      <Select.Option key="Production" value="Production">
                        Production
                      </Select.Option>
                      <Select.Option key="Management" value="Management">
                        Management
                      </Select.Option>
                      <Select.Option key="ERP" value="ERP">
                        ERP
                      </Select.Option>
                    </Select>
                  </div>
                  {role === 'Super Admin' && (
                    <>
                      <div className="col-lg-3">
                        <div className="mb-2">Raised By</div>
                        <Select
                          value={raisedBy || null}
                          style={{ width: '100%' }}
                          onChange={(value) => setRaisedBy(value)}
                          placeholder="Raised By"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          <Option key={0} value={null}>
                            All
                          </Option>
                          <Option key="Admin" value="Admin">
                            Admin
                          </Option>
                          <Option key="Vendor" value="Vendor">
                            Vendor
                          </Option>
                          <Option key="Employee" value="Employee">
                            Employee
                          </Option>
                        </Select>
                      </div>
                      <div className="col-lg-3">
                        <div className="mb-2">Assigned To</div>
                        <Select
                          mode="multiple"
                          value={assignedToIDs}
                          style={{ width: '100%' }}
                          onChange={(value) => setAssignedToIDs(value)}
                          placeholder="Select Employees"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {assignedToList && assignedToList.length
                            ? assignedToList.map((obj) => (
                                <Select.Option key={String(obj.id)} value={String(obj.id)}>
                                  {obj.name}
                                </Select.Option>
                              ))
                            : null}
                        </Select>
                      </div>
                    </>
                  )}
                  <div className="col-lg-3">
                    <div className="mb-2">Status</div>
                    <Select
                      mode="multiple"
                      showSearch
                      style={{ width: '100%' }}
                      onChange={(value) => setStatus(value)}
                      placeholder="Select status"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Option key="In Progress" value="In Progress">
                        In Progress
                      </Option>
                      <Option key="Closed" value="Closed">
                        Closed
                      </Option>
                      <Option key="Answer" value="Answer">
                        Answer
                      </Option>
                      <Option key="Need Attention" value="Need Attention">
                        Need Attention
                      </Option>
                    </Select>
                  </div>
                </div>
              </div>
              {pivotView ? (
                <div className="mt-4">
                  <PivotTable
                    data={pivotTableData}
                    rows={pivotRows}
                    measures={pivotMeasures}
                    columns={[]}
                  />
                </div>
              ) : (
                <div className="card-body ticketTabs">
                  <Tabs onChange={onChange} defaultActiveKey="1">
                    <TabPane tab="Raised by Me" key="1">
                      <TicketTab
                        tabType={tabType}
                        tableData={tickets}
                        tableColumns={tableColumns}
                      />
                    </TabPane>
                    <TabPane tab="Assigned To Me" key="2">
                      <TicketTab
                        tabType={tabType}
                        tableData={tickets}
                        tableColumns={tableColumns}
                      />
                    </TabPane>
                    <TabPane tab="CC" key="3">
                      <TicketTab
                        tabType={tabType}
                        tableData={tickets}
                        tableColumns={tableColumns}
                      />
                    </TabPane>
                    <TabPane tab="Closed" key="5">
                      <TicketTab
                        tabType={tabType}
                        tableData={tickets}
                        tableColumns={tableColumns}
                      />
                    </TabPane>
                    <TabPane tab="ALL" key="4">
                      <TicketTab
                        tabType={tabType}
                        tableData={tickets}
                        tableColumns={tableColumns}
                      />
                    </TabPane>
                  </Tabs>
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
              )}
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(Tickets))
