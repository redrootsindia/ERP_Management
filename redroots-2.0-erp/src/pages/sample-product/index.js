import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Spin, Table, Image, Button, Pagination } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Error403 from 'components/Errors/403'
import moment from 'moment'
import { EyeOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { SAMPLE_PRODUCTS } from './query'

// const Option = Select
const mapStateToProps = ({ user }) => ({ user })

const SampleProduct = ({ user: { permissions } }) => {
  const [sampleProductLists, setSampleProductLists] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)
  const {
    loading: samoleProductsLoad,
    data: sampleProductsData,
    error: sampleProductsError,
  } = useQuery(SAMPLE_PRODUCTS, {
    variables: {
      limit,
      offset,
    },
  })
  useEffect(() => {
    if (
      !samoleProductsLoad &&
      sampleProductsData &&
      sampleProductsData.sampleProducts &&
      sampleProductsData.sampleProducts.rows &&
      sampleProductsData.sampleProducts.rows.length
    ) {
      setSampleProductLists(sampleProductsData.sampleProducts.rows)
      setRecordCount(sampleProductsData.sampleProducts.count)
    } else {
      setSampleProductLists([])
      setRecordCount([])
    }
  }, [samoleProductsLoad, sampleProductsData])

  const tableColumns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + image}
            height={image ? 50 : 40}
            width={image ? 50 : 40}
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },

    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text, record) => (
        <Link to={`/sample-product/update/${Number(record.id)}`}>{text}</Link>
      ),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => moment(Number(text)).format('MMM Do YYYY'),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ]
  // const tableData = [
  //   {
  //     id: 1,
  //     image:
  //       'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=463&q=80',
  //     product_name: 'HandBags',
  //     vendor_name: 'Vendor Name',
  //     date: '1670312584000',
  //     quantity: 1,
  //     status: 'pending',
  //   },
  // ]
  if (!permissions.includes('readBrandPayment')) return <Error403 />
  if (sampleProductsError)
    return `Error occured while fetching data: ${sampleProductsError.message}`

  return (
    <div>
      <Helmet title="Sample Product" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>SAMPLE PRODUCT</strong>
                </h5>
                <div className="row mt-4">
                  {permissions.includes('createProduct') ? (
                    <div className="col-lg-1 custom-pad-r0 text-align-right">
                      <Link to="/sample-product/create">
                        <Button type="primary w-100">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="card-body">
                <Table
                  columns={tableColumns}
                  dataSource={sampleProductLists}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
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
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(SampleProduct))
