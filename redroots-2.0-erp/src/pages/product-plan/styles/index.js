/* eslint no-unused-vars: off, no-undef:off */

import React, { useState, useEffect } from 'react'
import { Link, withRouter, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin, Pagination, DatePicker, Select, Button, Image } from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import moment from 'moment'
import { PRODUCT_PLAN_STYLES } from '../queries'

const { RangePicker } = DatePicker
const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const ProductPlanStyle = ({ user: { permissions } }) => {
  const { id, brand_id } = useParams()

  const [stylesList, setStylesist] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  // const [searchString, setSearchString] = useState('')
  // const [dateRange, setDateRange] = useState([])

  // const dateFilter = dateRange.map((e) => String(moment(e, 'Do MMM YYYY hh:mm:ss a').valueOf()))

  const {
    loading: productPlanStylesLoad,
    error: productPlanStylesErr,
    data: productPlanStylesData,
  } = useQuery(PRODUCT_PLAN_STYLES, {
    variables: { limit, offset, product_plan_id: id },
  })

  useEffect(() => {
    if (
      !productPlanStylesLoad &&
      productPlanStylesData &&
      productPlanStylesData.productPlanStyles &&
      productPlanStylesData.productPlanStyles.rows &&
      productPlanStylesData.productPlanStyles.rows.length
    ) {
      setStylesist(productPlanStylesData.productPlanStyles.rows)
      setRecordCount(productPlanStylesData.productPlanStyles.count)
    } else {
      setStylesist([])
      setRecordCount(0)
    }
  }, [productPlanStylesData, productPlanStylesLoad])

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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/product-plan/product-detail/${id}/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => {
        return {
          props: {
            style: {
              background: text === 'New' ? '#d3e68cb5' : '#ffe7bb',
              color: 'black',
            },
          },
          children: <b>{text || 0}</b>,
        }
      },
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
      // render: (text) => <Link to="/settings/product-settings/categories">{text}</Link>,
    },
    {
      title: 'Subcategory',
      dataIndex: 'product_subcategory',
      key: 'product_subcategory',
      // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
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
      title: 'Plan QTY.',
      dataIndex: 'quantity',
      key: 'quantity',
      // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
    },
    {
      title: 'Est SP',
      dataIndex: 'sp',
      key: 'sp',
      // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
    },
    {
      title: 'Total SP',
      dataIndex: 'total_sp',
      key: 'total_sp',
      render: (text, record) => record.quantity * record.sp,
    },
    {
      title: 'Trans. Price',
      dataIndex: 'tp',
      key: 'tp',
      // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
    },
    {
      title: 'Total TP',
      dataIndex: 'total_tp',
      key: 'total_tp',
      render: (text, record) => record.quantity * record.tp,
    },
    {
      title: 'MRP',
      dataIndex: 'mrp',
      key: 'mrp',
      // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
    },
    {
      title: 'Total MRP',
      dataIndex: 'total_mrp',
      key: 'total_mrp',
      render: (text, record) => record.quantity * record.mrp,
    },
  ]

  // const onChangeDate = (value, dateString) => setDateRange(dateString)
  // const debouncedInputSearch = debounce((value) => {
  //   setSearchString(value)
  //   setCurrentPage(1)
  // }, 500)

  if (!permissions.includes('readProductPlan')) return <Error403 />

  if (productPlanStylesErr)
    return `Error occured while fetching data: ${productPlanStylesErr.message}`

  return (
    <div>
      <Helmet title="Product Plan Styles" />

      <Spin spinning={productPlanStylesLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>Product Plan Styles </strong>
                </h5>
                <div className="row mt-4">
                  {permissions.includes('createProductPlan') ? (
                    <div className="col-lg-2 custom-pad-r0 text-align-right">
                      <Link to={`/product-plan/create-form/${id}/${brand_id}`}>
                        <Button type="primary w-100">Create New Styles</Button>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={stylesList}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Styles Found</h5>
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

export default withRouter(connect(mapStateToProps)(ProductPlanStyle))
