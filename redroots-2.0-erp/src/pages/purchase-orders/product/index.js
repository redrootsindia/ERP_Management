import React, { useState, useEffect } from 'react'
import { Link, withRouter, useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  Input,
  Select,
  Button,
  Table,
  Spin,
  Switch,
  Pagination,
  notification,
  Tooltip,
  Modal,
  Space,
} from 'antd'
import { SearchOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import PivotTable from 'components/PivotTable'
import {
  PRODUCT_PURCHASE_ORDERS,
  PRODUCT_VENDOR_NAMES_LIST,
  CHANGE_STATUS,
  PRODUCT_PO_PIVOT_DATA,
  PRODUCT_PURCHASE_ORDER_REJECT,
  BRANDS,
} from './queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const Products = ({ user: { permissions, type } }) => {
  const pivotRows = [
    { uniqueName: 'plan_year', caption: 'Plan Year' },
    { uniqueName: 'plan_quarter', caption: 'Plan Quarter' },
    { uniqueName: 'purchase_order_type', caption: 'PO Type' },
    { uniqueName: 'status', caption: 'PO Status' },
    { uniqueName: 'vendor', caption: 'Vendor' },
    { uniqueName: 'brand', caption: 'Brand' },
    { uniqueName: 'product_category', caption: 'Category' },
    { uniqueName: 'product_subcategory', caption: 'Sub-Category' },
    { uniqueName: 'product', caption: 'Product' },
    { uniqueName: 'variant_code', caption: 'BOM Code' },
  ]

  const pivotMeasures = [
    { uniqueName: 'purchase_order_id', aggregation: 'count', caption: 'PO No' },
    { uniqueName: 'quantity', aggregation: 'sum', caption: 'Quantity' },
    { uniqueName: 'balance_quantity', aggregation: 'sum', caption: 'Balance Quantity' },
    { uniqueName: 'received_quantity', aggregation: 'sum', caption: 'Recieved Quantity' },
  ]

  const status = useLocation().search
  const statusQuery = new URLSearchParams(status).get('status')
  const brandQuery = new URLSearchParams(status).get('brandIDs')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [sortBy, setSortBy] = useState('dateDesc')
  const [statusFilter, setStatusFilter] = useState(statusQuery || null)
  const [activeFilter, setActiveFilter] = useState(null)
  const [searchString, setSearchString] = useState('')
  const [pivotTableData, setPivotTableData] = useState([])
  const [pivotView, setPivotView] = useState(false)
  const [vendorIDs, setVendorIDs] = useState([])
  const [vendorsList, setVendorsList] = useState([])
  const [brandIDs, setBrandIDs] = useState(brandQuery || [])
  const [brandList, setBrandList] = useState([])
  const [vendorSearchString, setVendorSearchString] = useState(null)
  const [rejectReason, setRejectReason] = useState(undefined)
  const [rejectReasonError, setRejectReasonError] = useState(undefined)
  const [approved, setApproved] = useState(undefined)
  const debouncedVendorSearch = debounce((value) => setVendorSearchString(value), 500)
  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  // const [vendorID, setVendorID] = useState(undefined)

  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)

  const [poID, setPOID] = useState(undefined)

  const [productPurchaseOrderReject] = useMutation(PRODUCT_PURCHASE_ORDER_REJECT)

  const onSubmit = () => {
    setRejectReasonError(undefined)
    let isError = false
    if (!rejectReason) {
      isError = true
      setRejectReasonError('Reason cannot be empty')
    }
    if (!poID) isError = true

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    productPurchaseOrderReject({
      variables: {
        id: poID,
        reject_reason: rejectReason,
        approved,
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        setPOID(null)
        setRejectReason(null)
        setRejectReasonError(undefined)
        setIsModalVisible(false)
        refetch()
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while Rejecting PO.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const handleCancel = () => {
    setPOID(null)
    setRejectReason(null)
    setRejectReasonError(undefined)
    setIsModalVisible(false)
  }

  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(PRODUCT_VENDOR_NAMES_LIST, { variables: { searchString: vendorSearchString } })

  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorsList(vendorData.vendorNames)
  }, [vendorData, vendorLoad])

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length) {
      setBrandList(brandData.brands)
    }
  }, [brandLoad, brandData])

  const [productPurchaseOrders, setProductPurchaseOrders] = useState([])

  const {
    loading: productPurchaseOrderLoad,
    error: productPurchaseOrderErr,
    data: productPurchaseOrderData,
    refetch,
  } = useQuery(PRODUCT_PURCHASE_ORDERS, {
    variables: {
      brandIDs,
      vendorIDs,
      activeFilter,
      statusFilter,
      searchString,
      sortBy,
      limit,
      offset,
    },
  })

  useEffect(() => {
    if (
      productPurchaseOrderData &&
      productPurchaseOrderData.productPurchaseOrders &&
      productPurchaseOrderData.productPurchaseOrders.rows &&
      productPurchaseOrderData.productPurchaseOrders.rows.length
    ) {
      setProductPurchaseOrders(productPurchaseOrderData.productPurchaseOrders.rows)
      setRecordCount(productPurchaseOrderData.productPurchaseOrders.count)
    } else {
      setProductPurchaseOrders([])
      setRecordCount(0)
    }
  }, [productPurchaseOrderData])

  const [generatePivotTable, { loading: pivotLoad, data: pivotData, error: pivotErr }] =
    useLazyQuery(PRODUCT_PO_PIVOT_DATA)

  useEffect(() => {
    if (pivotData && pivotData.productPurchaseOrderPivotData) {
      const tempData = pivotData.productPurchaseOrderPivotData.map((e) => {
        return { ...e, balance_quantity: e.quantity - e.received_quantity }
      })
      setPivotTableData(tempData)
    }
  }, [pivotData, pivotLoad])

  const [changeStatus] = useMutation(CHANGE_STATUS)

  const tableColumns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Link to={`/purchase-orders/product/update/${record.id}`}>{text}</Link>
      ),
    },

    {
      title: 'PO Type',
      dataIndex: 'pack',
      key: 'pack',
      render: (pack) => (pack ? 'Pack' : 'Product'),
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: 'PI NO.',
      dataIndex: 'proforma_invoice_id',
      key: 'proforma_invoice_id',
      render: (text, record) => (
        <Link to={`/proforma-invoice/update/${record.text}`}>{text || '-'}</Link>
      ),
    },
    {
      title: 'Vendor',
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
      title: 'Accept / Reject',
      dataIndex: 'Accept',
      key: 'Accept',
      render: (text, record) => {
        return (
          <Space size="small">
            {record.status === 'Draft' || record.status === 'Assigned' ? (
              <>
                <Tooltip title="Approve">
                  <Button
                    danger
                    onClick={() =>
                      productPurchaseOrderReject({
                        variables: {
                          id: record.id,
                          approved: true,
                        },
                      })
                        .then(() => {
                          notification.success({ description: 'Approved PO' })
                          refetch()
                        })
                        .catch((err) => {
                          notification.error({
                            message: 'Error occured while Approving PO.',
                            description: err.message || 'Please contact system administrator.',
                          })
                        })
                    }
                    type="primary"
                    shape="circle"
                    icon={<CheckOutlined />}
                  />
                </Tooltip>
                <Tooltip title="Reject">
                  <Button
                    danger
                    onClick={() => {
                      showModal()
                      setPOID(record.id)
                      setApproved(false)
                    }}
                    shape="circle"
                    icon={<CloseOutlined />}
                  />
                </Tooltip>
              </>
            ) : (
              '-'
            )}
          </Space>
        )
      },
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
    {
      title: 'Created By',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
  ]

  if (type === 'vendor') {
    tableColumns.splice(8, 1)
  }

  if (!permissions.includes('readPurchaseOrder')) return <Error403 />
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (pivotErr) return `Error occured while fetching data: ${pivotErr.message}`
  if (productPurchaseOrderErr)
    return `Error occured while fetching data: ${productPurchaseOrderErr.message}`

  return (
    <div>
      <Helmet title="Products PO" />

      <Spin spinning={productPurchaseOrderLoad || pivotLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>PRODUCT PURCHASE ORDERS</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createPurchaseOrder') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/purchase-orders/product/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  {type === 'admin' ? (
                    <div className="col-lg-2 custom-pad-r0">
                      <Select
                        mode="multiple"
                        showSearch
                        value={brandIDs}
                        onSearch={(value) => debouncedVendorSearch(value)}
                        onChange={(value) => setBrandIDs(value)}
                        placeholder="Brands"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        className="custom-pad-r1 mb-2 w-100"
                      >
                        {brandList && brandList.length
                          ? brandList.map((obj) => (
                              <Select.Option key={String(obj.id)} value={String(obj.id)}>
                                {obj.name}
                              </Select.Option>
                            ))
                          : null}
                      </Select>
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
                      <Option key={3} value="In Progress">
                        In Progress
                      </Option>
                      <Option key={4} value="Closed">
                        Closed
                      </Option>
                      <Option key={5} value="Force Closed">
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
                      dataSource={productPurchaseOrders}
                      pagination={false}
                      rowKey={(record) => String(record.id)}
                      locale={{
                        emptyText: (
                          <div className="custom-empty-text-parent">
                            <div className="custom-empty-text-child">
                              <i className="fe fe-search" />
                              <h5>No Products PO Found</h5>
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
          <Modal
            title={` Reject PO #${poID}`}
            visible={isModalVisible}
            onOk={onSubmit}
            centered
            width={300}
            onCancel={handleCancel}
          >
            <div className="text-center">
              <Input
                placeholder="Reject Reason"
                onChange={({ target: { value } }) => setRejectReason(value)}
                allowClear
              />
              <div className="custom-error-text mb-4">{rejectReasonError || ''}</div>
            </div>
          </Modal>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(Products))
