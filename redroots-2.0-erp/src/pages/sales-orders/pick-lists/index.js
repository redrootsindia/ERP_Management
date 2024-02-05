import React, { useState, useEffect } from 'react'
import { withRouter, Link, useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import {
  Table,
  Spin,
  Pagination,
  DatePicker,
  Button,
  Input,
  Space,
  Tooltip,
  Checkbox,
  notification,
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import PODModal from './proofOfDelieveryModal'

import { PICK_LISTS, PACKAGING_STATUS } from './queries'

const { RangePicker } = DatePicker
const mapStateToProps = ({ user }) => ({ user })

const PickList = ({ user: { permissions } }) => {
  const querySearch = useLocation().search
  const pickListIDs =
    new URLSearchParams(querySearch).get('pickListIDs') !== null
      ? new URLSearchParams(querySearch).get('pickListIDs').split(',')
      : []
  const [pickList, setpickList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [searchString, setSearchString] = useState('')
  const [createdAtFilter, setCreatedAtFilter] = useState([])

  const [changePackagingStatus] = useMutation(PACKAGING_STATUS)

  const {
    loading: pickListsLoad,
    error: pickListsErr,
    data: pickListsData,
    refetch,
  } = useQuery(PICK_LISTS, {
    variables: { pickListIDs, createdAtFilter, searchString, limit, offset },
  })

  useEffect(() => {
    if (
      !pickListsLoad &&
      pickListsData &&
      pickListsData.pickLists &&
      pickListsData.pickLists.rows &&
      pickListsData.pickLists.rows.length
    ) {
      setpickList(pickListsData.pickLists.rows)
      setRecordCount(pickListsData.pickLists.count)
    }
  }, [pickListsData, pickListsLoad])

  const tableColumns = [
    {
      title: 'Pick List ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Against Sales Order',
      dataIndex: 'sales_order_name',
      key: 'sales_order_name',
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
      render: (text) => (text ? <span>{text}</span> : '-'),
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
    },
    {
      title: 'Total Qty. to Pick',
      dataIndex: 'total_quantity_to_pick',
      key: 'total_quantity_to_pick',
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'pick_list_status',
      key: 'pick_list_status',
      render: (text, record) =>
        text === 'pending'
          ? 'Yet to Scan & Pick'
          : text === 'partial'
          ? 'Partially Picked'
          : text === 'completed'
          ? !record.packaging_status || record.packaging_status === 'pending'
            ? 'Pick Completed, Yet to Package'
            : record.packaging_status === 'partial'
            ? 'Partially Packaged'
            : record.packaging_status === 'completed'
            ? 'Picked & Packed'
            : record.packaging_status === 'delivered'
            ? 'Delivered'
            : 'Packaging Cancelled'
          : 'Pick Cancelled',
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Space size="small">
          <Link to={`/sales-orders/pick-lists/scan/${record.id}`}>
            <Button type="primary" disabled={record.pick_list_status === 'completed'}>
              {record.pick_list_status === 'partial' ? 'Continue Picking' : 'Scan & Pick'}
            </Button>
          </Link>
          <Link to={`/sales-orders/pick-lists/generate-packaging-list/${record.id}`}>
            <Button
              type="primary"
              disabled={
                record.pick_list_status === 'pending' ||
                record.pick_list_status === 'partial' ||
                record.packaging_status === 'completed' ||
                record.packaging_status === 'delivered'
              }
            >
              {record.packaging_status === 'partial' ? 'Continue Packing' : 'Package'}
            </Button>
          </Link>
          <Link to={`/sales-orders/pick-lists/view/${record.id}`}>
            <Button type="primary">View / Edit</Button>
          </Link>
          {record.packaging_status === 'delivered' ? (
            <PODModal id={record.packaging_id} />
          ) : (
            <Tooltip title="Mark package as delivered">
              <Checkbox
                disabled={record.packaging_status !== 'completed'}
                checked={false}
                onChange={(value) => {
                  if (value) {
                    changePackagingStatus({
                      variables: { id: record.packaging_id, status: 'delivered' },
                    })
                      .then(() => {
                        notification.success({ description: 'Status Changed Successfully' })
                        refetch()
                      })
                      .catch((err) => {
                        notification.error({
                          message: 'Error occured while changing status.',
                          description: err.message || 'Please contact system administrator.',
                        })
                      })
                  }
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  if (!permissions.includes('readPickList')) return <Error403 />
  if (pickListsErr) return `Error occured while fetching data: ${pickListsErr.message}`

  return (
    <div>
      <Helmet title="Pick Lists" />

      <Spin spinning={pickListsLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-4">
                  <strong>Pick Lists</strong>
                </h5>

                <div className="row">
                  {/* {permissions.includes('createPickList') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/sales-orders/all/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null} */}

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
                    dataSource={pickList}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Pick Lists Found</h5>
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

export default withRouter(connect(mapStateToProps)(PickList))
