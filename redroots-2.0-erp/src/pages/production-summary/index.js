import React, { useState, useEffect } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Spin, Switch, Tabs } from 'antd'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import PivotTable from 'components/PivotTable'
// import InfiniteScroll from 'react-infinite-scroll-component'
import SummaryTable from './production-summary-table'
import CSVDownload from './csvDownload'
import PRODUCTION_SUMMARY from './queries'
import './style.scss'

const { TabPane } = Tabs

const mapStateToProps = ({ user }) => ({ user })

const ProductionSummary = ({ user: { permissions, type } }) => {
  const pivotRows = [
    { uniqueName: 'brand_name', caption: 'Brand' },
    { uniqueName: 'purchase_order_type', caption: ' purchase_order_type' },
    { uniqueName: 'user_name', caption: 'Issued By' },
    { uniqueName: 'po_date', caption: 'P.O. DAte' },
    { uniqueName: 'purchase_order_id', caption: 'P.O. #' },
    { uniqueName: 'status', caption: 'P.O. Status' },
    { uniqueName: 'due_date', caption: 'P.O. Expiry Date' },
    { uniqueName: 'vendor_name', caption: 'Vendor' },
    { uniqueName: 'pack', caption: 'Set' },
    { uniqueName: 'ean', caption: 'EAN' },
    { uniqueName: 'asin', caption: 'ASIN' },
    { uniqueName: 'product_category_name', caption: 'Category' },
    { uniqueName: 'product_subcategory_name', caption: 'Sub-Category' },
    { uniqueName: 'code', caption: 'BOM/Pack Code' },
    { uniqueName: 'quantity', caption: 'P.O. Qty' },
  ]

  const pivotMeasures = [
    { uniqueName: 'total_price', aggregation: 'sum', caption: ' P.O. Value (with GST) (₹)' },
  ]
  const [pivotView, setPivotView] = useState(false)
  const [pivotTableData, setPivotTableData] = useState([])
  const [productionSummary, setProductionSummary] = useState([])
  const [completedSummary, setCompletedSummary] = useState([])
  // const [currentPage, setCurrentPage] = useState(1)
  //   const [pageSize, setPageSize] = useState(20)
  //   const [recordCount, setRecordCount] = useState(0)
  const [limit, setLimit] = useState(50)
  // const [offset, setOffset] = useState(0)
  const [hashMore, setHasMore] = useState(true)
  const {
    loading: productionSummaryLoad,
    error: productionSummaryErr,
    data: productionSummaryData,
  } = useQuery(PRODUCTION_SUMMARY, { variables: { limit } })

  useEffect(() => {
    if (
      !productionSummaryLoad &&
      productionSummaryData &&
      productionSummaryData?.productionSummary &&
      productionSummaryData?.productionSummary?.length
    ) {
      setProductionSummary(
        productionSummaryData.productionSummary.filter((e) => {
          return e.quantity - e.received_quantity !== 0
        }),
      )
      setCompletedSummary(
        productionSummaryData.productionSummary.filter((e) => {
          return e.quantity - e.received_quantity === 0
        }),
      )
      const tempPivotData = productionSummaryData.productionSummary
        .filter((e) => e.quantity - e.received_quantity !== 0)
        .map((e) => {
          return {
            ...e,
            po_date: moment(Number(e.po_date)).format('Do MMM YYYY'),
            due_date: moment(Number(e.due_date)).format('Do MMM YYYY'),
            vendor_name: `${e.vendor_company} (${e.vendor_name})` || '-',
            pack: e.pack ? `Pack of ${e.pack_of}` : 'Single',
            product_category_name: e.pack
              ? e.contains_same_product
                ? e.product_category_name
                : '-'
              : e.product_category_name,
            product_subcategory_name: e.pack
              ? e.contains_same_product
                ? e.product_subcategory_name
                : '-'
              : e.product_subcategory_name,
            total_price:
              e.quantity * e.unit_cost +
              (e.quantity * e.unit_cost * Number(e.igst) + Number(e.cgst) + Number(e.sgst) / 100),
          }
        })
      setPivotTableData(tempPivotData)
    }
  }, [productionSummaryData, productionSummaryLoad])

  const tableColumns = [
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name',
      render: (text) => text || '-',
      fixed: 'left',
    },
    {
      title: 'P.O. Type',
      dataIndex: 'purchase_order_type',
      key: 'purchase_order_type',
      render: (text) => text || '-',
      fixed: 'left',
    },
    {
      title: 'P.O. Class',
      dataIndex: 'po_class',
      key: 'po_class',
      render: (text) => text || '-',
      fixed: 'left',
    },
    {
      title: 'Issued By',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (text) => text || '-',
      fixed: 'left',
    },
    {
      title: 'P.O. Date',
      dataIndex: 'po_date',
      key: 'po_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : null),
      fixed: 'left',
    },
    {
      title: 'P.O. #',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
      render: (text, record) => (
        <Link to={`/purchase-orders/product/view/${record.purchase_order_id}`}>{text || '-'}</Link>
      ),
      fixed: 'left',
    },

    {
      title: 'P.O. Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => text || '-',
      fixed: 'left',
    },
    {
      title: 'P.O. Expiry Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : null),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      render: (text, record) => `${record.vendor_company}` || '-',
    },
    {
      title: 'Vendor Bill No.',
      dataIndex: 'vendor_bill_no',
      key: 'vendor_bill_no',
      render: (text) => text || '-',
    },
    {
      title: 'Set ',
      dataIndex: 'pack',
      key: 'pack',
      render: (pack, { pack_of }) => (pack ? `Pack of ${pack_of}` : 'Single'),
    },
    {
      title: 'EAN ',
      dataIndex: 'ean',
      key: 'ean',
      render: (text) => text || '-',
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
      render: (text) => text || '-',
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text) => text || '-',
    },
    {
      title: 'Category',
      dataIndex: 'product_category_name',
      key: 'product_category_name',
      render: (text, { pack, contains_same_product }) =>
        pack ? (contains_same_product ? text : '-') : text,
    },
    {
      title: 'Sub-Category',
      dataIndex: 'product_subcategory_name',
      key: 'product_subcategory_name',
      render: (text, { pack, contains_same_product }) =>
        pack ? (contains_same_product ? text : '-') : text,
    },
    {
      title: 'BOM/Pack Code',
      dataIndex: 'code',
      key: 'code',
      render: (text) => text || '-',
    },

    {
      title: 'P.O. Qty.',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => text || '-',
    },
    {
      title: 'unit cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      render: (text) => text || '-',
    },
    {
      title: 'P.O. Value (without GST) (₹) ',
      key: 'total_price',
      render: (text, { quantity, unit_cost }) => quantity * unit_cost,
    },
    {
      title: 'CGST',
      dataIndex: 'cgst',
      key: 'cgst',
      render: (text, record) =>
        (record.quantity * record.unit_cost * (record.cgst / 100)).toFixed(2),
    },
    {
      title: 'SGST',
      dataIndex: 'sgst',
      key: 'sgst',
      render: (text, record) =>
        (record.quantity * record.unit_cost * (record.sgst / 100)).toFixed(2),
    },
    {
      title: 'IGST',
      dataIndex: 'igst',
      key: 'igst',
      render: (text, record) =>
        (record.quantity * record.unit_cost * (record.igst / 100)).toFixed(2),
    },
    {
      title: 'P.O. Value (with GST) (₹) ',
      key: 'total_price',
      render: (text, record) => {
        let total = 0
        if (record.same_state && record.quantity && record.unit_cost) {
          total = record.quantity * record.unit_cost * (1 + record.cgst / 100 + record.sgst / 100)
        } else if (!record.same_state && record.quantity && record.unit_cost) {
          total = record.quantity * record.unit_cost * (1 + record.igst / 100)
        }
        return parseFloat(total).toFixed(2)
      },
    },
    {
      title: 'P.I.#',
      dataIndex: 'pi',
      key: 'pi',
      render: (text) => text || '-',
    },
    {
      title: 'Buyer P.O. #.',
      dataIndex: 'sales_order_name',
      key: 'sales_order_name',
      render: (text) => text || '-',
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
      render: (text) => text || '-',
    },
    {
      title: 'Buyer Type',
      dataIndex: 'buyer_type',
      key: 'buyer_type',
      render: (text) => text || '-',
    },
    {
      title: 'Buyer Group',
      dataIndex: 'buyer_group_name',
      key: 'buyer_group_name',
      render: (text) => text || '-',
    },
    {
      title: 'Buyer Warehouse',
      dataIndex: 'warehouse_name',
      key: 'buyer_group_name',
      render: (text, { warehouse_location }) => (text ? `${text}(${warehouse_location})` : '-'),
    },
    {
      title: 'Buyer P.O. Closure ',
      dataIndex: 'buyer_po_closure',
      key: 'buyer_po_closure',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY') : '-'),
    },
    {
      title: 'Recieved Qty.',
      dataIndex: 'received_quantity',
      key: 'received_quantity',
      render: (text) => text || 0,
    },
    {
      title: 'Rejected Qty.',
      dataIndex: 'rejected_quantity',
      key: 'rejected_quantity',
      render: (text) => text || 0,
    },
    {
      title: 'Remark.',
      dataIndex: 'remark',
      key: 'remark',
      render: (text) => text || 0,
    },
    {
      title: 'QC Allotment.',
      dataIndex: 'qc_allotment',
      key: 'qc_allotment',
      render: (text) => text || 0,
    },
    {
      title: 'Recieved Qty Date.',
      dataIndex: 'received_quantity_date',
      key: 'received_quantity_date',
      render: (text) => text || 0,
    },

    {
      title: 'Recieved Total Value',
      dataIndex: 'received_total_value',
      key: 'received_total_value',
      render: (text, record) => record.unit_cost * record.received_quantity || 0,
    },
    {
      title: 'Balanced Qty.',
      dataIndex: 'balanced_quantity',
      key: 'balanced_quantity',
      render: (text, record) => record.quantity - record.received_quantity || 0,
    },

    {
      title: 'GRN No.',
      dataIndex: 'grn_no',
      key: 'grn_no',
      render: (grn_no) =>
        grn_no && grn_no.length
          ? grn_no.map((number, i) => {
              if (i === grn_no.length - 1)
                return <Link to={`/inventory/put-aways/form/${number}`}> {number}</Link>
              return <Link to={`/inventory/put-aways/form/${number}`}>{number}</Link>
            })
          : null,
    },
    {
      title: 'Company name ',
      dataIndex: 'company_name',
      key: 'company_name',
      render: (text) => text || '-',
    },
    {
      title: 'Balanced Total Value',
      dataIndex: 'balanced_total_value',
      key: 'balanced_total_value',
      render: (text, record) =>
        (record.quantity - record.received_quantity) * record.unit_cost || 0,
    },
    // {
    //   title: 'Material Status',
    //   dataIndex: 'material_status',
    //   key: 'material_status',
    //   render: (text, record) => {
    //     return {
    //       props: {
    //         style: {
    //           background: record.material_status === 'Pending' ? 'red' : 'yellow',
    //           color: 'black',
    //         },
    //       },
    //       children: <b>{text}</b>,
    //     }
    //   },
    // },
  ]
  if (!permissions.includes('readProductionSummary')) return <Error403 />
  if (productionSummaryErr)
    return `Error occured while fetching data: ${productionSummaryErr.message}`
  return (
    <div>
      <Helmet title="M.O.S" />

      <Spin spinning={productionSummaryLoad} tip="Loading..." size="large" className="pt-2">
        <div className="row pt-2 mb-2">
          {type === 'admin' ? (
            <div className="col-10">
              <Switch
                className="mr-2"
                checked={pivotView}
                onChange={(checked) => {
                  setPivotView(checked)
                }}
              />
              <span>Pivot View</span>
            </div>
          ) : null}
          <div className="col-2">
            <CSVDownload data={productionSummary} />
          </div>
        </div>
        <div className="row production_summary_report">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body pt-2">
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
                    <Tabs defaultActiveKey="1">
                      <TabPane tab={`Open Summary(${productionSummary.length})`} key="1">
                        {/* <InfiniteScroll
                          dataLength={productionSummary.length}
                          next={() => {
                            setLimit(limit + 20)
                            if (productionSummary.length >= 500) setHasMore(false)
                          }}
                          hasMore={hashMore}
                          loader={
                            <Spin
                              spinning={productionSummaryLoad}
                              tip="Loading..."
                              size="large"
                              className="pt-2"
                            />
                          }
                        > */}
                        <SummaryTable
                          tableColumns={tableColumns}
                          data={productionSummary}
                          hashMore={hashMore}
                          setHasMore={setHasMore}
                          limit={limit}
                          setLimit={setLimit}
                        />
                        {/* </InfiniteScroll> */}
                      </TabPane>
                      <TabPane tab={`Completed Summary(${completedSummary.length})`} key="2">
                        <SummaryTable
                          tableColumns={tableColumns}
                          data={completedSummary}
                          hashMore={hashMore}
                          setHasMore={setHasMore}
                          limit={limit}
                          setLimit={setLimit}
                        />
                      </TabPane>
                    </Tabs>

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
export default withRouter(connect(mapStateToProps)(ProductionSummary))
