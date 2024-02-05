import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useLazyQuery } from '@apollo/client'
import { Select, Table, Spin, Switch } from 'antd'
import PivotTable from 'components/PivotTable'
import Error403 from 'components/Errors/403'
import { STOCK_ON_HAND, MATERIAL_SOH_PIVOT_DATA } from './queries'
import { MATERIAL_SUBCATS } from '../../../../settings/material-settings/subcategories/queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const StockOnHandSubCategories = ({ user: { permissions, type } }) => {
  const [pivotView, setPivotView] = useState(false)
  const [pivotTableData, setPivotTableData] = useState([])
  const pivotRows = [
    { uniqueName: 'material_category_name', caption: 'MATERIAL CAT.' },
    { uniqueName: 'material_subcategory_name', caption: 'MATERIAL SUB-CAT.' },
    { uniqueName: 'material_code', caption: 'MATERIAL CODE' },
    { uniqueName: 'batch_no', caption: 'BATCH NO.' },
    { uniqueName: 'last_po_price', caption: 'LAST PO PRICE' },
  ]

  const pivotMeasures = [
    { uniqueName: 'quantity', aggregation: 'sum', caption: 'Balance Qty.' },
    { uniqueName: 'booked_quantity', aggregation: 'sum', caption: 'Balance Qty.' },
    { uniqueName: 'inward_cost', aggregation: 'sum', caption: 'Inward Cost (₹)' },
  ]

  const [subcategoryIDs, setsubcategoryIDs] = useState([])
  const [stockOnHandsList, setstockOnHandsList] = useState([])
  const [stockOnHands, setstockOnHands] = useState([])

  const [sortBy, setSortBy] = useState('subcategoryAsc')

  const { loading: msLoad, error: msErr, data: msData } = useQuery(MATERIAL_SUBCATS)
  const {
    loading: sohLoad,
    error: sohErr,
    data: sohData,
  } = useQuery(STOCK_ON_HAND, {
    variables: { subcategoryIDs, sortBy },
  })

  const [generatePivotTable, { loading: pivotLoad, data: pivotData, error: pivotErr }] =
    useLazyQuery(MATERIAL_SOH_PIVOT_DATA)

  useEffect(() => {
    if (
      !pivotLoad &&
      pivotData &&
      pivotData.materialSOHReportPivotData &&
      pivotData.materialSOHReportPivotData.length
    ) {
      const tempData = pivotData.materialSOHReportPivotData.map((e) => {
        return {
          ...e,
          inward_cost: e.inward_qty * e.unit_cost,
        }
      })
      setPivotTableData(tempData)
    }
  }, [pivotData, pivotLoad])

  useEffect(() => {
    if (
      sohData &&
      sohData.allMaterialSubcategoriesStock &&
      sohData.allMaterialSubcategoriesStock.length
    ) {
      setstockOnHands(sohData.allMaterialSubcategoriesStock)
    } else {
      setstockOnHands([])
    }
  }, [sohData])

  useEffect(() => {
    if (!msLoad && msData && msData.materialSubcategories && msData.materialSubcategories.length)
      setstockOnHandsList(msData.materialSubcategories)
  }, [msData, msLoad])

  const tableColumns = [
    {
      title: 'Sub Category Name',
      dataIndex: 'material_subcategory',
      key: 'material_subcategory',
      render: (text, record) => <Link to={`stock-on-hand/subcategory/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Total Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => text.toFixed(2),
    },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
      render: (text, record) => {
        const data = record.quantity * record.price_per_uom
        const curr = data.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        return `${curr.slice(0, 1)} ${curr.slice(1)}`
      },
    },
    {
      title: 'Booked Quantity',
      dataIndex: 'booked_quantity',
      key: 'booked_quantity',
      render: (text) => text.toFixed(2),
    },
    {
      title: 'Booked Value',
      dataIndex: 'booked_value',
      key: 'booked_value',
      render: (text, record) => {
        const data = record.booked_quantity * record.price_per_uom
        const curr = data.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        return `${curr.slice(0, 1)} ${curr.slice(1)}`
      },
    },
    {
      title: 'Balance Quantity',
      dataIndex: 'balance_quantity',
      key: 'balance_quantity',
      render: (text, record) => (record.quantity - record.booked_quantity).toFixed(2),
    },
    {
      title: 'Balance Value',
      dataIndex: 'balance_value',
      key: 'balance_value',
      render: (text, record) => {
        const data = (record.quantity - record.booked_quantity) * record.price_per_uom
        const curr = data.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        return `${curr.slice(0, 1)} ${curr.slice(1)}`
      },
    },
  ]

  if (!permissions.includes('readMaterialReport')) return <Error403 />
  if (msErr) return `Error occured while fetching data: ${msErr.message}`
  if (sohErr) return `Error occured while fetching data: ${sohErr.message}`
  if (pivotErr) return `Error occured while fetching data: ${pivotErr.message}`

  return (
    <div>
      <Helmet title="Stock On Hand" />

      <Spin spinning={sohLoad || pivotLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-4">
                  <strong> MATERIAL STOCK-ON-HAND - ALL SUBCATEGORIES</strong>
                </h5>

                <div className="row">
                  <div className="col-lg-10 custom-pad-r0">
                    <Select
                      mode="multiple"
                      value={subcategoryIDs || []}
                      style={{ width: '25%' }}
                      onChange={(value) => setsubcategoryIDs(value)}
                      placeholder="Filter by Material Subcategory"
                      className="custom-pad-r1"
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {stockOnHandsList && stockOnHandsList.length
                        ? stockOnHandsList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>

                    <Select
                      key="sortBy"
                      value={sortBy || 'subcategoryAsc'}
                      style={{ width: '30%' }}
                      placeholder="Sort by name - A to Z"
                      onChange={(value) => setSortBy(value)}
                      className="custom-pad-r1"
                    >
                      <Option key="subcategoryAsc" value="subcategoryAsc">
                        Sort by Sub-Category - A to Z
                      </Option>
                      <Option key="subcategoryDesc" value="subcategoryDesc">
                        Sort by Sub-Category - Z to A
                      </Option>
                      <Option key="totalQtyAsc" value="totalQtyAsc">
                        Sort by Total Quantity - Ascending
                      </Option>
                      <Option key="totalQtyDesc" value="totalQtyDesc">
                        Sort by Total Quantity - Descending
                      </Option>
                      <Option key="totalValueAsc" value="totalValueAsc">
                        Sort by Total Value - Ascending
                      </Option>
                      <Option key="totalValueDesc" value="totalValueDesc">
                        Sort by Total Value - Descending
                      </Option>
                      <Option key="bookedQtyAsc" value="bookedQtyAsc">
                        Sort by Booked Quantity - Ascending
                      </Option>
                      <Option key="bookedQtyDesc" value="bookedQtyDesc">
                        Sort by Booked Quantity - Descending
                      </Option>
                      <Option key="bookedValueAsc" value="bookedValueAsc">
                        Sort by Booked Value - Ascending
                      </Option>
                      <Option key="bookedValueDesc" value="bookedValueDesc">
                        Sort by Booked Quantity - Descending
                      </Option>
                      <Option key="balanceQtyAsc" value="balanceQtyAsc">
                        Sort by Balance Quantity - Ascending
                      </Option>
                      <Option key="balanceQtyDesc" value="balanceQtyDesc">
                        Sort by Balance Quantity - Descending
                      </Option>
                      <Option key="balanceValueAsc" value="balanceValueAsc">
                        Sort by Balance Value - Ascending
                      </Option>
                      <Option key="balanceValueDesc" value="balanceValueDesc">
                        Sort by Balance Value - Descending
                      </Option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {type === 'admin' ? (
                  <div className="row ml-2">
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
                  <div className="kit__utils__table mt-4">
                    <Table
                      columns={tableColumns}
                      dataSource={stockOnHands}
                      pagination={{
                        defaultPageSize: 20,
                        showSizeChanger: true,
                        pageSizeOptions: ['20', '40', '60'],
                      }}
                      rowKey={(record) => String(record.subcategory_id)}
                      locale={{
                        emptyText: (
                          <div className="custom-empty-text-parent">
                            <div className="custom-empty-text-child">
                              <i className="fe fe-search" />
                              <h5>No Stock On Hand Found</h5>
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
                )}
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(StockOnHandSubCategories))
