import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import { capitalize, debounce } from 'lodash'
import { useQuery, useMutation } from '@apollo/client'
import {
  Button,
  Table,
  Spin,
  Pagination,
  Tooltip,
  Popconfirm,
  Tag,
  notification,
  Space,
  Input,
} from 'antd'
import {
  SyncOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import Error403 from 'components/Errors/403'
import { PUT_AWAYS, CHANGE_STATUS, CHANGE_PROCESSING_STATE } from './queries'
import GRNDownload from './grnDownload'

const mapStateToProps = ({ user }) => ({ user })

const PutAwaysTab = ({ user: { permissions }, statusType, search }) => {
  const tagColor = (status) => {
    switch (status) {
      case 'pending':
        return 'default'
      case 'partial':
        return 'purple'
      case 'completed':
        return 'success'
      case 'closed':
        return 'error'
      default:
        return 'default'
    }
  }

  const canUpdate = permissions.includes('updatePutAway')

  const [putAways, setPutAways] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)

  const [changeStatus] = useMutation(CHANGE_STATUS)
  const [changeProcessingState] = useMutation(CHANGE_PROCESSING_STATE)
  const [searchString, setSearchString] = useState('')

  const debouncedInputSearch = debounce((value) => {
    // console.log('value =', value)
    setSearchString(value)
  }, 500)
  const { loading, error, data, refetch } = useQuery(PUT_AWAYS, {
    variables: { statusType, limit, offset, searchString },
  })

  useEffect(() => {
    if (!loading && data && data.putAways && data.putAways.rows && data.putAways.rows.length) {
      setPutAways(data.putAways.rows)
      setRecordCount(data.putAways.count)
    }
  }, [data, loading, statusType])

  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '5%',
    },
    {
      title: 'Created On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '12%',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'P.O. #',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
      width: '7%',
      render: (text) => <Link to={`/purchase-orders/product/update/${text}`}>{text}</Link>,
    },
    {
      title: 'P.O. Qty',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: '7%',
    },
    {
      title: 'Scanned Qty.',
      dataIndex: 'scanned_quantity',
      key: 'scanned_quantity',
      width: '14%',
    },
    {
      title: 'Pending Qty.',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: '14%',
      render: (text, record) => `${text - record.scanned_quantity}`,
    },
    // {
    //   title: 'Scanned Qty.',
    //   dataIndex: 'scanned_quantity',
    //   key: 'scanned_quantity',
    //   width: '14%',
    //   render: (text, record) => `${text} / ${record.total_quantity}`,
    // },
    // {
    //   title: 'Pending Qty.',
    //   dataIndex: 'total_quantity',
    //   key: 'total_quantity',
    //   width: '14%',
    //   render: (text, record) => `${text - record.scanned_quantity} / ${text}`,
    // },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '16%',
      render: (status, { in_progress }) => (
        <Tag
          style={{ fontSize: '1rem', padding: '4px' }}
          icon={
            in_progress ? (
              <SyncOutlined spin />
            ) : status === 'pending' ? (
              <ClockCircleOutlined />
            ) : status === 'partial' ? (
              <ExclamationCircleOutlined />
            ) : status === 'completed' ? (
              <CheckCircleOutlined />
            ) : status === 'closed' ? (
              <MinusCircleOutlined />
            ) : null
          }
          color={in_progress ? 'processing' : tagColor(status)}
        >
          {in_progress
            ? 'Processing'
            : status === 'partial'
            ? 'Partially Completed'
            : capitalize(status)}
        </Tag>
      ),
    },
  ]

  if (canUpdate)
    tableColumns.push({
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (text, { id, status, in_progress }) =>
        canUpdate ? (
          status === 'pending' || status === 'partial' || status === 'processing' ? (
            <Space size="middle">
              <Tooltip
                title={
                  !in_progress && (status === 'pending' || status === 'partial')
                    ? 'Scan & put items on shelves'
                    : null
                }
              >
                <Link to={`/inventory/put-aways/form/${id}`}>
                  <Button
                    type="primary"
                    disabled={in_progress || (status !== 'pending' && status !== 'partial')}
                    onClick={() =>
                      changeProcessingState({
                        variables: { id, in_progress: true },
                      }).catch((err) => console.log('Error occured: ', err))
                    }
                  >
                    {status === 'partial' ? 'Resume' : 'Put Away'}
                  </Button>
                </Link>
              </Tooltip>

              {in_progress ? (
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
                  disabled={!in_progress}
                  onConfirm={() =>
                    changeProcessingState({ variables: { id, in_progress: false } })
                      .then((res) => {
                        if (res) {
                          notification.success({
                            description: 'Put away successfully unblocked',
                          })
                          refetch()
                        }
                      })
                      .catch((err) => console.log('Error occured: ', err))
                  }
                >
                  <Button type="link" danger disabled={!in_progress}>
                    Unblock
                  </Button>
                </Popconfirm>
              ) : (
                <Popconfirm
                  title="Are you sure to 'Force Close' this put-away?"
                  okText="Yes"
                  cancelText="No"
                  disabled={in_progress || (status !== 'pending' && status !== 'partial')}
                  onConfirm={() =>
                    changeStatus({ variables: { id, status: 'closed' } })
                      .then((res) => {
                        if (res) {
                          notification.success({ description: 'Put away successfully closed' })
                          refetch()
                        }
                      })
                      .catch((err) => console.log('Error occured: ', err))
                  }
                >
                  <Button
                    danger
                    disabled={in_progress || (status !== 'pending' && status !== 'partial')}
                  >
                    Close
                  </Button>
                </Popconfirm>
              )}
            </Space>
          ) : status === 'completed' || status === 'closed' ? (
            <Space size="middle">
              <Tooltip
                title={
                  status === 'completed' || status === 'closed'
                    ? 'View or Edit items on shelves in non-scanner mode'
                    : null
                }
              >
                <Link to={`/inventory/put-aways/form/${id}`}>
                  <Button
                    type="primary"
                    disabled={status !== 'completed' && status !== 'closed'}
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
              <GRNDownload id={id} />
            </Space>
          ) : null
        ) : (
          '-'
        ),
    })

  if (!permissions.includes('readPutAway')) return <Error403 />
  if (error) return `Error occured while fetching data: ${error.message}`

  return (
    <>
      {search && (
        <div className="col-lg-3 mb-2 ml-auto">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search"
            onChange={({ target: { value } }) => debouncedInputSearch(value)}
            allowClear
          />
        </div>
      )}
      <div>
        <Spin spinning={loading} tip="Loading..." size="large">
          <div className="card-body" style={{ padding: '0px' }}>
            <div className="kit__utils__table">
              <Table
                columns={tableColumns}
                dataSource={putAways}
                pagination={false}
                rowKey={(record) => String(record.id)}
                locale={{
                  emptyText: (
                    <div className="custom-empty-text-parent">
                      <div className="custom-empty-text-child">
                        <i className="fe fe-search" />
                        <h5>No Put-Aways Found</h5>
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
        </Spin>
      </div>
    </>
  )
}

export default withRouter(connect(mapStateToProps)(PutAwaysTab))
