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
import { PURCHASE_BILLS } from './query'

// const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const PurchaseBill = ({ user: { permissions } }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [searchString, setSearchString] = useState('')
  const [purchaseBills, setPurchaseBills] = useState([])

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const {
    loading: purchaseBillLoad,
    error: purchaseBillError,
    data: purchaseBillData,
  } = useQuery(PURCHASE_BILLS, {
    searchString,
    limit,
    offset,
  })
  useEffect(() => {
    if (
      !purchaseBillLoad &&
      purchaseBillData &&
      purchaseBillData.purchaseBills &&
      purchaseBillData.purchaseBills.rows &&
      purchaseBillData.purchaseBills.rows.length
    ) {
      setPurchaseBills(purchaseBillData.purchaseBills.rows)
      setRecordCount(purchaseBillData.purchaseBills.count)
    } else {
      setPurchaseBills([])
      setRecordCount(0)
    }
  }, [purchaseBillLoad, purchaseBillData])

  const tableColumns = [
    {
      title: 'Invoice Date',
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      render: (text, record) => (
        <Link to={`/accounts/purchase-bill/update/${record.id}`}>
          {text ? moment(Number(text)).format('Do MMM YYYY') : '-'}
        </Link>
      ),
    },
    {
      title: 'Invoice No.',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
    },
    {
      title: 'Vendor Company Name',
      dataIndex: 'vendor_company_name',
      key: 'vendor_company_name',
      //   render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      //   render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: 'Due Date',
      dataIndex: 'invoice_due_date',
      key: 'invoice_due_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: 'Total Bill Qty.',
      dataIndex: 'total_bill_quantity',
      key: 'total_bill_quantity',
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
    },
  ]

  if (!permissions.includes('readPurchaseBill')) return <Error403 />

  if (purchaseBillError) return `Error occured while fetching data: ${purchaseBillError.message}`

  return (
    <div>
      <Helmet title="Proforma Invoice" />
      <Spin spinning={purchaseBillLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>PURCHASE BILL</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createPurchaseBill') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/accounts/purchase-bill/create">
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
                    dataSource={purchaseBills}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Purchase Bill Found</h5>
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

export default withRouter(connect(mapStateToProps)(PurchaseBill))
