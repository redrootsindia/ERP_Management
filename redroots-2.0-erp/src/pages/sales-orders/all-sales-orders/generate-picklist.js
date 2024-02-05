import React, { useState, useEffect } from 'react'
import { withRouter, useParams, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Table, Spin, Select, InputNumber, Image, notification, Button } from 'antd'
import { EyeOutlined, LoadingOutlined } from '@ant-design/icons'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import { SALES_ORDER, WAREHOUSES, SO_DATA_FOR_PICK_LISTS, UPSERT_PICK_LIST } from './queries'

const { Option } = Select
const mapStateToProps = ({ user }) => ({ user })

const GeneratePickList = ({ user: { permissions } }) => {
  const { id } = useParams()
  const history = useHistory()
  const [salesOrder, setSalesOrder] = useState([])
  const [wareHousesList, setWareHousesList] = useState([])
  const [warehouseID, setWarehouseID] = useState(undefined)
  const [variantQuantities, setVariantQuantities] = useState([])
  const [okText, setOkText] = useState('Create')

  const [upsertPickList] = useMutation(UPSERT_PICK_LIST)

  const {
    loading: salesOrderLoad,
    error: salesOrderErr,
    data: salesOrderData,
  } = useQuery(SALES_ORDER, { variables: { id, includeSalesOrderData: false } })

  useEffect(() => {
    if (!salesOrderLoad && salesOrderData && salesOrderData.salesOrder)
      setSalesOrder(salesOrderData.salesOrder)
    else setSalesOrder([])
  }, [salesOrderData, salesOrderLoad])

  const {
    loading: warehousesLoad,
    error: warehousesErr,
    data: warehousesData,
  } = useQuery(WAREHOUSES)

  useEffect(() => {
    if (!warehousesLoad && warehousesData && warehousesData.warehouses)
      setWareHousesList(warehousesData.warehouses)
    else setWareHousesList([])
  }, [warehousesData, warehousesLoad])

  const {
    loading: variantQuantitiesLoad,
    error: variantQuantitiesErr,
    data: variantQuantitiesData,
  } = useQuery(SO_DATA_FOR_PICK_LISTS, { variables: { id, warehouse_id: warehouseID } })

  useEffect(() => {
    if (
      !variantQuantitiesLoad &&
      variantQuantitiesData &&
      variantQuantitiesData.salesOrderDataToCreatePickList
    ) {
      setVariantQuantities(
        variantQuantitiesData.salesOrderDataToCreatePickList.map((obj) => ({
          ...obj,
          pending_quantity: obj.quantity - obj.scheduled_quantity,
          quantity_to_pick: obj.quantity_to_pick || 0,
          stock_quantity:
            Number(obj.stock_quantity) -
            (Number(obj.scheduled_quantity) || 0) +
            (Number(obj.picked_quantity) || 0),
        })),
      )
    } else {
      setVariantQuantities([])
    }
  }, [variantQuantitiesData, variantQuantitiesLoad])

  const addQuantityToPick = (quantity, recordID) => {
    const tempQuantityToPick = JSON.parse(JSON.stringify(variantQuantities))
    const foundIndex = tempQuantityToPick.findIndex((e) => Number(e.id) === Number(recordID))
    if (foundIndex > -1) tempQuantityToPick[foundIndex].quantity_to_pick = Number(quantity)
    setVariantQuantities(tempQuantityToPick)
  }

  const tableColumns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <div>
          <Image
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + image}
            height={image ? 35 : 20}
            width={image ? 35 : 20}
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'variant_code',
      key: 'variant_code',
    },
    {
      title: 'S.O. Qty.',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Picked Qty. / Scheduled to be picked',
      dataIndex: 'scheduled_quantity',
      key: 'scheduled_quantity',
    },
    {
      title: 'Pending Qty.',
      dataIndex: 'pending_quantity',
      key: 'pending_quantity',
    },
    {
      title: 'Qty in Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
    },
    {
      title: 'Qty to Pick',
      dataIndex: 'quantity_to_pick',
      key: 'quantity_to_pick',
      render: (text, record) => (
        <>
          <InputNumber
            value={text}
            min={0}
            max={
              Number(record.stock_quantity < record.pending_quantity)
                ? Number(record.stock_quantity)
                : Number(record.pending_quantity)
            }
            onChange={(e) => {
              if (Number(e) > Number(record.quantity - record.scheduled_quantity))
                notification.error({
                  message: 'Invalid Quantity:',
                  description: "Cannot pick more than what you're supposed to!",
                })
              else if (Number(e) > Number(record.stock_quantity))
                notification.error({
                  message: 'Invalid Quantity:',
                  description: 'Cannot pick more than the stock!',
                })
              else addQuantityToPick(e, record.id)
            }}
          />
        </>
      ),
    },
  ]

  const onSubmit = () => {
    // Check if no item is chosen for Pick-List, i.e., if all the quantities are 0
    const count = variantQuantities.reduce((accumulator, currentValue) => {
      return accumulator + Number(currentValue.quantity_to_pick)
    }, 0)
    if (count <= 0) {
      notification.error({
        message: 'Nothing Chosen to Pick:',
        description: 'Cannot create an empty pick-list',
      })
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )
    const tempPickListData = variantQuantities
      .map((obj) => ({
        pack_list_id: obj.id,
        quantity_to_pick: Number(obj.quantity_to_pick),
        product_variant_id: obj.product_variant_id,
        warehouse_id: warehouseID,
      }))
      .filter((obj) => !!obj.quantity_to_pick)

    upsertPickList({
      variables: {
        upsertType: 'create',
        pack_id: id,
        sales_order_id: id,
        warehouse_id: warehouseID,
        pick_list_data: tempPickListData,
      },
    })
      .then(() => {
        setOkText('Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/sales-orders/pick-lists')
      })
      .catch((err) => {
        setOkText('Create')
        notification.error({
          message: 'Error occured while saving pick-list.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readPickList')) return <Error403 />
  if (salesOrderErr) return `Error occured while fetching data: ${salesOrderErr.message}`
  if (warehousesErr) return `Error occured while fetching data: ${warehousesErr.message}`
  if (variantQuantitiesErr)
    return `Error occured while fetching data: ${variantQuantitiesErr.message}`
  return (
    <div>
      <Helmet title="Sales Order Detail" />
      <Spin
        spinning={salesOrderLoad || warehousesLoad || variantQuantitiesLoad}
        tip="Loading..."
        size="large"
      >
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="mb-4">
                  <strong>Add Pick List</strong>
                </h5>

                <div className="row">
                  <div className="col-lg-3">
                    <div className="mb-2">
                      <strong>Expected Delivery By:</strong>
                    </div>
                    <div>
                      {salesOrder.expected_delivery_date
                        ? moment(Number(salesOrder.expected_delivery_date)).format('Do MMM YYYY')
                        : '-'}
                    </div>
                  </div>

                  <div className="col-lg-3">
                    <div className="mb-2">
                      <strong>S.O. Name / Buyer P.O. #:</strong>
                    </div>
                    <div> {salesOrder.name}</div>
                  </div>

                  <div className="col-lg-3">
                    <div className="mb-2">
                      <strong>Buyer:</strong>
                    </div>
                    <div>{salesOrder.buyer_name}</div>
                  </div>

                  <div className="col-lg-3">
                    <div className="mb-2">
                      <strong>From Warehouse:</strong>
                    </div>
                    <Select
                      value={warehouseID}
                      style={{ width: '100%' }}
                      onChange={(value) => setWarehouseID(value)}
                      placeholder="Select Warehouse"
                    >
                      {wareHousesList && wareHousesList.length
                        ? wareHousesList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              {warehouseID ? (
                <>
                  <div className="card-body">
                    <div className="kit__utils__table">
                      <Table
                        columns={tableColumns}
                        dataSource={variantQuantities}
                        pagination={{
                          defaultPageSize: 20,
                          showSizeChanger: true,
                          pageSizeOptions: ['20', '40', '60'],
                        }}
                        rowKey={(record) => String(record.id)}
                        locale={{
                          emptyText: (
                            <div className="custom-empty-text-parent">
                              <div className="custom-empty-text-child">
                                <i className="fe fe-search" />
                                <h5>No Data Found</h5>
                              </div>
                            </div>
                          ),
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="row mt-3 mb-4 ml-2">
              {permissions.includes('createPickList') ? (
                <Button type="primary" onClick={onSubmit}>
                  {okText}
                </Button>
              ) : null}
              &emsp;
              <Button danger onClick={() => history.goBack()}>
                Back
              </Button>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(GeneratePickList))
