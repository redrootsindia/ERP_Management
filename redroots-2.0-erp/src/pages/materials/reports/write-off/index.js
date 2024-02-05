import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin, Pagination, DatePicker, Input, Select } from 'antd'
import moment from 'moment'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import MATERIAL_WRITE_OFFS from './queries'

const { RangePicker } = DatePicker
const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const WriteOffs = ({ user: { permissions } }) => {
  const [writeOffsList, setWriteOffsList] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [searchString, setSearchString] = useState('')
  const [sortBy, setSortBy] = useState('dateDesc')
  const [createdAtFilter, setCreatedAtFilter] = useState([])

  const { loading: writeOffLoad, error: writeOffErr, data: writeOffData } = useQuery(
    MATERIAL_WRITE_OFFS,
    {
      variables: { limit, offset, createdAtFilter, sortBy, searchString },
    },
  )

  useEffect(() => {
    if (
      !writeOffLoad &&
      writeOffData &&
      writeOffData.materialWriteOffs &&
      writeOffData.materialWriteOffs.rows &&
      writeOffData.materialWriteOffs.rows.length
    ) {
      setWriteOffsList(writeOffData.materialWriteOffs.rows)
      setRecordCount(writeOffData.materialWriteOffs.count)
    }
  }, [writeOffData, writeOffLoad])

  const tableColumns = [
    {
      title: 'Written-Off On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Category',
      dataIndex: 'material_category',
      key: 'material_category',
    },
    {
      title: 'Sub-Category',
      dataIndex: 'material_subcategory',
      key: 'material_subcategory',
    },
    {
      title: 'P.O. #',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
      render: (text) => text || '-',
    },
    {
      title: 'Batch #',
      dataIndex: 'material_inward_batch_id',
      key: 'material_inward_batch_id',
    },
    {
      title: 'Material Code',
      dataIndex: 'material_code',
      key: 'material_code',
    },
    {
      title: 'Stock Written-Off',
      dataIndex: 'written_off_quantity',
      key: 'written_off_quantity',
    },

    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Written-Off By',
      dataIndex: 'user_name',
      key: 'user_name',
    },
  ]

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  if (!permissions.includes('readWriteOff')) return <Error403 />
  if (writeOffErr) return `Error occured while fetching data: ${writeOffErr.message}`

  return (
    <div>
      <Helmet title="Material Write-Offs" />

      <Spin spinning={writeOffLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-4">
                  <strong> MATERIAL WRITE-OFFS</strong>
                </h5>

                <div className="row">
                  <div className="col-lg-3 custom-pad-r0">
                    <RangePicker
                      allowClear={false}
                      id="date"
                      style={{ width: '100%' }}
                      placeholder={['Starting Date', 'Ending Date']}
                      onChange={(value, dateString) => {
                        setCreatedAtFilter(dateString)
                      }}
                    />
                  </div>
                  <div className="col-lg-6 custom-pad-r0">
                    <Select
                      key="sortBy"
                      value={sortBy || 'dateDesc'}
                      style={{ width: '50%' }}
                      placeholder="Sort by  Date - Latest first"
                      onChange={(value) => setSortBy(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="dateDesc" value="dateDesc">
                        Sort by created Date - Latest first
                      </Option>
                      <Option key="dateAsc" value="dateAsc">
                        Sort by created Date - Oldest first
                      </Option>
                      <Option key="categoryAsc" value="categoryAsc">
                        Sort by Material Category - Ascending
                      </Option>
                      <Option key="categoryDesc" value="categoryDesc">
                        Sort by Material Category - Descending
                      </Option>
                      <Option key="subcategoryAsc" value="subcategoryAsc">
                        Sort by Material sub-category - Ascending
                      </Option>
                      <Option key="subcategoryDesc" value="subcategoryDesc">
                        Sort by Material sub-category - Descending
                      </Option>
                      <Option key="purchaseOrderIDAsc" value="purchaseOrderIDAsc">
                        Sort by Purchase Order - Ascending
                      </Option>
                      <Option key="purchaseOrderIDDesc" value="purchaseOrderIDDesc">
                        Sort by Purchase Order - Descending
                      </Option>
                      <Option key="materialCodeAsc" value="materialCodeAsc">
                        Sort by Material Code - Ascending
                      </Option>
                      <Option key="materialCodeDesc" value="materialCodeDesc">
                        Sort by Material Code - Descending
                      </Option>
                    </Select>
                  </div>
                  <div className="col-lg-3 custom-pad-r0">
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
                    dataSource={writeOffsList}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Write-Offs Found</h5>
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

export default withRouter(connect(mapStateToProps)(WriteOffs))
