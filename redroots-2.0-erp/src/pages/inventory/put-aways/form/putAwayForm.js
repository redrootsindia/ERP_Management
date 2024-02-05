/* eslint "no-unused-vars": "off" */
import React, { useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { Button, Select, notification, InputNumber, Popconfirm, Modal, Table } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
// import Error403 from 'components/Errors/403'
import RackShelfComponent from 'components/RackShelfComponent'
import validation from './validation'
import { ADD_PUT_AWAY, CHANGE_PROCESSING_STATE } from '../queries'
import { SHELF_NAMES_BY_IDS } from '../../warehouses/queries'
import { UNSALABLE_REASONS } from '../../../settings/inventory-settings/unsalable-reason/queries'
import './style.scss'

const { confirm } = Modal
const { Option } = Select

/**
  STATE VARIABLES:
    * @rackShelfData :
        - Consists all the combined handson-table data
        - Previously scanned (partial put-aways) and currently scanned - evrything!
    * @partialPutAwayRackShelf :
        - Consists only currently scanned data
        - This data is used while running mutations (previous partial data is excluded)
    * @unsalableTableData :
        - Used only for RTV Module Put Aways
        - Contains data of any items that are supposed to be tagged as unsalable, along with reason
 */

const PutAwayFormPage = (props) => {
  const history = useHistory()
  const { isNonScannerEdit, putAwayData, partialPutAwayData, type } = props

  const [isPack, setIsPack] = useState(false)
  const [dataSources, setDataSources] = useState({})
  const [rackShelfData, setRackShelfData] = useState({})
  const [partialPutAwayRackShelf, setPartialPutAwayRackShelf] = useState({})
  const [errorFoundIn, setErrorFoundIn] = useState(null)
  const [scannerMode, setScannerMode] = useState(!isNonScannerEdit)
  const [unsalableTableData, setUnsalableTableData] = useState([])
  const [unsalableDropOptions, setUnsalableDropOptions] = useState({})
  const [count, setCount] = useState(0)

  useEffect(() => {
    const tempDataSources = {}
    const tempRackShelfData = {}
    const tempUnsalableTableData = []
    let tempUnsalableDropOptions = {}
    let tempIsPack = false

    if (putAwayData && Object.keys(putAwayData).length) {
      const { orders, racks, pack } = putAwayData

      tempIsPack = pack || false

      console.log('partialPutAwayData -- ', partialPutAwayData)

      if (partialPutAwayData && partialPutAwayData.length) {
        orders.forEach((order) => {
          // console.log('order --> ', order)

          // For this item, get all the rows of previously done partial put-aways
          let partialDone = []
          if (pack)
            partialDone = partialPutAwayData.filter(
              ({ pack_id }) => Number(pack_id) === Number(order.itemID),
            )
          else
            partialDone = partialPutAwayData.filter(
              ({ product_variant_id }) => Number(product_variant_id) === Number(order.itemID),
            )
          console.log('partialDone: ', partialDone)

          if (partialDone.length) {
            partialDone.forEach((obj) => {
              obj.put_away_shelf_mapping.forEach((putAwayObj) => {
                const foundRackID = racks.find(({ shelves }) => {
                  let find = false
                  shelves.forEach(({ id }) => {
                    if (Number(id) === Number(putAwayObj.shelf_id)) find = true
                  })
                  return find
                }).id

                if (Object.prototype.hasOwnProperty.call(tempDataSources, order.itemCode)) {
                  /**
                   * If there are many partial put-aways of this item on the same shelf,
                        just increase the increase the quantity on that shelf in "dataSources".
                   * This will avoid duplicate rows of same "shelfID"
                   * "tempIndex" below serves that purpose:
                        It gets the index in the "dataSources" object, if the "shelfID" already exists
                   */
                  const tempIndex = tempDataSources[order.itemCode].findIndex(
                    ({ shelfID }) => Number(shelfID) === Number(putAwayObj.shelf_id),
                  )

                  if (tempIndex > -1)
                    tempDataSources[order.itemCode][tempIndex].quantity += Number(
                      putAwayObj.quantity,
                    )
                  else {
                    const objToPush = {
                      key: tempDataSources[order.itemCode].length,
                      rackID: foundRackID,
                      shelfID: putAwayObj.shelf_id,
                      quantity: putAwayObj.quantity,
                      racksDrop: racks,
                      shelvesDrop: racks.find(({ id }) => Number(id) === Number(foundRackID))
                        .shelves,
                      // isNew: false,
                      // putAwayId: Number(obj.id),
                      // putAwayLastTableId: Number(putAwayObj.id)
                    }

                    tempDataSources[order.itemCode].push(objToPush)
                    tempRackShelfData[order.itemID].push(objToPush)
                  }
                } else {
                  const newObj = {
                    key: 0,
                    rackID: foundRackID,
                    shelfID: putAwayObj.shelf_id,
                    quantity: putAwayObj.quantity,
                    racksDrop: racks,
                    shelvesDrop: racks.find(({ id }) => Number(id) === Number(foundRackID)).shelves,
                    // isNew: false,
                    // putAwayId: Number(obj.id),
                    // putAwayLastTableId: Number(putAwayObj.id)
                  }
                  tempDataSources[order.itemCode] = [newObj]
                  tempRackShelfData[order.itemID] = [newObj]
                }

                if (type === 'rtv' && obj.putAwayDetail) {
                  const unsalableItems = obj.putAwayDetail.filter(
                    (unsalableObj) =>
                      Number(unsalableObj.productVariantID) === Number(order.itemID) &&
                      Number(unsalableObj.shelfID) === Number(putAwayObj.shelf_id) &&
                      unsalableObj.salable === false,
                  )

                  if (unsalableItems.length) {
                    unsalableItems.forEach((e) => {
                      tempUnsalableTableData.push({
                        key: tempUnsalableTableData.length,
                        quantity: e.quantity,
                        isNew: false,
                        oldQuantity: e.quantity,
                        productStockID: e.id,
                        shelfID: String(e.shelf_id),
                        productVariant: String(e.productVariantID),
                        unsalableReasonID: String(e.unsalable_reason_id),
                      })

                      tempUnsalableDropOptions = {
                        ...tempUnsalableDropOptions,
                        [order.itemID]: {
                          id: String(order.itemID),
                          name: order.itemCode,
                        },
                      }
                    })
                  }
                }
              })
            })
            // console.log('IN PARTIAL DONE --> tempRackShelfData --> ', tempRackShelfData)
            setRackShelfData(tempRackShelfData)
          } else
            tempDataSources[order.itemCode] = [
              {
                key: 0,
                rackID: racks[0].id,
                shelfID: racks[0].shelves[0].id,
                quantity: 0,
                racksDrop: racks,
                shelvesDrop: racks.find(({ id }) => Number(id) === Number(racks[0].id)).shelves,
                // isNew: true,
                // putAwayId: 0,
                // putAwayLastTableId: 0
              },
            ]
        })
      } else
        orders.forEach((order) => {
          tempDataSources[order.itemCode] = [
            {
              key: 0,
              rackID: racks[0].id,
              shelfID: racks[0].shelves[0].id,
              quantity: 0,
              racksDrop: racks,
              shelvesDrop: racks.find(({ id }) => Number(id) === Number(racks[0].id)).shelves,
              // isNew: true,
              // putAwayId: 0,
              // putAwayLastTableId: 0
            },
          ]
        })
    }

    setIsPack(tempIsPack)
    setDataSources(tempDataSources)
    setUnsalableTableData(tempUnsalableTableData)
    setCount(tempUnsalableTableData.length)
    setUnsalableDropOptions(tempUnsalableDropOptions)
  }, [])

  console.log('ispack -- ', isPack)

  // const onChange = (e) => this.setState({ [e.target.id]: e.target.value })

  const onChangeView = (e) => setScannerMode(e)

  const onChangeTableRow = (e, key, column) => {
    const newTableData = unsalableTableData.map((row) => {
      if (row.key === key) return { ...row, [column]: e }
      return row
    })
    setUnsalableTableData(newTableData)
  }

  const addRow = () => {
    const newTableData = [
      ...unsalableTableData,
      {
        key: count + 1,
        quantity: 1,
        isNew: true,
        oldQuantity: 0,
        productStockID: 0,
        shelfID: null,
      },
    ]
    setUnsalableTableData(newTableData)
    setCount(count + 1)
  }

  const deleteRow = (key) => {
    const tableData = JSON.parse(JSON.stringify(unsalableTableData))
    const newTableData = tableData.filter((item) => item.key !== key)
    setUnsalableTableData(newTableData)
  }

  const getRackShelfData = (productVariantID, tableData, partialData) => {
    const { orders } = putAwayData

    setRackShelfData({
      ...rackShelfData,
      [productVariantID]: tableData,
    })

    setPartialPutAwayRackShelf({
      ...partialPutAwayRackShelf,
      [productVariantID]: partialData,
    })

    setUnsalableDropOptions({
      ...unsalableDropOptions,
      [productVariantID]: {
        id: String(productVariantID),
        name: orders.find(({ itemID }) => Number(itemID) === Number(productVariantID)).itemCode,
      },
    })
  }

  const onSubmit = (addPutAway) => {
    const { id, orders } = putAwayData

    if (!Object.keys(rackShelfData).length) {
      notification.error({
        message: 'No items scanned:',
        description: 'Please scan some items to be put away on shelves',
      })
      return
    }

    const finalPutAwayData = []
    let excessQtyArray = []
    let isExcess = false
    let isPartial = false
    const isPartialDataExists = partialPutAwayData && partialPutAwayData.length

    const isFormInvalid = validation(rackShelfData, orders, type, unsalableTableData)
    // console.log('rackShelfData: ', rackShelfData)
    // console.log('isFormInvalid: ', isFormInvalid)
    // return

    if (isFormInvalid) setErrorFoundIn(isFormInvalid)
    else {
      let dataToConsider = rackShelfData

      if (isPartialDataExists) {
        dataToConsider = partialPutAwayRackShelf

        partialPutAwayData.forEach((previousPartial) => {
          previousPartial.put_away_shelf_mapping.forEach((previousShelf) => {
            const newPartial = dataToConsider[previousPartial.productVariantID]

            if (newPartial) {
              const newShelfIndex = newPartial.findIndex(
                ({ shelfID }) => Number(shelfID) === Number(previousShelf.shelfID),
              )

              if (newShelfIndex > -1) {
                dataToConsider[previousPartial.productVariantID][newShelfIndex].quantity -=
                  previousShelf.quantity
              }
            }
          })
        })
      }

      orders.forEach((order) => {
        if (order.quantity && Object.prototype.hasOwnProperty.call(rackShelfData, order.itemID)) {
          const totalQty = rackShelfData[order.itemID].reduce(
            (acc, curr) => acc + Number(curr.quantity),
            0,
          )

          if (totalQty < order.quantity) isPartial = true

          let excessQty = 0
          let excessShelfObj = {}
          if (
            totalQty > order.quantity &&
            (!isPartialDataExists ||
              (isPartialDataExists &&
                Object.prototype.hasOwnProperty.call(partialPutAwayRackShelf, order.itemID)))
          ) {
            isExcess = true
            excessQty = totalQty - order.quantity
            excessShelfObj = rackShelfData[order.itemID].find((obj) => obj.quantity >= excessQty)
          }

          // console.log('totalQty: ', totalQty)
          // console.log('excessQty: ', excessQty)
          // console.log('excessShelfObj: ', excessShelfObj)
          // console.log('partialPutAwayRackShelf: ', partialPutAwayRackShelf)

          // let totalUnsalableQty = unsalableTableData
          //   .filter(({ productVariant }) => Number(productVariant) === Number(order.itemID))
          //   .((acc, curr) => acc + Number(curr.quantity), 0);
          let totalUnsalableQty = 0
          let totalUnsalableOldQty = 0

          unsalableTableData.forEach((obj) => {
            if (Number(obj.productVariant) === Number(order.itemID)) {
              totalUnsalableQty += obj.quantity
              totalUnsalableOldQty += obj.oldQuantity
            }
          })
          // console.log('totalUnsalableQty', totalUnsalableQty)
          // console.log('totalUnsalableOldQty', totalUnsalableOldQty)

          let obj = {}

          if (isPartialDataExists) {
            if (Object.prototype.hasOwnProperty.call(dataToConsider, order.itemID)) {
              const newTotalQty = dataToConsider[order.itemID].reduce(
                (acc, curr) => acc + Number(curr.quantity),
                0,
              )
              // console.log('newTotalQty: ', newTotalQty)

              const thisItemID = Number(order.itemID)

              obj = {
                productVariantID: thisItemID,
                // prettier-ignore
                quantity:
                  type === 'rtv'
                    ? newTotalQty - totalUnsalableQty + totalUnsalableOldQty
                    : isExcess
                        ? newTotalQty - excessQty
                        : newTotalQty,
                shelfMapping: dataToConsider[order.itemID].map((rackShelfObj) => {
                  const thisShelf = Number(rackShelfObj.shelfID)
                  const thisQty = Number(rackShelfObj.quantity)

                  const thisUnsalableRows = unsalableTableData.filter(
                    ({ productVariant, shelfID }) =>
                      Number(productVariant) === thisItemID && Number(shelfID) === thisShelf,
                  )

                  let thisUnsalableQty = 0
                  let thisUnsalableOldQty = 0
                  thisUnsalableRows.forEach((e) => {
                    thisUnsalableQty += e.quantity
                    thisUnsalableOldQty += e.oldQuantity
                  })

                  return {
                    // prettier-ignore
                    quantity:
                    type === 'rtv'
                          ? thisQty - thisUnsalableQty + thisUnsalableOldQty
                          : isExcess && Number(excessShelfObj.shelfID) === thisShelf
                              ? thisQty - excessQty
                              : thisQty,
                    shelfID: thisShelf,
                  }
                }),
              }
            }
          } else
            obj = {
              productVariantID: Number(order.itemID),
              quantity:
                type === 'rtv'
                  ? totalQty - totalUnsalableQty + totalUnsalableOldQty
                  : isExcess
                  ? totalQty - excessQty
                  : totalQty,
              shelfMapping: rackShelfData[order.itemID].map((rackShelfObj) => {
                const thisShelf = Number(rackShelfObj.shelfID)
                const thisQty = Number(rackShelfObj.quantity)

                const thisUnsalableRows = unsalableTableData.filter(
                  ({ productVariant, shelfID }) =>
                    Number(productVariant) === Number(order.itemID) &&
                    Number(shelfID) === thisShelf,
                )

                let thisUnsalableQty = 0
                let thisUnsalableOldQty = 0
                thisUnsalableRows.forEach((e) => {
                  thisUnsalableQty += e.quantity
                  thisUnsalableOldQty += e.oldQuantity
                })

                return {
                  quantity:
                    type === 'rtv'
                      ? thisQty - thisUnsalableQty + thisUnsalableOldQty
                      : isExcess && excessShelfObj.shelfID === thisShelf
                      ? thisQty - excessQty
                      : thisQty,
                  shelfID: thisShelf,
                }
              }),
            }

          // console.log('obj: ', obj)
          if (Object.keys(obj).length) finalPutAwayData.push(obj)

          if (type !== 'rtv') {
            const excessObj = {
              productVariantID: Number(order.itemID),
              quantity: Number(excessQty),
              shelfMapping: rackShelfData[order.itemID].map((rackShelfObj) => {
                return {
                  quantity:
                    isExcess && excessShelfObj.shelfID === rackShelfObj.shelfID
                      ? Number(excessQty)
                      : 0,
                  shelfID: Number(rackShelfObj.shelfID),
                }
              }),
            }
            excessQtyArray.push(excessObj)
          } else if (type === 'rtv') {
            isExcess = false
            excessQtyArray = []

            if (unsalableTableData.length) {
              unsalableTableData.forEach((unsalableObj) => {
                const objIndex = finalPutAwayData.findIndex(
                  ({ productVariantID }) =>
                    productVariantID === Number(unsalableObj.productVariant),
                )
                // console.log('-- objIndex: ', objIndex)

                if (objIndex > -1) {
                  const shelfIndex = finalPutAwayData[objIndex].shelfMapping.findIndex(
                    ({ shelfID }) => shelfID === Number(unsalableObj.shelfID),
                  )
                  // console.log('shelfIndex: ', shelfIndex)
                  if (shelfIndex < 0) {
                    finalPutAwayData[objIndex].shelfMapping.push({
                      quantity: 0,
                      shelfID: Number(unsalableObj.shelfID),
                    })
                  }
                } else {
                  finalPutAwayData.push({
                    productVariantID: Number(unsalableObj.productVariant),
                    quantity: 0,
                    shelfMapping: [
                      {
                        quantity: 0,
                        warehouseID: 0,
                        rackID: 0,
                        shelfID: Number(unsalableObj.shelfID),
                      },
                    ],
                  })
                }
              })
            }
          }
        } else if (
          order.quantity &&
          !Object.prototype.hasOwnProperty.call(rackShelfData, order.itemID)
        )
          isPartial = true
      })

      // console.log('isExcess: ', isExcess, ';   isPartial: ', isPartial)
      // console.log('final DATA: ', finalPutAwayData)
      // console.log('excessQtyArray: ', excessQtyArray)

      if (isExcess && type === 'stock-transfer') {
        notification.error({
          message: 'Stock Transfer Cannot Be In Excess:',
          description:
            'Some of the scanned items are in excess of the quantity supposed to be transferred.',
        })
        return
      }

      const mutationVariables = {
        upsertType: 'update',
        type,
        id,
        pack: isPack,
        is_excess: isExcess,
        is_partial: isPartial,
        is_non_scanner_edit: isNonScannerEdit || false,
        put_away_array: finalPutAwayData,
        excess_qty_array: excessQtyArray,
        unsalable_qty_array: unsalableTableData,
      }
      // console.log('FINAL MUTATION VARIABLES : ', mutationVariables)

      if (isExcess || isPartial)
        confirm({
          centered: true,
          title: isExcess ? 'Excess Items Scanned' : 'Partial Items Scanned',
          content: isExcess
            ? 'Some of the items scanned are in excess quantity than the original order. Do you wish to continue?'
            : 'Some of the items scanned are in less quantity than the original order. Do you wish to continue?',
          onOk: () => finalSubmission(mutationVariables, addPutAway),
          onCancel: () => {},
        })
      else if (!isExcess && !isPartial) finalSubmission(mutationVariables, addPutAway)
      else console.log('AVOIDED!')
    }
  }

  const finalSubmission = (variables, addPutAway) => {
    addPutAway({ variables })
      .then((res) => {
        if (res) {
          notification.success({
            message: 'Success',
            description: 'Put away successfully',
          })

          if (type === 'product-delivery') history.push('/inventory/put-aways')
          if (type === 'stock-transfer') history.push('/inventory/stock-transfers')
          if (type === 'rtv') history.push('/inventory/rtv')
          if (type === 'internal-adjustment') history.push('/inventory/internal-adjustments')
        }
      })
      .catch((err) => console.log('Error occured: ', err))
  }

  const RenderUnsalableTableShelf = (text, record) => {
    let shelfIDs = []
    const { productVariant, isNew, key } = record

    if (productVariant) shelfIDs = rackShelfData[productVariant].map(({ shelfID }) => shelfID)

    const { loading, error, data } = useQuery(SHELF_NAMES_BY_IDS, {
      variables: { shelf_ids: shelfIDs },
    })

    if (loading) return null
    if (error) return `Error ${error}`
    const shelves = data.shelfNamesByIDs
    // console.log("shelves: ", shelves);
    return (
      <Select
        disabled={!isNew}
        onChange={(e) => onChangeTableRow(e, key, 'shelfID')}
        id="shelfID"
        value={text}
        style={{ width: '100%' }}
        placeholder="Please select one"
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {shelves.length
          ? shelves.map(({ id, name }) => (
              <Option key={id} value={String(id)}>
                {name}
              </Option>
            ))
          : null}
      </Select>
    )
  }

  const RenderUnsalableTableReason = (text, record) => {
    const { loading, error, data } = useQuery(UNSALABLE_REASONS)
    if (loading) return null
    if (error) return `Error ${error}`

    const reasons = data.unsalableReasons
    const { key } = record

    return (
      <Select
        // disabled={!isEdit}
        onChange={(e) => onChangeTableRow(e, key, 'unsalableReasonID')}
        id="unsalableReasonID"
        value={text}
        style={{ width: '100%' }}
        placeholder="Please select one"
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {reasons.length
          ? reasons.map(({ id, reason }) => (
              <Option key={id} value={String(id)}>
                {reason}
              </Option>
            ))
          : null}
      </Select>
    )
  }

  const unsalableTableCol = [
    {
      title: 'Product',
      dataIndex: 'productVariant',
      key: 'productVariant',
      type: 'number',
      width: '20%',
      sort: true,
      filter: false,
      render: (text, record) => (
        <Select
          disabled={!record.isNew}
          onChange={(e) => onChangeTableRow(e, record.key, 'productVariant')}
          id="productVariant"
          value={text}
          style={{ width: '100%' }}
          placeholder="Please select one"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {unsalableDropOptions && Object.keys(unsalableDropOptions).length
            ? Object.values(unsalableDropOptions).map(({ id, name }) => (
                <Option key={id} value={String(id)}>
                  {name}
                </Option>
              ))
            : null}
        </Select>
      ),
    },
    {
      title: 'Shelf',
      dataIndex: 'shelfID',
      key: 'shelfID',
      type: 'number',
      width: '20%',
      sort: true,
      filter: false,
      render: (text, record) => RenderUnsalableTableShelf(text, record),
    },
    {
      title: 'Qty. Returned',
      dataIndex: 'quantity',
      key: 'quantity',
      type: 'number',
      sort: false,
      filter: false,
      width: '20%',
      render: (text, record) => (
        <InputNumber
          style={{ width: '100%' }}
          // disabled={!isEdit}
          min={1}
          value={text}
          onChange={(e) => onChangeTableRow(e, record.key, 'quantity')}
        />
      ),
    },
    {
      title: 'Unsalable Reason',
      dataIndex: 'unsalableReasonID',
      key: 'unsalableReasonID',
      type: 'number',
      width: '30%',
      sort: true,
      filter: false,
      render: (text, record) => RenderUnsalableTableReason(text, record),
    },
    {
      title: '',
      dataIndex: 'deleteRow',
      type: 'number',
      sort: false,
      filter: false,
      render: (text, record) => (
        <Popconfirm
          disabled={!record.isNew}
          title="Sure to delete? Any product already put in shelves will be deleted."
          onConfirm={() => deleteRow(record.key)}
        >
          <Button type="danger" disabled={!record.isNew}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const [addPutAway] = useMutation(ADD_PUT_AWAY)
  const [changePutAwayProcessing] = useMutation(CHANGE_PROCESSING_STATE)

  return (
    <div className="card">
      <div className="card-header">
        <div className="utils__title text-center">
          <h5 className="mb-2">
            <strong>Perform Put-Away</strong>
          </h5>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-lg-12">
            <div className="row biggerFont">
              <div className="col-lg-4">
                <div className="mb-2">
                  Order ID: &nbsp;
                  {putAwayData && putAwayData.id}
                </div>
              </div>
              <div className="col-lg-4">
                <div className="mb-2">
                  Total Quantity: &nbsp;
                  {putAwayData && putAwayData.totalQuantity}
                </div>
              </div>

              {/* {!isNonScannerEdit ? (
                <div className="col-lg-4">
                  <Switch
                    checked={scannerMode}
                    onChange={onChangeView}
                  />
                  &nbsp;Scanner Mode
                </div>
              ) : null} */}
            </div>

            <br />
            <br />
          </div>
        </div>

        {scannerMode && dataSources && Object.keys(dataSources).length ? (
          <div className="row">
            <div className="col-lg-10">
              <RackShelfComponent
                scannerMode
                scannerData={{
                  putAway: true,
                  putAwayData: {
                    orders: putAwayData ? putAwayData.orders : [],
                    dataSources,
                    racks: putAwayData.racks,
                  },
                }}
                getRackShelfData={getRackShelfData}
              />
            </div>
          </div>
        ) : (
          <div className="row bigFont">
            {putAwayData &&
              dataSources &&
              Object.keys(dataSources).length &&
              putAwayData.orders.map((order, i) => {
                let className = 'col-lg-4 '
                if (errorFoundIn === order.itemID) className += 'errorDiv'

                if (order.quantity)
                  return (
                    <div className={className} key={i}>
                      <RackShelfComponent
                        uniqueKey={i}
                        editableHeader={false}
                        productVariantID={Number(order.itemID)}
                        productVariant={order.itemCode}
                        itemQuantity={order.quantity}
                        tableData={dataSources[order.itemCode]}
                        suggestRacks
                        racks={putAwayData.racks}
                        getRackShelfData={getRackShelfData}
                      />
                    </div>
                  )
                return null
              })}
          </div>
        )}

        {type === 'rtv' ? (
          <div className="row">
            <div className="col-6">
              <div>
                <br />
                <br />
                <span className="font-weight-bold font-size-16">Unsalabe Products</span>
                <Button
                  // disabled={viewOnly}
                  className="pull-right"
                  size="small"
                  type="primary"
                  onClick={addRow}
                >
                  Add row
                </Button>
              </div>
              <Table
                columns={unsalableTableCol}
                dataSource={unsalableTableData}
                pagination={false}
                scroll={false}
              />
            </div>
          </div>
        ) : null}

        <div className="row">
          <div className="col-lg-12">
            <div className="form-actions">
              <Button htmlType="submit" type="primary" onClick={() => onSubmit(addPutAway)}>
                Put Away
              </Button>
              &nbsp;
              {/* Cancel Button will take back to the main-table page, and remove "In Progress" of Put-Away */}
              <Link
                to={
                  type === 'product-delivery'
                    ? '/inventory/put-aways'
                    : type === 'stock-transfer'
                    ? '/inventory/stock-transfers'
                    : type === 'internal-adjustment'
                    ? '/inventory/internal-adjustments'
                    : type === 'rtv'
                    ? '/inventory/rtv'
                    : '/'
                }
              >
                <Button
                  type="default"
                  onClick={() =>
                    changePutAwayProcessing({
                      variables: { id: putAwayData.id, in_progress: false },
                    })
                  }
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PutAwayFormPage
