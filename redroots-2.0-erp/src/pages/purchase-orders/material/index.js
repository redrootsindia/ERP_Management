import React, { useState, useEffect } from 'react'
import { Link, withRouter, useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { Input, Select, Button, Table, Spin, Switch, Pagination, notification } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import {
  MATERIAL_PURCHASE_ORDERS,
  VENDOR_NAMES_LIST,
  CHANGE_STATUS,
  MATERIAL_PO_PIVOT_DATA,
} from './queries'
import PivotTable from '../../../components/PivotTable'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const Materials = ({ user: { permissions, type } }) => {
  // const convertDate = (text) => {
  //   const dateFormat = new Date(text)
  //   const today = new Date()
  //   // prettier-ignore
  //   const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  //   return `${monthNames[dateFormat.getMonth()]} ${dateFormat.getDate()}, ${dateFormat.getFullYear()}`
  // }

  const status = useLocation().search
  const statusQuery = new URLSearchParams(status).get('status')

  const pivotRows = [
    { uniqueName: 'plan_year', caption: 'Plan Year' },
    { uniqueName: 'plan_quarter', caption: 'Plan Quarter' },
    { uniqueName: 'status', caption: 'PO Status' },
    { uniqueName: 'organization', caption: 'Organization' },
    { uniqueName: 'vendor', caption: 'Vendor' },
    { uniqueName: 'material_category', caption: 'Category' },
    { uniqueName: 'material_subcategory', caption: 'Sub-Category' },
    { uniqueName: 'material', caption: 'Material' },
  ]

  const pivotMeasures = [
    { uniqueName: 'purchase_order_id', aggregation: 'count', caption: 'PO No' },
    { uniqueName: 'quantity', aggregation: 'sum', caption: 'Quantity' },
    { uniqueName: 'balance_quantity', aggregation: 'sum', caption: 'Balance Quantity' },
    { uniqueName: 'received_quantity', aggregation: 'sum', caption: 'Recieved Quantity' },
  ]

  const [pivotView, setPivotView] = useState(true)
  const [pivotTableData, setPivotTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [sortBy, setSortBy] = useState('dateDesc')
  const [statusFilter, setStatusFilter] = useState(statusQuery || null)
  const [activeFilter, setActiveFilter] = useState(null)
  const [searchString, setSearchString] = useState('')
  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const [vendorIDs, setVendorIDs] = useState([])
  const [vendorsList, setVendorsList] = useState([])
  const [vendorSearchString, setVendorSearchString] = useState(null)
  const debouncedVendorSearch = debounce((value) => setVendorSearchString(value), 500)

  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(VENDOR_NAMES_LIST, {
    variables: { searchString: vendorSearchString, vendorIDs },
  })
  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorsList(vendorData.vendorNames)
  }, [vendorData, vendorLoad])

  const [materialPurchaseOrders, setMaterialPurchaseOrders] = useState([])

  const {
    loading: materialPurchaseOrderLoad,
    error: materialPurchaseOrderErr,
    data: materialPurchaseOrderData,
  } = useQuery(MATERIAL_PURCHASE_ORDERS, {
    variables: { vendorIDs, activeFilter, statusFilter, searchString, sortBy, limit, offset },
  })

  useEffect(() => {
    if (
      materialPurchaseOrderData &&
      materialPurchaseOrderData.materialPurchaseOrders &&
      materialPurchaseOrderData.materialPurchaseOrders.rows &&
      materialPurchaseOrderData.materialPurchaseOrders.rows.length
    ) {
      setMaterialPurchaseOrders(materialPurchaseOrderData.materialPurchaseOrders.rows)
      setRecordCount(materialPurchaseOrderData.materialPurchaseOrders.count)
    } else {
      setMaterialPurchaseOrders([])
      setRecordCount(0)
    }
  }, [materialPurchaseOrderData])

  const [generatePivotTable, { loading: pivotLoad, data: pivotData, error: pivotErr }] =
    useLazyQuery(MATERIAL_PO_PIVOT_DATA)

  useEffect(() => {
    if (pivotData && pivotData.materialPurchaseOrderPivotData) {
      const tempData = pivotData.materialPurchaseOrderPivotData.map((e) => {
        return { ...e, balance_quantity: e.quantity - e.received_quantity }
      })
      setPivotTableData(tempData)
    }
  }, [pivotData, pivotLoad])

  const [changeStatus] = useMutation(CHANGE_STATUS)

  const tableColumns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Link to={`/purchase-orders/material/update/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Organization Name',
      dataIndex: 'organization_name',
      key: 'organization_name',
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      render: (name, row) => `${row.vendor_company} (${name})`,
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
    {
      title: 'Created By',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) =>
        permissions.includes('updatePurchaseOrder') && type === 'admin' ? (
          <Switch
            defaultChecked={active}
            onChange={(checked) =>
              changeStatus({ variables: { id: record.id, active: checked } })
                .then(() =>
                  notification.success({
                    description: (
                      <span>
                        Status of <strong>{record.id}</strong> changed successfully
                      </span>
                    ),
                  }),
                )
                .catch((err) => {
                  notification.error({
                    message: 'Error occured while changing active.',
                    description: err.message || 'Please contact system administrator.',
                  })
                })
            }
            disabled={!permissions.includes('updatePurchaseOrder')}
          />
        ) : active ? (
          'Yes'
        ) : (
          'No'
        ),
    },
  ]

  if (!permissions.includes('readMaterial')) return <Error403 />
  if (materialPurchaseOrderErr)
    return `Error occured while fetching data: ${materialPurchaseOrderErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (pivotErr) return `Error occured while fetching data: ${pivotErr.message}`
  if (materialPurchaseOrderErr)
    return `Error occured while fetching data: ${materialPurchaseOrderErr.message}`

  return (
    <div>
      <Helmet title="Materials PO" />

      <Spin spinning={materialPurchaseOrderLoad || pivotLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>MATERIAL PURCHASE ORDERS</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createMaterial') && type === 'admin' ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/purchase-orders/material/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  {type === 'admin' ? (
                    <div className="col-lg-2 custom-pad-r0">
                      <Select
                        mode="multiple"
                        showSearch
                        value={vendorIDs}
                        onSearch={(value) => debouncedVendorSearch(value)}
                        onChange={(value) => setVendorIDs(value)}
                        placeholder="Vendors"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        className="custom-pad-r1 mb-2 w-100"
                      >
                        {vendorsList && vendorsList.length
                          ? vendorsList.map((obj) => (
                              <Select.Option key={String(obj.id)} value={String(obj.id)}>
                                {`${obj.company} (${obj.name})`}
                              </Select.Option>
                            ))
                          : null}
                      </Select>
                    </div>
                  ) : null}

                  <div className="col-lg-2">
                    <Select
                      key="statusFilter"
                      value={statusFilter || null}
                      placeholder="Filter by status"
                      onChange={(value) => setStatusFilter(value)}
                      className="custom-pad-r1 w-100"
                    >
                      <Option key={0} value={null}>
                        All statuses
                      </Option>
                      <Option key={1} value="Draft">
                        Draft
                      </Option>
                      <Option key={2} value="Assigned">
                        Assigned
                      </Option>
                      <Option key={2} value="In Progress">
                        In Progress
                      </Option>
                      <Option key={2} value="Closed">
                        Closed
                      </Option>
                      <Option key={2} value="Force Closed">
                        Force Closed
                      </Option>
                    </Select>
                  </div>
                  <div className="col-lg-2">
                    <Select
                      key="activeFilter"
                      value={activeFilter || null}
                      placeholder="Filter by active"
                      onChange={(active) => setActiveFilter(active)}
                      className="custom-pad-r1 w-100"
                    >
                      <Option key={0} value={null}>
                        Active & Inactive
                      </Option>
                      <Option key={1} value="active">
                        Active only
                      </Option>
                      <Option key={2} value="inactive">
                        Inactive only
                      </Option>
                    </Select>
                  </div>
                  <div className="col-lg-2">
                    <Select
                      key="sortBy"
                      value={sortBy || 'dateDesc'}
                      placeholder="Sort by created date - Latest first"
                      onChange={(value) => setSortBy(value)}
                      className="custom-pad-r1 w-100"
                    >
                      <Option key="dateDesc" value="dateDesc">
                        Sort by created date - Latest first
                      </Option>
                      <Option key="dateAsc" value="dateAsc">
                        Sort by created date - Oldest first
                      </Option>
                    </Select>
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
                {type === 'admin' ? (
                  <div className="row ml-2">
                    <Switch
                      className="mr-2"
                      onChange={(checked) => {
                        if (checked) generatePivotTable()
                        setPivotView(checked)
                      }}
                    />
                    <div>Pivot View</div>
                  </div>
                ) : null}

                {pivotView && pivotTableData && pivotTableData.length ? (
                  <div className="mt-4">
                    <PivotTable
                      data={pivotTableData}
                      rows={pivotRows}
                      measures={pivotMeasures}
                      columns={[]}
                    />
                  </div>
                ) : (
                  <div className="kit__utils__table  mt-4">
                    <Table
                      columns={tableColumns}
                      dataSource={materialPurchaseOrders}
                      pagination={false}
                      rowKey={(record) => String(record.id)}
                      locale={{
                        emptyText: (
                          <div className="custom-empty-text-parent">
                            <div className="custom-empty-text-child">
                              <i className="fe fe-search" />
                              <h5>No Materials Found</h5>
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

export default withRouter(connect(mapStateToProps)(Materials))
