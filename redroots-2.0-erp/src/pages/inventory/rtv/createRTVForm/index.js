import React, { useState, useEffect } from 'react'
import { withRouter, useParams, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  Spin,
  Switch,
  Button,
  Select,
  Input,
  Table,
  DatePicker,
  InputNumber,
  Popconfirm,
  notification,
} from 'antd'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import _ from 'lodash'
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  RTV_NAMES,
  RTV,
  UPSERT_RTV,
  RETURN_REASONS,
  VARIANT_BY_SALES_ORDERS,
  SALES_ORDER_NAMES_LIST,
} from '../queries'
// import { VARIANT_CODES } from '../../../products/all-products/queries'
import { BUYER_NAMES } from '../../../accounts/buyers/queries'
import { WAREHOUSES } from '../../../sales-orders/all-sales-orders/queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const CreateRTVForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [status, setStatus] = useState(null)

  const [rtvNamesList, setRTVNamesList] = useState([])
  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(undefined)

  const [buyerNamesList, setBuyerNamesList] = useState([])
  const [buyerID, setBuyerID] = useState('0')
  const [buyerIDError, setBuyerIDError] = useState(undefined)

  const [customBuyerName, setCustomBuyerName] = useState(undefined)
  const [customBuyerNameError, setCustomBuyerNameError] = useState(undefined)

  const [receivedOn, setReceivedOn] = useState(undefined)
  const [receivedOnError, setReceivedOnError] = useState(undefined)

  const [salesOrderIDs, setSalesOrderIDs] = useState([])
  const [salesOrderIDsError, setSalesOrderIDsError] = useState([])
  const [salesOrderList, setSalesOrderList] = useState([])

  // const [variantCodesList, setVariantCodesList] = useState([])
  const [variantCodeBySalesOrder, setVariantCodeBySalesOrder] = useState([])

  const [warehouseID, setWarehouseID] = useState(undefined)
  const [warehouseIDError, setWarehouseIDError] = useState(undefined)
  const [warehousesList, setWarehousesList] = useState([])

  const [returnReasonsList, setReturnReasonsList] = useState([])
  const [deletedRows, setDeletedRows] = useState([])

  const [tableData, setTableData] = useState([])
  const [tableDataError, setTableDataError] = useState(false)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateRTV')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertRTV] = useMutation(UPSERT_RTV)

  const addRow = () => {
    const count = tableData.length + 1
    const newRow = {
      isNew: true,
      key: count,
      variant_code: '',
      quantity: 0,
    }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)
  }

  const deleteRow = (key) => {
    const tempDeletedRow = _.cloneDeep(deletedRows)
    const newTableData = []

    tableData.forEach((row) => {
      if (row.key !== key) newTableData.push(row)
      else if (!row.isNew) tempDeletedRow.push(row.id)
    })

    setTableData(newTableData)
    setDeletedRows(tempDeletedRow)
  }

  const { loading: rtvNamesLoad, error: rtvNamesErr, data: rtvNamesData } = useQuery(RTV_NAMES)

  const {
    loading: returnReasonsLoad,
    error: returnReasonsErr,
    data: returnReasonsData,
  } = useQuery(RETURN_REASONS)

  // const {
  //   loading: variantCodesLoad,
  //   error: variantCodesErr,
  //   data: variantCodesData,
  // } = useQuery(VARIANT_CODES)
  const [
    getVariantCodes,
    { loading: variantBySOLoad, data: variantBySOData, error: variantBySOError },
  ] = useLazyQuery(VARIANT_BY_SALES_ORDERS, { variables: { sales_order_id: salesOrderIDs } })
  useEffect(() => {
    if (
      !variantBySOLoad &&
      variantBySOData &&
      variantBySOData.variantsBySalesOrderID &&
      variantBySOData.variantsBySalesOrderID.length
    ) {
      setVariantCodeBySalesOrder(variantBySOData.variantsBySalesOrderID)
    } else {
      setVariantCodeBySalesOrder([])
    }
  }, [variantBySOLoad, variantBySOData])
  const {
    loading: warehousesLoad,
    error: warehousesErr,
    data: warehousesData,
  } = useQuery(WAREHOUSES)

  const {
    loading: salesOrderLoad,
    error: salesOrderErr,
    data: salesOrderData,
  } = useQuery(SALES_ORDER_NAMES_LIST)

  const {
    loading: buyerNamesLoad,
    error: buyerNamesErr,
    data: buyerNamesData,
  } = useQuery(BUYER_NAMES)

  const { loading: rtvLoad, error: rtvErr, data: rtvData } = useQuery(RTV, { variables: { id } })

  useEffect(() => {
    if (
      !buyerNamesLoad &&
      buyerNamesData &&
      buyerNamesData.buyerNames &&
      buyerNamesData.buyerNames.length
    )
      setBuyerNamesList(buyerNamesData.buyerNames)
  }, [buyerNamesData, buyerNamesLoad])

  useEffect(() => {
    if (
      !salesOrderLoad &&
      salesOrderData &&
      salesOrderData.allSalesOrderNames &&
      salesOrderData.allSalesOrderNames.length
    )
      setSalesOrderList(salesOrderData.allSalesOrderNames)
  }, [salesOrderData, salesOrderLoad])

  useEffect(() => {
    if (!rtvNamesLoad && rtvNamesData && rtvNamesData.rtvNames && rtvNamesData.rtvNames.length)
      setRTVNamesList(rtvNamesData.rtvNames)
  }, [rtvNamesLoad, rtvNamesData])

  useEffect(() => {
    if (
      !returnReasonsLoad &&
      returnReasonsData &&
      returnReasonsData.returnReasons &&
      returnReasonsData.returnReasons.length
    )
      setReturnReasonsList(returnReasonsData.returnReasons)
  }, [returnReasonsLoad, returnReasonsData])

  // useEffect(() => {
  //   if (
  //     !variantCodesLoad &&
  //     variantCodesData &&
  //     variantCodesData.variantCodes &&
  //     variantCodesData.variantCodes.length
  //   )
  //     setVariantCodesList(variantCodesData.variantCodes)
  // }, [variantCodesData, variantCodesLoad])

  useEffect(() => {
    if (!warehousesLoad && warehousesData && warehousesData.warehouses)
      setWarehousesList(warehousesData.warehouses)
    else setWarehousesList([])
  }, [warehousesData, warehousesLoad])

  useEffect(() => {
    if (!rtvLoad && rtvData && rtvData.rtv) {
      const {
        buyer_id,
        custom_buyer_name,
        received_on,
        sales_order_ids,
        warehouse_id,
        rtv_bom_detail,
        rtv_reason_mapping_detail,
      } = rtvData.rtv
      if (rtvData.rtv.name) setName(rtvData.rtv.name)
      if (buyer_id) setBuyerID(buyer_id)
      else setBuyerID('0')
      if (custom_buyer_name) setCustomBuyerName(custom_buyer_name)
      if (received_on) setReceivedOn(moment(Number(received_on)))
      if (sales_order_ids) {
        setSalesOrderIDs(sales_order_ids.map(String))
        getVariantCodes()
      }
      if (warehouse_id) setWarehouseID(warehouse_id)

      let intermediateTableData = []
      if (
        rtv_bom_detail &&
        rtv_bom_detail.length &&
        rtv_reason_mapping_detail &&
        rtv_reason_mapping_detail.length
      ) {
        intermediateTableData = rtv_bom_detail.map((obj) => {
          const rtv_reason_mapping = rtv_reason_mapping_detail.find((e) => e.rtv_bom_id === obj.id)
          return {
            ...obj,
            key: obj.id,
            isNew: false,
            ...rtv_reason_mapping,
          }
        })
      }

      setTableData(intermediateTableData)
      if (rtvData.rtv.status) setStatus(rtvData.rtv.status)
    }
  }, [rtvData, rtvLoad])

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_variant_id',
      key: 'product_variant_id',
      sort: true,
      filter: false,
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.product_variant_id
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <Select
              onChange={(e) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.product_variant_id = e
                })
                setTableData(intermediateTableData)
              }}
              value={record.product_variant_id}
              style={{ width: '100%' }}
              placeholder="Please select one"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={disabled}
            >
              {variantCodeBySalesOrder && variantCodeBySalesOrder.length
                ? variantCodeBySalesOrder.map((obj) => (
                    <Select.Option key={String(obj.id)} value={String(obj.id)}>
                      {obj.code}
                    </Select.Option>
                  ))
                : null}
            </Select>
          ),
        }
      },
    },
    {
      title: 'Qty. Returned',
      dataIndex: 'quantity',
      key: 'quantity',
      sort: false,
      filter: false,
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.quantity ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.quantity}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.quantity = value
                  }
                })

                setTableData(intermediateTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: 'Returned Reason',
      dataIndex: 'return_reason_id',
      key: 'return_reason_id',
      sort: true,
      filter: false,
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.return_reason_id
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <Select
              onChange={(e) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.return_reason_id = e
                })
                setTableData(intermediateTableData)
              }}
              value={record.return_reason_id}
              style={{ width: '100%' }}
              placeholder="Please select one reasons"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={disabled}
            >
              {returnReasonsList && returnReasonsList.length
                ? returnReasonsList.map((obj) => (
                    <Select.Option key={String(obj.id)} value={String(obj.id)}>
                      {obj.name}
                    </Select.Option>
                  ))
                : null}
            </Select>
          ),
        }
      },
    },
    {
      title: '',
      dataIndex: 'deleteRow',
      type: 'number',
      sort: false,
      filter: false,
      // width: "20%",
      render: (text, record) => (
        <Popconfirm
          title="Sure to delete? Any product already put in shelves will be deleted."
          onConfirm={() => deleteRow(record.key)}
          disabled={disabled}
        >
          <Button type="danger" disabled={disabled}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const onSubmit = () => {
    setNameError(undefined)
    setBuyerIDError(undefined)
    setCustomBuyerNameError(undefined)
    setReceivedOnError(undefined)
    setWarehouseIDError(undefined)
    setSalesOrderIDsError(undefined)

    let isError = false

    if (!name) {
      isError = true
      setNameError('Please enter a valid name / ID for this RTV')
    } else if (name && rtvNamesList && rtvNamesList.length && action === 'create') {
      rtvNamesList.forEach((obj) => {
        if (name.toLowerCase() === obj.name.toLowerCase()) {
          isError = true
          setNameError('This name / ID already exists. Please choose a different one.')
        }
      })
    }

    if (!buyerID) {
      isError = true
      setBuyerIDError('Please select a buyer')
    }

    if (!Number(buyerID) && !customBuyerName) {
      isError = true
      setCustomBuyerNameError("Please enter a valid name for 'Custom Buyer'")
    }

    if (!receivedOn) {
      isError = true
      setReceivedOnError('Please select the date when RTV was received')
    }

    if (!salesOrderIDs || !salesOrderIDs.length) {
      isError = true
      setSalesOrderIDsError('Please select sales orders against which RTV is being received.')
    }

    if (!warehouseID) {
      isError = true
      setWarehouseIDError('Please select a warehouse')
    }

    if (!tableData || tableData.length === 0) {
      isError = true
      setTableDataError('Please add at least add one record')
    }

    const detail = []

    const intermediateTableData = _.cloneDeep(tableData)

    intermediateTableData.forEach((record) => {
      record.recordError = {}

      if (!record.product_variant_id || record.product_variant_id === '') {
        isError = true
        record.recordError.product_variant_id = true
      }
      if (!record.quantity || record.quantity === 0) {
        isError = true
        record.recordError.quantity = true
      }
      if (!record.return_reason_id || record.return_reason_id === '') {
        isError = true
        record.recordError.return_reason_id = true
      }

      detail.push({
        id: record.id || undefined,
        product_variant_id: record.product_variant_id,
        quantity: record.quantity,
        return_reason_id: record.return_reason_id,
      })
    })
    setTableData(intermediateTableData)

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertRTV({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        name,
        buyer_id: Number(buyerID) || null,
        custom_buyer_name: customBuyerName,
        sales_order_ids: salesOrderIDs.map(Number),
        received_on: String(receivedOn.valueOf()),
        warehouse_id: warehouseID,
        rtvVariantData: detail,
        deleted_row_ids: deletedRows,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/inventory/rtv')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving RTV.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const ErrorPage = () => {
    return (
      <>
        <div className="container p-5 mb-auto text-dark font-size-32">
          <div className="font-weight-bold mb-3">Permission denied because of Status</div>
          <div className="text-gray-6 font-size-24">
            You do not have permissions to view this page. If you believe otherwise, try logging-in
            again. Or else, contact the system administrator.
          </div>
          <Button className="btn btn-outline-primary width-100" onClick={() => history.goBack()}>
            Go Back
          </Button>
        </div>
      </>
    )
  }
  if (!permissions.includes('updateRTV')) return <Error403 />
  if (action === 'create' && !permissions.includes('createRTV')) return <Error403 />
  if (action === 'update' && status && status !== 'pending') return ErrorPage()
  if (returnReasonsErr) return `Error occured while fetching data: ${returnReasonsErr.message}`
  // if (variantCodesErr) return `Error occured while fetching data: ${variantCodesErr.message}`
  if (variantBySOError) return `Error occured while fetching data: ${variantBySOError.message}`
  if (salesOrderErr) return `Error occured while fetching data: ${salesOrderErr.message}`
  if (warehousesErr) return `Error occured while fetching data: ${warehousesErr.message}`
  if (rtvErr) return `Error occured while fetching data: ${rtvErr.message}`
  if (rtvNamesErr) return `Error occured while fetching data: ${rtvNamesErr.message}`
  if (buyerNamesErr) return `Error occured while fetching data: ${buyerNamesErr.message}`

  return (
    <>
      <Helmet title="RTV" />

      <Spin spinning={buyerNamesLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} RTV</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateRTV') ? (
            <div className="col-1 pull-right">
              <Switch
                checked={editMode}
                onChange={(checked) => {
                  setEditMode(checked)
                  setDisabled(!checked)
                }}
              />
              &ensp;Edit
            </div>
          ) : null}
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-4">
                <div className="mb-2">RTV Name</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
                <div className="custom-error-text mb-4">{nameError || ''}</div>
              </div>

              <div className="col-4">
                <div className="mb-2">Buyer</div>
                <Select
                  value={buyerID || null}
                  placeholder="Select a year"
                  onChange={(value) => setBuyerID(value)}
                  className="custom-pad-r1"
                  style={{ width: '100%' }}
                  disabled={disabled}
                >
                  <Option key="0" value="0">
                    CUSTOM BUYER
                  </Option>
                  {buyerNamesList && buyerNamesList.length
                    ? buyerNamesList.map((buyer) => (
                        <Option key={buyer.id} value={String(buyer.id)}>
                          {`${buyer.name}`}
                        </Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{buyerIDError || ''}</div>
              </div>

              <div className="col-lg-4">
                <div className="mb-2">Custom Buyer Name</div>
                <Input
                  disabled={!!Number(buyerID) || disabled}
                  value={customBuyerName}
                  placeholder="Enter name of buyer"
                  onChange={({ target: { value } }) => setCustomBuyerName(value)}
                />
                <div className="custom-error-text mb-4">{customBuyerNameError || ''}</div>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-4">
                <div className="mb-2">RTV Received On</div>
                <DatePicker
                  format="YYYY/MM/DD"
                  placeholder="Select a date"
                  value={receivedOn || null}
                  onChange={(value) => setReceivedOn(value)}
                  style={{ width: '100%' }}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{receivedOnError || ''}</div>
              </div>
              <div className="col-4">
                <div className="mb-2">Against Sales Order(s)</div>

                <Select
                  mode="multiple"
                  showSearch
                  value={salesOrderIDs}
                  onChange={(value) => {
                    setSalesOrderIDs(value)
                    getVariantCodes()
                  }}
                  placeholder="Select Sales Orders "
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  className="custom-pad-r1 mb-2 w-100"
                  disabled={disabled}
                >
                  {salesOrderList && salesOrderList.length
                    ? salesOrderList.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {` ${obj.name}
                              `}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{salesOrderIDsError || ''}</div>
              </div>
              <div className="col-4">
                <div className="mb-2">Warehouse</div>

                <Select
                  showSearch
                  disabled={disabled}
                  value={warehouseID}
                  style={{ width: '100%' }}
                  onChange={(value) => setWarehouseID(value)}
                  placeholder="Select the warehouse"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {warehousesList && warehousesList.length
                    ? warehousesList.map((obj) => (
                        <Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{warehouseIDError || ''}</div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-9 pull-right" style={{ textAlign: 'right' }}>
                <Button onClick={addRow} type="default" disabled={disabled}>
                  Add Row
                </Button>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-9">
                <Table
                  dataSource={tableData}
                  columns={columns}
                  pagination={false}
                  className={tableDataError ? 'custom-error-border' : ''}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2 mr-2 pull-right">
          <div className="col-12">
            {(action === 'create' && permissions.includes('createRTV')) ||
            (action === 'update' && permissions.includes('updateRTV')) ? (
              <Button type="primary" onClick={onSubmit} disabled={disabled}>
                {okText}
              </Button>
            ) : null}
            &emsp;
            <Button danger onClick={() => history.goBack()}>
              Back
            </Button>
          </div>
        </div>
      </Spin>
    </>
  )
}

export default withRouter(connect(mapStateToProps)(CreateRTVForm))

// import React from "react";
// import Page from "components/LayoutComponents/Page";
// import Helmet from "react-helmet";
// import { Query, Mutation } from "react-apollo";
// import Form from "./form";
// // prettier-ignore
// import { getRTVNamesOnly, getRTVById, addRTV, editRTV } from "Query/WarehouseManagement/rtv";

// class FormPage extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }
//   static defaultProps = {
//     // abcd: { name: "Put Away", path: "/inventory/putaway" },
//     // pathName: "PAway",
//     roles: ["agent", "administrator"],
//     accessRights: ["isViewDataValidation"]
//   };

//   render() {
//     const { id } = this.props.match.params;
//     return (
//       <Page {...this.props}>
//         <Helmet title="RTV" />
//         <Query query={getRTVNamesOnly}>
//           {({ loading: allRTVLoad, error: allRTVErr, data: allRTVData }) => (
//             <Query query={getRTVById} variables={{ id }}>
//               {({ loading: rtvLoad, error: rtvErr, data: rtvByIdData }) => (
//                 <Mutation mutation={addRTV}>
//                   {addRTV => (
//                     <Mutation mutation={editRTV}>
//                       {editRTV => {
//                         if (allRTVLoad || rtvLoad) return "Loading....";
//                         if (allRTVErr) return `${allRTVErr.message}`;
//                         if (rtvErr) return `${rtvErr.message}`;

//                         // console.log("allRTVData: ", allRTVData.getRTVNamesOnly);
//                         // console.log("rtvByIdData: ", rtvByIdData.getRTVById);

//                         return (
//                           <Form
//                             allRTVData={allRTVData.getRTVNamesOnly}
//                             editRTVId={id}
//                             isEdit={id ? true : false}
//                             editRTVData={rtvByIdData.getRTVById || {}}
//                             submitMutation={id ? editRTV : addRTV}
//                             {...this.props}
//                           />
//                         );
//                       }}
//                     </Mutation>
//                   )}
//                 </Mutation>
//               )}
//             </Query>
//           )}
//         </Query>
//       </Page>
//     );
//   }
// }

// export default FormPage;
