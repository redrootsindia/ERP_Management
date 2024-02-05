import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin } from 'antd'
import Error403 from 'components/Errors/403'
import BRAND_WISE_PURCHASE_ORDER from './queries'

const mapStateToProps = ({ user }) => ({ user })

const SummaryDashboard = ({ user: { permissions }, dashboardProp }) => {
  const [brandWisePOList, setBrandWisePOList] = useState([])
  const {
    loading: brandWisePOLoad,
    error: brandWisePOErr,
    data: brandWisePOData,
  } = useQuery(BRAND_WISE_PURCHASE_ORDER)

  useEffect(() => {
    if (
      !brandWisePOLoad &&
      brandWisePOData &&
      brandWisePOData.brandWiseListPurchaseOrder &&
      brandWisePOData.brandWiseListPurchaseOrder.length
    )
      setBrandWisePOList(brandWisePOData.brandWiseListPurchaseOrder)
  }, [brandWisePOData, brandWisePOLoad])

  //   const [currentPage, setCurrentPage] = useState(1)
  //   const [pageSize, setPageSize] = useState(20)
  //   const [recordCount, setRecordCount] = useState(0)
  //   const [limit, setLimit] = useState(20)
  //   const [offset, setOffset] = useState(0)

  const tableColumns = [
    {
      title: 'Brand',
      dataIndex: 'name',
      key: 'name',
      width: 50,
      render: (text) => text || '-',
    },
    {
      title: 'Draft',
      width: 100,
      children: [
        {
          title: 'Count',
          dataIndex: 'draft_count',
          key: 'draft_count',
          render: (text, record) => {
            console.log('text =', record)
            return {
              props: {
                style: {
                  background: '#bdddf9b5',
                  color: 'black',
                },
              },
              children: (
                <Link to={`/purchase-orders/product?status=Draft&brandIDs=${record.brand_id}`}>
                  {text || 0}
                </Link>
              ),
            }
          },
        },
        {
          title: 'P.O. Value',
          dataIndex: 'draft_value',
          key: 'draft_value',

          render: (text, record) => {
            return {
              props: {
                style: {
                  background: '#bdddf9b5',
                  color: 'black',
                },
              },
              children: (
                <Link to={`/purchase-orders/product?status=Draft&brandIDs=${record.brand_id}`}>
                  {text || 0}
                </Link>
              ),
            }
          },
        },
      ],
    },
    {
      title: 'In Prgress',
      children: [
        {
          title: 'Count',
          dataIndex: 'progress_count',
          key: 'progress_count',
          render: (text, record) => {
            return {
              props: {
                style: {
                  background: '#ffe7bb',
                  color: 'black',
                },
              },
              children: (
                <Link
                  to={`/purchase-orders/product?status=In Progress&brandIDs=${record.brand_id}`}
                >
                  {text || 0}
                </Link>
              ),
            }
          },
        },
        {
          title: 'P.O. Value',
          dataIndex: 'progress_value',
          key: 'progress_value',

          render: (text, record) => {
            return {
              props: {
                style: {
                  background: '#ffe7bb',
                  color: 'black',
                },
              },
              children: (
                <Link
                  to={`/purchase-orders/product?status=In Progress&brandIDs=${record.brand_id}`}
                >
                  {text || 0}
                </Link>
              ),
            }
          },
        },
      ],
    },
    {
      title: 'Assigned',
      children: [
        {
          title: 'Count',
          dataIndex: 'assigned_count',
          key: 'assigned_count',

          render: (text, record) => {
            return {
              props: {
                style: {
                  background: '#ffefef',
                  color: 'black',
                },
              },
              children: (
                <Link to={`/purchase-orders/product?status=Assigned&brandIDs=${record.brand_id}`}>
                  {text || 0}
                </Link>
              ),
            }
          },
        },
        {
          title: 'P.O. Value',
          dataIndex: 'assigned_value',
          key: 'assigned_value',

          render: (text, record) => {
            return {
              props: {
                style: {
                  background: '#ffefef',
                  color: 'black',
                },
              },
              children: (
                <Link to={`/purchase-orders/product?status=Assigned&brandIDs=${record.brand_id}`}>
                  {text || 0}
                </Link>
              ),
            }
          },
        },
      ],
    },
    {
      title: 'Closed',
      children: [
        {
          title: 'Count',
          dataIndex: 'closed_count',
          key: 'closed_count',

          render: (text) => {
            return {
              props: {
                style: {
                  background: '#ef7a7a',
                  color: 'black',
                },
              },
              children: <b>{text || 0}</b>,
            }
          },
        },
        {
          title: 'P.O. Value',
          dataIndex: 'closed_value',
          key: 'closed_value',

          render: (text) => {
            return {
              props: {
                style: {
                  background: '#ef7a7a',
                  color: 'black',
                },
              },
              children: <b>{text || 0}</b>,
            }
          },
        },
      ],
    },
    {
      title: 'Force Closed',
      children: [
        {
          title: 'Count',
          dataIndex: 'force_closed_count',
          key: 'force_closed_count',

          render: (text) => {
            return {
              props: {
                style: {
                  background: '#d3e68cb5',
                  color: 'black',
                },
              },
              children: <b>{text || 0}</b>,
            }
          },
        },
        {
          title: 'P.O. Value',
          dataIndex: 'force_closed_value',
          key: 'force_closed_value',

          render: (text) => {
            return {
              props: {
                style: {
                  background: '#d3e68cb5',
                  color: 'black',
                },
              },
              children: <b>{text || 0}</b>,
            }
          },
        },
      ],
    },
    {
      title: 'Rejected By Vendor',
      children: [
        {
          title: 'Count',
          dataIndex: 'rejected_by_vendor_count',
          key: 'rejected_by_vendor_count',

          render: (text, record) => {
            return {
              props: {
                style: {
                  background: '#e70f23c2',
                  color: 'black',
                  hover: 'white',
                },
              },
              children: (
                <Link
                  to={`/purchase-orders/product?status=Rejected by Vendor&brandIDs=${record.brand_id}`}
                >
                  {text || 0}
                </Link>
              ),
            }
          },
        },
        {
          title: 'P.O. Value',
          dataIndex: 'rejected_by_vendor_value',
          key: 'rejected_by_vendor_value',

          render: (text, record) => {
            return {
              props: {
                style: {
                  background: '#e70f23c2',
                  color: 'black',
                },
              },
              children: (
                <Link
                  to={`/purchase-orders/product?status=Rejected by Vendor&brandIDs=${record.brand_id}`}
                >
                  {text || 0}
                </Link>
              ),
            }
          },
        },
      ],
    },
  ]
  if (dashboardProp) {
    tableColumns.splice(4, 2)
  }

  if (!permissions.includes('readSummaryDashboard')) return <Error403 />
  if (brandWisePOErr) return `Error occured while fetching data: ${brandWisePOErr.message}`

  return (
    <div>
      <Helmet title="Production Summary" />

      <Spin spinning={brandWisePOLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-4">
                  <strong>Brand Wise Purchase Order Summary </strong>
                </h5>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={brandWisePOList}
                    pagination={false}
                    onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                    rowKey={(record) => String(record.brand_id)}
                    bordered
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Brand wise P.O. Found</h5>
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
export default withRouter(connect(mapStateToProps)(SummaryDashboard))
