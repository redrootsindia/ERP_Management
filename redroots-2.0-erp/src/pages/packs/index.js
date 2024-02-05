import React, { useState, useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Table, Spin, Pagination, DatePicker, Input, Button, Switch, notification } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import { PACKS, CHANGE_STATUS } from './queries'

const { RangePicker } = DatePicker

const mapStateToProps = ({ user }) => ({ user })

const Packs = ({ user: { permissions } }) => {
  const [packs, setPacks] = useState(undefined)

  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)

  const [searchString, setSearchString] = useState('')
  const [createdAtFilter, setCreatedAtFilter] = useState([])

  const { loading: packsLoad, error: packsErr, data: packsData } = useQuery(PACKS, {
    variables: { limit, offset, createdAtFilter, searchString },
  })

  const [changeStatus] = useMutation(CHANGE_STATUS)

  useEffect(() => {
    if (
      !packsLoad &&
      packsData &&
      packsData.packs &&
      packsData.packs.rows &&
      packsData.packs.rows.length
    ) {
      setPacks(packsData.packs.rows)
      setRecordCount(packsData.packs.count)
    }
  }, [packsData, packsLoad])

  const tableColumns = [
    {
      title: 'Pack Size',
      dataIndex: 'pack_of',
      key: 'pack_of',
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
    },
    {
      title: 'Sub Category',
      dataIndex: 'sub_category_name',
      key: 'sub_category_name',
    },
    {
      title: 'Products',
      dataIndex: 'products',
      key: 'products',
      render: (products) =>
        products && products.length
          ? products.map((type, i) => {
              if (i === products.length - 1) return type
              return `${type} | `
            })
          : null,
    },
    {
      title: 'Vendors',
      dataIndex: 'vendors',
      key: 'vendors',
      render: (vendors) =>
        vendors && vendors.length
          ? vendors.map((type, i) => {
              if (i === vendors.length - 1) return type
              return `${type} | `
            })
          : null,
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) =>
        permissions.includes('updatePack') ? (
          <Switch
            defaultChecked={active}
            onChange={(checked) =>
              changeStatus({ variables: { id: record.id, status: checked } })
                .then(() =>
                  notification.success({
                    description: <span>Status changed successfully</span>,
                  }),
                )
                .catch((err) => {
                  notification.error({
                    message: 'Error occured while changing status.',
                    description: err.message || 'Please contact system administrator.',
                  })
                })
            }
            disabled={!permissions.includes('updatePack')}
          />
        ) : active ? (
          'Yes'
        ) : (
          'No'
        ),
    },
    {
      title: '',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <Link to={`/packs/update/${id}`}>
          <Button type="primary">View / Edit</Button>
        </Link>
      ),
    },
  ]

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  if (!permissions.includes('readPack')) return <Error403 />
  if (packsErr) return `Error occured while fetching data: ${packsErr.message}`

  return (
    <div>
      <Helmet title="Packs" />

      <Spin spinning={packsLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>Packs</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createProduct') ? (
                    <div className="col-lg-2 custom-pad-r0 text-align-right">
                      <Link to="/packs/create">
                        <Button type="primary w-100">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                  <div className="col-lg-7">
                    <RangePicker
                      allowClear={false}
                      id="date"
                      format="YYYY-MM-DD"
                      placeholder={['Starting Date', 'Ending Date']}
                      onChange={(value, dateString) => setCreatedAtFilter(dateString)}
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
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={packs}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Packs Found</h5>
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

export default withRouter(connect(mapStateToProps)(Packs))
