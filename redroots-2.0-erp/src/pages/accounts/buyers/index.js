import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Select, Button, Table, Spin, Switch, Pagination, notification } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import { BUYERS, CHANGE_STATUS } from './queries'
import { BUYER_GROUPS } from '../../settings/buyer-settings/buyer-groups/queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const Buyers = ({ user: { permissions } }) => {
  const [buyerGroupIDs, setBuyerGroupIDs] = useState([])
  const [buyerGroupsList, setBuyerGroupsList] = useState([])
  const [buyers, setBuyers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [sortBy, setSortBy] = useState('nameAsc')
  const [statusFilter, setStatusFilter] = useState(null)
  const [searchString, setSearchString] = useState('')

  const [changeStatus] = useMutation(CHANGE_STATUS)
  const { loading: bgLoad, error: bgErr, data: bgData } = useQuery(BUYER_GROUPS)
  const { loading: buyerLoad, error: buyerErr, data: buyerData } = useQuery(BUYERS, {
    variables: { buyerGroupIDs, statusFilter, searchString, sortBy, limit, offset },
  })

  useEffect(() => {
    if (
      !buyerLoad &&
      buyerData &&
      buyerData.buyers &&
      buyerData.buyers.rows &&
      buyerData.buyers.rows.length
    ) {
      setBuyers(buyerData.buyers.rows)
      setRecordCount(buyerData.buyers.count)
    }
  }, [buyerData, buyerLoad])

  useEffect(() => {
    if (!bgLoad && bgData && bgData.buyerGroups && bgData.buyerGroups.length)
      setBuyerGroupsList(bgData.buyerGroups)
  }, [bgData, bgLoad])

  const tableColumns = [
    {
      title: 'Buyer Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/accounts/buyers/update/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Buyer Group',
      dataIndex: 'buyer_group',
      key: 'buyer_group',
      render: (text) => <Link to="/settings/buyer-settings/buyer-groups">{text}</Link>,
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
      title: 'Payment Term',
      dataIndex: 'payment_term',
      key: 'payment_term',
    },
    {
      title: 'Payment Term Post-GRN',
      dataIndex: 'payment_term_post_grn',
      key: 'payment_term_post_grn',
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) =>
        permissions.includes('updateBuyer') ? (
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
            disabled={!permissions.includes('updateBuyer')}
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

  if (!permissions.includes('readBuyer')) return <Error403 />
  if (bgErr) return `Error occured while fetching data: ${bgErr.message}`
  if (buyerErr) return `Error occured while fetching data: ${buyerErr.message}`

  return (
    <div>
      <Helmet title="Buyers" />

      <Spin spinning={buyerLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>BUYERS</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createBuyer') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/accounts/buyers/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}

                  <div className="col-lg-9 custom-pad-r0">
                    <Select
                      mode="multiple"
                      value={buyerGroupIDs || []}
                      style={{ width: '25%' }}
                      onChange={(value) => setBuyerGroupIDs(value)}
                      placeholder="Filter by Buyer groups"
                      className="custom-pad-r1"
                    >
                      {buyerGroupsList && buyerGroupsList.length
                        ? buyerGroupsList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>

                    <Select
                      key="statusFilter"
                      value={statusFilter || null}
                      style={{ width: '20%' }}
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
                      style={{ width: '30%' }}
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
                    dataSource={buyers}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Buyers Found</h5>
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

export default withRouter(connect(mapStateToProps)(Buyers))
