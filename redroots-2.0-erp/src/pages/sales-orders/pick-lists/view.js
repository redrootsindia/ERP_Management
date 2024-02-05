import React, { useState, useEffect } from 'react'
import { withRouter, useParams, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Table, Spin, InputNumber, Image, notification, Button } from 'antd'
import { EyeOutlined, LoadingOutlined } from '@ant-design/icons'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import { UPSERT_PICK_LIST, PICK_LIST } from './queries'

const mapStateToProps = ({ user }) => ({ user })

const ViewPickList = ({ user: { permissions } }) => {
  const { id } = useParams()
  const history = useHistory()
  const [pickList, setPickList] = useState([])
  const [okText, setOkText] = useState('Save')
  const [variantQuantities, setVariantQuantities] = useState([])

  const [upsertPickList] = useMutation(UPSERT_PICK_LIST)

  const { loading: pickListLoad, error: pickListErr, data: pickListData } = useQuery(PICK_LIST, {
    variables: { id },
  })

  useEffect(() => {
    if (!pickListLoad && pickListData && pickListData.pickList) {
      setPickList(pickListData.pickList)
      setVariantQuantities(
        pickListData.pickList.pick_list_data.map((obj) => ({
          ...obj,
          pending_quantity: Number(obj.sales_order_quantity) - Number(obj.scheduled_quantity),
          stock_quantity:
            Number(obj.stock_quantity) -
            (Number(obj.scheduled_quantity) || 0) +
            (Number(obj.picked_quantity) || 0),
        })),
      )
    } else {
      setPickList([])
      setVariantQuantities([])
    }
  }, [pickListData, pickListLoad])

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
      dataIndex: 'sales_order_quantity',
      key: 'sales_order_quantity',
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
      render: (text, record) =>
        pickList.status === 'pending' ? (
          <InputNumber
            value={text}
            min={0}
            max={
              Number(record.stock_quantity < record.pending_quantity)
                ? Number(record.stock_quantity)
                : Number(record.pending_quantity)
            }
            onChange={(e) => {
              if (Number(e) > Number(record.quantity - record.scheduled_quantity)) {
                notification.error({
                  message: 'Invalid Quantity:',
                  description: "Cannot pick more than what you're supposed to!",
                })
              } else if (Number(e) > Number(record.stock_quantity)) {
                notification.error({
                  message: 'Invalid Quantity:',
                  description: 'Cannot pick more than the stock!',
                })
              } else {
                addQuantityToPick(e, record.id)
              }
            }}
          />
        ) : (
          record.quantity_to_pick
        ),
    },
  ]

  const onSubmit = () => {
    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    const tempPickListData = variantQuantities.map((obj) => ({
      quantity_to_pick: Number(obj.quantity_to_pick),
      product_variant_id: obj.product_variant_id,
      warehouse_id: Number(pickList.warehouse_id),
      id: pickList.id,
    }))

    upsertPickList({
      variables: {
        upsertType: 'update',
        id,
        sales_order_id: Number(pickList.sales_order_id),
        warehouse_id: Number(pickList.warehouse_id),
        pick_list_data: tempPickListData,
      },
    })
      .then(() => {
        setOkText('Save')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/sales-orders/pick-lists')
      })
      .catch((err) => {
        setOkText('Save')
        notification.error({
          message: 'Error occured while saving pick-list.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('updatePickList')) return <Error403 />
  if (pickListErr) return `Error occured while fetching data: ${pickListErr.message}`

  return (
    <div>
      <Helmet title="Pick Lists" />
      <Spin spinning={pickListLoad} tip="Loading..." size="large">
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="mb-4">
                  <strong>Edit Pick List</strong>
                </h5>

                <div className="row">
                  <div className="col-lg-3">
                    <div className="mb-2">
                      <strong>Expected Delivery By:</strong>
                    </div>
                    <div>
                      {pickList.expected_delivery_date
                        ? moment(Number(pickList.expected_delivery_date)).format('Do MMM YYYY')
                        : '-'}
                    </div>
                  </div>

                  <div className="col-lg-3">
                    <div className="mb-2">
                      <strong>S.O. Name / Buyer P.O. #:</strong>
                    </div>
                    <div> {pickList.sales_order_name}</div>
                  </div>

                  <div className="col-lg-3">
                    <div className="mb-2">
                      <strong>Buyer:</strong>
                    </div>
                    <div>{pickList.buyer_name}</div>
                  </div>

                  <div className="col-lg-3">
                    <div className="mb-2">
                      <strong>From Warehouse:</strong>
                    </div>

                    <div>{pickList.warehouse_name}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="card">
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
            </div>
          </div>

          <div className="row mt-3 mb-4 ml-2">
            {permissions.includes('updatePickList') && pickList.status === 'pending' ? (
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
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(ViewPickList))
