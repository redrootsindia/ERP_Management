import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Input, Button, Table, Spin, Image, Switch, Pagination, Select, notification } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import { PRODUCTS, CHANGE_STATUS } from './queries'
import { BRANDS } from '../../settings/misc/brands/queries'
import { PRODUCT_CATS } from '../../settings/product-settings/categories/queries'
import { PRODUCT_SUBCATS } from '../../settings/product-settings/subcategories/queries'
import { VENDOR_NAMES_LIST } from '../../accounts/vendors/queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const Products = ({ user: { permissions } }) => {
  const [products, setProducts] = useState([])

  const [vendorIDs, setVendorIDs] = useState([])
  const [vendorsList, setVendorsList] = useState([])
  const [vendorSearchString, setVendorSearchString] = useState(null)

  const [brandIDs, setBrandIDs] = useState([])
  const [brandsList, setBrandsList] = useState([])

  const [categoryIDs, setCategoryIDs] = useState([])
  const [categoriesList, setCategoriesList] = useState([])

  const [subcategoryIDs, setSubcategoryIDs] = useState([])
  const [subcategoriesList, setSubcategoriesList] = useState([])

  const [sortBy, setSortBy] = useState('nameAsc')
  const [statusFilter, setStatusFilter] = useState(null)
  const [searchString, setSearchString] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)

  const [changeStatus] = useMutation(CHANGE_STATUS)

  // prettier-ignore
  const { loading: prodLoad, error: prodErr, data: prodData } = useQuery(PRODUCTS, {
    variables: {
      vendorIDs, brandIDs, categoryIDs, subcategoryIDs, statusFilter, searchString, sortBy, limit, offset
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

  useEffect(() => {
    if (prodData && prodData.products && prodData.products.rows && prodData.products.rows.length) {
      setProducts(prodData.products.rows)
      setRecordCount(prodData.products.count)
    } else {
      setProducts([])
      setRecordCount(0)
    }
  }, [prodData])

  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length)
      setBrandsList(brandData.brands)
  }, [brandData, brandLoad])

  useEffect(() => {
    if (!catLoad && catData && catData.productCategories && catData.productCategories.length)
      setCategoriesList(catData.productCategories)
  }, [catData, catLoad])

  // prettier-ignore
  useEffect(() => {
    if (!subcatLoad && subcatData && subcatData.productSubcategories && subcatData.productSubcategories.length)
      setSubcategoriesList(subcatData.productSubcategories)
  }, [subcatData, subcatLoad])

  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorsList(vendorData.vendorNames)
  }, [vendorData, vendorLoad])

  const debouncedVendorSearch = debounce((value) => setVendorSearchString(value), 500)

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const tableColumns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + image}
            height={image ? 50 : 20}
            width={image ? 50 : 20}
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/products/all-products/update/${record.id}`}>{text}</Link>
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
      dataIndex: 'product_category',
      key: 'product_category',
      // render: (text) => <Link to="/settings/product-settings/categories">{text}</Link>,
    },
    {
      title: 'Product Subcategory',
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
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) =>
        permissions.includes('updateProduct') ? (
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
            disabled={!permissions.includes('updateProduct')}
          />
        ) : active ? (
          'Yes'
        ) : (
          'No'
        ),
    },
  ]

  if (!permissions.includes('readProduct')) return <Error403 />
  if (prodErr) return `Error occured while fetching data: ${prodErr.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (catErr) return `Error occured while fetching data: ${catErr.message}`
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`

  return (
    <div>
      <Helmet title="Products" />

      <Spin spinning={prodLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>PRODUCTS</strong>
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
                        <Button type="primary w-100">Create</Button>
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
                      <Option key={1} value="active">
                        Active only
                      </Option>
                      <Option key={2} value="inactive">
                        Inactive only
                      </Option>
                    </Select>
                  </div>
                  <div className="col-lg-2 custom-pad-r0">
                    <Select
                      key="sortBy"
                      value={sortBy || 'nameAsc'}
                      placeholder="Sort by name - A to Z"
                      onChange={(value) => setSortBy(value)}
                      className="custom-pad-r1 w-100"
                    >
                      <Option key="nameAsc" value="nameAsc">
                        Sort by name - A to Z
                      </Option>
                      <Option key="nameDesc" value="nameDesc">
                        Sort by name - Z to A
                      </Option>
                      <Option key="brandAsc" value="brandAsc">
                        Sort by brand - A to Z
                      </Option>
                      <Option key="brandDesc" value="brandDesc">
                        Sort by brand - Z to A
                      </Option>
                      <Option key="categoryAsc" value="categoryAsc">
                        Sort by category - A to Z
                      </Option>
                      <Option key="categoryDesc" value="categoryDesc">
                        Sort by category - Z to A
                      </Option>
                      <Option key="subcategoryAsc" value="subcategoryAsc">
                        Sort by subcategory - A to Z
                      </Option>
                      <Option key="subcategoryDesc" value="subcategoryDesc">
                        Sort by subcategory - Z to A
                      </Option>
                      <Option key="dateDesc" value="dateDesc">
                        Sort by created date - Latest first
                      </Option>
                      <Option key="dateAsc" value="dateAsc">
                        Sort by created date - Oldest first
                      </Option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    columns={tableColumns}
                    dataSource={products}
                    pagination={false}
                    rowKey={(record) => String(record.id)}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Products Found</h5>
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

export default withRouter(connect(mapStateToProps)(Products))
