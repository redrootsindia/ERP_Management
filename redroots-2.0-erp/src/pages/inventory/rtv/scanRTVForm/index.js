import React, { useState, useEffect } from 'react'
import { withRouter, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery } from '@apollo/client'
import { Spin } from 'antd'
import Form from '../../put-aways/form/putAwayForm'
import { PARTIAL_PUT_AWAY } from '../../put-aways/queries'
import { RTV } from '../queries'

const mapStateToProps = ({ user }) => ({ user })

const ScanRTVForm = () => {
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

  const { loading: rtvLoad, error: rtvErr, data: rtvData } = useQuery(RTV, { variables: { id } })

  const {
    loading: partialLoad,
    error: partialErr,
    data: partialData,
  } = useQuery(PARTIAL_PUT_AWAY, { variables: { id } })

  useEffect(() => {
    if (!rtvLoad && rtvData && rtvData.rtv) {
      // prettier-ignore
      const { pack, date, warehouse_data, items_list } = rtvData.rtv
      let totalQuantity = 0
      const orders = items_list.map((item) => {
        totalQuantity += item.quantity
        return {
          id: item.id,
          itemID: item.productVariantData.id,
          itemCode: item.productVariantData.code,
          quantity: item.quantity,
          itemEANCode: item.productVariantData.ean,
        }
      })
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
  }, [rtvData, rtvLoad])

  if (rtvErr) return `Error occured while fetching data: ${rtvErr.message}`
  if (partialErr) return `Error occured while fetching data: ${partialErr.message}`

  return (
    <div>
      <Helmet title="Put-Aways" />

      <Spin spinning={rtvLoad || partialLoad} tip="Loading..." size="large">
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

export default withRouter(connect(mapStateToProps)(ScanRTVForm))

// import React from 'react'
// import Page from 'components/LayoutComponents/Page'
// import Helmet from 'react-helmet'

// import { Query } from 'react-apollo'
// import { getRTVById } from '../../../../Query/WarehouseManagement/rtv'
// import { getPartialPutAwayDataQuery } from '../../../../Query/WarehouseManagement/putAwayQueries'

// import Form from '../../PutAway/PutAwayForm/putAwayForm'

// class RTVInwardForm extends React.Component {
//   render() {
//     const { path, params } = this.props.match
//     const { id } = params
//     let isNonScannerEdit = false
//     if (path.includes('non-scanner-edit')) isNonScannerEdit = true

//     return (
//       <Page {...this.props}>
//         <Helmet title="RTV Scan" />
//         <Query query={getRTVById} variables={{ id: Number(id) }}>
//           {({ loading: rtvLoad, error: rtvErr, data: rtvData }) => (
//             <Query query={getPartialPutAwayDataQuery} variables={{ id: Number(id), type: 4 }}>
//               {({ loading: pLoad, error: pErr, data: partialData }) => {
//                 if (rtvLoad || pLoad) return 'Loading....'
//                 if (rtvErr) return `${rtvErr.message}`
//                 if (pErr) return `${pErr.message}`

//                 // console.log("rtvData: ", rtvData);
//                 // console.log("partialData: ", partialData);

//                 const { getRTVById } = rtvData

//                 let totalQuantity = 0
//                 const orders = getRTVById.rtvData.map((item) => {
//                   totalQuantity += item.quantity
//                   return {
//                     id: item.id,
//                     itemId: item.bomCodeData.id,
//                     itemCode: item.bomCodeData.name,
//                     quantity: item.quantity,
//                     itemBarcode: item.bomCodeData.bomBarCode,
//                   }
//                 })

//                 let putAwayData = {
//                   id: getRTVById.id,
//                   poId: 0,
//                   date: getRTVById.createdAt,
//                   warehouseId: getRTVById.inventoryId,
//                   warehouseName: getRTVById.inventoryData.unitNumber,
//                   location: getRTVById.inventoryData.location,
//                   racks: getRTVById.inventoryData.racks,
//                   orders,
//                   totalQuantity,
//                 }

//                 // console.log("putAwayData: ", putAwayData);

//                 return (
//                   <Form
//                     putAwayData={putAwayData}
//                     partialPutAwayData={partialData.getPartialPutAwayData}
//                     isNonScannerEdit={isNonScannerEdit}
//                     type={4}
//                     {...this.props}
//                   />
//                 )
//               }}
//             </Query>
//           )}
//         </Query>
//       </Page>
//     )
//   }
// }
// export default RTVInwardForm
