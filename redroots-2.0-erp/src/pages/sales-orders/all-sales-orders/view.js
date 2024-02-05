import React, { useState, useEffect } from 'react'
import { withRouter, Link, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin, Button, Image, Row, Col } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import moment from 'moment'
import Error403 from 'components/Errors/403'

import { SALES_ORDER } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const ViewSalesOrder = ({ user: { permissions } }) => {
  const { id } = useParams()
  const [salesOrder, setSalesOrder] = useState([])
  const [salesOrderDataList, setSalesOrderDataList] = useState([])

  const {
    loading: salesOrderLoad,
    error: salesOrderErr,
    data: salesOrderData,
  } = useQuery(SALES_ORDER, { variables: { id } })

  useEffect(() => {
    if (!salesOrderLoad && salesOrderData && salesOrderData.salesOrder) {
      setSalesOrder(salesOrderData.salesOrder)
      setSalesOrderDataList(salesOrderData.salesOrder.sales_order_data)
    } else {
      setSalesOrderDataList([])
      setSalesOrder([])
    }
  }, [salesOrderData, salesOrderLoad])

  const tableColumns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + image}
            height={image ? 35 : 20}
            width={image ? 35 : 20}
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'variant_code',
      key: 'variant_code',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      render: (text) => {
        const curr = text
          ? text.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
          : null
        return curr ? `${curr.slice(0, 1)} ${curr.slice(1)}` : '-'
      },
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      render: (text, record) => {
        if (record.unit_cost) {
          const total = record.unit_cost * record.quantity
          const curr = total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
          return `${curr.slice(0, 1)} ${curr.slice(1)}`
        }
        return '-'
      },
    },
  ]

  if (!permissions.includes('readSalesOrder')) return <Error403 />
  if (salesOrderErr) return `Error occured while fetching data: ${salesOrderErr.message}`

  return (
    <div>
      <Helmet title="Sales Order Detail" />
      <Spin spinning={salesOrderLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-4">
                  <strong>Sales Order Detail</strong>
                </h5>

                <Row>
                  <Col span={12}>
                    <Row>
                      <Col span={4}>
                        <strong>Sales Order # :</strong>
                      </Col>
                      <Col span={19}>&nbsp;{salesOrder.id}</Col>
                    </Row>
                    <Row>
                      <Col span={4}>
                        <strong>Buyer PO # :</strong>
                      </Col>
                      <Col span={19}>&nbsp;{salesOrder.name}</Col>
                    </Row>
                  </Col>
                </Row>
              </div>

              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-lg-6">
                    <div className="row">
                      <div className="col-lg-4">
                        <strong>Status : </strong>
                      </div>
                      <div className="col-lg-6">{salesOrder.status}</div>
                    </div>
                    <div className="row">
                      <div className="col-lg-4">
                        <strong>Buyer : </strong>
                      </div>
                      <div className="col-lg-6">{salesOrder.buyer_name}</div>
                    </div>
                    <div className="row">
                      <div className="col-lg-4">
                        <strong>Buyer Group : </strong>
                      </div>
                      <div className="col-lg-6">{salesOrder.buyer_group_name}</div>
                    </div>
                    <div className="row">
                      <div className="col-lg-4">
                        <strong>Created On : </strong>
                      </div>
                      <div className="col-lg-6">
                        {moment(Number(salesOrder.createdAt)).format('Do MMM YYYY') || '-'}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-4">
                        <strong>Expected Delivery : </strong>
                      </div>
                      <div className="col-lg-6">
                        {salesOrder.expected_delivery_date
                          ? moment(Number(salesOrder.expected_delivery_date)).format('Do MMM YYYY')
                          : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 text-right ">
                    <Link to={`/sales-orders/all/generate-picklist/${id}`}>
                      <Button type="primary">Generate Pick List</Button>
                    </Link>
                  </div>
                </div>
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={salesOrderDataList}
                    pagination={{
                      defaultPageSize: 20,
                      showSizeChanger: true,
                      pageSizeOptions: ['20', '40', '60'],
                    }}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Sales Order Data Found</h5>
                          </div>
                        </div>
                      ),
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

export default withRouter(connect(mapStateToProps)(ViewSalesOrder))
