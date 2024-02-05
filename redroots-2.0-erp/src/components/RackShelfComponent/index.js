import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { Button, Select, Spin } from 'antd'
import { SHELVES_STOCK_IN_WAREHOUSE, RACKS_OF_PRODUCT } from 'pages/inventory/warehouses/queries'
import TakeOutScan from './ScannerMode/takeOutTable'
import PutAwayScan from './ScannerMode/putawayTable'
import RackShelfTable from './table'
import './style.scss'

const { Option } = Select
const emptyRow = {
  key: 1,
  rackID: null,
  shelfID: null,
  quantity: 0,
  racksDrop: [],
  shelvesDrop: [],
}

const RackShelfComponent = (props) => {
  // prettier-ignore
  const { getSelectedProductVariants, uniqueKey, editableHeader, warehouseID, getRackShelfData, pickListComponent,
    pickListData, initialTableData, itemQuantity, headerDrop, getHandsonData, scannerMode,
    forceHideTable, scannerData, disableTable, productVariantProps, productVariantIDProps } = props

  const {
    loading: sLoad,
    error: sErr,
    data: shelvesData,
  } = useQuery(SHELVES_STOCK_IN_WAREHOUSE, {
    variables: {
      warehouse_id:
        scannerData && scannerData.pickUpData ? scannerData.pickUpData.warehouseID || null : null,
    },
  })

  const [tableData, setTableData] = useState([emptyRow])
  // const [count, setCount] = useState(1)
  const [allShelvesData, setAllShelvesData] = useState([])
  const [productVariantID, setProductVariantID] = useState(undefined)
  const [productVariant, setProductVariant] = useState(undefined)
  const [callbackFlag, setCallbackFlag] = useState(0)

  const rackShelfInstance = useRef(null)

  useEffect(() => {
    if (initialTableData && initialTableData.length) {
      setTableData(initialTableData)
      // setCount(initialTableData.length)
    }
  }, [initialTableData])

  useEffect(() => {
    if (
      shelvesData &&
      shelvesData.productStockOnShelvesByWarehouseID &&
      shelvesData.productStockOnShelvesByWarehouseID.length
    )
      setAllShelvesData(shelvesData.productStockOnShelvesByWarehouseID)
  }, [shelvesData])

  useEffect(() => {
    if (callbackFlag > 0 && getSelectedProductVariants)
      getSelectedProductVariants(productVariantID, productVariant, uniqueKey)
  }, [callbackFlag])

  const getProducts = (products) =>
    products.map(({ productVariantID: tempID, productVariantName }) => (
      <Option key={Number(tempID)} value={`${tempID},${productVariantName}`}>
        {productVariantName}
      </Option>
    ))

  const onChangeProduct = (e) => {
    const splitString = e.split(',')
    setProductVariant(splitString[1])
    setProductVariantID(Number(splitString[0]))
    setCallbackFlag(callbackFlag + 1)
  }

  const GetTableWithQuery = () => {
    // Prepare a list of all the racks and associated shelves
    const [rackList, setRackList] = useState([])
    const [shelvesList, setShelvesList] = useState({})
    const [shelfQuantity, setShelfQuantity] = useState({})

    const selectedProductVariantID = pickListComponent
      ? Number(pickListData.productVariantID)
      : Number(productVariantID)

    const {
      loading: rLoad,
      error: rErr,
      data: racksData,
    } = useQuery(RACKS_OF_PRODUCT, {
      variables: {
        product_variant_id: selectedProductVariantID,
        warehouse_id: Number(warehouseID),
      },
    })

    useEffect(() => {
      if (racksData && racksData.racksOfProduct && racksData.racksOfProduct.length) {
        const tempShelvesList = {}
        const tempShelfQuantity = {}

        let tempRacksList = racksData.racksOfProduct.map(({ rackData, shelfData, quantity }) => {
          if (Object.prototype.hasOwnProperty.call(tempShelvesList, rackData.id))
            tempShelvesList[rackData.id].push({
              id: shelfData.id,
              name: shelfData.name,
            })
          else tempShelvesList[rackData.id] = [shelfData]

          if (Object.prototype.hasOwnProperty.call(tempShelfQuantity, shelfData.id))
            tempShelfQuantity[shelfData.id] =
              Number(tempShelfQuantity[shelfData.id]) + Number(quantity)
          else tempShelfQuantity[shelfData.id] = Number(quantity)

          return {
            id: rackData.id,
            name: rackData.name,
          }
        })

        // remove duplicates of same "rack id" from the list
        tempRacksList = tempRacksList.filter((obj, pos, arr) => {
          return arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos
        })

        setRackList(tempRacksList)
        setShelvesList(tempShelvesList)
        setShelfQuantity(tempShelfQuantity)
      }
    }, [racksData])

    const newTableData = tableData.map((row) => {
      return {
        ...row,
        racksDrop: rackList.map((rackRow) => {
          return {
            ...rackRow,
            // remove duplicates of same "shelf id" from the list for the given rack
            shelves: shelvesList[rackRow.id].filter((obj, pos, arr) => {
              return arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos
            }),
          }
        }),
        shelfQuantity,
      }
    })

    if (rErr) return `Error occured while fetching data: ${rErr.message}`
    return (
      <Spin spinning={rLoad} tip="Loading..." size="large">
        <RackShelfTable
          uniqueKey={uniqueKey}
          editableHeader={editableHeader}
          pickListComponent={pickListComponent}
          initialTableData={newTableData}
          productVariantID={productVariantID}
          getRackShelfData={getRackShelfData}
          childRef={rackShelfInstance}
        />
      </Spin>
    )
  }

  if (scannerMode) {
    if (scannerData.putAway)
      return (
        <PutAwayScan
          putAwayData={scannerData.putAwayData}
          getRackShelfData={getRackShelfData}
          disableTable={disableTable}
        />
      )

    if (scannerData.pickUp) {
      if (sErr) return `Error occured while fetching data: ${sErr.message}`
      return (
        <Spin spinning={sLoad} tip="Loading..." size="large">
          <TakeOutScan
            partialPickedData={scannerData.partialPickedData}
            pickUpData={scannerData.pickUpData}
            getHandsonData={getHandsonData}
            allShelvesData={allShelvesData}
            disableTable={disableTable}
            pickListComponent={pickListComponent}
          />
        </Spin>
      )
    }
    return null
  }

  return (
    <div className="divPad">
      {!editableHeader ? (
        <div>
          <div className="bigFont">
            <strong>
              {productVariantProps}: {itemQuantity}
            </strong>
            <div className="pull-right">
              <Button type="primary" onClick={() => rackShelfInstance.current.addRowfunction()}>
                Add row
              </Button>
            </div>
          </div>

          {/* <br /> */}
          {pickListComponent ? (
            GetTableWithQuery()
          ) : (
            <div>
              <div style={{ color: 'orange' }}>
                (* Shelves with &quot;Quantity&quot; as 0 or empty will be automatically ignored)
              </div>
              <RackShelfTable
                uniqueKey={uniqueKey}
                editableHeader={editableHeader}
                initialTableData={forceHideTable ? [] : tableData}
                productVariantID={productVariantIDProps}
                getRackShelfData={getRackShelfData}
                childRef={rackShelfInstance}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="row">
            <div className="col-lg-9">
              <div className="row removePad">
                <div className="col-lg-3 bigFont">
                  <strong>Item:</strong>
                </div>
                <div className="col-lg-9">
                  <Select
                    onChange={(e) => onChangeProduct(e)}
                    id="productVariantID"
                    showSearch
                    style={{ width: '100%' }}
                    value={productVariant || null}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {getProducts(headerDrop || [])}
                  </Select>
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <Button type="primary" onClick={() => rackShelfInstance.current.addRowfunction()}>
                Add row
              </Button>
            </div>
          </div>
          {/* <br /> */}

          {!productVariantID ? 'Please select an item from the dropdown' : null}

          {productVariantID ? (
            <GetTableWithQuery />
          ) : (
            <RackShelfTable
              uniqueKey={uniqueKey}
              editableHeader={editableHeader}
              initialTableData={[]}
              productVariantID={null}
              getRackShelfData={getRackShelfData}
              childRef={rackShelfInstance}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default RackShelfComponent
