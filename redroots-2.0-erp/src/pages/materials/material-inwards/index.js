import React, { useState, useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useLazyQuery } from '@apollo/client'
import './style.scss'
import {
  Table,
  Spin,
  Button,
  Input,
  Select,
  DatePicker,
  Pagination,
  Space,
  Tooltip,
  Switch,
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import PivotTable from 'components/PivotTable'
import InwardDetailExpand from './inwardDetailExpand'
import { MATERIAL_INWARDS, VENDOR_NAMES_LIST, MATERIAL_INWARD_PIVOT_DATA } from './queries'
import ImageModal from './imageModal'
import GRNDownload from './grnDownload'

const { Option } = Select
const { RangePicker } = DatePicker
const mapStateToProps = ({ user }) => ({ user })

const MaterialInward = ({ user: { permissions, type } }) => {
  const [pivotView, setPivotView] = useState(false)
  const [pivotTableData, setPivotTableData] = useState([])
  const pivotRows = [
    { uniqueName: 'month', caption: 'Month' },
    { uniqueName: 'week', caption: 'Week' },
    { uniqueName: 'material_category_name', caption: 'MATERIAL CAT.' },
    { uniqueName: 'material_subcategory_name', caption: 'MATERIAL SUB-CAT.' },
    { uniqueName: 'material_code', caption: 'MATERIAL CODE' },
    { uniqueName: 'vendor_company', caption: 'VENDOR COMPANY' },
    { uniqueName: 'purchase_order_id', caption: 'AGAINST PO' },
    { uniqueName: 'batch_no', caption: 'BATCH NO.' },
  ]

  const pivotMeasures = [
    { uniqueName: 'inward_qty', aggregation: 'sum', caption: 'Inward Qty.' },
    { uniqueName: 'inward_cost', aggregation: 'sum', caption: 'Inward Cost (₹)' },
  ]

  const [materialInwardsList, setMaterialInwardsList] = useState([])
  const [vendorIDs, setVendorIDs] = useState([])
  const [vendorNamesList, setVendorNamesList] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)

  const [searchString, setSearchString] = useState('')

  const [sortBy, setSortBy] = useState('createdAtDesc')

  const [dateRange, setDateRange] = useState([])

  const inwardDateFilter = dateRange.map((e) => String(moment(e, 'Do MMM YYYY').valueOf()))

  const [statusFilter, setStatusFilter] = useState(null)

  const {
    loading: materialInwardLoad,
    error: materialInwardErr,
    data: materialInwardData,
  } = useQuery(MATERIAL_INWARDS, {
    variables: { inwardDateFilter, vendorIDs, statusFilter, sortBy, searchString, limit, offset },
  })

  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(VENDOR_NAMES_LIST, {
    variables: { vendorIDs },
  })

  const [generatePivotTable, { loading: pivotLoad, data: pivotData, error: pivotErr }] =
    useLazyQuery(MATERIAL_INWARD_PIVOT_DATA)

  useEffect(() => {
    if (
      !pivotLoad &&
      pivotData &&
      pivotData.materialInwardPivotData &&
      pivotData.materialInwardPivotData.length
    ) {
      const tempData = pivotData.materialInwardPivotData.map((e) => {
        const createdDate = new Date(Number(e.createdAt))
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
        const monthYear = `${months[createdDate.getMonth()]}-${createdDate.getFullYear()}`
        const getWeekOfMonth = (dateToConvert) => {
          const month = dateToConvert.getMonth()
          const year = dateToConvert.getFullYear()
          const firstWeekday = new Date(year, month, 1).getDay()
          const offsetDate = dateToConvert.getDate() + firstWeekday - 1
          return Math.floor(offsetDate / 7) + 1
        }

        return {
          ...e,
          inward_cost: e.inward_qty * e.unit_cost,
          month: monthYear,
          week: `Week ${getWeekOfMonth(createdDate)} of ${monthYear}`,
        }
      })
      setPivotTableData(tempData)
    }
  }, [pivotData, pivotLoad])

  useEffect(() => {
    if (
      !materialInwardLoad &&
      materialInwardData &&
      materialInwardData.materialInwards &&
      materialInwardData.materialInwards.rows &&
      materialInwardData.materialInwards.rows.length
    ) {
      setMaterialInwardsList(materialInwardData.materialInwards.rows)
      setRecordCount(materialInwardData.materialInwards.count)
    }
  }, [materialInwardData, materialInwardLoad])

  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorNamesList(vendorData.vendorNames)
  }, [vendorData, vendorLoad])

  const tableColumns = [
    {
      title: 'Inward ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 120,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Inward Date',
      dataIndex: 'inward_date',
      key: 'inward_date',
      fixed: 'left',
      width: 120,
      render: (text) => moment(Number(text)).format('Do MMM YYYY'),
      sorter: (a, b) => a.inward_date - b.inward_date,
    },

    {
      title: 'Invoice Number',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      fixed: 'left',
      width: 120,
    },
    {
      title: 'P.O. #',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
      fixed: 'left',
      width: 120,
      sorter: (a, b) => a.purchase_order_id - b.purchase_order_id,
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      render: (text) => text || '-',
    },
    {
      title: 'P.O. Date',
      dataIndex: 'po_date',
      key: 'po_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : null),
      sorter: (a, b) => a.po_date - b.po_date,
    },
    {
      title: 'P.O. Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : null),
    },
    {
      title: 'Ordered Qty.',
      dataIndex: 'ordered_quantity',
      key: 'ordered_quantity',
      sorter: (a, b) => a.ordered_quantity - b.ordered_quantity,
    },
    {
      title: 'Recieved Qty.',
      dataIndex: 'received_quantity',
      key: 'received_quantity',
      sorter: (a, b) => a.received_quantity - b.received_quantity,
    },
    {
      title: 'Recieved Qty Amt',
      dataIndex: 'received_amount',
      key: 'received_amount',
    },
    {
      title: 'Shortage qty',
      dataIndex: 'shortage qty',
      key: 'shortage_qty',
    },
    {
      title: 'Shoratge qty Amt',
      dataIndex: 'shortage_qty_amt',
      key: 'shortage_qty_amt',
    },
    {
      title: 'Excess qty',
      dataIndex: 'excess_qty',
      key: 'excess_qty',
    },
    {
      title: 'Excess qty Amt',
      dataIndex: 'excess_qty_amt',
      key: 'excess_qty_amt',
    },
    {
      title: 'Pending Qty.',
      dataIndex: 'pending_quantity',
      key: 'pending_quantity',
    },
    {
      title: 'P.O. Status',
      dataIndex: 'po_status',
      key: 'po_status',
      render: (text) => text || '-',
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      fixed: 'right',
      render: (text, record) => (
        <Space w-100 size="small">
          <Link to={`/materials/material-inwards/update/${record.id}`}>
            <Button type="primary">View / Edit</Button>
          </Link>
        </Space>
      ),
    },
    {
      tittle: '',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
      fixed: 'right',
      render: (text, record) => (
        <Space>
          <ImageModal invoice_image={record.invoice_image} challan_image={record.challan_image} />
          {record.purchase_order_id && (
            <Tooltip title="Print GRN">
              <GRNDownload inward_id={record.id} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)
  if (!permissions.includes('readMaterialInward')) return <Error403 />
  if (materialInwardErr) return `Error occured while fetching data: ${materialInwardErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (pivotErr) return `Error occured while fetching data: ${pivotErr.message}`

  return (
    <div>
      <Helmet title="Material Inward" />

      <Spin spinning={materialInwardLoad || pivotLoad} tip="Loading..." size="large">
        <div className="row mt-4 material-inward">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-4">
                  <strong>Material Inwards</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createMaterialInward') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/materials/material-inwards/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  <div className="col-lg-2 custom-pad-r0">
                    <RangePicker
                      allowClear={false}
                      id="date"
                      style={{ width: '100%' }}
                      format="Do MMM YYYY "
                      placeholder={['Start', 'End']}
                      onChange={(value, dateString) => setDateRange(dateString)}
                    />
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      mode="multiple"
                      value={vendorIDs}
                      style={{ width: '100%' }}
                      onChange={(value) => setVendorIDs(value)}
                      placeholder="Select Vendors"
                    >
                      {vendorNamesList && vendorNamesList.length
                        ? vendorNamesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      key="statusFilter"
                      style={{ width: '100%' }}
                      placeholder="Sort by Status"
                      onChange={(value) => setStatusFilter(value)}
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
                  <div className="col-3 custom-pad-r0">
                    <Select
                      key="sortBy"
                      value={sortBy || 'createdAtDesc'}
                      style={{ width: '100%' }}
                      onChange={(value) => setSortBy(value)}
                    >
                      <Option key="createdAtAsc" value="createdAtAsc">
                        Sort by created date - Oldest first
                      </Option>
                      <Option key="createdAtDesc" value="createdAtDesc">
                        Sort by created date - Latest first
                      </Option>
                      <Option key="purchaseOrderIDAsc" value="purchaseOrderIDAsc">
                        Sort by P.O. # - Ascending
                      </Option>
                      <Option key="purchaseOrderIDDesc" value="purchaseOrderIDDesc">
                        Sort by P.O. # - Descending
                      </Option>
                      <Option key="vendorAsc" value="vendorAsc">
                        Sort by Vendor - A to Z
                      </Option>
                      <Option key="vendorDesc" value="vendorDesc">
                        Sort by Vendor - Z to A
                      </Option>
                      <Option key="inwardDateAsc" value="inwardDateAsc">
                        Sort by inward date - Oldest first
                      </Option>
                      <Option key="inwardDateDesc" value="inwardDateDesc">
                        Sort by inward date - Latest first
                      </Option>
                      <Option key="purchaseOrderDateAsc" value="purchaseOrderDateAsc">
                        Sort by P.O. date - Oldest first
                      </Option>
                      <Option key="purchaseOrderDateDesc" value="purchaseOrderDateDesc">
                        Sort by P.O. date - Latest first
                      </Option>
                    </Select>
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <Input
                      style={{ width: '100%' }}
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
                  <div className="kit__utils__table mt-4">
                    <Table
                      columns={tableColumns}
                      dataSource={materialInwardsList}
                      pagination={false}
                      size="small"
                      scroll={{ x: 300, y: 600 }}
                      expandable={{
                        expandedRowRender: ({ id }) => <InwardDetailExpand id={id} />,
                      }}
                      onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                      rowKey={(record) => String(record.id)}
                      locale={{
                        emptyText: (
                          <div className="custom-empty-text-parent">
                            <div className="custom-empty-text-child">
                              <i className="fe fe-search" />
                              <h5>No Material Inward Found</h5>
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
export default withRouter(connect(mapStateToProps)(MaterialInward))
