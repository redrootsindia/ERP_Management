import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Button, Spin, Tabs, Tag, Pagination, DatePicker, Select, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import Error403 from 'components/Errors/403'
import moment from 'moment'
import { debounce } from 'lodash'
import { EXPENSES } from './queries'
import StatusTab from './statusTab'

const { Option } = Select
const { TabPane } = Tabs
const { RangePicker } = DatePicker

const mapStateToProps = ({ user }) => ({ user })

const ExpenseManagementMaster = ({ user: { permissions, role, name } }) => {
  const [expenseManagementData, setExpenseManagementData] = useState([])
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState([])
  const [sortBy, setSortBy] = useState('dateDesc')
  const [dateRange, setDateRange] = useState([])
  const [adminVoucher, setAdminVoucher] = useState('')
  const [searchString, setSearchString] = useState([])
  const expenseDateFilter = dateRange.map((e) => String(e.valueOf()))

  const [tabType, setTabType] = useState('unrejected')
  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)
  const {
    loading: expenseManagementMasterLoad,
    error: expenseManagementMasterErr,
    data: expenseManagementMasterData,
  } = useQuery(EXPENSES, {
    variables: {
      limit,
      offset,
      expenseDateFilter,
      statusFilter,
      searchString,
      sortBy,
      tabType,
    },
  })

  useEffect(() => {
    if (
      !expenseManagementMasterLoad &&
      expenseManagementMasterData &&
      expenseManagementMasterData.expenses &&
      expenseManagementMasterData.expenses.rows &&
      expenseManagementMasterData.expenses.rows.length
    ) {
      if (role === 'Super Admin') {
        setExpenseManagementData(expenseManagementMasterData.expenses.rows)
        const myVoucher = expenseManagementMasterData.expenses.rows.filter((e) => {
          return e.raised_by === name
        })
        setAdminVoucher(myVoucher)
      } else {
        setExpenseManagementData(expenseManagementMasterData.expenses.rows)
      }

      setRecordCount(expenseManagementMasterData.expenses.count)
    } else {
      setExpenseManagementData([])
      setRecordCount(0)
    }
  }, [expenseManagementMasterData, expenseManagementMasterLoad])

  const tableColumns = [
    {
      title: 'Raised By',
      dataIndex: 'raised_by',
      key: 'raised_by',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Expense Date',
      dataIndex: 'expense_date',
      key: 'expense_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Due Date',
      dataIndex: 'expense_due_date',
      key: 'expense_due_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (text) => {
        const curr = text.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        return `${curr.slice(0, 1)} ${curr.slice(1)}`
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) =>
        text === 'Approved' || text === 'Rejected' ? (
          text === 'Approved' ? (
            <Tag color="green">{text}</Tag>
          ) : (
            <Tag color="red">{text}</Tag>
          )
        ) : text === 'In Review' ? (
          <Tag color="blue">{text}</Tag>
        ) : (
          <Tag color="purple">{text}</Tag>
        ),
    },
    // {
    //   title: '',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (text, record) =>
    //     text === 'Approved' ||
    //     (text === 'Rejected' &&
    //       (permissions.includes('approveExpenseManagement') ? (
    //         <Row justify="space-around" align="middle">
    //           <Col>
    //             <Link to={`/accounting/expense-management/update/${record.id}`}>
    //               <Button type="primary">View / Edit</Button>
    //             </Link>
    //           </Col>
    //         </Row>
    //       ) : null)),
    //   : (
    //     <Row justify="space-around" align="middle">
    //       <Col>
    //         <Link to={`/accounting/expense-management/update/${record.id}`}>
    //           <Button type="primary">Edit</Button>
    //         </Link>
    //       </Col>
    //     </Row>
    //   ),
    // },
  ]

  const onChangeDate = (value) => {
    setDateRange(value)
  }

  const onChange = (key) => {
    if (key === '1') {
      setTabType('unrejected')
    } else if (key === '2') {
      setTabType('rejected')
    }
  }

  // if (!permissions.includes('approveExpenseManagement')) tableColumns.splice(0, 1)

  if (!permissions.includes('readExpenseManagement')) return <Error403 />
  if (expenseManagementMasterErr)
    return `Error occured while fetching data: ${expenseManagementMasterErr.message}`

  return (
    <div>
      <Helmet title="Expense Management" />

      <Spin spinning={expenseManagementMasterLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>Expense Management</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createExpenseManagement') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/accounting/expense-management/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  <div className="col-lg-3">
                    <RangePicker
                      allowClear={false}
                      id="date"
                      format="Do MMM YYYY"
                      placeholder={['Starting Date', 'Ending Date']}
                      onChange={onChangeDate}
                    />
                  </div>
                  <div className="col-lg-2">
                    <Select
                      mode="multiple"
                      key="statusFilter"
                      style={{ width: '100%' }}
                      placeholder="Sort by Status"
                      onChange={(value) => setStatusFilter(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="In Review" value="In Review">
                        In Review
                      </Option>
                      <Option key="Partial" value="In Partial">
                        In Partial
                      </Option>
                      <Option key="Approved" value="Approved">
                        Approved
                      </Option>
                      {/* <Option key="Rejected" value="Rejected">
                        Rejected
                  </Option> */}
                    </Select>
                  </div>
                  <div className="col-lg-3">
                    <Select
                      key="sortBy"
                      value={sortBy || 'dateDesc'}
                      // style={{ width: '30%' }}
                      placeholder="Sort by created date - Latest first"
                      onChange={(value) => setSortBy(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="amountAsc" value="amountAsc">
                        Sort by Amount - Ascending
                      </Option>
                      <Option key="amountDesc" value="amountDesc">
                        Sort by Amount - Descending
                      </Option>
                      <Option key="dateDesc" value="dateDesc">
                        Sort by created date - Latest first
                      </Option>
                      <Option key="dateAsc" value="dateAsc">
                        Sort by created date - Oldest first
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
              </div>

              <div className="card-body">
                <Tabs onChange={onChange} defaultActiveKey="1">
                  <TabPane tab="Expense Management" key="1">
                    <StatusTab
                      tabType={tabType}
                      tableData={expenseManagementData}
                      tableColumns={tableColumns}
                    />
                  </TabPane>
                  <TabPane tab="Rejected" key="2">
                    <StatusTab
                      tabType={tabType}
                      tableData={expenseManagementData}
                      tableColumns={tableColumns}
                    />
                  </TabPane>
                  {role === 'Super Admin' && (
                    <TabPane tab="My Voucher" key="3">
                      <StatusTab
                        tabType={tabType}
                        tableData={adminVoucher}
                        tableColumns={tableColumns}
                      />
                    </TabPane>
                  )}
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
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(ExpenseManagementMaster))
