import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useLazyQuery } from '@apollo/client'
import { Button, Table, Spin, Pagination, Switch, Space } from 'antd'
import Error403 from 'components/Errors/403'
import PivotTable from 'components/PivotTable'

import { PRODUCT_PLANS, PRODUCT_PLAN_PIVOT_DATA } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const ProductPlans = ({ user: { permissions, type } }) => {
  const pivotRows = [
    { uniqueName: 'year', caption: ' Year' },
    { uniqueName: 'quarter', caption: ' Quarter' },
    { uniqueName: 'brand_name', caption: 'Brand' },
    { uniqueName: 'product_category_name', caption: 'Category' },
    { uniqueName: 'product_subcategory_name', caption: 'Sub-Category' },
  ]

  const pivotMeasures = [
    { uniqueName: 'new_product_budget', aggregation: 'sum', caption: ' Budget for New Product' },
    {
      uniqueName: 'repeat_product_budget',
      aggregation: 'sum',
      caption: ' Budget for Repeat Product',
    },
  ]

  const [productPlans, setProductPlans] = useState([])

  const [pivotView, setPivotView] = useState(false)
  const [pivotTableData, setPivotTableData] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)

  const {
    loading: productPlanLoad,
    error: productPlanErr,
    data: productPlanData,
  } = useQuery(PRODUCT_PLANS, {
    variables: { limit, offset },
  })

  useEffect(() => {
    if (!productPlanLoad && productPlanData && productPlanData.productPlans) {
      setProductPlans(productPlanData.productPlans.rows)
      setRecordCount(productPlanData.productPlans.count)
    }
  }, [productPlanData, productPlanLoad])

  const [generatePivotTable, { loading: pivotLoad, data: pivotData, error: pivotErr }] =
    useLazyQuery(PRODUCT_PLAN_PIVOT_DATA)

  useEffect(() => {
    if (pivotData && pivotData.productPlanPivotData && pivotData.productPlanPivotData) {
      setPivotTableData(
        pivotData.productPlanPivotData.map((e) => ({
          ...e,
          year: `${e.year}-${(e.year % 100) + 1}`,
        })),
      )
    }
  }, [pivotData, pivotLoad])

  const tableColumns = [
    {
      title: 'Plan period (FY)',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => `${record.quarter} FY ${record.year}-${(record.year % 100) + 1}`,
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
    },
    {
      title: 'Styles',
      dataIndex: 'styles',
      key: 'styles',
    },
    {
      title: 'Plan Qty.',
      dataIndex: 'planned_quantity',
      key: 'planned_quantity',
    },

    {
      title: 'New Budget',
      dataIndex: 'budget_new_product',
      key: 'budget_new_product',
    },
    {
      title: 'Repeat Budget',
      dataIndex: 'budget_repeat_product',
      key: 'budget_repeat_product',
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Link to={`/product-plan/update/${record.id}`}>
            <Button type="primary">View/Edit</Button>
          </Link>
          <Link to={`/product-plan/style/${record.id}/${record.brand_id}`}>
            <Button type="primary">Style</Button>
          </Link>
        </Space>
      ),
    },
  ]

  if (!permissions.includes('readProductPlan')) return <Error403 />
  if (productPlanErr) return `Error occured while fetching data: ${productPlanErr.message}`
  if (pivotErr) return `Error occured while fetching data: ${pivotErr.message}`

  return (
    <div>
      <Helmet title="Product Plan" />

      <Spin spinning={productPlanLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-2">
                  <strong>Product Plan</strong>
                </h5>

                <div className="row">
                  {permissions.includes('createProductPlan') ? (
                    <div className="col-lg-1 custom-pad-r0">
                      <Link to="/product-plan/create">
                        <Button type="primary">Create</Button>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="card-body">
                {type === 'admin' ? (
                  <div className="row mb-4 ml-2">
                    <Switch
                      className="mr-2"
                      checked={pivotView}
                      onChange={(checked) => {
                        if (checked) generatePivotTable()
                        setPivotView(checked)
                      }}
                    />
                    <div>Pivot View</div>
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
                  <div className="kit__utils__table">
                    <Table
                      columns={tableColumns}
                      dataSource={productPlans}
                      pagination={false}
                      rowKey={(record) => String(record.id)}
                      locale={{
                        emptyText: (
                          <div className="custom-empty-text-parent">
                            <div className="custom-empty-text-child">
                              <i className="fe fe-search" />
                              <h5>No Product Plans Found</h5>
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

export default withRouter(connect(mapStateToProps)(ProductPlans))
