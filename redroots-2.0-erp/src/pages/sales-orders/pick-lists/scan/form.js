/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { Modal, Button, notification, Spin } from 'antd'
import { Link, withRouter, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { useQuery, useMutation } from '@apollo/client'
import RackShelfComponent from 'components/RackShelfComponent'
import { PRODUCT_VARIANTS_IN_STOCK } from '../../../inventory/warehouses/queries'
import { ADD_PICKED_ITEMS } from '../queries'
import { validation } from '../../../inventory/stock-transfers/outward/pickUpFormValidation'

const mapStateToProps = ({ user }) => ({ user })

const ScanForm = ({ user: { permissions }, pickListID, pickUpData, partialPickedData }) => {
  const { warehouseID, warehouseName, location, pickUpItems, totalQuantity } = pickUpData
  const history = useHistory()
  const [rackShelfData, setRackShelfData] = useState({})
  const [handsonData, setHandsonData] = useState(pickUpData.warehouseID)
  const [errors, setErrors] = useState({ warehouse: null, divError: null })
  const [scannerMode, setScannerMode] = useState(true)
  const [productVariantMapping, setProductVariantMapping] = useState([])

  // headerDrop --> this contains list of all the products of a warehouse
  const [headerDrop, setHeaderDrop] = useState([])

  // const [productVariantMapping, setProductVariantMapping] = useState([{ id: 1, productVariant: null, productVariantID: null }])

  console.log('RackShelfData in state: ', rackShelfData)

  const {
    loading: variantsListLoad,
    error: variantsListErr,
    data: variantsListData,
  } = useQuery(PRODUCT_VARIANTS_IN_STOCK, { variables: { warehouse_id: pickUpData.warehouseID } })

  const [addPickedItems] = useMutation(ADD_PICKED_ITEMS)

  useEffect(() => {
    if (
      !variantsListLoad &&
      variantsListData &&
      variantsListData.productsListByWarehouseID &&
      variantsListData.productsListByWarehouseID.length
    ) {
      let tempHeaderDrop = variantsListData.productsListByWarehouseID.map(
        ({ id: variantID, code, ean }) => {
          return {
            productVariantID: Number(variantID) || 0,
            productVariantName: code || '',
            eanCode: ean,
          }
        },
      )
      setHeaderDrop(tempHeaderDrop)
    } else setHeaderDrop([])
  }, [variantsListData, variantsListLoad])

  const nonScannerSubmit = () => {
    const warehouseVerify = {
      warehouse1Verify: true,
      warehouse1: warehouseID,
      warehouse2Verify: false,
      warehouse2: null,
    }

    const isFormInvalid = validation(warehouseVerify, rackShelfData, productVariantMapping)
    // console.log("isFormInvalid: ", isFormInvalid);

    if (isFormInvalid) {
      //prettier-ignore
      const { divError, divErrorFoundIn, nonDivErrorFoundIn, divErrorMessage } = isFormInvalid;

      tempErrors = {
        ...tempErrors,
        warehouse: nonDivErrorFoundIn.warehouse1 || null,
        divError: divError ? { [divErrorFoundIn]: divErrorMessage } : null,
      }

      setErrors(tempErrors)
      return
    } else {
      const pickedProductsArray = Object.keys(rackShelfData).map((divID) => {
        let totalQuantity = 0
        let totalRows = []

        rackShelfData[divID].tableData.forEach((rackRow) => {
          totalQuantity += rackRow.quantity
          totalRows.push({
            shelf_id: rackRow.shelfID,
            quantity: rackRow.quantity,
          })
        })

        return {
          product_variant_id: rackShelfData[divID].productVariantID,
          picked_shelf_mapping: totalRows,
        }
      })

      addMutationFn(pickedProductsArray)
    }
  }

  const scannerSubmit = () => {
    console.log('IN SCANNER SUBMIT')

    let isPartial = false
    let tempErrors = {}

    if (!warehouseID || !handsonData) {
      tempErrors = {
        ...tempErrors,
        warehouse: !warehouseID ? 'Please select a warehouse' : null,
      }

      if (!handsonData)
        notification.warning({
          message: 'Nothing Scanned!',
          description: "Please scan some items or press 'Cancel'",
        })

      console.log('errors: ', tempErrors)
      setErrors(tempErrors)
      return
    }

    let scannedBomCodes = {}
    let unusedShelves = false

    handsonData.forEach((obj) => {
      if (!obj.productID || !obj.quantity) unusedShelves = true

      const tempObj = {
        shelf_id: Number(obj.shelfID),
        quantity: Number(obj.quantity),
      }

      if (scannedBomCodes.hasOwnProperty(obj.productID))
        scannedBomCodes[obj.productID].picked_shelf_mapping.push(tempObj)
      else
        scannedBomCodes[obj.productID] = {
          product_variant_id: Number(obj.productID),
          picked_shelf_mapping: [tempObj],
        }

      delete scannedBomCodes.null
      // console.log("scannedBomCodes: ", scannedBomCodes);
    })

    const pickedProductsArray = Object.values(scannedBomCodes)
    // console.log("====>> pickedProductsArray: ", pickedProductsArray);

    if (!pickedProductsArray.length) {
      notification.warning({
        message: 'Nothing Scanned!',
        description: "Please scan some items or press 'Cancel'",
      })
      return
    }

    pickUpData.pickUpItems.forEach(({ itemID, quantity }) => {
      // console.log("==== forEach itemID", itemID);
      const scannedInPreviousIteration = partialPickedData[itemID].pickedQty

      // if all the products are already scanned in previous partial iteration, skip this check
      if (scannedInPreviousIteration <= quantity) {
        const totalScanned =
          (scannedBomCodes[itemID] ? scannedBomCodes[itemID].quantity : 0) +
          scannedInPreviousIteration
        if (totalScanned < quantity) isPartial = true
      }
    })

    // console.log("  isPartial ", isPartial);

    if (isPartial) {
      Modal.confirm({
        title: 'Items Partially Scanned:',
        content:
          "Some items are picked less than their requirement. Press 'No' to return to scanning. Press 'Yes' to continue anyway.",
        okText: 'Yes',
        cancelText: 'No',
        centered: true,
        onCancel: () => {},
        onOk: () => {
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
                addMutationFn(pickedProductsArray, isPartial)
              },
            })
          } else addMutationFn(pickedProductsArray, isPartial)
        },
      })
    } else addMutationFn(pickedProductsArray, isPartial)
  }

  const addMutationFn = async (pickedProductsArray, isPartial) => {
    const finalObj = {
      pick_list_id: Number(pickListID),
      isPartial,
      warehouse_id: Number(warehouseID),
      picked_data: pickedProductsArray,
    }

    console.log('finalObj:', finalObj)

    await addPickedItems({ variables: finalObj })
      .then((res) => {
        notification.success({
          message: 'Success',
          description: 'Pick-up successful',
        })
        history.push('/sales-orders/pick-lists')
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while saving picked items.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const getRackShelfData = (productVariantID, tableData, uniqueKey) => {
    setRackShelfData({
      ...rackShelfData,
      [uniqueKey]: { productVariantID, tableData },
    })
  }

  console.log('2. pickUpItems -- ', pickUpItems)
  console.log('2. partialPickedData -- ', partialPickedData)
  console.log('2. totalQuantity -- ', totalQuantity)

  if (!permissions.includes('updatePickList')) return <Error403 />
  if (variantsListErr) return `Error occured while fetching data: ${variantsListErr.message}`

  return (
    <div>
      <Spin spinning={variantsListLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-header">
            <div className="utils__title text-center font-weight-bold font-size-20 ">
              <strong>Pick Items</strong>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-lg-6 font-size-14">
                    <label>Warehouse:</label>&nbsp;
                    {warehouseName}, {location}
                  </div>
                </div>

                {/* <br />
                <br /> */}

                {scannerMode ? (
                  <div className="row">
                    <div className="col-lg-12">
                      <RackShelfComponent
                        pickListComponent={true}
                        scannerMode={true}
                        scannerData={{
                          pickUp: true,
                          pickUpData: {
                            pickUpItems,
                            headerDrop,
                            warehouseID: warehouseID,
                          },
                          partialPickedData,
                        }}
                        getHandsonData={(handsonDataToSet) => setHandsonData(handsonDataToSet)}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="row bigFont">
                      {pickUpItems.map((item, i) => {
                        let className = 'col-lg-4 '
                        // if (errorFoundIn === item.itemID)
                        //   className += "errorDiv";

                        if (!!item.quantity)
                          return (
                            <div className={className} key={i}>
                              <RackShelfComponent
                                uniqueKey={i}
                                editableHeader={false}
                                productVariantID={Number(item.itemID)}
                                bomCode={item.itemCode}
                                itemQuantity={item.quantity}
                                tableData={null}
                                suggestRacks={true}
                                inventoryId={warehouseID}
                                // racks={racks}
                                getRackShelfData={getRackShelfData}
                                pickListComponent={true}
                                pickListData={{
                                  productVariantID: item.itemID,
                                }}
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
                        onClick={(e) => (scannerMode ? scannerSubmit() : nonScannerSubmit())}
                      >
                        {true ? 'Save' : 'Update'}
                      </Button>
                      &nbsp;
                      <Link to="/setting/inventory">
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
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(ScanForm))

// ===============================================================================
