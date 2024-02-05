import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Input, Button, Table, Spin, Pagination } from 'antd'
import Error403 from 'components/Errors/403'
import { debounce } from 'lodash'
import moment from 'moment'
import { SearchOutlined } from '@ant-design/icons'
import { SALES_BILLS } from './query'

// const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const SalesBill = ({ user: { permissions } }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  //   const [sortBy, setSortBy] = useState('dateDesc')
  //   const [statusFilter, setStatusFilter] = useState('')
  const [searchString, setSearchString] = useState('')
  const [salesBills, setSalesBills] = useState([])

  //   const [buyerSearchString, setBuyerSearchString] = useState(null)
  //   const debouncedBuyerSearch = debounce((value) => setBuyerSearchString(value), 500)
  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const {
    loading: salesBillLoad,
    error: salesBillError,
    data: salesBillData,
  } = useQuery(SALES_BILLS, {
    variables: {
      searchString,
      limit,
      offset,
    },
  })
  useEffect(() => {
    if (
      !salesBillLoad &&
      salesBillData &&
      salesBillData.salesBills &&
      salesBillData.salesBills.rows &&
      salesBillData.salesBills.rows.length
    ) {
      setSalesBills(salesBillData.salesBills.rows)
      setRecordCount(salesBillData.salesBills.count)
    } else {
      setSalesBills([])
      setRecordCount(0)
    }
  }, [salesBillLoad, salesBillData])

  const tableColumns = [
    {
      title: 'Invoice Date',
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      render: (text, record) => (
        <Link to={`/sales-bill/update/${record.id}`}>
          {text ? moment(Number(text)).format('Do MMM YYYY') : '-'}
        </Link>
      ),
    },
    {
      title: 'Invoice Due Date',
      dataIndex: 'invoice_due_date',
      key: 'invoice_due_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
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
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
    },

    {
      title: 'Due Date',
      dataIndex: 'invoice_due_date',
      key: 'invoice_due_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },

    {
      title: 'Sales Invoice No.',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
    },
  ]

  if (!permissions.includes('readSalesBill')) return <Error403 />
  // if (organizationsError) return `Error occured while fetching data: ${organizationsError.message}`

  if (salesBillError) return `Error occured while fetching data: ${salesBillError.message}`
  //   if (buyerErr) return `Error occured while fetching data: ${buyerErr.message}`
  //   if (brandErr) return `Error occured while fetching data: ${brandErr.message}`

  return (
    <div>
      <Helmet title="Sales Bill" />
      <Spin spinning={salesBillLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>SALES BILL</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createSalesBill') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/sales-bill/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}

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
                <div className="kit__utils__table mt-4">
                  <Table
                    columns={tableColumns}
                    dataSource={salesBills}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Sales Bill Found</h5>
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

export default withRouter(connect(mapStateToProps)(SalesBill))
