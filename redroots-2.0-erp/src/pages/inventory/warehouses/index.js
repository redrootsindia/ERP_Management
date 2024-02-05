import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Button, Table, Spin, Switch, notification } from 'antd'
import Error403 from 'components/Errors/403'
import { WAREHOUSES, CHANGE_STATUS } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const Warehouses = ({ user: { permissions } }) => {
  const [warehouses, setWarehouses] = useState([])

  const [changeStatus] = useMutation(CHANGE_STATUS)
  const { loading, error, data } = useQuery(WAREHOUSES)

  useEffect(() => {
    if (data && data.warehouses && data.warehouses.length) setWarehouses(data.warehouses)
  }, [data])

  const tableColumns = [
    {
      title: 'Warehouse Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/inventory/warehouses/update/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (text, record) => (
        <Link to={`/inventory/warehouses/update/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) =>
        permissions.includes('updateWarehouse') ? (
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
            disabled={!permissions.includes('updateWarehouse')}
          />
        ) : active ? (
          'Yes'
        ) : (
          'No'
        ),
    },
  ]

  if (!permissions.includes('readWarehouse')) return <Error403 />
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <div>
      <Helmet title="Warehouses" />

      <Spin spinning={loading} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>WAREHOUSES</strong>
                </h5>
                {permissions.includes('createWarehouse') ? (
                  <Link to="/inventory/warehouses/create">
                    <Button type="primary">Create</Button>
                  </Link>
                ) : null}
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={warehouses}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Warehouses Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                  />
                  {/* <Pagination
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
                  /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(Warehouses))
