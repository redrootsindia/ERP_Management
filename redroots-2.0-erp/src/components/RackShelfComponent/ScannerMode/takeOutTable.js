import React, { useState, useEffect } from 'react'
import { notification } from 'antd'
import { HotTable } from '@handsontable/react'
import '../style.scss'

const TakeOutTable = (props) => {
  // prettier-ignore
  const { allShelvesData, pickUpData, partialPickedData, getHandsonData, pickListComponent, disableTable } = props

  const takeOutColHeaders = ['Shelf', 'Product', 'In Stock', 'Quantity']
  const takeOutColumns = [
    { data: 'shelf', type: 'text' },
    { data: 'product', type: 'text' },
    { data: 'stockQuantity', type: 'numeric' },
    { data: 'quantity', type: 'numeric' },
  ]

  const scannedColHeaders = ['Product', 'Qty. to Pick', 'Scanned Qty.']
  const scannedColumns = [
    { data: 'itemCode', type: 'text' },
    { data: 'qtyToPick', type: 'numeric' },
    { data: 'scannedQuantity', type: 'numeric' },
  ]

  if (!pickListComponent) {
    takeOutColumns.splice(2, 1)
    takeOutColHeaders.splice(2, 1)
    scannedColHeaders.splice(1, 1)
    scannedColumns.splice(1, 1)
  }

  const [firstHandsonEntry, setFirstHandsonEntry] = useState(true)
  const [handsonData, setHandsonData] = useState([{ id: 1 }])
  const [activeShelf, setActiveShelf] = useState({ id: null, name: null })
  const [productData, setProductData] = useState([])
  const [shelfData, setShelfData] = useState([])
  const [pickedQuantities, setPickedQuantities] = useState([])
  const [pickedQtyHandsonData, setPickedQtyHandsonData] = useState([])
  const [callbackFlag, setCallbackFlag] = useState(0)

  useEffect(() => {
    if (callbackFlag > 0 && getHandsonData) getHandsonData(handsonData)
  }, [callbackFlag])

  useEffect(() => {
    if (pickUpData && Object.keys(pickUpData).length) {
      const { headerDrop, pickUpItems } = pickUpData

      const isPartialExists = partialPickedData && !!Object.keys(partialPickedData).length

      let tempProductData = []
      let tempPickedQuantities = {}
      const tempPickedQtyHandsonData = []
      let tempShelfData = []

      headerDrop.forEach((bomObj) => {
        // productData --> list of all products to be put away
        tempProductData = [
          ...tempProductData,
          {
            ...bomObj,
            quantity: allShelvesData
              .filter(
                ({ productVariantData: { id } }) => Number(id) === Number(bomObj.productVariantID),
              )
              .reduce((accumulator, currentValue) => {
                return accumulator + parseFloat(currentValue.quantity)
              }, 0),
          },
        ]
      })

      allShelvesData.forEach(({ shelfData: { id, name, rackData } }) => {
        tempShelfData = [
          ...tempShelfData,
          {
            rackID: rackData.id,
            shelfID: id,
            shelf: `${rackData.name}, ${name}`,
          },
        ]
      })

      if (pickUpItems && pickUpItems.length)
        pickUpItems.forEach(({ itemID, itemCode, quantity }) => {
          const qtyToInsert =
            isPartialExists && !!partialPickedData[itemID] ? partialPickedData[itemID].pickedQty : 0

          tempPickedQtyHandsonData.push({
            itemCode,
            qtyToPick: quantity,
            scannedQuantity: qtyToInsert,
          })

          tempPickedQuantities = {
            ...tempPickedQuantities,
            [itemID]: qtyToInsert,
          }
        })

      setProductData(tempProductData)
      setPickedQuantities(tempPickedQuantities)
      setPickedQtyHandsonData(tempPickedQtyHandsonData)
      // remove duplicate entries from shelfData
      setShelfData(
        tempShelfData.filter(
          (obj, pos, arr) => arr.map((mapObj) => mapObj.shelfID).indexOf(obj.shelfID) === pos,
        ),
      )
    }
  }, [pickUpData, allShelvesData, partialPickedData])

  const beforeHandsonChange = (changes) => {
    const audioElement = new Audio('resources/sounds/error.mp3')

    let tempHandsonData = JSON.parse(JSON.stringify(handsonData))
    let tempActiveShelf = JSON.parse(JSON.stringify(activeShelf))
    const tempPickedQuantities = JSON.parse(JSON.stringify(pickedQuantities))
    let tempPickedQtyHandsonData = JSON.parse(JSON.stringify(pickedQtyHandsonData))

    let isShelf = false
    let isProduct = false
    let newName = ''
    let newShelfID = null
    let newProductVariantID = null
    let newRackID = null

    shelfData.forEach((obj) => {
      if (Number(changes[0][3]) === Number(obj.shelfID)) {
        isShelf = true
        newName = obj.shelf
        newShelfID = Number(obj.shelfID)
        newRackID = Number(obj.rackID)
      }
    })

    productData.forEach((obj) => {
      if (Number(changes[0][3]) === Number(obj.eanCode)) {
        isProduct = true
        newName = obj.productVariantName
        newProductVariantID = obj.productVariantID
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

      if (!isShelfPresent) {
        const newRowData = {
          id: firstHandsonEntry ? 1 : tempHandsonData.length + 1,
          rackID: Number(newRackID),
          shelfID: Number(newShelfID),
          shelf: newName,
          product: '',
          productID: null,
          quantity: 0,
        }
        tempHandsonData = firstHandsonEntry ? [newRowData] : [...tempHandsonData, newRowData]
        setFirstHandsonEntry(false)
      }

      tempActiveShelf = {
        id: newShelfID,
        name: newName,
        warehouseDetails: allShelvesData.filter(
          ({ shelfData: { id } }) => Number(id) === Number(newShelfID),
        ),
      }

      changes[0] = null
      setHandsonData(tempHandsonData)
      setActiveShelf(tempActiveShelf)
      setCallbackFlag(callbackFlag + 1)
      return false
    }

    if (isProduct) {
      // If product is scanned first and no shelf is selected, return!
      if (firstHandsonEntry) {
        notification.warning({
          message: 'No Shelf selected',
          description: 'Please select a shelf first',
        })
        audioElement.play()
        changes[0] = null
        return false
      }

      if (pickListComponent) {
        const qtyToPick = pickUpData.pickUpItems.find(
          ({ itemID }) => Number(itemID) === Number(newProductVariantID),
        ).quantity

        if (tempPickedQuantities[newProductVariantID] + 1 > qtyToPick) {
          notification.warning({
            message: 'Quantity Exceeded',
            description: `Quantity of '${newName}' to be picked is already scanned`,
          })
          audioElement.play()
          changes[0] = null
          return false
        }
      }

      let alreadyPresent = false
      let presentData = {}

      tempHandsonData.forEach((dataObj, index) => {
        if (dataObj.shelf === tempActiveShelf.name) {
          if (!dataObj.product || dataObj.product === newName) {
            alreadyPresent = true
            presentData = { index, quantity: dataObj.quantity }
          }
        }
      })

      // Check if the scanned product exists on the shelf in warehouse
      const productOnWHShelf = tempActiveShelf.warehouseDetails.find(
        ({ productVariantData: { id } }) => Number(id) === Number(newProductVariantID),
      )

      // If there is no such product found on the warehouse-shelf, return!
      if (!productOnWHShelf) {
        notification.warning({
          message: 'Invalid Scan',
          description: `${newName} does not exist on ${tempActiveShelf.name}`,
        })
        audioElement.play()
        changes[0] = null
        return false
      }

      const qtyOnShelf = Number(productOnWHShelf.quantity)

      // prettier-ignore
      // If quantity of the scanned product is more than what exits on the warehouse-shelf, return!
      if (Number(presentData.quantity) + 1 > qtyOnShelf) {
        notification.warning({
          message: "Quantity Exceeded",
          description: `Quantity of ${newName} on ${tempActiveShelf.name} is ${qtyOnShelf}`
        });
        audioElement.play();
        changes[0] = null;
        return false;
      }

      tempPickedQuantities[newProductVariantID] += 1
      tempPickedQtyHandsonData = tempPickedQtyHandsonData.map((obj) => {
        if (obj.itemCode === newName)
          return {
            ...obj,
            scannedQuantity: obj.scannedQuantity + 1,
          }
        return obj
      })

      if (alreadyPresent) {
        tempHandsonData[presentData.index] = {
          ...tempHandsonData[presentData.index],
          quantity: Number(presentData.quantity) + 1,
          product: newName,
          productID: newProductVariantID,
          itemEANCode: changes[0][3],
        }
      } else {
        tempHandsonData = [
          ...tempHandsonData,
          {
            id: tempHandsonData.length + 1,
            rackID: Number(
              shelfData.find(({ shelfID }) => Number(shelfID) === Number(tempActiveShelf.id))
                .rackID,
            ),
            shelfID: Number(tempActiveShelf.id),
            shelf: tempActiveShelf.name,
            product: newName,
            productID: newProductVariantID,
            quantity: 1,
            itemEANCode: changes[0][3],
          },
        ]
      }

      changes[0] = null
      setHandsonData(tempHandsonData)
      setPickedQuantities(tempPickedQuantities)
      setPickedQtyHandsonData(tempPickedQtyHandsonData)
      setCallbackFlag(callbackFlag + 1)
      return false
    }
    return false
  }

  return (
    <div className="row">
      <div className="col-lg-6">
        {pickListComponent ? (
          <div>
            <div>List of products to pick:</div>
            {/* <br /> */}
            <div style={{ height: '500px' }}>
              <HotTable
                data={pickedQtyHandsonData}
                colHeaders={scannedColHeaders}
                rowHeaders
                // stretchH="all"
                columns={scannedColumns}
                manualRowResize
                manualColumnResize
                readOnly
                disableVisualSelection
              />
            </div>
            {/* <br /> */}
            {/* <br /> */}
          </div>
        ) : null}
      </div>
      <div className="col-lg-6">
        <div>List of scanned products:</div>
        <div style={{ height: '500px' }}>
          <HotTable
            // ref="handsonTable"
            data={handsonData}
            colHeaders={takeOutColHeaders}
            rowHeaders
            readOnly={disableTable}
            disableVisualSelection={disableTable}
            // stretchH="all"
            columns={takeOutColumns}
            beforeChange={beforeHandsonChange}
            manualRowResize
            manualColumnResize
          />
        </div>
      </div>
    </div>
  )
}

export default TakeOutTable
