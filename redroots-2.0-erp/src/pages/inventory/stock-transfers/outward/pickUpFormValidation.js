/* eslint-disable import/prefer-default-export */
import { notification } from 'antd'

export const validation = (warehouseVerify, rackShelfData, productVariantMapping) => {
  let divError = false
  let nonDivError = false
  let divErrorMessage = ''
  let divErrorFoundIn = null
  let nonDivErrorFoundIn = { warehouse1: null, warehouse2: null }

  // console.log("rackShelfData: ", rackShelfData);

  if (warehouseVerify.warehouse1Verify) {
    if (!warehouseVerify.warehouse1) {
      nonDivError = true
      nonDivErrorFoundIn = {
        ...nonDivErrorFoundIn,
        warehouse1: 'Please select a warehouse',
      }
    }
  }

  if (warehouseVerify.warehouse2Verify) {
    if (!warehouseVerify.warehouse2) {
      nonDivError = true
      nonDivErrorFoundIn = {
        ...nonDivErrorFoundIn,
        warehouse2: 'Please select a warehouse',
      }
    }
  }

  productVariantMapping.forEach(({ id, productVariantID, bomCode }) => {
    // console.log("divObj -- divId, productVariantID: ", id, productVariantID);

    if (!divError) {
      if (!productVariantID) {
        divError = true
        divErrorFoundIn = id
        divErrorMessage = 'Please select an item'
      } else if (!Object.prototype.hasOwnProperty.call(rackShelfData, id)) {
        divError = true
        divErrorFoundIn = id
        divErrorMessage = `"${bomCode}" must be assigned racks and shelves`
      } else {
        const newArray = rackShelfData[id].tableData

        newArray.forEach(({ quantity, shelfId, shelfQuantity }) => {
          if (!divError && !shelfId) {
            divError = true
            divErrorFoundIn = id
            divErrorMessage = `"${productVariantID}" must be assigned racks and shelves. \n OR, \n Delete any unused rows`
          }

          if (!divError && (!quantity || quantity > shelfQuantity[shelfId])) {
            divError = true
            divErrorFoundIn = id
            divErrorMessage = `Quantity of items must be less than or equal to "In Stock" quantity`
          }
        })
      }
    }

    // if (!!order.quantity) {
    //   if (!rackShelfData.hasOwnProperty(order.itemId)) {
    //     errorsPresent = true;
    //     errorMessage = `"${order.itemCode}" must be assigned racks and shelves`;
    //     errorFoundIn = order.itemId;
    //   } else {
    //     const newArray = rackShelfData[order.itemId];
    //     let totalQuantity = 0;

    //     newArray.forEach(obj => {
    //       totalQuantity += obj.quantity;

    //       if (!errorsPresent && !obj.shelfId) {
    //         errorFoundIn = order.itemId;
    //         errorsPresent = true;
    //         errorMessage = `"${order.itemCode}" must be assigned racks and shelves. \n OR, \n Delete any unused rows`;
    //       }
    //     });

    //     if (!errorsPresent && order.quantity !== totalQuantity) {
    //       errorsPresent = true;
    //       errorMessage = `Quantity for item "${order.itemCode}" must be equal to "${order.quantity}"`;
    //       errorFoundIn = order.itemId;
    //     }
    //   }
    // }
  })

  if (divError && divErrorMessage) {
    notification.error({
      message: 'Error:',
      description: divErrorMessage,
    })
  }

  if (divError || nonDivError)
    return {
      divError,
      nonDivError,
      divErrorFoundIn,
      nonDivErrorFoundIn,
      divErrorMessage,
    }

  return false
}
