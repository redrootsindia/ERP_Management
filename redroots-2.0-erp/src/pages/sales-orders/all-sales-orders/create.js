/* eslint "no-restricted-syntax": "off", "no-loop-func": "off" */

import React, { useState, useEffect, useRef } from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useLazyQuery, useMutation } from '@apollo/client'
import { Select, Upload, Button, message, Input, notification } from 'antd'
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons'
import readXlsx from 'read-excel-file'
import moment from 'moment'
import { HotTable } from '@handsontable/react'
import Error403 from 'components/Errors/403'

import {
  cloudtailColHeaders,
  cloudtailColumns,
  ajioColumns,
  ajioHeaders,
  marketplaceColumns,
  marketplaceHeaders,
} from './columns'

import {
  BUYER_GROUPS_LIST,
  BUYER_NAME_LIST,
  BRAND_LIST,
  BUYER_WAREHOUSE_LIST,
  VARIANTS,
  VARIANTS_BY_BRAND_ID,
  ADD_SALES_ORDER,
  ADD_MARKETPLACE_SALES_ORDER,
} from './queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const AddSalesOrderForm = ({ user: { permissions } }) => {
  const history = useHistory()

  const [addSalesOrder] = useMutation(ADD_SALES_ORDER)
  const [addMarketplaceSalesOrder] = useMutation(ADD_MARKETPLACE_SALES_ORDER)

  const [buyerGroupsList, setBuyerGroupsList] = useState([])
  const [buyerGroupID, setBuyerGroupID] = useState(undefined)
  const [buyerGroupError, setBuyerGroupError] = useState(undefined)

  const [buyerNamesList, setBuyerNamesList] = useState([])
  const [buyerID, setBuyerID] = useState()
  const [buyerError, setBuyerError] = useState(undefined)

  const [salesOrderName, setSalesOrderName] = useState(undefined)
  const [salesOrderNameError, setSalesOrderNameError] = useState(undefined)

  const [buyerWareHousesList, setBuyerWareHousesList] = useState([])
  const [buyerWarehouseID, setBuyerWarehouseID] = useState(undefined)
  const [buyerWarehouseError, setBuyerWarehouseError] = useState(undefined)

  const [brandsList, setBrandsList] = useState([])
  const [brandID, setBrandID] = useState()
  const [brandError, setBrandError] = useState(undefined)

  const [variantsList, setVariantsList] = useState([])

  const [columnHeaders, setColumnHeaders] = useState([])
  const [columns, setColumns] = useState([])

  const handsonRef = useRef(null)
  const [hotInstance, setHotInstance] = useState(null)
  const [handsonVisible, setHandsonVisible] = useState(false)
  const [handsonData, setHandsonData] = useState([])

  const [displaySaveButton, setDisplaySaveButton] = useState(false)
  const [okText, setOkText] = useState('Create')

  const {
    loading: buyerGroupLoad,
    error: buyerGroupErr,
    data: buyerGroupData,
  } = useQuery(BUYER_GROUPS_LIST)

  const [
    getBuyerNames,
    { loading: buyerNamesLoading, data: buyerNamesData, error: buyerNamesErr },
  ] = useLazyQuery(BUYER_NAME_LIST, {
    variables: {
      buyerGroupIDs: buyerGroupID ? [buyerGroupID] : null,
      buyerIDs: buyerID ? [buyerID] : [],
    },
  })

  const [
    getBuyerWarehouses,
    { loading: buyerWarehouseLoading, data: buyerWarehouseData, error: buyerWarehouseErr },
  ] = useLazyQuery(BUYER_WAREHOUSE_LIST, {
    variables: { buyer_group_id: buyerGroupID },
  })

  const {
    loading: brandLoading,
    data: brandData,
    error: brandErr,
  } = useQuery(BRAND_LIST, {
    variables: { id: buyerGroupID },
  })

  const [getVariants, { loading: variantLoading, data: variantData, error: variantErr }] =
    useLazyQuery(VARIANTS)

  const [
    getVariantsByBrandID,
    { loading: variantByIDLoading, data: variantByIDData, error: variantByIDErr },
  ] = useLazyQuery(VARIANTS_BY_BRAND_ID, {
    variables: { brand_id: brandID },
  })

  useEffect(() => {
    if (
      !variantByIDLoading &&
      variantByIDData &&
      variantByIDData.variantsByBrandID &&
      variantByIDData.variantsByBrandID.length
    )
      setVariantsList(variantByIDData.variantsByBrandID)
  }, [variantByIDLoading, variantByIDData])

  useEffect(() => {
    if (!variantLoading && variantData && variantData.variants && variantData.variants.length)
      setVariantsList(variantData.variants)
  }, [variantLoading, variantData])

  useEffect(() => {
    if (
      !buyerGroupLoad &&
      buyerGroupData &&
      buyerGroupData.buyerGroups &&
      buyerGroupData.buyerGroups.length
    )
      setBuyerGroupsList(buyerGroupData.buyerGroups)
  }, [buyerGroupData, buyerGroupLoad])

  useEffect(() => {
    if (
      !buyerNamesLoading &&
      buyerNamesData &&
      buyerNamesData.buyerNames &&
      buyerNamesData.buyerNames.length
    )
      setBuyerNamesList(buyerNamesData.buyerNames)
    else setBuyerNamesList([])
  }, [buyerNamesData, buyerNamesLoading])

  useEffect(() => {
    if (
      !buyerWarehouseLoading &&
      buyerWarehouseData &&
      buyerWarehouseData.buyerGroupWarehousesByBuyerGroupID &&
      buyerWarehouseData.buyerGroupWarehousesByBuyerGroupID.length
    )
      setBuyerWareHousesList(buyerWarehouseData.buyerGroupWarehousesByBuyerGroupID)
    else setBuyerWareHousesList([])
  }, [buyerWarehouseData, buyerWarehouseLoading])

  useEffect(() => {
    if (brandData && brandData.brands && brandData.brands.length) setBrandsList(brandData.brands)
  }, [brandData, brandLoading])

  useEffect(() => {
    if (buyerGroupID) {
      if (Number(buyerGroupID) === 1) {
        setColumnHeaders(marketplaceHeaders)
        setColumns(marketplaceColumns)
      } else if (Number(buyerGroupID) === 2) {
        setColumnHeaders(cloudtailColHeaders)
        setColumns(cloudtailColumns)
      } else {
        setColumnHeaders(ajioHeaders)
        setColumns(ajioColumns)
      }
    }
  }, [buyerGroupID])

  useEffect(() => {
    if (handsonVisible && handsonRef && handsonRef.current)
      setHotInstance(handsonRef.current.hotInstance)
  }, [handsonVisible, handsonRef])

  useEffect(() => {
    if (Number(buyerGroupID) === 1 || (buyerGroupID && buyerID && buyerWarehouseID && brandID))
      setHandsonVisible(true)
  }, [buyerGroupID, buyerID, buyerWarehouseID, brandID])

  const beforeUpload = (file) => {
    const isExcel =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if (!isExcel) message.error('You can only upload MS-Excel Worksheet (.xlsx) files')
    return isExcel
  }

  const readExcelFunction = (e) => {
    readXlsx(e.file).then(async (rows) => {
      // "rows" is an array of rows --> each row being an array of cells.
      console.log('rows: ', rows)
      const tempHandsonData = []
      // remove the column-header row in excel to get the handsonData
      rows.splice(1, rows.length - 1).forEach((rowInfo) => {
        console.log('rowInfo: ', rowInfo)
        const singleRow = {}

        columns.forEach((colInfo, index) => {
          singleRow[colInfo.data] = rowInfo[index]
        })
        console.log('singleRow: ', singleRow)

        // MARKETPLACE S.O.:
        if (Number(buyerGroupID) === 1) {
          // Find variant-ID for mutations and save it for each row of handonData
          if (singleRow.products) {
            const indexVariant = variantsList.findIndex(
              ({ code }) => code.toLowerCase() === singleRow.products.toLowerCase(),
            )
            singleRow.product_variant_id =
              Number(indexVariant) > -1 ? Number(variantsList[indexVariant].id) : 0
          } else singleRow.product_variant_id = 0

          // Find buyer-ID (using marketplace_channel) for mutations and save it for each row of handonData
          if (singleRow.channel) {
            const indexBuyer = buyerNamesList.findIndex(
              (obj) =>
                obj.marketplace_channel &&
                obj.marketplace_channel.toLowerCase() === singleRow.channel.toLowerCase(),
            )
            singleRow.marketplace_buyer_id =
              Number(indexBuyer) > -1 ? Number(buyerNamesList[indexBuyer].id) : 0
          } else singleRow.marketplace_buyer_id = 0
        }
        console.log('singleRow AGAIN: ', singleRow)

        // CLOUDTAIL S.O.: Find variant-ID for mutations and save it for each row of handonData
        if (Number(buyerGroupID) === 2) {
          if (singleRow.sku) {
            const index = variantsList.findIndex(
              ({ code }) => code.toLowerCase() === singleRow.sku.toLowerCase(),
            )
            singleRow.product_variant_id = Number(index) > -1 ? Number(variantsList[index].id) : 0
          } else singleRow.product_variant_id = 0
        }

        // AJIO S.O.: Find variant-ID for mutations and save it for each row of handonData
        if (Number(buyerGroupID) === 3) {
          if (singleRow.ean_no) {
            const index = variantsList.findIndex(
              ({ ean }) => Number(ean) === Number(singleRow.ean_no),
            )
            singleRow.product_variant_id = Number(index) > -1 ? Number(variantsList[index].id) : 0
          } else singleRow.product_variant_id = 0
        }

        tempHandsonData.push(singleRow)
      })
      setHandsonData(tempHandsonData)
      setDisplaySaveButton(true)
    })
  }

  const formatCells = (rowIndex, columnIndex) => {
    if (!hotInstance) return null

    // "cellProp" gets finally returned
    const cellProp = {
      className: '',
      renderer: (instance, td, row, col, prop, value) => {
        td.setAttribute('class', '')
        td.setAttribute('title', '')
        td.innerHTML = value
      },
    }

    const colVisualIndex = hotInstance.toVisualColumn(columnIndex)

    const customHandsonRender = (errorMsg, errorClass) => (instance, td, row, col, prop, value) => {
      // set the attributes "class" and "title" to handson-cell
      td.setAttribute('class', `handson-error-${errorClass}`)
      td.setAttribute('title', errorMsg)
      td.innerHTML = value
    }

    const setErrorCell = (error = null) => {
      if (error === 'empty') {
        cellProp.className = 'handson-error-empty'
        cellProp.renderer = customHandsonRender('Cannot be empty', 'empty')
      }
      if (error === 'absent') {
        cellProp.className = 'handson-error-absent'
        cellProp.renderer = customHandsonRender('Does not exist in the system', 'absent')
      }
      if (displaySaveButton) setDisplaySaveButton(false)
      return cellProp
    }

    const rowData = hotInstance.getDataAtRow(rowIndex)

    if (rowData.filter((currentValue) => !!currentValue).length) {
      const cellValue = rowData[colVisualIndex]

      if (
        (Number(buyerGroupID) === 1 && Number(colVisualIndex) === 3) ||
        (Number(buyerGroupID) === 2 && Number(colVisualIndex) === 5) ||
        (Number(buyerGroupID) === 3 && Number(colVisualIndex) === 9)
      ) {
        // check for empty cells
        if (!cellValue) return setErrorCell('empty')
        // check for BOM-Codes that do not exist in the system
        if (!handsonData[rowIndex].product_variant_id) return setErrorCell('absent')
      }

      if (Number(buyerGroupID) === 1 && Number(colVisualIndex) === 4) {
        // check for empty cells for marketplace-buyers
        if (!cellValue) return setErrorCell('empty')
        // check for marketplace-buyers that do not exist in the system
        if (!handsonData[rowIndex].marketplace_buyer_id) return setErrorCell('absent')
      }
    }

    return cellProp
  }

  const onSubmit = async () => {
    setBuyerGroupError(undefined)
    setBuyerError(undefined)
    setBuyerWarehouseError(undefined)
    setBrandError(undefined)
    setSalesOrderNameError(undefined)

    let isError = false
    if (!buyerGroupID || Number(buyerGroupID) === 0) {
      isError = true
      setBuyerError('Please select a buyer-group')
    }
    if (Number(buyerGroupID) !== 1 && (!buyerID || Number(buyerID) === 0)) {
      isError = true
      setBuyerError('Please select a buyer')
    }
    if (Number(buyerGroupID) !== 1 && (!buyerWarehouseID || Number(buyerWarehouseID) === 0)) {
      isError = true
      setBuyerWarehouseError('Please select a buyer-warehouse')
    }
    if (Number(buyerGroupID) !== 1 && (!brandID || Number(brandID) === 0)) {
      isError = true
      setBrandError('Please select a brand')
    }
    if (Number(buyerGroupID) === 1 && !salesOrderName) {
      isError = true
      setSalesOrderNameError('Sales-Order Name cannot be empty')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    const marketplaceSalesOrderData = []
    let salesOrdersToAdd = {}
    let isExcelError = false

    // Prepare mutation variables for MARKETPLACE S.O.
    if (Number(buyerGroupID) === 1)
      handsonData.forEach((item) => {
        if (!isExcelError)
          try {
            marketplaceSalesOrderData.push({
              marketplace_order_name: String(item.display_order_no),
              marketplace_buyer_id: Number(item.marketplace_buyer_id),
              product_variant_id: Number(item.product_variant_id),
              quantity: item.number_of_boxes ? Number(item.number_of_boxes) : 0,
            })
          } catch (error) {
            isExcelError = true
            console.log('[ERROR OCCURED WHILE READING MARKETPLACE EXCEL] : ', error)
            notification.error({
              message: 'Error occured while reading Excel',
              description:
                'Please make sure the data within the excel is correct. If the error still exists, please contact system administrator.',
            })
          }
      })

    // Prepare mutation variables for CLOUDTAIL S.O.
    if (Number(buyerGroupID) === 2)
      handsonData.forEach((item) => {
        if (!isExcelError)
          try {
            const tempObj = {
              product_variant_id: Number(item.product_variant_id),
              quantity: Number(item.accepted_quantity),
              unit_cost: Number(parseFloat(String(item.unit_cost).match(/[\d\.]+/)[0]).toFixed(2)),
            }

            if (Object.prototype.hasOwnProperty.call(salesOrdersToAdd, item.po))
              salesOrdersToAdd[item.po].sales_order_data.push(tempObj)
            else {
              salesOrdersToAdd = {
                ...salesOrdersToAdd,
                [item.po]: {
                  type: 'e-Commerce',
                  name: String(item.po),
                  buyer_id: Number(buyerID),
                  brand_id: Number(brandID),
                  buyer_warehouse_id: Number(buyerWarehouseID),
                  expected_delivery_date: String(new Date(item.expected_delivery_date).getTime()),
                  sales_order_data: [tempObj],
                },
              }
            }
          } catch (error) {
            isExcelError = true
            console.log('[ERROR OCCURED WHILE READING CLOUDTAIL EXCEL] : ', error)
            notification.error({
              message: 'Error occured while reading Excel',
              description:
                'Please make sure the data within the excel is correct. If the error still exists, please contact system administrator.',
            })
          }
      })

    // Prepare mutation variables for AJIO S.O.
    if (Number(buyerGroupID) === 3)
      handsonData.forEach((item) => {
        if (!isExcelError)
          try {
            const tempObj = {
              product_variant_id: Number(item.product_variant_id),
              quantity: item.po_qty,
              unit_cost: Number(item.sales_price),
            }

            if (Object.prototype.hasOwnProperty.call(salesOrdersToAdd, item.po))
              salesOrdersToAdd[item.po].sales_order_data.push(tempObj)
            else {
              salesOrdersToAdd = {
                ...salesOrdersToAdd,
                [item.po]: {
                  type: 'e-Commerce',
                  name: String(item.po),
                  buyer_id: Number(buyerID),
                  brand_id: Number(brandID),
                  buyer_warehouse_id: Number(buyerWarehouseID),
                  expected_delivery_date: String(moment(item.deliv_date, 'DD.MM.YYYY').valueOf()),
                  sales_order_data: [tempObj],
                },
              }
            }
          } catch (error) {
            isExcelError = true
            console.log('[ERROR OCCURED WHILE READING AJIO EXCEL] : ', error)
            notification.error({
              message: 'Error occured while reading Excel',
              description:
                'Please make sure the data within the excel is correct. If the error still exists, please contact system administrator.',
            })
          }
      })

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    let errorWhileSaving = false

    if (Number(buyerGroupID) === 1) {
      await addMarketplaceSalesOrder({
        variables: {
          type: 'Marketplace',
          name: salesOrderName,
          sales_order_data: marketplaceSalesOrderData,
        },
      })
        .then(() => {})
        .catch((err) => {
          errorWhileSaving = true
          setOkText('Create')
          notification.error({
            message: 'Error occured while saving sales-order.',
            description: err.message || 'Please contact system administrator.',
          })
        })
    } else {
      for await (const salesOrder of Object.values(salesOrdersToAdd)) {
        await addSalesOrder({ variables: { ...salesOrder } })
          .then(() => {})
          .catch((err) => {
            errorWhileSaving = true
            setOkText('Create')
            notification.error({
              message: 'Error occured while saving sales-order.',
              description: err.message || 'Please contact system administrator.',
            })
          })
      }
    }

    if (!errorWhileSaving) {
      setOkText('Create')
      notification.success({ description: 'Saved Successfully.' })
      history.push('/sales-orders/all')
    }
  }

  if (!permissions.includes('createSalesOrder')) return <Error403 />
  if (buyerGroupErr) return `Error occured while fetching data: ${buyerGroupErr.message}`
  if (buyerNamesErr) return `Error occured while fetching data: ${buyerNamesErr.message}`
  if (buyerWarehouseErr) return `Error occured while fetching data: ${buyerWarehouseErr.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (variantErr) return `Error occured while fetching data: ${variantErr.message}`
  if (variantByIDErr) return `Error occured while fetching data: ${variantByIDErr.message}`

  return (
    <div>
      <Helmet title="Sales Orders" />

      <div className="row mb-4 mr-2 ml-2">
        <div className="col-11">
          <h5 className="mb-2">
            <strong>Add Sales Order</strong>
          </h5>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-lg-3">
                  <div className="mb-2">
                    Buyer Group<span className="custom-error-text"> *</span>
                  </div>
                  <Select
                    value={buyerGroupID}
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      setHotInstance(null)
                      setBuyerGroupID(value)
                      setHandsonData([])
                      setBuyerID(undefined)
                      setBuyerWarehouseID(undefined)
                      getBuyerNames()
                      getBuyerWarehouses()
                      if (Number(value) === 1) getVariants()
                    }}
                    placeholder="Select Buyer Group"
                    className={buyerGroupError ? 'custom-error-border' : ''}
                  >
                    {buyerGroupsList && buyerGroupsList.length
                      ? buyerGroupsList.map((obj) => (
                          <Option key={obj.id} value={obj.id}>
                            {obj.name}
                          </Option>
                        ))
                      : null}
                  </Select>
                </div>

                {buyerGroupID && Number(buyerGroupID) === 1 ? (
                  <div className="col-lg-3">
                    <div className="mb-2">
                      Sales-Order Name<span className="custom-error-text"> *</span>
                    </div>
                    <Input
                      placeholder="Sales-Order Name"
                      value={salesOrderName}
                      onChange={({ target: { value } }) => setSalesOrderName(value)}
                      allowClear
                      className={salesOrderNameError ? 'custom-error-border' : ''}
                    />
                    <div className="custom-error-text mb-4">{salesOrderNameError || ''}</div>
                  </div>
                ) : (
                  <>
                    <div className="col-lg-3">
                      <div className="mb-2">
                        Buyer<span className="custom-error-text"> *</span>
                      </div>
                      <Select
                        value={buyerID}
                        style={{ width: '100%' }}
                        onChange={(value) => setBuyerID(value)}
                        placeholder="Select Buyer"
                        className={buyerError ? 'custom-error-border' : ''}
                      >
                        {buyerNamesList && buyerNamesList.length
                          ? buyerNamesList.map((obj) => (
                              <Option key={obj.id} value={obj.id}>
                                {obj.name}
                              </Option>
                            ))
                          : null}
                      </Select>
                      <div className="custom-error-text mb-4">{buyerError || ''}</div>
                    </div>

                    <div className="col-lg-3">
                      <div className="mb-2">
                        Warehouse<span className="custom-error-text"> *</span>
                      </div>
                      <Select
                        value={buyerWarehouseID}
                        style={{ width: '100%' }}
                        onChange={(value) => setBuyerWarehouseID(value)}
                        placeholder="Select Warehouse"
                        className={buyerWarehouseError ? 'custom-error-border' : ''}
                      >
                        {buyerWareHousesList && buyerWareHousesList.length
                          ? buyerWareHousesList.map((obj) => (
                              <Option key={String(obj.id)} value={String(obj.id)}>
                                {obj.name}
                              </Option>
                            ))
                          : null}
                      </Select>
                      <div className="custom-error-text mb-4">{buyerWarehouseError || ''}</div>
                    </div>

                    <div className="col-lg-3">
                      <div className="mb-2">
                        Brand<span className="custom-error-text"> *</span>
                      </div>
                      <Select
                        value={brandID}
                        style={{ width: '100%' }}
                        onChange={(value) => {
                          setBrandID(value)
                          getVariantsByBrandID()
                        }}
                        placeholder="Select Brand"
                        className={brandError ? 'custom-error-border' : ''}
                      >
                        {brandsList && brandsList.length
                          ? brandsList.map((obj) => (
                              <Option key={obj.id} value={obj.id}>
                                {obj.name}
                              </Option>
                            ))
                          : null}
                      </Select>
                      <div className="custom-error-text mb-4">{brandError || ''}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {Number(buyerGroupID) === 1 ||
          (buyerGroupID && buyerID && buyerWarehouseID && brandID) ? (
            <div className="card">
              <div className="card-body">
                <Upload
                  name="uploadExcel"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  customRequest={(e) => readExcelFunction(e)}
                >
                  <Button icon={<UploadOutlined />} className="mb-4">
                    Upload Excel
                  </Button>
                </Upload>
                ​
                <HotTable
                  ref={handsonRef}
                  data={handsonData}
                  cells={formatCells}
                  readOnly
                  stretchH="all"
                  width="100%"
                  height={
                    handsonData && handsonData.length
                      ? handsonData.length < 9
                        ? 160
                        : handsonData.length * 20
                      : 50
                  }
                  rowHeights={23}
                  columns={columns}
                  colHeaders={columnHeaders}
                  contextMenu
                />
              </div>
            </div>
          ) : null}

          <div className="row mt-3 mb-4 ml-2">
            {displaySaveButton && permissions.includes('createSalesOrder') ? (
              <Button type="primary" onClick={onSubmit}>
                {okText}
              </Button>
            ) : null}
            &emsp;
            <Button danger onClick={() => history.goBack()}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(AddSalesOrderForm))
