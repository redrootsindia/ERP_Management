import React, { useState, useEffect } from 'react'
import { withRouter, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Spin } from 'antd'
import Form from './putAwayForm'
import { PUT_AWAY, PARTIAL_PUT_AWAY } from '../queries'

const mapStateToProps = ({ user }) => ({ user })

const PutAwayForm = () => {
  // const history = useHistory()
  const { action, id } = useParams()

  const [isNonScannerEdit, setIsNonScannerEdit] = useState(false)
  if (action === 'non-scanner-edit') setIsNonScannerEdit(true)

  // const [editMode, setEditMode] = useState(
  //   action === 'create' || (action === 'update' && permissions.includes('updatePutAway')),
  // )
  // const [disabled, setDisabled] = useState(!editMode)
  // const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [putAwayData, setPutAwayData] = useState({})

  const {
    loading: putAwayLoad,
    error: putAwayErr,
    data: putAwayQueryData,
  } = useQuery(PUT_AWAY, { variables: { id } })

  const {
    loading: partialLoad,
    error: partialErr,
    data: partialData,
  } = useQuery(PARTIAL_PUT_AWAY, { variables: { id } })

  useEffect(() => {
    if (putAwayQueryData && putAwayQueryData.putAway) {
      // prettier-ignore
      const { pack, date, warehouse_data, items_list } = putAwayQueryData.putAway

      let totalQuantity = 0
      const orders = []
      if (items_list && items_list.length) {
        items_list.forEach((item) => {
          totalQuantity += item.quantity
          const foundIndex = orders.findIndex(
            (obj) => Number(obj.itemID) === Number(item.productVariantData.id),
          )
          if (foundIndex > -1) orders[foundIndex].quantity += item.quantity
          else
            orders.push({
              id: item.id,
              itemID: item.productVariantData.id,
              itemCode: item.productVariantData.code,
              quantity: item.quantity,
              itemEANCode: item.productVariantData.ean,
            })
        })
      }
      setPutAwayData({
        id,
        pack,
        date,
        warehouseID: warehouse_data.id,
        warehouseName: warehouse_data.name,
        location: warehouse_data.location,
        racks: warehouse_data.racks,
        orders,
        totalQuantity,
      })
    }
  }, [putAwayQueryData])

  if (putAwayErr) return `Error occured while fetching data: ${putAwayErr.message}`
  if (partialErr) return `Error occured while fetching data: ${partialErr.message}`

  return (
    <div>
      <Helmet title="Put-Aways" />

      <Spin spinning={putAwayLoad || partialLoad} tip="Loading..." size="large">
        {/* <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>Perform Put-Away</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updatePutAway') ? (
            <div className="col-1 pull-right">
              <Switch
                checked={editMode}
                onChange={(checked) => {
                  setEditMode(checked)
                  setDisabled(!checked)
                }}
              />
              &ensp;Edit
            </div>
          ) : null}
        </div> */}

        <div className="card">
          <div className="card-body">
            {putAwayData && Object.keys(putAwayData).length && partialData ? (
              <Form
                putAwayData={putAwayData}
                partialPutAwayData={partialData.partialPutAwayByID}
                type="product-delivery"
                isNonScannerEdit={isNonScannerEdit}
              />
            ) : null}
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(PutAwayForm))
