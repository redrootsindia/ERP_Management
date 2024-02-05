import { notification } from 'antd'

const validation = (boxDivs, boxData) => {
  let divError = false
  let divErrorMessage = ''
  let divErrorFoundIn = null

  boxDivs.forEach(({ key }) => {
    if (!divError) {
      if (!boxData[key]) {
        divError = true
        divErrorFoundIn = key
        divErrorMessage = 'Please enter quantities against products in this box'
      } else {
        const boxObj = boxData[key]
        if (!boxObj.boxCode) {
          divError = true
          divErrorFoundIn = key
          divErrorMessage = 'Please enter a name (Box #) for this box'
          return
        }

        if (!boxObj.tableData.length) {
          divError = true
          divErrorFoundIn = key
          divErrorMessage = `Box "${boxObj.boxCode}" cannot be empty`
          return
        }

        boxObj.tableData.forEach((obj) => {
          if (!obj.productVariantID || Number(obj.productVariantID) === 0 || !obj.quantity) {
            divError = true
            divErrorFoundIn = key
            divErrorMessage = `Please enter quantities against products in box "${boxObj.boxCode}"`
          }
        })
      }
    }
  })

  if (divError) {
    notification.error({
      message: 'Error:',
      description: divErrorMessage,
    })
    return { divError, divErrorFoundIn, divErrorMessage }
  }

  return false
}

export default validation
