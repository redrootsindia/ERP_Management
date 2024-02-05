import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Select, Button, Table, Spin, Image, Switch, Pagination, notification } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import { VENDORS, VENDOR_TYPES, CHANGE_STATUS } from './queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const Vendors = ({ user: { permissions } }) => {
  const [vendorTypeIDs, setVendorTypeIDs] = useState([])
  const [vendorTypesList, setVendorTypesList] = useState([])
  const [vendors, setVendors] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [sortBy, setSortBy] = useState('nameAsc')
  const [statusFilter, setStatusFilter] = useState(null)
  const [searchString, setSearchString] = useState('')

  const [changeStatus] = useMutation(CHANGE_STATUS)
  const { loading: vTypeLoad, error: vTypeErr, data: vTypeData } = useQuery(VENDOR_TYPES)
  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(VENDORS, {
    variables: { vendorTypeIDs, statusFilter, searchString, sortBy, limit, offset },
  })

  useEffect(() => {
    if (
      !vendorLoad &&
      vendorData &&
      vendorData.vendors &&
      vendorData.vendors.rows &&
      vendorData.vendors.rows.length
    ) {
      setVendors(vendorData.vendors.rows)
      setRecordCount(vendorData.vendors.count)
    } else {
      setVendors([])
      setRecordCount(0)
    }
  }, [vendorData, vendorLoad])

  useEffect(() => {
    if (!vTypeLoad && vTypeData && vTypeData.vendorTypes && vTypeData.vendorTypes.length)
      setVendorTypesList(vTypeData.vendorTypes)
  }, [vTypeData, vTypeLoad])

  const tableColumns = [
    {
      title: 'Profile Pic',
      dataIndex: 'profile_pic',
      key: 'profile_pic',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PROFILE_PIC_URL + image}
            height={image ? 35 : 20}
            width={image ? 35 : 20}
            alt="profile"
            fallback="resources/images/placeholder/profile.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/accounts/vendors/update/${record.id}`}>{text}</Link>,
    },
    {
      title: 'e-mail',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Vendor Types',
      dataIndex: 'vendor_types',
      key: 'vendor_types',
      render: (vendor_types) =>
        vendor_types && vendor_types.length
          ? vendor_types.map((type, i) => {
              if (i === vendor_types.length - 1) return type
              return `${type} | `
            })
          : null,
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) =>
        permissions.includes('updateVendor') ? (
          <Switch
            defaultChecked={active}
            onChange={(checked) =>
              changeStatus({ variables: { id: record.id, status: checked } })
                .then(() =>
                  notification.success({
                    description: (
                      <span>
                        Status of <strong>{record.name}</strong> changed successfully
                      </span>
                    ),
                  }),
                )
                .catch((err) => {
                  notification.error({
                    message: 'Error occured while changing status.',
                    description: err.message || 'Please contact system administrator.',
                  })
                })
            }
            disabled={!permissions.includes('updateVendor')}
          />
        ) : active ? (
          'Yes'
        ) : (
          'No'
        ),
    },
  ]

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  if (!permissions.includes('readVendor')) return <Error403 />
  if (vTypeErr) return `Error occured while fetching data: ${vTypeErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`

  return (
    <div>
      <Helmet title="Vendors" />

      <Spin spinning={vendorLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>VENDORS</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createVendor') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/accounts/vendors/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}

                  <div className="col-lg-9 custom-pad-r0">
                    <Select
                      mode="multiple"
                      value={vendorTypeIDs || []}
                      style={{ width: '20%' }}
                      onChange={(value) => setVendorTypeIDs(value)}
                      placeholder="Filter by vendor types"
                      className="custom-pad-r1"
                    >
                      {vendorTypesList && vendorTypesList.length
                        ? vendorTypesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.type}
                            </Option>
                          ))
                        : null}
                    </Select>

                    <Select
                      key="statusFilter"
                      value={statusFilter || null}
                      style={{ width: '14%' }}
                      placeholder="Filter by active"
                      onChange={(active) => setStatusFilter(active)}
                      className="custom-pad-r1"
                    >
                      <Option key={0} value={null}>
                        All statuses
                      </Option>
                      <Option key={1} value="active">
                        Active only
                      </Option>
                      <Option key={2} value="inactive">
                        Inactive only
                      </Option>
                    </Select>

                    <Select
                      key="sortBy"
                      value={sortBy || 'nameAsc'}
                      style={{ width: '25%' }}
                      placeholder="Sort by name - A to Z"
                      onChange={(value) => setSortBy(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="nameAsc" value="nameAsc">
                        Sort by name - A to Z
                      </Option>
                      <Option key="nameDesc" value="nameDesc">
                        Sort by name - Z to A
                      </Option>
                      <Option key="companyAsc" value="companyAsc">
                        Sort by company - A to Z
                      </Option>
                      <Option key="companyDesc" value="companyDesc">
                        Sort by company - Z to A
                      </Option>
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
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={vendors}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Vendors Found</h5>
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

export default withRouter(connect(mapStateToProps)(Vendors))
