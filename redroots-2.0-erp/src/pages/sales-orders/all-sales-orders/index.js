import React, { useState, useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin, Pagination, DatePicker, Button, Input, Switch } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import moment from 'moment'
import PivotTable from 'components/PivotTable'
import Error403 from 'components/Errors/403'

import { SALES_ORDERS } from './queries'

const { RangePicker } = DatePicker
const mapStateToProps = ({ user }) => ({ user })

const AllSalesOrders = ({ user: { permissions, type } }) => {
  const [salesOrdersList, setSalesOrdersList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [searchString, setSearchString] = useState('')
  const [createdAtFilter, setCreatedAtFilter] = useState([])
  const [pivotView, setPivotView] = useState(false)
  const [pivotTableData, setPivotTableData] = useState([])

  const {
    loading: salesOrdersLoad,
    error: salesOrdersErr,
    data: salesOrdersData,
  } = useQuery(SALES_ORDERS, { variables: { createdAtFilter, searchString, limit, offset } })

  // const [generatePivotTable, { loading: pivotLoad, data: pivotData, error: pivotErr }] =
  //   useLazyQuery(PRODUCT_PO_PIVOT_DATA)

  const pivotRows = [
    { uniqueName: 'brand', caption: 'Brand' },
    { uniqueName: 'buyer_group', caption: 'Buyer Group' },
    { uniqueName: 'buyer', caption: 'Buyer Name' },
    { uniqueName: 'type', caption: 'Type' },
    { uniqueName: 'total_qty', caption: 'Total Qty' },
    { uniqueName: 'total_cost', caption: 'Total Cost' },
    { uniqueName: 'status', caption: 'SO Status' },
    { uniqueName: 'delevery_date', caption: 'Expected Delivery' },
  ]

  const pivotMeasures = [{ uniqueName: 'total_cost', aggregation: 'sum', caption: 'SO Value' }]

  useEffect(() => {
    if (
      !salesOrdersLoad &&
      salesOrdersData &&
      salesOrdersData.salesOrders &&
      salesOrdersData.salesOrders.rows &&
      salesOrdersData.salesOrders.rows.length
    ) {
      setSalesOrdersList(salesOrdersData.salesOrders.rows)
      setRecordCount(salesOrdersData.salesOrders.count)
      const tempPivotData = salesOrdersData.salesOrders.rows.map((e) => {
        return {
          brand: e.brand_name,
          buyer_group: e.name,
          buyer: e.buyer_name,
          type: e.type,
          total_qty: e.total_quantity,
          total_cost: e.total_cost,
          status: e.status,
          delevery_date: moment(Number(e.expected_delivery_date)).format('Do MMM YYYY'),
        }
      })
      setPivotTableData(tempPivotData)
    }
  }, [salesOrdersData, salesOrdersLoad])

  const tableColumns = [
    {
      title: 'S.O. #',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'S.O. Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/sales-orders/all/view/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Buyer-Group',
      dataIndex: 'buyer_group_name',
      key: 'buyer_group_name',
      render: (text, record) => (record.type === 'Marketplace' ? 'Marketplace' : text),
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
    },
    {
      title: 'Buyer Warehouse',
      dataIndex: 'buyer_warehouse',
      key: 'buyer_warehouse',
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: 'Total Qty.',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
    },
    {
      title: 'Qty. picked / Scheduled to be picked',
      dataIndex: 'quantity_scheduled_to_pick',
      key: 'quantity_scheduled_to_pick',
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      render: (text) => {
        const curr = text.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        return `${curr.slice(0, 1)} ${curr.slice(1)}`
      },
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
  ]

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  if (!permissions.includes('readSalesOrder')) return <Error403 />
  if (salesOrdersErr) return `Error occured while fetching data: ${salesOrdersErr.message}`

  return (
    <div>
      <Helmet title="Sales Orders" />

      <Spin spinning={salesOrdersLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-4">
                  <strong>Sales Orders</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createSalesOrder') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/sales-orders/all/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  <div className="col-lg-7">
                    <RangePicker
                      allowClear={false}
                      id="date"
                      placeholder={['Starting Date', 'Ending Date']}
                      onChange={(value, dateString) => {
                        setCreatedAtFilter(dateString)
                      }}
                    />
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
                {type === 'admin' ? (
                  <div className="row ml-2">
                    <Switch
                      className="mr-2"
                      checked={pivotView}
                      onChange={(checked) => {
                        if (checked) {
                          setPivotView(true)
                        } else {
                          setPivotView(false)
                        }
                      }}
                    />
                    <div>Pivot View</div>
                  </div>
                ) : null}

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
                  <div className="kit__utils__table">
                    <Table
                      columns={tableColumns}
                      dataSource={salesOrdersList}
                      pagination={false}
                      // onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                      rowKey={(record) => String(record.id)}
                      locale={{
                        emptyText: (
                          <div className="custom-empty-text-parent">
                            <div className="custom-empty-text-child">
                              <i className="fe fe-search" />
                              <h5>No Sales Orders Found</h5>
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
                )}
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(AllSalesOrders))
