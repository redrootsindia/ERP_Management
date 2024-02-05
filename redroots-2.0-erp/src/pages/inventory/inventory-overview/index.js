/* eslint no-unused-vars: "off" ,no-undef :"off" */
import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useLazyQuery } from '@apollo/client'
import { Input, Button, Spin, Select, Table, Image, Divider, Switch } from 'antd'
import Error403 from 'components/Errors/403'
import PivotTable from 'components/PivotTable'
import { EyeOutlined } from '@ant-design/icons'
import CSVDownload from './csvDownload'
import { BRANDS } from '../../settings/misc/brands/queries'
import { PRODUCT_CATS } from '../../settings/product-settings/categories/queries'
import { PRODUCT_SUBCAT_BY_CAT_IDS } from '../../settings/product-settings/subcategories/queries'
import { PRODUCT_NAMES } from '../../products/margin-calculator/queries'
import { PRODUCTS_BY_IDS } from '../../products/all-products/queries'
import INVENTORY_OVERVIEW from './queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const InventoryOverview = ({ user: { permissions, type } }) => {
  const [pivotView, setPivotView] = useState(false)
  const [pivotTableData, setPivotTableData] = useState([])
  const pivotRows = [
    { uniqueName: 'brand', caption: 'BRAND' },
    { uniqueName: 'product_category', caption: 'PRODUCT CAT.' },
    { uniqueName: 'product_subcategory', caption: 'PRODUCT SUB-CAT.' },
    { uniqueName: 'code', caption: 'BOM CODE' },
    { uniqueName: 'warehouse', caption: 'WAREHOUSE' },
    { uniqueName: 'rack', caption: 'RACK' },
    { uniqueName: 'shelf', caption: 'SHELF' },
  ]

  const pivotMeasures = [
    { uniqueName: 'salable_quantity', aggregation: 'sum', caption: 'Salable QTY.' },
    { uniqueName: 'unsalable_quantity', aggregation: 'sum', caption: 'Unsalable QTY.' },
    { uniqueName: 'total_quantity', aggregation: 'sum', caption: 'Stock Qty.' },
  ]
  const [brandIDs, setBrandIDs] = useState([])
  const [brandsList, setBrandsList] = useState([])

  const [categoryIDs, setCategoryIDs] = useState([])
  const [categoriesList, setCategoriesList] = useState([])

  const [subcategoryIDs, setSubcategoryIDs] = useState([])
  const [subcategoriesList, setSubcategoriesList] = useState([])

  const [productIDs, setProductIDs] = useState([])
  const [productsList, setProductsList] = useState([])

  const [bomCodeIDs, setBomCodeIDs] = useState([])
  const [bomCodesList, setBomCodesList] = useState([])

  const [inputCode, setInputCode] = useState(undefined)

  const [stocksList, setStocksList] = useState([])

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  const { loading: catLoad, error: catErr, data: catData } = useQuery(PRODUCT_CATS)

  const {
    loading: subcatLoad,
    error: subcatErr,
    data: subcatData,
  } = useQuery(PRODUCT_SUBCAT_BY_CAT_IDS, { variables: { categoryIDs } })

  const {
    loading: prodNameLoad,
    error: prodNameErr,
    data: prodNameData,
  } = useQuery(PRODUCT_NAMES, {
    variables: { brandIDs, categoryIDs, subcategoryIDs, productIDs },
  })

  const {
    loading: prodLoad,
    error: prodErr,
    data: prodData,
  } = useQuery(PRODUCTS_BY_IDS, {
    variables: { ids: productIDs },
  })

  const [generateStock, { loading: prodStockLoad, error: prodStockErr, data: prodStockData }] =
    useLazyQuery(INVENTORY_OVERVIEW)

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
      subcatData.productSubcategoryByCategoryIDs &&
      subcatData.productSubcategoryByCategoryIDs.length
    )
      setSubcategoriesList(subcatData.productSubcategoryByCategoryIDs)
  }, [subcatData, subcatLoad])

  useEffect(() => {
    if (
      !prodNameLoad &&
      prodNameData &&
      prodNameData.productNames &&
      prodNameData.productNames.length
    )
      setProductsList(prodNameData.productNames)
  }, [prodNameData, prodNameLoad])

  useEffect(() => {
    if (!prodLoad && prodData && prodData.productsByIDs && prodData.productsByIDs.length) {
      const tempBomCodes = []
      prodData.productsByIDs.forEach((product) => {
        product.variants.forEach((variant) => tempBomCodes.push(variant))
      })
      setBomCodesList(tempBomCodes)
    }
  }, [prodData, prodLoad])

  useEffect(() => {
    if (
      !prodStockLoad &&
      prodStockData &&
      prodStockData.inventoryOverview &&
      prodStockData.inventoryOverview.length
    ) {
      setStocksList(prodStockData.inventoryOverview)
      setPivotTableData(
        prodStockData.inventoryOverview.map(({ variant_image, ...rest }) => ({
          ...rest,
        })),
      )
    } else {
      setStocksList([])
      setPivotTableData([])
    }
  }, [prodStockData, prodStockLoad])

  const tableColumns = [
    {
      title: 'Image',
      dataIndex: 'variant_image',
      key: 'variant_image',
      render: (variant_image) => (
        <div>
          <Image
            src={
              process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + variant_image
            }
            height={variant_image ? 35 : 20}
            width={variant_image ? 35 : 20}
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
    },
    {
      title: 'Sub-Category',
      dataIndex: 'product_subcategory',
      key: 'product_subcategory',
    },
    {
      title: 'BOM-Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouse',
      key: 'warehouse',
      render: (text, record) => `${text} - ${record.location}`,
    },
    {
      title: 'Rack/Shelf',
      dataIndex: 'rack',
      key: 'rack',
      render: (text, record) => `${text} - ${record.shelf}`,
    },
    {
      title: 'Salable Qty.',
      dataIndex: 'salable_quantity',
      key: 'salable_quantity',
    },
    {
      title: 'Unsalable Qty.',
      dataIndex: 'unsalable_quantity',
      key: 'unsalable_quantity',
    },
    {
      title: 'Total Qty.',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
    },
    {
      title: 'Total Value',
      dataIndex: 'total_val',
      key: 'total_val',
      render: (text, record) => <span>{record.total_quantity * record.unit_cost}</span>,
    },
    {
      title: 'P.O no',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
      render: (text, record) => (
        <Link to={`/purchase-orders/product/update/${record.purchase_order_id}`}>{text}</Link>
      ),
    },
  ]

  if (!permissions.includes('readInventoryOverview')) return <Error403 />
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (catErr) return `Error occured while fetching data: ${catErr.message}`
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`
  if (prodNameErr) return `Error occured while fetching data: ${prodNameErr.message}`
  if (prodErr) return `Error occured while fetching data: ${prodErr.message}`
  if (prodStockErr) return `Error occured while fetching data: ${prodStockErr.message}`

  return (
    <div>
      <Helmet title="Inventory-Overview" />
      <Spin spinning={false} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-12">
            <h5 className="mb-2">
              <strong> Inventory Overview</strong>
            </h5>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-12">
                <div className="row">
                  <div className="col-lg-3">
                    <div className="mb-2">Brands</div>
                    <Select
                      showSearch
                      mode="multiple"
                      value={brandIDs}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setCategoryIDs([])
                        setSubcategoryIDs([])
                        setProductIDs([])
                        setBomCodeIDs([])
                        setBrandIDs(value)
                      }}
                      placeholder="Select brands"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {brandsList && brandsList.length
                        ? brandsList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </div>
                  <div className="col-lg-2 text-center">
                    <h5 className="mt-4 mb-4">
                      <strong>OR</strong>
                    </h5>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-2">Category</div>

                    <Select
                      showSearch
                      mode="multiple"
                      value={categoryIDs}
                      placeholder="Select categories"
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setBrandIDs([])
                        setProductIDs([])
                        setBomCodeIDs([])
                        setCategoryIDs(value)
                      }}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {categoriesList && categoriesList.length
                        ? categoriesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-2"> Sub-Category</div>

                    <Select
                      showSearch
                      mode="multiple"
                      value={subcategoryIDs}
                      placeholder="Select  subcategories"
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setBrandIDs([])
                        setProductIDs([])
                        setBomCodeIDs([])
                        setSubcategoryIDs(value)
                      }}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {subcategoriesList && subcategoriesList.length
                        ? subcategoriesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="row mt-4">
                  <div className="col-lg-3">
                    <div className="mb-2">Product</div>
                    <Select
                      showSearch
                      mode="multiple"
                      value={productIDs}
                      style={{ width: '100%' }}
                      onChange={(value) => setProductIDs(value)}
                      placeholder="Select  products"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {(brandIDs.length || categoryIDs.length || subcategoryIDs.length) &&
                      productsList &&
                      productsList.length
                        ? productsList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-2">BOM Codes</div>

                    <Select
                      showSearch
                      mode="multiple"
                      value={bomCodeIDs}
                      style={{ width: '100%' }}
                      onChange={(value) => setBomCodeIDs(value)}
                      placeholder="Select BOM Codes"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {bomCodesList && bomCodesList.length
                        ? bomCodesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.code}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <Divider>
                  <h5 className="mb-0">
                    <strong>OR</strong>
                  </h5>
                </Divider>
              </div>
              <div className="col-12">
                <div className="row">
                  <div className="col-lg-3">
                    <div className="mb-2">EAN Code / BOM Code:</div>
                    <Input
                      placeholder="Code"
                      onChange={({ target: { value } }) => setInputCode(value)}
                      allowClear
                    />
                  </div>
                </div>
              </div>
              <div className="col-12">
                <Divider />
              </div>
              <div className="col-12 mt-4 ">
                <div className="row ml-1">
                  <Button
                    type="primary"
                    onClick={() => {
                      generateStock({
                        variables: {
                          brandIDs,
                          categoryIDs,
                          subcategoryIDs,
                          productIDs,
                          bomCodeIDs,
                          getAll: false,
                          inputCode,
                        },
                      })
                    }}
                  >
                    Get Stock from selected filters
                  </Button>

                  <div className=" mt-2 mb-2 ml-4 mr-4 text-center">OR</div>

                  <Button
                    type="primary"
                    onClick={() => {
                      generateStock({
                        variables: {
                          brandIDs,
                          categoryIDs,
                          subcategoryIDs,
                          productIDs,
                          bomCodeIDs,
                          getAll: true,
                          inputCode,
                        },
                      })
                    }}
                  >
                    Get All Stock
                  </Button>
                </div>
              </div>
              <div className="col-12 mt-4 mb-4">
                <div className="row">
                  <div className="col-3">
                    <strong>Total Quantity:</strong>
                    <span>
                      &nbsp;&nbsp;
                      {stocksList && stocksList.length
                        ? stocksList.reduce((acc, obj) => acc + obj.total_quantity, 0)
                        : 0}
                    </span>
                  </div>

                  <div className="col-3">
                    <strong>Salable Quantity:</strong>
                    <span>
                      &nbsp;&nbsp;
                      {stocksList && stocksList.length
                        ? stocksList.reduce((acc, obj) => acc + obj.salable_quantity, 0)
                        : 0}
                    </span>
                  </div>
                  <div className="col-3">
                    <strong>Unsalable Quantity:</strong>
                    <span>
                      &nbsp;&nbsp;
                      {stocksList && stocksList.length
                        ? stocksList.reduce((acc, obj) => acc + obj.unsalable_quantity, 0)
                        : 0}
                    </span>
                  </div>
                  <div className="col-3">
                    <strong>Total value:</strong>
                    <span>
                      &nbsp;&nbsp;
                      {stocksList && stocksList.length
                        ? stocksList.reduce(
                            (acc, obj) => acc + obj.total_quantity * obj.unit_cost,
                            0,
                          )
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              {type === 'admin' ? (
                <div className="row ml-2">
                  <div className="col-9">
                    <Switch
                      className="mr-2"
                      checked={pivotView}
                      onChange={(checked) => {
                        setPivotView(checked)
                      }}
                    />
                    <div>Pivot View</div>
                  </div>
                  <div className="col-3">
                    <CSVDownload
                      brandIDs={brandIDs}
                      categoryIDs={categoryIDs}
                      subcategoryIDs={subcategoryIDs}
                      productIDs={productIDs}
                      bomCodeIDs={bomCodeIDs}
                      inputCode={inputCode}
                    />
                  </div>
                </div>
              ) : null}

              {pivotView && pivotTableData && pivotTableData.length ? (
                <div className="mt-4">
                  <PivotTable
                    data={pivotTableData}
                    rows={pivotRows}
                    measures={pivotMeasures}
                    columns={[]}
                  />
                </div>
              ) : (
                <div className="kit__utils__table mt-4">
                  <Table
                    columns={tableColumns}
                    dataSource={stocksList}
                    pagination={{
                      defaultPageSize: 20,
                      showSizeChanger: true,
                      pageSizeOptions: ['20', '40', '60'],
                    }}
                    locale={{
                      emptyText: (
                        <div className="custom-empty-text-parent">
                          <div className="custom-empty-text-child">
                            <i className="fe fe-search" />
                            <h5>No Stocks Found</h5>
                          </div>
                        </div>
                      ),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(InventoryOverview))
