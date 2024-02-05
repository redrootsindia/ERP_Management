import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useLazyQuery } from '@apollo/client'
import { Table, Spin, Pagination, Select, Input, Image, Switch } from 'antd'
import Error403 from 'components/Errors/403'
import PivotTable from 'components/PivotTable'
import { debounce } from 'lodash'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import CSVDownload from './csvDownload'
import { BRANDS } from '../../settings/misc/brands/queries'
import { PRODUCT_CATS } from '../../settings/product-settings/categories/queries'
import { PRODUCT_SUBCATS } from '../../settings/product-settings/subcategories/queries'
import { AGEING_REPORT_PIVOT_DATA, AGEING_REPORT } from './queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const AgeingReport = ({ user: { permissions } }) => {
  const [ageingReport, setAgeingReport] = useState([])

  const pivotRows = [
    { uniqueName: 'product_name', caption: 'PRODUCT' },
    { uniqueName: 'brand', caption: 'BRAND' },
    { uniqueName: 'product_category', caption: 'PRODUCT CAT.' },
    { uniqueName: 'product_subcategory', caption: 'PRODUCT SUB-CAT.' },
    { uniqueName: 'variant_code', caption: 'BOM CODE' },
  ]

  const pivotRows30Days = [
    { uniqueName: 'days30', caption: '0-30 Days' },
    { uniqueName: 'days60', caption: '31-60 Days' },
    { uniqueName: 'days90', caption: '61-90 Days' },
    { uniqueName: 'days180', caption: '91-180 Days' },
    { uniqueName: 'days360', caption: '181-360 Days' },
    { uniqueName: 'days360plus', caption: '>360 Days' },
  ]

  const pivotRows60dDays = [
    { uniqueName: 'days60', caption: '31-60 Days' },
    { uniqueName: 'days120', caption: '61-120 Days' },
    { uniqueName: 'days180', caption: '91-180 Days' },
    { uniqueName: 'days360', caption: '181-360 Days' },
    { uniqueName: 'days360plus', caption: '>360 Days' },
  ]

  const pivotRows90Days = [
    { uniqueName: 'days90', caption: '61-90 Days' },
    { uniqueName: 'days180', caption: '91-180 Days' },
    { uniqueName: 'days360', caption: '181-360 Days' },
    { uniqueName: 'days360plus', caption: '>360 Days' },
  ]

  const pivotMeasures = [{ uniqueName: 'quantity', aggregation: 'sum', caption: 'Stock Qty.' }]

  const [brandIDs, setBrandIDs] = useState([])
  const [brandsList, setBrandsList] = useState([])

  const [categoryIDs, setCategoryIDs] = useState([])
  const [categoriesList, setCategoriesList] = useState([])

  const [subcategoryIDs, setSubcategoryIDs] = useState([])
  const [subcategoriesList, setSubcategoriesList] = useState([])

  const [intervalLength, setIntervalLength] = useState(30)

  const [searchString, setSearchString] = useState('')

  const [pivotTableData, setPivotTableData] = useState([])

  const [pivotView, setPivotView] = useState(false)

  const debouncedInputSearch = debounce((value) => {
    setSearchString(value)
    setCurrentPage(1)
  }, 500)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  const { loading: catLoad, error: catErr, data: catData } = useQuery(PRODUCT_CATS)
  const { loading: subcatLoad, error: subcatErr, data: subcatData } = useQuery(PRODUCT_SUBCATS)

  const {
    loading: ageingReportLoad,
    error: ageingReportErr,
    data: ageingReportData,
  } = useQuery(AGEING_REPORT, {
    variables: {
      brandIDs,
      categoryIDs,
      subcategoryIDs,
      limit,
      offset,
      searchString,
      interval_length: intervalLength,
    },
  })

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
    if (
      !ageingReportLoad &&
      ageingReportData &&
      ageingReportData.ageingReport &&
      ageingReportData.ageingReport.rows &&
      ageingReportData.ageingReport.rows.length
    ) {
      setAgeingReport(ageingReportData.ageingReport.rows)
      setRecordCount(ageingReportData.ageingReport.count)
    } else {
      setAgeingReport([])
      setRecordCount(0)
    }
  }, [ageingReportData, ageingReportLoad])

  const [generatePivotTable, { loading: pivotLoad, data: pivotData, error: pivotErr }] =
    useLazyQuery(AGEING_REPORT_PIVOT_DATA)

  useEffect(() => {
    if (
      !pivotLoad &&
      pivotData &&
      pivotData.ageingReportPivotData &&
      pivotData.ageingReportPivotData.length
    ) {
      let tempPivotData = []
      if (intervalLength) {
        if (intervalLength === 30) {
          tempPivotData = pivotData.ageingReportPivotData.map(({ days120, ...rest }) => ({
            ...rest,
          }))
        } else if (intervalLength === 60) {
          tempPivotData = pivotData.ageingReportPivotData.map(({ days30, days90, ...rest }) => ({
            ...rest,
          }))
        } else if (intervalLength === 90) {
          tempPivotData = pivotData.ageingReportPivotData.map(
            ({ days30, days60, days120, ...rest }) => ({
              ...rest,
            }),
          )
        }
      }
      setPivotTableData(tempPivotData)
    } else setPivotTableData([])
  }, [pivotData, pivotLoad])

  const fixedColumns = [
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
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
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
      title: 'BOM Code',
      dataIndex: 'variant_code',
      key: 'variant_code',
    },
  ]

  const tableColumns30Days = [
    {
      title: '0-30 Days',
      dataIndex: 'days30',
      key: 'days30',
    },
    {
      title: '31-60 Days',
      dataIndex: 'days60',
      key: 'days60',
    },
    {
      title: '61-90 Days',
      dataIndex: 'days90',
      key: 'days90',
    },
    {
      title: '91-180 Days',
      dataIndex: 'days180',
      key: 'days180',
    },
    {
      title: '181-360 Days',
      dataIndex: 'days360',
      key: 'days360',
    },
    {
      title: '>360 Days',
      dataIndex: 'days360plus',
      key: 'days360plus',
    },
  ]

  const tableColumns60Days = [
    {
      title: '0-60 Days',
      dataIndex: 'days60',
      key: 'days60',
    },
    {
      title: '61-120 Days',
      dataIndex: 'days120',
      key: 'days120',
    },
    {
      title: '121-180 Days',
      dataIndex: 'days180',
      key: 'days180',
    },
    {
      title: '180-360 Days',
      dataIndex: 'days360',
      key: 'days360',
    },
    {
      title: '>360 Days',
      dataIndex: 'days360',
      key: 'days360plus',
    },
  ]

  const tableColumns90Days = [
    {
      title: '0-90 Days',
      dataIndex: 'days90',
      key: 'days90',
    },
    {
      title: '91-180 Days',
      dataIndex: 'days180',
      key: 'days180',
    },
    {
      title: '181-360 Days',
      dataIndex: 'days360',
      key: 'days360',
    },
    {
      title: '>360 Days',
      dataIndex: 'days360',
      key: 'days360plus',
    },
  ]

  if (!permissions.includes('readAgeingReport')) return <Error403 />
  if (ageingReportErr) return `Error occured while fetching data: ${ageingReportErr.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (catErr) return `Error occured while fetching data: ${catErr.message}`
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`
  if (pivotErr) return `Error occured while fetching data: ${pivotErr.message}`

  return (
    <div>
      <Helmet title="Ageing Report" />

      <Spin spinning={ageingReportLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>Ageing Report</strong>
                </h5>

                <div className="row mt-4">
                  <div className="col-lg-2">
                    <div className="mb-2">Interval</div>
                    <Select
                      value={intervalLength}
                      onChange={(value) => setIntervalLength(value)}
                      placeholder="Interval"
                      className="custom-pad-r1 w-100"
                    >
                      <Option key={30} value={30}>
                        30 Days
                      </Option>
                      <Option key={60} value={60}>
                        60 Days
                      </Option>
                      <Option key={90} value={90}>
                        90 Days
                      </Option>
                    </Select>
                  </div>
                  <div className="col ml-2">
                    <div className="mb-2">Pivot View</div>
                    <Switch
                      className="mr-2"
                      checked={pivotView}
                      onChange={(checked) => {
                        if (checked)
                          generatePivotTable({
                            variables: {
                              interval_length: intervalLength,
                            },
                          })
                        setPivotView(checked)
                      }}
                    />
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-lg-2 custom-pad-r0">
                    <div className="mb-2">Brands</div>
                    <Select
                      mode="multiple"
                      value={brandIDs}
                      onChange={(value) => setBrandIDs(value)}
                      placeholder="Select Brands"
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
                    <div className="mb-2">Categories</div>
                    <Select
                      mode="multiple"
                      value={categoryIDs}
                      onChange={(value) => setCategoryIDs(value)}
                      placeholder="Select Categories"
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
                  <div className="col-lg-3 custom-pad-r0">
                    <div className="mb-2">Subcategories</div>
                    <Select
                      mode="multiple"
                      value={subcategoryIDs}
                      onChange={(value) => setSubcategoryIDs(value)}
                      placeholder="Select Subcategories"
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
                  <div className="col-lg-2">
                    <div className="mb-2">Search</div>
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search"
                      onChange={({ target: { value } }) => {
                        debouncedInputSearch(value)
                        setBrandIDs([])
                        setCategoryIDs([])
                        setSubcategoryIDs([])
                      }}
                      allowClear
                    />
                  </div>
                  <div className="col-lg-2 ">
                    <div className="mb-2" />
                    <CSVDownload
                      intervalLength={intervalLength}
                      brandIDs={brandIDs}
                      categoryIDs={categoryIDs}
                      subcategoryIDs={subcategoryIDs}
                      searchString={searchString}
                    />
                  </div>
                </div>
              </div>

              <div className="card-body">
                {pivotView && pivotTableData && pivotTableData.length ? (
                  <div className="mt-4">
                    <PivotTable
                      data={pivotTableData}
                      rows={[
                        ...pivotRows,
                        ...(intervalLength === 30
                          ? pivotRows30Days
                          : intervalLength === 60
                          ? pivotRows60dDays
                          : pivotRows90Days),
                      ]}
                      measures={pivotMeasures}
                      columns={[]}
                    />
                  </div>
                ) : (
                  <div className="kit__utils__table">
                    <Table
                      columns={[
                        ...fixedColumns,
                        ...(intervalLength === 30
                          ? tableColumns30Days
                          : intervalLength === 60
                          ? tableColumns60Days
                          : tableColumns90Days),
                      ]}
                      dataSource={ageingReport}
                      pagination={false}
                      rowKey={(record) => String(record.id)}
                      locale={{
                        emptyText: (
                          <div className="custom-empty-text-parent">
                            <div className="custom-empty-text-child">
                              <i className="fe fe-search" />
                              <h5>No Ageing Report Found</h5>
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
                )}
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(AgeingReport))
