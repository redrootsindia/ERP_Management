import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useLazyQuery, useQuery } from '@apollo/client'
import { Input, Select, Button, Table, Switch, Spin, Pagination } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import PivotTable from 'components/PivotTable'
import { PROFORMA_INVOICES, PROFORMA_INVOICE_PIVOT_DATA } from './queries'
import { BRANDS } from '../purchase-orders/product/queries'
import { BUYER_NAME_LIST } from '../sales-orders/all-sales-orders/queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const ProformaInvoice = ({ user: { permissions, type } }) => {
  const pivotRows = [
    { uniqueName: 'plan_year', caption: 'Plan Year' },
    { uniqueName: 'plan_quarter', caption: 'Plan Quarter' },
    { uniqueName: 'purchase_order_type', caption: 'PO Type' },
    { uniqueName: 'status', caption: 'PI Status' },
    { uniqueName: 'buyer_group', caption: 'Buyer Group' },
    { uniqueName: 'buyer_name', caption: 'Buyer' },
    { uniqueName: 'brand_name', caption: 'Brand' },
    { uniqueName: 'product_category_name', caption: 'Category' },
    { uniqueName: 'product_subcategory_name', caption: 'Sub-Category' },
    { uniqueName: 'product_name', caption: 'Product' },
    { uniqueName: 'variant_code', caption: 'BOM Code' },
  ]

  const pivotMeasures = [
    { uniqueName: 'proforma_invoice_id', aggregation: 'count', caption: 'PI No' },
    { uniqueName: 'quantity', aggregation: 'sum', caption: 'Quantity' },
    // { uniqueName: 'balance_quantity', aggregation: 'sum', caption: 'Balance Quantity' },
    // { uniqueName: 'received_quantity', aggregation: 'sum', caption: 'Recieved Quantity' },
  ]
  const Colum = [
    {
      uniqueName: 'brand',
    },
    {
      uniqueName: 'category',
      caption: 'Main category',
    },
    {
      uniqueName: 'subcategory1',
      caption: 'Sub-Category 01',
    },
    {
      uniqueName: 'subcategory2',
      caption: 'Sub-Category 02',
    },
    {
      uniqueName: 'category',
      caption: 'Main category',
    },
    {
      uniqueName: 'marketingScore',
    },
    { uniqueName: 'Measures' },
  ]
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [sortBy, setSortBy] = useState('dateDesc')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchString, setSearchString] = useState('')
  const [buyerIDs, setBuyerIDS] = useState([])
  const [brandIDs, setBrandIDs] = useState([])
  const [proformaInvoices, setProformaInvoices] = useState([])
  const [buyerList, setBuyerList] = useState([])
  const [brandNames, setBrandName] = useState([])
  const [buyerSearchString, setBuyerSearchString] = useState(null)
  const debouncedBuyerSearch = debounce((value) => setBuyerSearchString(value), 500)
  const [pivotView, setPivotView] = useState(false)
  const [pivotTableData, setPivotTableData] = useState([])

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const [generatePivotTable, { loading: pivotLoad, data: pivotData, error: pivotErr }] =
    useLazyQuery(PROFORMA_INVOICE_PIVOT_DATA)

  useEffect(() => {
    if (pivotData && pivotData.proformaInvoicePivoteData) {
      const tempData = pivotData.proformaInvoicePivoteData.map((e) => {
        return { ...e, balance_quantity: e.quantity - e.received_quantity }
      })
      setPivotTableData(tempData)
    }
  }, [pivotData, pivotLoad])

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length) {
      setBrandName(brandData.brands)
    }
  }, [brandLoad, brandData])

  const {
    loading: buyerLoad,
    error: buyerErr,
    data: buyerData,
  } = useQuery(BUYER_NAME_LIST, {
    searchString: buyerSearchString,
  })
  useEffect(() => {
    if (!buyerLoad && buyerData && buyerData.buyerNames && buyerData.buyerNames.length) {
      setBuyerList(buyerData.buyerNames)
    } else {
      setBuyerList([])
    }
  }, [buyerData, buyerLoad])

  const {
    loading: proformaInvoicesLoad,
    error: proformaInvoicesError,
    data: proformaInvoicesData,
  } = useQuery(PROFORMA_INVOICES, {
    variables: { brandIDs, buyerIDs, statusFilter, searchString, sortBy, limit, offset },
  })
  useEffect(() => {
    if (
      !proformaInvoicesLoad &&
      proformaInvoicesData &&
      proformaInvoicesData.proformaInvoices &&
      proformaInvoicesData.proformaInvoices.rows &&
      proformaInvoicesData.proformaInvoices.rows.length
    ) {
      setProformaInvoices(proformaInvoicesData.proformaInvoices.rows)
      setRecordCount(proformaInvoicesData.proformaInvoices.count)
    } else {
      setProformaInvoices([])
      setRecordCount(0)
    }
  }, [proformaInvoicesLoad, proformaInvoicesData])

  const tableColumns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => <Link to={`/proforma-invoice/update/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
    },
    {
      title: 'PI Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
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
  ]

  if (!permissions.includes('readProformaInvoice')) return <Error403 />
  if (proformaInvoicesError)
    return `Error occured while fetching data: ${proformaInvoicesError.message}`
  if (buyerErr) return `Error occured while fetching data: ${buyerErr.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (pivotErr) return `Error occured while fetching data: ${pivotErr.message}`

  return (
    <div>
      <Helmet title="Proforma Invoice" />
      <Spin spinning={proformaInvoicesLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>PROFORMA INVOICE</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createProformaInvoice') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/proforma-invoice/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      mode="multiple"
                      showSearch
                      value={brandIDs}
                      onChange={(value) => setBrandIDs(value)}
                      placeholder="Brand"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 mb-2 w-100"
                    >
                      {brandNames && brandNames.length
                        ? brandNames.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      mode="multiple"
                      showSearch
                      value={buyerIDs}
                      onSearch={(value) => debouncedBuyerSearch(value)}
                      onChange={(value) => setBuyerIDS(value)}
                      placeholder="Buyers"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 mb-2 w-100"
                    >
                      {buyerList && buyerList.length
                        ? buyerList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>

                  <div className="col-lg-2">
                    <Select
                      key="statusFilter"
                      value={statusFilter || null}
                      placeholder="Filter by status"
                      showSearch
                      onChange={(value) => setStatusFilter(value)}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 w-100"
                    >
                      <Option key={0} value={null}>
                        All statuses
                      </Option>
                      <Option key={1} value="Open">
                        Open
                      </Option>
                      <Option key={3} value="In Progress">
                        In Progress
                      </Option>
                      <Option key={4} value="Completed">
                        Completed
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
                      columns={Colum}
                    />
                  </div>
                ) : (
                  <div className="kit__utils__table mt-4">
                    <Table
                      columns={tableColumns}
                      dataSource={proformaInvoices}
                      pagination={false}
                      rowKey={(record) => String(record.id)}
                      locale={{
                        emptyText: (
                          <div className="custom-empty-text-parent">
                            <div className="custom-empty-text-child">
                              <i className="fe fe-search" />
                              <h5>No Proforma Invoice Found</h5>
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

export default withRouter(connect(mapStateToProps)(ProformaInvoice))
