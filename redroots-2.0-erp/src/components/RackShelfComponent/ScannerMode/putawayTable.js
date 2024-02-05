import React, { useState, useEffect } from 'react'
import { notification } from 'antd'
import { HotTable } from '@handsontable/react'

const PutAwayScan = (props) => {
  const { putAwayData, disableTable, getRackShelfData } = props
  // console.log('===> props in COMPONENT/putAwayTable: ', props)
  // console.log("===> state in COMPONENT/putAwayTable: ", this.state);

  const putAwayColHeaders = ['Shelf', 'Product', 'Suggested Quantity', 'Quantity Scanned']
  const putAwayColumns = [
    { data: 'shelf', type: 'text' },
    { data: 'product', type: 'text' },
    { data: 'suggestedQty', type: 'numeric' },
    { data: 'quantity', type: 'numeric' },
  ]

  const displayColHeaders = ['Product', 'Qty. to Put Away', 'Scanned Qty.']
  const displayColumns = [
    { data: 'itemCode', type: 'text' },
    { data: 'quantity', type: 'numeric' },
    { data: 'scannedQuantity', type: 'numeric' },
  ]

  const [productData, setProductData] = useState([])
  const [shelfData, setShelfData] = useState([])
  const [handsonData, setHandsonData] = useState([])
  const [activeShelf, setActiveShelf] = useState({ id: null, name: null })
  const [dataSources, setDataSources] = useState(putAwayData.dataSources)
  const [partialDataSource, setPartialDataSource] = useState({})

  const [callBackValues, setCallbackValues] = useState(null)
  const [callbackFlag, setCallbackFlag] = useState(0)

  useEffect(() => {
    if (callbackFlag > 0 && callBackValues && getRackShelfData) getRackShelfData(...callBackValues)
    setCallbackValues(null)
  }, [callbackFlag])

  useEffect(() => {
    const { orders, racks } = putAwayData
    console.log('putAwayData --> ', putAwayData)

    // productData --> list of all products to be put away
    let tempProductData = orders.filter((order) => !!order.quantity)

    // shelfData --> list of all shelves of a warehouse
    let tempShelfData = []
    racks.forEach(({ id, name, shelves }) => {
      shelves.forEach((obj) => {
        tempShelfData = [
          ...tempShelfData,
          {
            rackID: id,
            shelfID: obj.id,
            shelf: `${name}, ${obj.name}`,
          },
        ]
      })
    })

    // handsonData --> suggested shelves and quantities
    let tempHandsonData = []
    let count = 1

    tempProductData = tempProductData.map((dataObj) => {
      let scannedQuantity = 0
      putAwayData.dataSources[dataObj.itemCode].forEach((obj) => {
        scannedQuantity += obj.quantity
        // prettier-ignore
        const shelfName = tempShelfData.find(e => Number(e.shelfID) === Number(obj.shelfID)).shelf;

        tempHandsonData = [
          ...tempHandsonData,
          {
            id: count,
            suggestedQty: 5,
            rackID: obj.rackID,
            shelfID: obj.shelfID,
            shelf: shelfName,
            product: dataObj.itemCode,
            quantity: obj.quantity,
          },
        ]

        count += 1
      })

      return { ...dataObj, scannedQuantity }
    })

    setProductData(tempProductData)
    setShelfData(tempShelfData)
    setHandsonData(tempHandsonData)
  }, [])

  // console.log('shelfData --> ', shelfData)
  // console.log('productData --> ', productData)

  const beforeHandsonChange = (changes) => {
    // console.log("===== INSIDE HANDSON CHANGE ======");

    const audioElement = new Audio('resources/sounds/error.mp3')

    let isShelf = false
    let isProduct = false
    let newName = ''
    let newShelfID = null
    let newProductVariantID = null
    let tempHandsonData = JSON.parse(JSON.stringify(handsonData))
    let tempActiveShelf = JSON.parse(JSON.stringify(activeShelf))
    let tempProductData = JSON.parse(JSON.stringify(productData))
    const tempDataSources = JSON.parse(JSON.stringify(dataSources))
    let tempPartialDataSource = JSON.parse(JSON.stringify(partialDataSource))

    // console.log('changes: ', changes[0], changes[0][3])

    shelfData.forEach((obj) => {
      if (Number(changes[0][3]) === Number(obj.shelfID)) {
        isShelf = true
        newName = obj.shelf
        newShelfID = obj.shelfID
      }
    })

    tempProductData.forEach(({ itemEANCode, itemID, itemCode }) => {
      if (Number(changes[0][3]) === Number(itemEANCode)) {
        isProduct = true
        newName = itemCode
        newProductVariantID = itemID
      }
    })

    if (!isShelf && !isProduct) {
      notification.warning({
        message: 'Invalid Scan',
        description:
          'Scanned barcode is neither a shelf in this warehouse, nor an item to be put away',
      })
      audioElement.play()
      changes[0] = null
      return false
    }

    if (isShelf) {
      let isShelfPresent = false

      tempHandsonData.forEach(({ shelf }) => {
        if (shelf === newName) isShelfPresent = true
      })
      // console.log("isShelfPresent: ", isShelfPresent);

      if (!isShelfPresent) {
        tempHandsonData = [
          ...tempHandsonData,
          {
            id: tempHandsonData.length + 1,
            shelf: newName,
            product: '',
            quantity: 0,
          },
        ]
        tempActiveShelf = { id: newShelfID, name: newName }
      } else tempActiveShelf = { id: newShelfID, name: newName }

      changes[0] = null
      setHandsonData(tempHandsonData)
      setActiveShelf(tempActiveShelf)

      return false
    }

    // IF THE SCANNED ITEM IS A PRODUCT
    if (isProduct) {
      // If there is no shelf active, show an error and return
      if (!tempActiveShelf.name) {
        notification.warning({
          message: 'No Shelf selected',
          description: 'Please select a shelf first',
        })
        audioElement.play()
        changes[0] = null
        return false
      }

      let alreadyPresent = false
      let presentData = {}

      // Find out if active shelf already exists for this scanned product in our handsonData
      tempHandsonData.forEach((dataObj, index) => {
        if (dataObj.shelf === tempActiveShelf.name) {
          if (!dataObj.product || dataObj.product === newName) {
            alreadyPresent = true
            presentData = { index, quantity: dataObj.quantity }
          }
        }
      })

      // STARTS BELOW --> making "partialDataSource" which would be helpful when putting away remainder of partial put-aways
      if (Object.prototype.hasOwnProperty.call(tempPartialDataSource, newName)) {
        const shelfDataIndex = tempPartialDataSource[newName].findIndex(
          ({ shelfID }) => Number(shelfID) === Number(tempActiveShelf.id),
        )

        if (shelfDataIndex > -1) tempPartialDataSource[newName][shelfDataIndex].quantity += 1
        else
          tempPartialDataSource[newName] = [
            ...tempPartialDataSource[newName],
            {
              key: tempPartialDataSource[newName].length + 1,
              rackID: Number(
                shelfData.find(({ shelfID }) => Number(shelfID) === Number(tempActiveShelf.id))
                  .rackID,
              ),
              shelfID: Number(tempActiveShelf.id),
              quantity: 1,
            },
          ]
      } else
        tempPartialDataSource = {
          ...tempPartialDataSource,
          [newName]: [
            {
              key: 1,
              rackID: Number(
                shelfData.find(({ shelfID }) => Number(shelfID) === Number(tempActiveShelf.id))
                  .rackID,
              ),
              shelfID: Number(tempActiveShelf.id),
              quantity: 1,
            },
          ],
        }
      // <-- ENDS ABOVE

      if (alreadyPresent) {
        /**
         * If the active shelf is already present for scanned product,
           simply increase the quantity of the product by 1
         * Here, we alter two things:
           (i) 'handsonData' --> used in handson table
           (ii) 'dataSources' object of props --> will be used by main form in mutations
                                              --> sent to main form via getRackShelfData() method
        */

        // change 'quantity' of the required row in 'dataSources' object
        tempDataSources[newName].forEach((dataObj) => {
          if (Number(dataObj.shelfID) === Number(tempActiveShelf.id)) dataObj.quantity += 1
        })

        tempHandsonData[presentData.index].quantity = Number(presentData.quantity) + 1

        if (!tempHandsonData[presentData.index].product) {
          tempDataSources[newName] = [
            ...tempDataSources[newName],
            {
              key: tempDataSources[newName].length + 1,
              rackID: Number(
                shelfData.find(({ shelfID }) => Number(shelfID) === Number(tempActiveShelf.id))
                  .rackID,
              ),
              shelfID: Number(tempActiveShelf.id),
              quantity: Number(presentData.quantity) + 1,
            },
          ]

          tempHandsonData[presentData.index].product = newName
        }

        tempProductData = tempProductData.map((obj) => {
          if (obj.itemCode === newName)
            return {
              ...obj,
              scannedQuantity: obj.scannedQuantity + 1,
            }
          return obj
        })

        changes[0] = null
        setHandsonData(tempHandsonData)
        setProductData(tempProductData)
        setDataSources(tempDataSources)
        setPartialDataSource(tempPartialDataSource)
        setCallbackValues([
          newProductVariantID,
          tempDataSources[newName],
          tempPartialDataSource[newName],
        ])
        setCallbackFlag(callbackFlag + 1)

        return false
      }

      if (!alreadyPresent && tempActiveShelf.id) {
        /**
         * If the currently active shelf is absent for scanned product,
           create a new row with quantity '1' of the product, in:
           (i) 'handsonData' --> used in handson table
           (ii) 'dataSources' object of props --> will be used by main form in mutations
                                              --> sent to main form via getRackShelfData() method
        */
        tempHandsonData = [
          ...tempHandsonData,
          {
            id: tempHandsonData.length + 1,
            shelf: tempActiveShelf.name,
            product: newName,
            quantity: 1,
          },
        ]

        tempDataSources[newName] = [
          ...tempDataSources[newName],
          {
            key: tempDataSources[newName].length + 1,
            rackID: Number(
              shelfData.find(({ shelfID }) => Number(shelfID) === Number(tempActiveShelf.id))
                .rackID,
            ),
            shelfID: Number(tempActiveShelf.id),
            quantity: 1,
          },
        ]
        // console.log("tableData: ", tempDataSources[newName]);

        tempProductData = tempProductData.map((obj) => {
          if (obj.itemCode === newName)
            return {
              ...obj,
              scannedQuantity: obj.scannedQuantity + 1,
            }
          return obj
        })

        changes[0] = null
        setHandsonData(tempHandsonData)
        setProductData(tempProductData)
        setDataSources(tempDataSources)
        setPartialDataSource(tempPartialDataSource)
        setCallbackValues([
          newProductVariantID,
          tempDataSources[newName],
          tempPartialDataSource[newName],
        ])
        setCallbackFlag(callbackFlag + 1)

        return false
      }
      return false
    }
    return false
  }

  return (
    <div>
      <div>List of products to put away:</div>
      <br />
      <div className="col-lg-8">
        <HotTable
          data={productData}
          colHeaders={displayColHeaders}
          rowHeaders
          stretchH="all"
          columns={displayColumns}
          manualRowResize
          manualColumnResize
          readOnly
          disableVisualSelection
        />
      </div>
      <br />
      <br />
      List of scanned products:
      <div style={{ color: 'orange' }}>
        (* Shelves with &quot;Quantity Scanned&quot; as 0 will be automatically ignored)
      </div>
      <br />
      <HotTable
        data={handsonData}
        colHeaders={putAwayColHeaders}
        rowHeaders
        readOnly={disableTable}
        disableVisualSelection={disableTable}
        // width="100%"
        // height={Number(heightToSet) - 50}
        stretchH="all"
        columns={putAwayColumns}
        // search
        // afterSelection={afterSelection}
        // afterChange={changes => afterChange(changes)}
        beforeChange={beforeHandsonChange}
        // beforePaste={beforePaste}
        // outsideClickDeselects={clickOutsideHandson}
        // afterColumnSort={afterColumnSort}
        // contextMenu
        manualRowResize
        manualColumnResize
        // manualRowMove
        // manualColumnMove
        // columnSorting={{ indicator: true, ...sortOrder }}
        // filters
        // renderAllRows
        // fillHandle={{
        //   direction: "vertical",
        //   autoInsertRow: false
        // }}
        // cells={cells}
      />
    </div>
  )
}

export default PutAwayScan
