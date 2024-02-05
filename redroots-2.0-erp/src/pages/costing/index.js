import React, { useEffect, useState } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Table, Tag, Pagination, Spin, Image, Select, Input, Button, Tabs } from 'antd'
import { useQuery } from '@apollo/client'
import { debounce } from 'lodash'
import { EyeOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons'
import { PRODUCT_COSTING_VERSIONS, PRODUCT_COSTING_APPROVAL } from './queries'
import { BRANDS } from '../settings/misc/brands/queries'
import { PRODUCT_CATS } from '../settings/product-settings/categories/queries'
import { PRODUCT_SUBCATS } from '../settings/product-settings/subcategories/queries'
import { VENDOR_NAMES_LIST } from '../accounts/vendors/queries'
import './style.scss'

const { Option } = Select
const { TabPane } = Tabs
const mapStateToProps = ({ user }) => ({ user })

const Costings = ({ user: { permissions } }) => {
  const [costings, setCostings] = useState([])
  const [vendorIDs, setVendorIDs] = useState([])
  const [vendorsList, setVendorsList] = useState([])
  const [vendorSearchString, setVendorSearchString] = useState(null)

  const [brandIDs, setBrandIDs] = useState([])
  const [brandsList, setBrandsList] = useState([])

  const [productApproveList, setProductApproveList] = useState([])
  const [categoryIDs, setCategoryIDs] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
  // const [approvedCount, setApprovedCount] = useState(0)

  const [subcategoryIDs, setSubcategoryIDs] = useState([])
  const [subcategoriesList, setSubcategoriesList] = useState([])

  const [statusFilter, setStatusFilter] = useState(null)

  const [searchString, setSearchString] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)

  const {
    loading: productCostVersionLoad,
    error: productCostVersionErr,
    data: productCostVersionData,
  } = useQuery(PRODUCT_COSTING_VERSIONS, {
    variables: {
      vendorIDs,
      brandIDs,
      categoryIDs,
      subcategoryIDs,
      statusFilter,
      searchString,
      limit,
      offset,
    },
  })

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  const { loading: catLoad, error: catErr, data: catData } = useQuery(PRODUCT_CATS)
  const { loading: subcatLoad, error: subcatErr, data: subcatData } = useQuery(PRODUCT_SUBCATS)
  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(VENDOR_NAMES_LIST, {
    variables: { searchString: vendorSearchString, vendorIDs },
  })
  const {
    loading: productApproveLoad,
    //  error: productApproveError,
    data: productApproveData,
  } = useQuery(PRODUCT_COSTING_APPROVAL)

  useEffect(() => {
    if (
      !productApproveLoad &&
      productApproveData &&
      productApproveData.productCostingApproval &&
      productApproveData.productCostingApproval.length
    )
      setProductApproveList(productApproveData.productCostingApproval)
    // setApprovedCount(productApproveData.productCostingApproval.length)
  }, [productApproveLoad, productApproveData])

  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length)
      setBrandsList(brandData.brands)
  }, [brandData, brandLoad])

  useEffect(() => {
    if (!catLoad && catData && catData.productCategories && catData.productCategories.length)
      setCategoriesList(catData.productCategories)
  }, [catData, catLoad])

  useEffect(() => {
    if (
      !subcatLoad &&
      subcatData &&
      subcatData.productSubcategories &&
      subcatData.productSubcategories.length
    )
      setSubcategoriesList(subcatData.productSubcategories)
  }, [subcatData, subcatLoad])

  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorsList(vendorData.vendorNames)
  }, [vendorData, vendorLoad])

  useEffect(() => {
    if (
      !productCostVersionLoad &&
      productCostVersionData &&
      productCostVersionData.productCostingVersions &&
      productCostVersionData.productCostingVersions.rows &&
      productCostVersionData.productCostingVersions.rows.length
    ) {
      setCostings(productCostVersionData.productCostingVersions.rows)
      setRecordCount(productCostVersionData.productCostingVersions.count)
    } else {
      setCostings([])
      setRecordCount(0)
    }
  }, [productCostVersionData, productCostVersionLoad])

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div
          role="button"
          onClick={(e) => {
            e.stopPropagation()
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
          }}
          tabIndex={0}
        >
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
      title: 'Product Name',
      dataIndex: 'product',
      key: 'product',
      render: (text, record) => (
        <Link to={`/costing/form/${record.version ? record.version : 0}/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      // render: (text) => <Link to="/settings/misc/brands">{text}</Link>,
    },
    {
      title: 'Product Category',
      dataIndex: 'category',
      key: 'category',
      // render: (text) => <Link to="/settings/product-settings/categories">{text}</Link>,
    },
    {
      title: 'Product Subcategory',
      dataIndex: 'subcategory',
      key: 'subcategory',
      // render: (text) => <Link to="/settings/product-settings/categories">{text}</Link>,
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
      title: 'CP',
      dataIndex: 'cp',
      key: 'cp',
      render: (text) => Number(text).toFixed(2) || '-',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      render: (text) => text || ' - ',
    },
    {
      title: 'Quarter',
      dataIndex: 'quarter',
      key: 'quarter',
      render: (text) => text || ' - ',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) =>
        text === 'completed' ? <Tag color="green">Completed</Tag> : <Tag color="blue">Pending</Tag>,
    },
    {
      title: 'Done By',
      dataIndex: 'employee_name',
      key: 'employee_name',
      render: (text) => text || ' - ',
    },
  ]

  const costingApprovedColumns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div
          role="button"
          onClick={(e) => {
            e.stopPropagation()
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
          }}
          tabIndex={0}
        >
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
      title: 'Product Name',
      dataIndex: 'product',
      key: 'product',
      render: (text, record) => (
        <Link to={`/costing/form/${record.version ? record.version : 0}/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      // render: (text) => <Link to="/settings/misc/brands">{text}</Link>,
    },
    {
      title: 'Product Category',
      dataIndex: 'category',
      key: 'category',
      // render: (text) => <Link to="/settings/product-settings/categories">{text}</Link>,
    },
    {
      title: 'Product Subcategory',
      dataIndex: 'subcategory',
      key: 'subcategory',
      // render: (text) => <Link to="/settings/product-settings/categories">{text}</Link>,
    },
    {
      title: 'Approved',
      dataIndex: 'employee_name',
      key: 'employee_name',
      render: (text) => (text ? <span>approve by {text}</span> : ''),
    },
    {
      title: 'Approved',
      dataIndex: 'approve',
      key: 'approve',
      render: (text, record) => (
        <>
          <Button
            type="primary"
            onClick={() => console.log('hello motto', record.id)}
            // bookedStatus({ variables: { appointment_id: record.id, status: 'Booked' } })
            //   .then(() => {
            //     notification.success({ description: 'Status Changed Successfully' })
            //     refetch()
            //   })
            //   .catch((err) => {
            //     notification.error({
            //       message: 'Error occured while changing status.',
            //       description: err.message || 'Please contact system administrator.',
            //     })
            //   })
            shape="circle"
            icon={<CheckOutlined />}
          />
        </>
      ),
    },
  ]
  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const debouncedVendorSearch = debounce((value) => setVendorSearchString(value), 500)

  // if (!permissions.includes('readProduct')) return <Error403 />
  if (productCostVersionErr)
    return `Error occured while fetching data: ${productCostVersionErr.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (catErr) return `Error occured while fetching data: ${catErr.message}`
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`

  return (
    <div>
      <Helmet title="Costing" />
      <Spin spinning={productCostVersionLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              {/* costing tab */}

              <div className="card-header">
                <h5 className="mb-2">
                  <strong>Costing</strong>
                </h5>
                <div className="row mt-4">
                  <div className="col-lg-10">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search"
                      onChange={({ target: { value } }) => debouncedInputSearch(value)}
                      allowClear
                    />
                  </div>
                  {permissions.includes('createProduct') ? (
                    <div className="col-lg-2 custom-pad-r0 text-align-right">
                      <Link to="/products/all-products/create">
                        <Button type="primary w-100">Create Product</Button>
                      </Link>
                    </div>
                  ) : null}
                </div>
                <div className="row mt-4">
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      mode="multiple"
                      showSearch
                      value={vendorIDs}
                      onSearch={(value) => debouncedVendorSearch(value)}
                      onChange={(value) => setVendorIDs(value)}
                      placeholder="Vendors"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 mb-2 w-100"
                    >
                      {vendorsList && vendorsList.length
                        ? vendorsList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {`${obj.company} (${obj.name})`}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      showSearch
                      value={brandIDs}
                      onChange={(value) => setBrandIDs(value)}
                      placeholder="Brands"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 mb-2 w-100"
                    >
                      {brandsList && brandsList.length
                        ? brandsList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      showSearch
                      value={categoryIDs}
                      onChange={(value) => setCategoryIDs(value)}
                      placeholder="Categories"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 mb-2 w-100"
                    >
                      {categoriesList && categoriesList.length
                        ? categoriesList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      showSearch
                      value={subcategoryIDs}
                      onChange={(value) => setSubcategoryIDs(value)}
                      placeholder="Subcategories"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 w-100"
                    >
                      {subcategoriesList &&
                      subcategoriesList.length &&
                      categoriesList &&
                      categoriesList.length
                        ? subcategoriesList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {`${obj.name} (${
                                categoriesList.find(
                                  (catObj) => Number(catObj.id) === Number(obj.product_category_id),
                                ).name
                              })`}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      key="statusFilter"
                      value={statusFilter || null}
                      placeholder="Filter by active"
                      onChange={(active) => setStatusFilter(active)}
                      className="custom-pad-r1 w-100"
                    >
                      <Option key={0} value={null}>
                        All statuses
                      </Option>
                      <Option key={1} value="pending">
                        Pending
                      </Option>
                      <Option key={2} value="completed">
                        Completed
                      </Option>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <Tabs defaultActiveKey="1" className="costing-tabs">
                  <TabPane tab={`Pending(${recordCount})`}>
                    <div className="kit__utils__table">
                      <Table
                        columns={columns}
                        dataSource={costings}
                        pagination={false}
                        rowKey={(record) => String(record.id)}
                        locale={{
                          emptyText: (
                            <div className="custom-empty-text-parent">
                              <div className="custom-empty-text-child">
                                <i className="fe fe-search" />
                                <h5>No Costings Found</h5>
                              </div>
                            </div>
                          ),
                        }}
                      />
                    </div>
                    <Pagination
                      current={currentPage}
                      showTotal={(total) => `Total ${total} items`}
                      total={recordCount}
                      pageSize={pageSize}
                      pageSizeOptions={[20, 50, 100]}
                      className="custom-pagination mb-3"
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
                  </TabPane>
                  <TabPane
                    tab={`Approved(${productApproveList.length})`}
                    key="2"
                    className="costing-tabs"
                  >
                    <div className="kit_utils_table">
                      <Table
                        pagination={false}
                        columns={costingApprovedColumns}
                        dataSource={productApproveList}
                      />
                      {productApproveList && (
                        <Pagination
                          current={currentPage}
                          showTotal={(total) => `Total ${total} items`}
                          total={productApproveList.length}
                          pageSize={pageSize}
                          pageSizeOptions={[20, 50, 100]}
                          className="custom-pagination mb-3"
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
                      )}
                    </div>
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(Costings))
