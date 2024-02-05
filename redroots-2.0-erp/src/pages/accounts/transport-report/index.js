import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Input, Button, Table, Spin, Select, Pagination } from 'antd'
import Error403 from 'components/Errors/403'
import moment from 'moment'
import { debounce } from 'lodash'
import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { TRANSPORT_REPORTS } from './query'
import { BRANDS } from '../../purchase-orders/product/queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const PurchaseBill = ({ user: { permissions } }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [searchString, setSearchString] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [brandIDs, setBrandIDs] = useState([])
  const [brandNames, setBrandName] = useState([])

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const [transportReportLists, setTransportReportLists] = useState([])
  const {
    loading: transportReportLoad,
    data: transportReportData,
    error: transportReportError,
  } = useQuery(TRANSPORT_REPORTS, {
    variables: { brandIDs, statusFilter, searchString, limit, offset },
  })
  useEffect(() => {
    console.log(transportReportData)
    if (
      !transportReportLoad &&
      transportReportData &&
      transportReportData.transportReports &&
      transportReportData.transportReports.rows &&
      transportReportData.transportReports.rows.length
    ) {
      setRecordCount(transportReportData.transportReports.count)
      setTransportReportLists(transportReportData.transportReports.rows)
    }
  }, [transportReportLoad, transportReportData])

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length) {
      setBrandName(brandData.brands)
    }
  }, [brandLoad, brandData])

  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Link to={`/accounts/transport-report/update/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Transporter Name',
      dataIndex: 'transporter_name',
      key: 'transporter_name',
      //   render: (text, record) => (
      //     <Link to={`/accounts/purchase-bill/update/${record.id}`}>
      //       {text ? moment(Number(text)).format('Do MMM YYYY') : '-'}
      //     </Link>
      //   ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: 'Vehicle Number',
      dataIndex: 'vehicle_number',
      key: 'vehicle_number',
      //   render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Contact Number',
      dataIndex: 'contact_number',
      key: 'contact_number',
    },
    {
      title: 'Eway Bill',
      dataIndex: 'e_way_bill',
      key: 'e_way_bill',
    },
    {
      title: 'FIRC Copy Status',
      dataIndex: 'firc_copy',
      key: 'firc_copy',
    },
    {
      title: 'FIRC DOC NO.',
      dataIndex: 'firc_doc_number',
      key: 'firc_doc_number',
      //   render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Booking Date',
      dataIndex: 'booking_date',
      key: 'booking_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Shipping Bill no.',
      dataIndex: 'shipping_bill_number',
      key: 'shipping_bill_number',
    },
    {
      title: 'MM Copy Status',
      dataIndex: 'mm_copy_status',
      key: 'mm_copy_status',
    },
    {
      title: 'Invoice Creation Date',
      dataIndex: 'invoice_creation_date',
      key: 'invoice_creation_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Vc Invoice Creation Status ',
      dataIndex: 'vc_inv_creation_status',
      key: 'vc_inv_creation_status',
    },
  ]

  if (!permissions.includes('readTransportReport')) return <Error403 />
  if (transportReportError)
    return `Error occured while fetching data: ${transportReportError.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`

  return (
    <div>
      <Helmet title="Transpor Report" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>TRANSPORT REPORT</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createTransportReport') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/accounts/transport-report/create">
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
                      <Option key={1} value="Not Recieved">
                        Not Recieved
                      </Option>
                      <Option key={3} value="Recieved">
                        Recieved
                      </Option>
                    </Select>
                  </div>

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
                </div>
              </div>
              <div className="card-body">
                <div className="kit__utils__table mt-4">
                  <Table
                    columns={tableColumns}
                    dataSource={transportReportLists}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Transport Report Found</h5>
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
                      // setOffset(0)
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
