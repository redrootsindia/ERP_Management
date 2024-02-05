// /* eslint no-unused-vars: off, no-undef:off */

import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin, Pagination, DatePicker, Input, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import moment from 'moment'
import { PRINTER_PURCHASE_ORDERS } from './queries'

const { RangePicker } = DatePicker
const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const PrinterPO = ({ user: { permissions } }) => {
  const [printerPOList, setPrinterPOList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [searchString, setSearchString] = useState('')
  const [dateRange, setDateRange] = useState([])
  const [statusFilter, setStatusFilter] = useState(null)

  const dateFilter = dateRange.map((e) => String(moment(e, 'Do MMM YYYY hh:mm:ss a').valueOf()))

  const {
    loading: printerPOLoad,
    error: printerPOErr,
    data: printerPOData,
  } = useQuery(PRINTER_PURCHASE_ORDERS, {
    variables: { statusFilter, dateFilter, limit, offset, searchString },
  })

  useEffect(() => {
    if (
      !printerPOLoad &&
      printerPOData &&
      printerPOData.printerPurchaseOrders &&
      printerPOData.printerPurchaseOrders.rows &&
      printerPOData.printerPurchaseOrders.rows.length
    ) {
      setPrinterPOList(printerPOData.printerPurchaseOrders.rows)
      setRecordCount(printerPOData.printerPurchaseOrders.count)
    } else {
      setPrinterPOList([])
      setRecordCount(0)
    }
  }, [printerPOData, printerPOLoad])

  const tableColumns = [
    {
      title: 'Printer P.O.',
      dataIndex: 'purchase_order_name',
      key: 'purchase_order_name',
      render: (text, record) => (
        <Link
          to={`/purchase-orders/printer/update/${record.parent_purchase_order_id}/${
            record.pack ? 'Pack' : 'Product'
          }/${record.id}`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Against Main P.O.',
      dataIndex: 'parent_purchase_order_id',
      key: 'parent_purchase_order_id',
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
    },
    {
      title: 'PO Date',
      dataIndex: 'po_date',
      key: 'po_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ]

  const onChangeDate = (value, dateString) => setDateRange(dateString)
  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  if (!permissions.includes('readPurchaseOrder')) return <Error403 />

  if (printerPOErr) return `Error occured while fetching data: ${printerPOErr.message}`

  return (
    <div>
      <Helmet title="Printer PO" />

      <Spin spinning={printerPOLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>Printer Purchase Order</strong>
                </h5>

                <div className="row ml-2">
                  <div className="col-lg-9">
                    <div className="row">
                      <div className="col-lg-5">
                        <RangePicker
                          allowClear={false}
                          id="date"
                          format="Do MMM YYYY hh:mm:ss a"
                          placeholder={['Starting Date', 'Ending Date']}
                          onChange={onChangeDate}
                        />
                      </div>
                      <div className="col-lg-4">
                        <Select
                          key="statusFilter"
                          value={statusFilter || null}
                          placeholder="Filter by active"
                          onChange={(active) => setStatusFilter(active)}
                          className="custom-pad-r1 w-100"
                        >
                          <Option key={0} value={null}>
                            All statuses
                          </Option>
                          <Option key="Draft" value="Draft">
                            Draft
                          </Option>
                          <Option key="Assigned" value="Assigned">
                            Assigned
                          </Option>
                          <Option key="In Progress" value="In Progress">
                            In Progress
                          </Option>
                          <Option key="Closed" value="Closed">
                            Closed
                          </Option>
                          <Option key="Force Closed" value="Force Closed">
                            Force Closed
                          </Option>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-2">
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
                    dataSource={printerPOList}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No PrinterPO Found</h5>
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
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(PrinterPO))
