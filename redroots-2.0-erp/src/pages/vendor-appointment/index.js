import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Input, Select, Button, Table, Spin, Pagination } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import { VENDOR_APPOINTMENTS } from './query'
import { BRANDS } from '../purchase-orders/product/queries'

const mapStateToProps = ({ user }) => ({ user })

const VendorAppointment = ({ user: { permissions } }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [searchString, setSearchString] = useState('')
  const [brandIDs, setBrandIDs] = useState([])
  const [vendorappointments, setVendorappointments] = useState([])
  const [brandNames, setBrandName] = useState([])
  // const debouncedBrandSearch = debounce((value) => setBuyerSearchString(value), 500)
  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length) {
      setBrandName(brandData.brands)
    }
  }, [brandLoad, brandData])

  const {
    loading: vendorappointmentLoad,
    error: vendorappointmentError,
    data: vendorappointmentData,
  } = useQuery(VENDOR_APPOINTMENTS, {
    variables: { searchString, brandIDs, limit, offset },
  })
  useEffect(() => {
    if (
      !vendorappointmentLoad &&
      vendorappointmentData &&
      vendorappointmentData.vendorAppointments &&
      vendorappointmentData.vendorAppointments.rows &&
      vendorappointmentData.vendorAppointments.rows.length
    ) {
      setVendorappointments(vendorappointmentData.vendorAppointments.rows)
      setRecordCount(vendorappointmentData.vendorAppointments.count)
    } else {
      setVendorappointments([])
      setRecordCount(0)
    }
  }, [vendorappointmentLoad, vendorappointmentData])

  const tableColumns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => <Link to={`/vendor-appointmnet/update/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Appointment Date',
      dataIndex: 'appointment_date',
      key: 'appointment_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Appointment Time',
      dataIndex: 'appointment_time',
      key: 'appointment_time',
      render: (text) => moment(Number(text)).format('h:mm a'),
      //   render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Dispatch Date',
      dataIndex: 'dispatch_date',
      key: 'dispatch_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Shipped From',
      dataIndex: 'shipped_from',
      key: 'shipped_from',
    },

    {
      title: 'Shipping Destination',
      dataIndex: 'shipping_destination',
      key: 'shipping_destination',
    },
    {
      title: 'Shipping Status',
      dataIndex: 'shipping_status',
      key: 'shipping_status',
    },
  ]

  if (!permissions.includes('readVendorAppointment')) return <Error403 />
  if (vendorappointmentError)
    return `Error occured while fetching data: ${vendorappointmentError.message}`
  //   if (buyerErr) return `Error occured while fetching data: ${buyerErr.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`

  return (
    <div>
      <Helmet title="Vendor Appointmnets" />
      <Spin spinning={vendorappointmentLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>VENDOR APPOINTMENT</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createVendorAppointment') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/vendor-appointmnet/create">
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
                    dataSource={vendorappointments}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Vendor Appointment Found</h5>
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

export default withRouter(connect(mapStateToProps)(VendorAppointment))
