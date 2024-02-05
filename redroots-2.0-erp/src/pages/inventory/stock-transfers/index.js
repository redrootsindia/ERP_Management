import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import { capitalize } from 'lodash'
import { useQuery } from '@apollo/client'
import { Button, Table, Spin, Pagination, Tooltip, Popconfirm, Space, notification } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import Error403 from 'components/Errors/403'
import { STOCK_TRANSFERS } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const StockTranferPage = ({ user: { permissions } }) => {
  const canUpdate = permissions.includes('updateStockTransfer')

  const [stockTransfers, setStockTransfers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)

  console.log(notification)

  //   const [changeStatus] = useMutation(CHANGE_STATUS)

  const { loading, error, data } = useQuery(STOCK_TRANSFERS, { variables: { limit, offset } })

  useEffect(() => {
    if (
      !loading &&
      data &&
      data.stockTransfers &&
      data.stockTransfers.rows &&
      data.stockTransfers.rows.length
    ) {
      setStockTransfers(data.stockTransfers.rows)
      setRecordCount(data.stockTransfers.count)
    }
  }, [data, loading])

  const tableColumns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Outward Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '14%',
      render: (text) => moment(Number(text)).format('Do MMM YYYY'),
    },
    {
      title: 'From Warehouse',
      dataIndex: 'from_warehouse',
      key: 'from_warehouse',
      width: '16%',
    },
    {
      title: 'To Warehouse',
      dataIndex: 'to_warehouse',
      key: 'to_warehouse',
      width: '16%',
    },
    {
      title: 'Put Away Status',
      dataIndex: 'put_away_status',
      key: 'put_away_status',
      width: '16%',
      render: (put_away_status, { put_away_in_progress }) =>
        put_away_in_progress ? (
          <>
            <SyncOutlined spin />
            &ensp;Processing
          </>
        ) : put_away_status === 'partial' ? (
          'Partially Completed'
        ) : (
          capitalize(put_away_status)
        ),
    },
  ]

  if (canUpdate)
    tableColumns.push({
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (text, { id, put_away_status, put_away_in_progress }) =>
        canUpdate ? (
          <Space size="small">
            <Tooltip
              title={
                !put_away_in_progress &&
                (put_away_status === 'pending' || put_away_status === 'partial')
                  ? 'Scan & put items on shelves'
                  : null
              }
            >
              <Link to={`/inventory/put-aways/form/${id}`}>
                <Button
                  type="primary"
                  disabled={
                    put_away_in_progress ||
                    (put_away_status !== 'pending' && put_away_status !== 'partial')
                  }
                  // onClick={() => updatePutAwayStatus({
                  //   variables: {
                  //     mainTableId: id,
                  //     status: 1,
                  //     type: 0
                  // }})}
                >
                  {put_away_status === 'partial' ? 'Resume' : 'Put Away'}
                </Button>
              </Link>
            </Tooltip>
            {put_away_in_progress ? (
              <Popconfirm
                title={
                  <>
                    This put-away is in &quot;Processing&quot; state. Someone may be scanning the
                    items in this put-away right now.
                    <br />
                    Are you sure to unblock this put-away?
                  </>
                }
                okText="Yes"
                cancelText="No"
                disabled={!put_away_in_progress}
                // onConfirm={() =>
                // updatePutAwayStatus({
                //   variables: {
                //     mainTableId: id,
                //     status: 3,
                //     type: 0,
                //   },
                // })
                // }
              >
                <Button type="link" danger disabled={!put_away_in_progress}>
                  Unblock
                </Button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Are you sure to 'Force Close' this put-away?"
                okText="Yes"
                cancelText="No"
                disabled={
                  put_away_in_progress ||
                  (put_away_status !== 'pending' && put_away_status !== 'partial')
                }
                // onConfirm={() =>
                // updatePutAwayStatus({
                //   variables: {
                //     mainTableId: id,
                //     status: 3,
                //     type: 0,
                //   },
                // })
                // }
              >
                <Button
                  danger
                  disabled={
                    put_away_in_progress ||
                    (put_away_status !== 'pending' && put_away_status !== 'partial')
                  }
                >
                  Close
                </Button>
              </Popconfirm>
            )}
            <Tooltip
              title={
                put_away_status === 'completed' || put_away_status === 'closed'
                  ? 'View or Edit items on shelves in non-scanner mode'
                  : null
              }
            >
              <Link to={`/inventory/put-away/non-scanner/${id}`}>
                <Button
                  type="primary"
                  disabled={put_away_status !== 'completed' && put_away_status !== 'closed'}
                  // onClick={() => updatePutAwayStatus({
                  //   variables: {
                  //     mainTableId: id,
                  //     status: 1,
                  //     type: 0
                  // }})}
                >
                  View / Edit
                </Button>
              </Link>
            </Tooltip>
          </Space>
        ) : (
          '-'
        ),
    })

  if (!permissions.includes('readStockTransfer')) return <Error403 />
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <div>
      <Helmet title="Stock Transfers" />

      <Spin spinning={loading} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>STOCK TRANSFERS</strong>
                </h5>
                {permissions.includes('createStockTransfer') ? (
                  <Link to="/inventory/stock-transfers/create">
                    <Button type="primary">Create</Button>
                  </Link>
                ) : null}
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={stockTransfers}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Stock-Transfers Found</h5>
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

export default withRouter(connect(mapStateToProps)(StockTranferPage))
