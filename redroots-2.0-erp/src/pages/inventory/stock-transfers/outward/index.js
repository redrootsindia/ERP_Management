import React, { useState, useEffect } from 'react'
import { Link, withRouter, useParams, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Spin, Switch, Button, Select, Modal, notification } from 'antd'
import Error403 from 'components/Errors/403'
import RackShelfComponent from 'components/RackShelfComponent'
import { validation } from './pickUpFormValidation'
import { ADD_STOCK_TRANSFER } from '../queries'
import { WAREHOUSES, PRODUCT_VARIANTS_IN_STOCK } from '../../warehouses/queries'

const mapStateToProps = ({ user }) => ({ user })

const TransferOutwardForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action } = useParams()

  // headerDrop --> this contains list of all the products of a warehouse
  const [headerDrop, setHeaderDrop] = useState([])

  const [handsonData, setHandsonData] = useState([])
  const [rackShelfData, setRackShelfData] = useState({})
  const [warehousesList, setWarehousesList] = useState([])
  const [fromWarehouse, setFromWarehouse] = useState(undefined)
  const [fromWarehouseID, setFromWarehouseID] = useState(undefined)
  const [toWarehouse, setToWarehouse] = useState(undefined)
  const [toWarehouseID, setToWarehouseID] = useState(undefined)
  const [transferDivs, setTransferDivs] = useState([{ id: 1 }])
  const [count, setCount] = useState(1)
  const [scannerMode, setScannerMode] = useState(true)
  const [errors, setErrors] = useState({ fromWarehouse: null, toWarehouse: null, divError: null })
  const [productVariantMapping, setProductVariantMapping] = useState([
    { id: 1, productVariant: null, productVariantID: null },
  ])

  const [addStockTransfer] = useMutation(ADD_STOCK_TRANSFER)

  const { loading: whLoad, error: whErr, data: warehousesData } = useQuery(WAREHOUSES, {
    variables: { includeRackShelfData: true },
  })

  useEffect(() => {
    if (warehousesData && warehousesData.warehouses && warehousesData.warehouses.length)
      setWarehousesList(warehousesData.warehouses)
  }, [warehousesData])

  const { loading: vLoad, error: vErr, data: variantsData } = useQuery(PRODUCT_VARIANTS_IN_STOCK, {
    variables: { warehouse_id: fromWarehouseID },
  })

  useEffect(() => {
    if (
      !vLoad &&
      variantsData &&
      variantsData.productsListByWarehouseID &&
      variantsData.productsListByWarehouseID.length
    ) {
      const tempHeaderDrop = variantsData.productsListByWarehouseID.map(({ id, code, ean }) => ({
        productVariantID: Number(id) || 0,
        productVariantName: code || '',
        eanCode: ean,
      }))
      setHeaderDrop(tempHeaderDrop)
    }
  }, [variantsData, vLoad])

  const onChange = (e, field) => {
    const splitString = e.split('==')

    if (field === 'fromWarehouse') {
      setFromWarehouse(splitString[1])
      setFromWarehouseID(Number(splitString[0]))
    } else if (field === 'toWarehouse') {
      setToWarehouse(splitString[1])
      setToWarehouseID(Number(splitString[0]))
    }

    setTransferDivs([{ id: 1 }])
    setProductVariantMapping([{ id: 1, productVariant: null, productVariantID: null }])
    setRackShelfData({})
    setCount(1)
  }

  const addTransferDivs = () => {
    setTransferDivs([...transferDivs, { id: count + 1 }])

    setProductVariantMapping([
      ...productVariantMapping,
      { id: count + 1, productVariant: null, productVariantID: null },
    ])

    setCount(count + 1)
  }

  const getRackShelfData = (productVariantID, tableData, uniqueKey) =>
    setRackShelfData({
      ...rackShelfData,
      [uniqueKey]: { productVariantID, tableData },
    })

  const getSelectedProductVariants = (productVariantID, productVariant, uniqueKey) => {
    const newVariantMap = productVariantMapping.map((obj) => {
      if (Number(obj.id) === Number(uniqueKey))
        return {
          ...obj,
          productVariantID,
          productVariant,
        }

      return obj
    })

    const newRackShelfData = JSON.parse(JSON.stringify(rackShelfData))
    if (Object.prototype.hasOwnProperty.call(rackShelfData, uniqueKey))
      delete newRackShelfData[uniqueKey]

    setProductVariantMapping(newVariantMap)
    setRackShelfData(newRackShelfData)
  }

  const nonScannerSubmit = () => {
    const warehouseVerify = {
      warehouse1Verify: true,
      warehouse1: fromWarehouseID,
      warehouse2Verify: true,
      warehouse2: toWarehouseID,
    }

    const isFormInvalid = validation(warehouseVerify, rackShelfData, productVariantMapping)

    if (isFormInvalid) {
      const { divError, divErrorFoundIn, nonDivErrorFoundIn, divErrorMessage } = isFormInvalid
      setErrors({
        ...errors,
        fromWarehouse: nonDivErrorFoundIn.warehouse1 || null,
        toWarehouse: nonDivErrorFoundIn.warehouse2 || null,
        divError: divError ? { [divErrorFoundIn]: divErrorMessage } : null,
      })
      return
    }

    const stockTransferArray = Object.keys(rackShelfData).map((divID) => {
      let totalQuantity = 0
      const totalRows = []

      rackShelfData[divID].tableData.forEach((rackRow) => {
        totalQuantity += rackRow.quantity
        totalRows.push({
          warehouseID: fromWarehouseID,
          rackID: rackRow.rackID,
          shelfID: rackRow.shelfID,
          quantity: rackRow.quantity,
        })
      })

      return {
        productVariantID: rackShelfData[divID].productVariantID,
        quantity: totalQuantity,
        arrayInput: totalRows,
      }
    })

    addMutationFn(stockTransferArray)
  }

  const scannerSubmit = () => {
    if (!fromWarehouseID || !toWarehouseID || !handsonData) {
      if (!handsonData)
        notification.warning({
          message: 'Nothing Scanned!',
          description: "Please scan some items or press 'Cancel'",
        })

      setErrors({
        ...errors,
        fromWarehouse: !fromWarehouseID ? 'Please select a warehouse' : null,
        toWarehouse: !toWarehouseID ? 'Please select a warehouse' : null,
      })
      return
    }

    const scannedProductVariants = {}
    let unusedShelves = false

    handsonData.forEach((obj) => {
      if (!obj.productID || !obj.quantity) unusedShelves = true

      const tempObj = {
        shelfID: Number(obj.shelfID),
        quantity: Number(obj.quantity),
      }

      if (Object.prototype.hasOwnProperty.call(scannedProductVariants, obj.productID))
        scannedProductVariants[obj.productID].quantityShelfMapping.push(tempObj)
      else
        scannedProductVariants[obj.productID] = {
          productVariantID: Number(obj.productID),
          quantityShelfMapping: [tempObj],
        }

      delete scannedProductVariants.null
      // console.log("scannedProductVariants: ", scannedProductVariants);
    })

    const stockTransferArray = Object.values(scannedProductVariants)
    // console.log("====>> stockTransferArray: ", stockTransferArray);

    if (unusedShelves) {
      Modal.confirm({
        title: 'Ignore unused shelves?',
        content:
          "Some shelves were scanned, but no items were taken out from them. Press 'Yes' to continue anyway. Press 'No' to return to scanning.",
        okText: 'Yes',
        cancelText: 'No',
        centered: true,
        onCancel: () => {},
        onOk: () => {
          if (!stockTransferArray.length) {
            notification.warning({
              message: 'Nothing Scanned!',
              description: "Please scan some items or press 'Cancel'",
            })
            return
          }
          addMutationFn(stockTransferArray)
        },
      })
    } else addMutationFn(stockTransferArray)
  }

  const addMutationFn = (stockTransferArray) => {
    const finalObj = {
      from_warehouse_id: Number(fromWarehouseID),
      to_warehouse_id: Number(toWarehouseID),
      stockTransferArray,
    }

    console.log('finalObj:', finalObj)

    addStockTransfer({ variables: finalObj })
      .then((res) => {
        if (res.data.addStockTransfer) {
          notification.success({
            message: 'Products picked out successfully at source warehouse !',
            description: 'Put away at the destination can now start.',
          })
          history.push('/inventory/stock-transfers')
        }
      })
      .catch((err) => console.log('Error occured: ', err))
  }

  if (!permissions.includes('updateStockTransfer')) return <Error403 />
  if (action === 'create' && !permissions.includes('createStockTransfer')) return <Error403 />
  if (whErr) return `Error occured while fetching data: ${whErr.message}`
  if (vErr) return `Error occured while fetching data: ${vErr.message}`

  return (
    <>
      <Helmet title="Materials" />

      <Spin spinning={whLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="utils__title text-center">
              <h5 className="mb-2">
                <strong>STOCK TRANSFER</strong>
              </h5>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="mb-2">From Warehouse</div>
                    <Select
                      onChange={(e) => onChange(e, 'fromWarehouse')}
                      id="product"
                      value={fromWarehouse}
                      style={{ width: '100%' }}
                      placeholder="Please select one"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {warehousesList && warehousesList.length
                        ? warehousesList.map(({ id, name, location }) => (
                            <Select.Option key={id} value={`${id}==${name}, ${location}`}>
                              {`${name}, ${location}`}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <span className="errorStyle">{errors.fromWarehouse || ''}</span>
                  </div>

                  <div className="col-lg-4">
                    <div className="mb-2">To Warehouse</div>
                    <Select
                      onChange={(e) => onChange(e, 'toWarehouse')}
                      id="product"
                      value={toWarehouse}
                      style={{ width: '100%' }}
                      placeholder="Please select one"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {warehousesList && warehousesList.length
                        ? warehousesList.map(({ id, name, location }) => (
                            <Select.Option key={id} value={`${id}==${name}, ${location}`}>
                              {`${name}, ${location}`}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <span className="errorStyle">{errors.toWarehouse || ''}</span>
                  </div>

                  <div className="col-lg-2">
                    <Switch checked={scannerMode} onChange={(e) => setScannerMode(e)} />
                    &nbsp;Tabular View
                  </div>
                </div>

                <br />
                <br />

                {scannerMode ? (
                  <div className="row">
                    <div className="col-lg-6">
                      <RackShelfComponent
                        scannerMode
                        scannerData={{
                          pickUp: true,
                          pickUpData: {
                            headerDrop,
                            warehouseID: fromWarehouseID,
                          },
                        }}
                        getHandsonData={(callbackData) => setHandsonData(callbackData)}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="row">
                      <div className="col-lg-3">
                        <Button type="primary" onClick={addTransferDivs}>
                          Add items to transfer
                        </Button>
                      </div>
                    </div>

                    <br />
                    <br />

                    <div className="row">
                      {transferDivs.map((div) => {
                        let className = 'col-lg-4 '

                        if (
                          errors.divError &&
                          Object.prototype.hasOwnProperty.call(errors.divError, div.id)
                        )
                          className += 'errorDiv'

                        return (
                          <div className={className} key={div.id}>
                            <RackShelfComponent
                              uniqueKey={div.id}
                              editableHeader
                              // itemCode={order.itemCode}
                              // itemQuantity={order.quantity}
                              tableData={null}
                              headerDrop={headerDrop}
                              warehouseID={fromWarehouseID}
                              suggestRacks
                              // racks={racks}
                              getRackShelfData={getRackShelfData}
                              getSelectedBomCodes={getSelectedProductVariants}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-actions">
                      <Button
                        type="primary"
                        onClick={scannerMode ? scannerSubmit : nonScannerSubmit}
                      >
                        {true ? 'Save' : 'Update'}
                      </Button>
                      &nbsp;
                      <Link to="/inventory/stock-transfers">
                        <Button type="default">Cancel</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </>
  )
}

export default withRouter(connect(mapStateToProps)(TransferOutwardForm))
