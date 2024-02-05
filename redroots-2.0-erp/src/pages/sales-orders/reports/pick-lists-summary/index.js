import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Select, Table, Spin, Pagination, DatePicker } from 'antd'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import StatusModal from './statusModal'
import CSVDownload from './csvDownload'
import { PICK_LISTS_REPORT } from './queries'

const { Option } = Select
const { RangePicker } = DatePicker

const mapStateToProps = ({ user }) => ({ user })

const SalesOrderReports = ({ user: { permissions } }) => {
  const [salesOrderReportsList, setSalesOrderReportsList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRangeCreate, setDateRangeCreate] = useState([])
  const [dateRangeDelievery, setDateRangeDeleivery] = useState([])

  const deliveryDateFilter = dateRangeDelievery.map((e) => Date.parse(e).toString())

  const { loading: sopLoad, error: sopErr, data: sopData } = useQuery(PICK_LISTS_REPORT, {
    variables: { createdAtFilter: dateRangeCreate, deliveryDateFilter, typeFilter, limit, offset },
  })

  useEffect(() => {
    if (
      !sopLoad &&
      sopData &&
      sopData.salesOrdersSummaryForPickLists &&
      sopData.salesOrdersSummaryForPickLists.rows &&
      sopData.salesOrdersSummaryForPickLists.rows.length
    ) {
      setSalesOrderReportsList(sopData.salesOrdersSummaryForPickLists.rows)
      setRecordCount(sopData.salesOrdersSummaryForPickLists.count)
    }
  }, [sopData, sopLoad])

  const tableColumns = [
    {
      title: 'S.O. #',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Raised On',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(Number(text)).format('Do MMM YYYY'),
    },
    {
      title: 'S.O. Name',
      dataIndex: 'sales_order_name',
      key: 'sales_order_name',
      width: '12%',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '10%',
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer',
      key: 'buyer',
      width: '12%',
      render: (buyer, record) =>
        `${
          !buyer || buyer === '-'
            ? '-'
            : `${buyer} ${
                !record.buyer_group || record.buyer_group === '-' ? '' : `(${record.buyer_group})`
              }`
        }`,
    },

    {
      title: 'Buyer WH',
      dataIndex: 'buyer_warehouse',
      key: 'buyer_warehouse',
    },
    {
      title: 'S.O. Qty',
      dataIndex: 'sales_order_quantity',
      key: 'sales_order_quantity',
    },
    {
      title: 'Available Stock',
      dataIndex: 'available_stock',
      key: 'available_stock',
      render: (text) => (text || text === 0 ? text : '-'),
    },
    {
      title: 'Picked Qty',
      dataIndex: 'picked_quantity',
      key: 'picked_quantity',
    },
    {
      title: 'Pending Qty',
      key: 'pending_quantity',
      render: (text, record) => {
        if (
          record.total_scheduled_to_pick === 0 ||
          record.total_scheduled_to_pick <= record.picked_quantity
        ) {
          return 0
        }
        return record.total_scheduled_to_pick - record.picked_quantity
      },
    },
    {
      title: 'Exp. Delivery',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
      render: (text) => (!text || text === '-' ? '-' : moment(Number(text)).format('Do MMM YYYY')),
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      render: (text, record) => (
        <StatusModal id={record.id} sales_order_id={record.sales_order_id} />
      ),
      onCell: () => ({ className: 'custom-pad-0' }),
    },
  ]

  const onChangeCreate = (value, dateString) => setDateRangeCreate(dateString)
  const onChangeDeleivery = (value, dateString) => setDateRangeDeleivery(dateString)

  if (!permissions.includes('readSalesOrderReport')) return <Error403 />
  if (sopErr) return `Error occured while fetching data: ${sopErr.message}`

  return (
    <div>
      <Helmet title="Sales Orders - Reports" />

      <Spin spinning={sopLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-4">
                  <strong>SALES ORDERS - PICK LISTS REPORT</strong>
                </h5>

                <div className="row">
                  <div className="col-3">
                    <div className="mb-2">Filter by Created On</div>
                    <RangePicker
                      allowClear={false}
                      id="date"
                      placeholder={['Starting Date', 'Ending Date']}
                      onChange={onChangeCreate}
                    />
                  </div>

                  <div className="col-3">
                    <div className="mb-2">Filter by Expected Delivery Date</div>
                    <RangePicker
                      allowClear={false}
                      id="date"
                      placeholder={['Starting Date', 'Ending Date']}
                      onChange={onChangeDeleivery}
                    />
                  </div>

                  <div className="col-3">
                    <div className="mb-2">Sort By Type</div>
                    <Select
                      key="sortBy"
                      value={typeFilter || 'all'}
                      style={{ width: '100%' }}
                      placeholder="All"
                      onChange={(value) => setTypeFilter(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="all" value="all">
                        All
                      </Option>
                      <Option key="Marketplace" value="Marketplace">
                        Marketplace
                      </Option>
                      <Option key="e-Commerce" value="e-Commerce">
                        e-Commerce
                      </Option>
                    </Select>
                  </div>

                  <div className="col-3">
                    <div className="mb-2" />
                    <br />
                    <CSVDownload
                      createdAtFilter={dateRangeCreate}
                      deliveryDateFilter={deliveryDateFilter}
                      typeFilter={typeFilter}
                    />
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={salesOrderReportsList}
                    pagination={false}
                    onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Sales Order Report Found</h5>
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
export default withRouter(connect(mapStateToProps)(SalesOrderReports))
