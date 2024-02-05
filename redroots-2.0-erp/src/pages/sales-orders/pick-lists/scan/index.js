/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { withRouter, Link, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Spin } from 'antd'
import Error403 from 'components/Errors/403'
import { PICK_LIST, PARTIAL_PICKED_DATA } from '../queries'
import ScanForm from './form'

const mapStateToProps = ({ user }) => ({ user })

const ScanFormPage = ({ user: { permissions } }) => {
  const { id } = useParams()
  const [pickList, setPickList] = useState({ warehouse_data: {} })
  const [pickUpItems, setPickUpItems] = useState([])
  const [partialPickedData, setPartialPickedData] = useState([])
  const [totalQuantity, setTotalQuantity] = useState(0)

  const {
    loading: pickListLoad,
    error: pickListErr,
    data: pickListData,
  } = useQuery(PICK_LIST, { variables: { id, scanMode: true } })

  const {
    loading: partialPickedLoad,
    error: partialPickedErr,
    data: partialPickedQueryData,
  } = useQuery(PARTIAL_PICKED_DATA, { variables: { pick_list_id: id } })

  useEffect(() => {
    if (!pickListLoad && pickListData && pickListData.pickList) {
      setPickList(pickListData.pickList)

      let tempTotalQuantity = 0
      let tempPartialPickedData = {}

      const tempPickUpItems = pickListData.pickList.pick_list_data.map((item) => {
        tempTotalQuantity += item.quantity_to_pick

        // For partial calculations, initialise every item with '0' scanned initially,
        // then later, if 'partialData' exists, put right corresponding values
        tempPartialPickedData = {
          ...tempPartialPickedData,
          [item.product_variant_id]: {
            id: item.id,
            itemID: item.product_variant_id,
            itemCode: item.variant_code,
            pickedQty: 0,
          },
        }

        return {
          id: item.id,
          itemID: item.product_variant_id,
          itemCode: item.variant_code,
          quantity: item.quantity_to_pick,
        }
      })

      if (
        partialPickedQueryData &&
        partialPickedQueryData.partialPickedItems &&
        partialPickedQueryData.partialPickedItems.length
      )
        partialPickedQueryData.partialPickedItems.forEach((obj) => {
          let quantity =
            obj.picked_item_shelf_mapping_data && obj.picked_item_shelf_mapping_data.length
              ? obj.picked_item_shelf_mapping_data.reduce(
                  (acc, currentValue) => acc + Number(currentValue.quantity),
                  0,
                )
              : 0
          tempPartialPickedData[obj.product_variant_id].pickedQty += quantity
        })

      setPickUpItems(tempPickUpItems)
      setTotalQuantity(tempTotalQuantity)
      setPartialPickedData(tempPartialPickedData)
    } else {
      setPickList({ warehouse_data: {} })
      setPickUpItems([])
      setTotalQuantity(0)
      setPartialPickedData(0)
    }
  }, [pickListData, pickListLoad, partialPickedLoad, partialPickedQueryData])

  if (!permissions.includes('updatePickList')) return <Error403 />
  if (pickListErr) return `Error occured while fetching data: ${pickListErr.message}`
  if (partialPickedErr) return `Error occured while fetching data: ${partialPickedErr.message}`

  return (
    <div>
      <Helmet title="Pick Items" />
      <Spin spinning={pickListLoad} tip="Loading..." size="large">
        <ScanForm
          pickListID={id}
          pickUpData={{
            id: pickList.id,
            warehouseID: pickList.warehouse_data.id,
            warehouseName: pickList.warehouse_data.name,
            location: pickList.warehouse_data.location,
            racks: pickList.warehouse_data.racks,
            pickUpItems,
            totalQuantity,
          }}
          partialPickedData={partialPickedData}
        />
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(ScanFormPage))
