import { notification } from 'antd'

const validation = (rackShelfData, incomingOrders, type, unsalableTableData = []) => {
  let errorsPresent = false
  let errorMessage = ''
  let errorFoundIn = null

  incomingOrders.forEach((order) => {
    if (!!order.quantity && rackShelfData[order.itemID]) {
      const newArray = rackShelfData[order.itemID]
      let totalQuantity = 0

      newArray.forEach((obj) => {
        totalQuantity += obj.quantity

        if (!errorsPresent && !obj.shelfID) {
          errorFoundIn = order.itemID
          errorsPresent = true
          errorMessage = `"${order.itemCode}" must be assigned racks and shelves, OR, Delete any unused rows`
        }

        // if (!errorsPresent && !obj.quantity) {
        //   errorFoundIn = order.itemID;
        //   errorsPresent = true;
        //   errorMessage = `All quantities for "${order.itemCode}" must be greater than 0`;
        // }
      })

      // if (!errorsPresent && order.quantity !== totalQuantity) {
      //   errorsPresent = true;
      //   errorMessage = `Quantity for item "${order.itemCode}" must be equal to "${order.quantity}"`;
      //   errorFoundIn = order.itemID;
      // }

      if (Number(type) === 4) {
        if (unsalableTableData.length && !errorsPresent) {
          const unsalableQty = unsalableTableData
            .filter(({ productVariant }) => Number(productVariant) === Number(order.itemID))
            .reduce((acc, curr) => acc + Number(curr.quantity), 0)
          // console.log("unsalableQty for ", order.itemCode, unsalableQty);
          // console.log("totalQuantity for ", order.itemCode, totalQuantity);

          if (unsalableQty > totalQuantity) {
            errorFoundIn = order.itemID
            errorsPresent = true
            errorMessage = `Unsalable quantity entered for "${order.itemCode}" is more than its scanned quantity`
          }
        }
      }
    }
  })

  if (Number(type) === 4 && unsalableTableData.length && !errorsPresent) {
    unsalableTableData.forEach((unsalableObj) => {
      if (
        !errorsPresent &&
        (!unsalableObj.productVariant ||
          !unsalableObj.quantity ||
          !unsalableObj.shelfID ||
          !unsalableObj.unsalableReasonID)
      ) {
        errorFoundIn = 'unsalable'
        errorsPresent = true
        errorMessage = `UNSALABLE PRODUCTS: Make sure all the columns for all the rows of the table have valid values, or, delete unnecessary rows.`
      }
    })
  }

  if (errorsPresent && errorMessage) {
    notification.error({
      message: 'Error:',
      description: errorMessage,
    })
    return errorFoundIn
  }

  return false
}

export default validation
