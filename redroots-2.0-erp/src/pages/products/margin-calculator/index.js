import React, { useState, useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Table, Spin, Image, Select, Button } from 'antd'
import Error403 from 'components/Errors/403'
import { debounce, orderBy } from 'lodash'
import { EyeOutlined } from '@ant-design/icons'
import { MARGIN_REPORT, PRODUCT_NAMES } from './queries'
import { PRODUCT_CATS } from '../../settings/product-settings/categories/queries'
import { PRODUCT_SUBCATS } from '../../settings/product-settings/subcategories/queries'
import CSVDownload from './csvDownload'
import CSVDownloadSelected from './csvDownloadSelected'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const MarginReports = ({ user: { permissions } }) => {
  const [marginReport, setMarginReport] = useState([])
  const [noOfProduct, setNoOfProduct] = useState(20)
  const [productIDs, setProductIDs] = useState([])
  const [products, setProducts] = useState([])
  const [productSearchString, setProductSearchString] = useState(null)
  const [categoryIDs, setCategoryIDs] = useState([])
  const [categoriesList, setCategoriesList] = useState([])

  const [subcategoryIDs, setSubcategoryIDs] = useState([])
  const [subcategoriesList, setSubcategoriesList] = useState([])

  const [excessShort, setExcessShort] = useState(undefined)

  const [selectedRows, setSelectedRows] = useState([])

  const debouncedProductSearch = debounce((value) => setProductSearchString(value), 500)

  const {
    loading: marginLoad,
    error: marginErr,
    data: marginData,
  } = useQuery(MARGIN_REPORT, {
    variables: { noOfProduct, productIDs, categoryIDs, subcategoryIDs },
  })

  const {
    loading: prodLoad,
    error: prodErr,
    data: prodData,
  } = useQuery(PRODUCT_NAMES, {
    variables: { searchString: productSearchString, categoryIDs, subcategoryIDs, productIDs },
  })

  const { loading: catLoad, error: catErr, data: catData } = useQuery(PRODUCT_CATS)
  const { loading: subcatLoad, error: subcatErr, data: subcatData } = useQuery(PRODUCT_SUBCATS)

  useEffect(() => {
    if (!marginLoad && marginData && marginData.marginReport) {
      const { product, buyer_margin, vendor_margin } = marginData.marginReport
      if (
        product &&
        buyer_margin &&
        vendor_margin &&
        product.length &&
        buyer_margin.length &&
        vendor_margin.length
      ) {
        const tempMarginReport = []
        product.forEach((productObj) => {
          const tempBuyerMargin = buyer_margin.filter(
            (element) => Number(element.product_id) === Number(productObj.id),
          )
          const tempVendorMargin = vendor_margin.filter(
            (element) => Number(element.product_id) === Number(productObj.id),
          )
          tempBuyerMargin.forEach((buyerObj) =>
            tempVendorMargin.forEach((vendorObj) => {
              const price_before_gst =
                buyerObj.target_selling_price && productObj.igst
                  ? (buyerObj.target_selling_price / (Number(productObj.igst) / 100 + 1)).toFixed(2)
                  : 0

              const estimatedTargetPrice =
                price_before_gst && buyerObj.margin_percent
                  ? (
                      Number(price_before_gst) -
                      Number(price_before_gst) * (Number(buyerObj.margin_percent) / 100)
                    ).toFixed(2)
                  : 0

              const totalCP =
                (vendorObj.cost_price ? Number(vendorObj.cost_price) : 0) +
                (vendorObj.transport_cost ? Number(vendorObj.transport_cost) : 0) +
                (vendorObj.packaging ? Number(vendorObj.packaging) : 0) +
                (vendorObj.photoshoot ? Number(vendorObj.photoshoot) : 0)

              const currentMarginVendor =
                totalCP && vendorObj.margin_percent
                  ? ((Number(totalCP) * Number(vendorObj.margin_percent)) / 100).toFixed(2)
                  : 0

              const transferPrice = Number(totalCP) + Number(currentMarginVendor)

              const excessShortfall =
                estimatedTargetPrice -
                (
                  transferPrice +
                  transferPrice * (vendorObj.transfer_price_marketing / 100) +
                  transferPrice * (vendorObj.brand_marketing / 100)
                ).toFixed(2)

              const tempMarginRow = {
                buyer_id: buyerObj.buyer_id,
                vendor_id: vendorObj.vendor_id,
                product_id: productObj.id,
                mrp: buyerObj.mrp ? Math.round(buyerObj.mrp) : '-',
                buyer_name: buyerObj.buyer_name ? buyerObj.buyer_name : '',
                image: productObj.image ? productObj.image : '',
                product_category: productObj.product_category ? productObj.product_category : '',
                product_subcategory: productObj.product_subcategory
                  ? productObj.product_subcategory
                  : '',
                name: productObj.name ? productObj.name : '',
                vendor_name: vendorObj.vendor_name ? vendorObj.vendor_name : '',
                discount_percent: buyerObj.discount_value ? buyerObj.discount_value : 0,
                discount_value: Math.round(buyerObj.mrp * (buyerObj.discount_value / 100)),
                // selling_price: Number(buyerObj.mrp) - Number(buyerObj.discount_value) || '-',
                target_selling_price: buyerObj.target_selling_price
                  ? Math.round(buyerObj.target_selling_price)
                  : '-',
                price_before_gst: Math.round(Number(price_before_gst)) || '-',
                buyer_margin_percent: buyerObj.margin_percent || '-',
                estimated_target_price: Math.round(Number(estimatedTargetPrice)) || '-',
                cost_price: vendorObj.cost_price ? Math.round(vendorObj.cost_price) : '-',
                transport_cost: vendorObj.transport_cost
                  ? Math.round(vendorObj.transport_cost)
                  : '-',
                total_cp: totalCP ? Math.round(totalCP) : '-',
                vendor_margin_percent: vendorObj.margin_percent || '-',
                brand_marketing: vendorObj.brand_marketing || '-',
                packaging: vendorObj.packaging || '-',
                photoshoot: vendorObj.photoshoot || '-',
                brand_marketing_price: (transferPrice * (vendorObj.brand_marketing / 100)).toFixed(
                  2,
                ),
                transfer_price: transferPrice ? Math.round(transferPrice) : '-',
                transfer_price_marketing: (
                  transferPrice +
                  transferPrice * (vendorObj.transfer_price_marketing / 100) +
                  transferPrice * (vendorObj.brand_marketing / 100)
                ).toFixed(2),
                marketing_value: (
                  transferPrice *
                  (vendorObj.transfer_price_marketing / 100)
                ).toFixed(2),
                multiple:
                  (Number(buyerObj.target_selling_price) / Number(transferPrice)).toFixed(2) || '-',
                current_margin: Math.round(currentMarginVendor),
                excess_shortfall: Math.round(excessShortfall) || '-',
              }
              tempMarginReport.push(tempMarginRow)
            }),
          )
        })
        console.log('tempMarginReport', tempMarginReport)
        setMarginReport(tempMarginReport)
      } else setMarginReport([])
    }
  }, [marginData, marginLoad])

  useEffect(() => {
    if (!prodLoad && prodData && prodData.productNames && prodData.productNames.length)
      setProducts(prodData.productNames)
    else setProducts([])
  }, [prodData, prodLoad])

  useEffect(() => {
    if (!catLoad && catData && catData.productCategories && catData.productCategories.length)
      setCategoriesList(catData.productCategories)
  }, [catData, catLoad])

  // prettier-ignore
  useEffect(() => {
    if (!subcatLoad && subcatData && subcatData.productSubcategories && subcatData.productSubcategories.length)
      setSubcategoriesList(subcatData.productSubcategories)
  }, [subcatData, subcatLoad])

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
        <Link to={`/products/all-products/update/${record.product_id}`}>{text}</Link>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
    },
    {
      title: 'Sub-category',
      dataIndex: 'product_subcategory',
      key: 'product_subcategory',
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
      align: 'center',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      align: 'center',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'MRP (₹)',
      dataIndex: 'mrp',
      key: 'mrp',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Discount (₹)',
      dataIndex: 'discount_value',
      key: 'discount_value',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Discount (%)',
      dataIndex: 'discount_percent',
      key: 'discount_percent',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Target SP (₹)',
      dataIndex: 'target_selling_price',
      key: 'target_selling_price',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Price before GST (₹)',
      dataIndex: 'price_before_gst',
      key: 'price_before_gst',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Margin (%)',
      dataIndex: 'buyer_margin_percent',
      key: 'buyer_margin_percent',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Estimated TP (₹)',
      dataIndex: 'estimated_target_price',
      key: 'estimated_target_price',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Vendor CP (₹)',
      dataIndex: 'cost_price',
      key: 'cost_price',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Transport (₹)',
      dataIndex: 'transport_cost',
      key: 'transport_cost',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Packaging (₹)',
      dataIndex: 'packaging',
      key: 'packaging',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'PhotoShoot (₹)',
      dataIndex: 'photoshoot',
      key: 'photoshoot',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Total CP (₹)',
      dataIndex: 'total_cp',
      key: 'total_cp',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Brand Marketing (%)',
      dataIndex: 'brand_marketing',
      key: 'brand_marketing',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Std Margin (%)',
      dataIndex: 'vendor_margin_percent',
      key: 'vendor_margin_percent',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Vendor TP (₹)',
      dataIndex: 'transfer_price',
      key: 'transfer_price',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'TP (With Marketing) (₹)',
      dataIndex: 'transfer_price_marketing',
      key: 'transfer_price_marketing',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Marketing (₹)',
      dataIndex: 'marketing_value',
      key: 'marketing_value',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Multiple',
      dataIndex: 'multiple',
      key: 'multiple',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Current Margin (₹)',
      dataIndex: 'current_margin',
      key: 'current_margin',
      align: 'center',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Excess / Short (₹)',
      dataIndex: 'excess_shortfall',
      key: 'excess_shortfall',
      align: 'center',
      render: (text) => {
        return {
          props: {
            style: {
              color: Number(text) > 0 ? 'green' : Number(text) < 0 && 'red',
              fontWeight: 'bold',
            },
          },
          children: <div>{text}</div>,
        }
      },
    },
  ]

  const rowSelection = {
    onChange: (selectedRowKey, selectRows) => {
      setSelectedRows(selectRows)
    },
  }
  useEffect(() => {
    if (excessShort) {
      if (excessShort === 'short') {
        const tempMarginReportAsc = orderBy(marginReport, ['excess_shortfall'], ['asc'])
        setMarginReport(tempMarginReportAsc)
      } else if (excessShort === 'excess') {
        const tempMarginReportDesc = orderBy(marginReport, ['excess_shortfall'], ['desc'])
        setMarginReport(tempMarginReportDesc)
      }
    }
  }, [excessShort])

  if (!permissions.includes('readMarginCalculator')) return <Error403 />
  if (marginErr) return `Error occured while fetching data: ${marginErr.message}`
  if (prodErr) return `Error occured while fetching data: ${prodErr.message}`
  if (catErr) return `Error occured while fetching data: ${catErr.message}`
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`

  return (
    <div>
      <Helmet title="Margin Calculator" />

      <Spin spinning={marginLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <div className="row">
                  <div className="col-8">
                    <h5 className="mb-4">
                      <strong>MARGIN CALCULATOR</strong>
                    </h5>
                  </div>
                  <div className="col-2">
                    <CSVDownload
                      productIDs={productIDs}
                      categoryIDs={categoryIDs}
                      subcategoryIDs={subcategoryIDs}
                    />
                  </div>
                  <div className="col-2">
                    {selectedRows && selectedRows.length ? (
                      <CSVDownloadSelected selectedRows={selectedRows} />
                    ) : null}
                  </div>
                </div>

                <div className="row mt-4">
                  {permissions.includes('createProduct') ? (
                    <div className="col-lg-2 custom-pad-r0 text-align-right">
                      <Link to="/products/all-products/create">
                        <Button type="primary w-100">Create Product</Button>
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div className="row mt-4">
                  <div className="col-3">
                    <div className="mb-2">No. of Products</div>
                    <Select
                      key="NoOfProduct"
                      value={noOfProduct}
                      style={{ width: '100%' }}
                      placeholder="Select No Of Product"
                      onChange={(value) => setNoOfProduct(Number(value))}
                      className="custom-pad-r1"
                    >
                      <Option key="20" value="20">
                        20
                      </Option>
                      <Option key="50" value="50">
                        50
                      </Option>
                      <Option key="100" value="100">
                        100
                      </Option>
                      <Option key="1000" value="1000">
                        all
                      </Option>
                    </Select>
                  </div>

                  <div className="col-3">
                    <div className="mb-2">Products</div>
                    <Select
                      mode="multiple"
                      showSearch
                      value={productIDs}
                      onSearch={(value) => debouncedProductSearch(value)}
                      onChange={(value) => {
                        setProductIDs(value)
                        setNoOfProduct(undefined)
                      }}
                      placeholder="Products"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 mb-2 w-100"
                    >
                      {products && products.length
                        ? products.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>

                  <div className="col-3">
                    <div className="mb-2">Product Categories</div>
                    <Select
                      mode="multiple"
                      showSearch
                      value={categoryIDs}
                      onChange={(value) => {
                        setCategoryIDs(value)
                        setProductIDs([])
                      }}
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

                  <div className="col-3">
                    <div className="mb-2">Product Subcategories</div>
                    <Select
                      mode="multiple"
                      showSearch
                      value={subcategoryIDs}
                      onChange={(value) => {
                        setSubcategoryIDs(value)
                        setProductIDs([])
                      }}
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
                </div>
                <div className="row mt-4">
                  <div className="col-3">
                    <div className="mb-2">Sort By </div>
                    <Select
                      key="Ascending"
                      value={excessShort}
                      style={{ width: '100%' }}
                      placeholder="Sort by Excess/Short "
                      onChange={(value) => setExcessShort(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="excess" value="excess">
                        Sort by Excess
                      </Option>
                      <Option key="short" value="short">
                        Sort by Short
                      </Option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="kit__utils__table">
                  <Table
                    dataSource={marginReport}
                    columns={tableColumns}
                    pagination={false}
                    rowSelection={rowSelection}
                    rowKey={(record) => String(record.id)}
                    size="small"
                    onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                    scroll={{ x: '150%' }}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Margin Report Found</h5>
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
export default withRouter(connect(mapStateToProps)(MarginReports))
