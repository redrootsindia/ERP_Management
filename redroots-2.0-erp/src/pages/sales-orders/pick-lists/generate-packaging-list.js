import React, { useState, useEffect } from 'react'
import { Table, Button, Spin, Row, Col, Modal, notification } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { connect } from 'react-redux'
import { withRouter, useParams, useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import Error403 from 'components/Errors/403'
import PackagingComponent from '../../../components/PackagingComponent'
import validation from './packagingValidation'
import { UPSERT_PACKAGING_LIST, PARTIAL_PACKAGED_DATA, PICK_LIST } from './queries'

const { confirm } = Modal

const mapStateToProps = ({ user }) => ({ user })

const GeneratePackagingList = ({ user: { permissions } }) => {
  const { id } = useParams()
  const history = useHistory()

  const [pickList, setPickList] = useState({})
  const [pickListTable, setPickListTable] = useState([])
  const [count, setCount] = useState(1)

  const [boxDivs, setBoxDivs] = useState([{ key: 0, boxPartialData: null }])
  const [boxData, setBoxData] = useState({})
  const [deletedBoxIDs, setDeletedBoxIDs] = useState([])
  const [deletedRowIDs, setDeletedRowIDs] = useState([])

  const [errors, setErrors] = useState({ divError: null })
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertPackagingList] = useMutation(UPSERT_PACKAGING_LIST)

  const scheduledCols = [
    {
      title: 'Item',
      key: 'variant_code',
      dataIndex: 'variant_code',
    },
    {
      title: 'Qty. to Pack',
      key: 'quantity_to_pick',
      dataIndex: 'quantity_to_pick',
    },
  ]

  const {
    loading: pickListLoad,
    error: pickListErr,
    data: pickListData,
  } = useQuery(PICK_LIST, { variables: { id } })

  const {
    loading: partialLoad,
    error: partialErr,
    data: partialData,
  } = useQuery(PARTIAL_PACKAGED_DATA, { variables: { pick_list_id: id } })

  useEffect(() => {
    if (!pickListLoad && pickListData && pickListData.pickList) {
      setPickList(pickListData.pickList)
      setPickListTable(pickListData.pickList.pick_list_data)
    } else {
      setPickList([])
      setPickListTable([])
    }
  }, [pickListData, pickListLoad])

  useEffect(() => {
    if (!partialLoad && partialData.partialPackagedData && partialData.partialPackagedData.length) {
      const tempBoxDivs = []
      const tempBoxData = {}
      partialData.partialPackagedData.forEach((e, index) => {
        tempBoxDivs.push({ id: e.id, key: index + 1, boxPartialData: e })
        tempBoxData[index + 1] = {
          id: e.id,
          boxCode: e.box_code,
          tableData: e.detail.map((obj, i) => ({
            id: obj.id,
            productVariantID: String(obj.product_variant_id),
            quantity: obj.quantity,
            key: i + 1,
          })),
        }
      })
      setBoxDivs(tempBoxDivs)
      setBoxData(tempBoxData)
      setCount(tempBoxDivs.length)
    }
  }, [partialData, partialLoad])

  const addBox = () => {
    setBoxDivs([...boxDivs, { key: count + 1, isNew: true }])
    setCount(count + 1)
  }

  const deleteBox = (boxDivID) => {
    const tempDeletedBoxIDs = JSON.parse(JSON.stringify(deletedBoxIDs))
    const tempBoxDivs = []

    boxDivs.forEach((box) => {
      if (box.key !== boxDivID) tempBoxDivs.push(box)
      else if (!box.isNew) tempDeletedBoxIDs.push(box.id)
    })

    setBoxDivs(tempBoxDivs)
    setDeletedBoxIDs(tempDeletedBoxIDs)

    const tempBoxData = JSON.parse(JSON.stringify(boxData))
    delete tempBoxData[boxDivID]
    setBoxData(tempBoxData)
  }

  const getBoxData = (boxCode, tableData, uniqueKey, deletedChildIDs) => {
    setBoxData({
      ...boxData,
      [uniqueKey]: { ...boxData[uniqueKey], boxCode, tableData },
    })

    if (deletedChildIDs && deletedChildIDs.length)
      setDeletedRowIDs([...deletedRowIDs, ...deletedChildIDs])
  }

  const onSubmit = () => {
    const isFormInvalid = validation(boxDivs, boxData)
    let tempErrors = {}

    if (isFormInvalid) {
      const { divError, divErrorFoundIn, divErrorMessage } = isFormInvalid
      tempErrors = {
        ...tempErrors,
        divError: divError ? { [divErrorFoundIn]: divErrorMessage } : null,
      }
      setErrors(tempErrors)
      return
    }

    let isPartial = false
    let isExcess = false

    pickListTable.forEach(({ product_variant_id, quantity_to_pick }) => {
      const productCount = Object.values(boxData).reduce((sum, { tableData }) => {
        return (
          sum +
          tableData.reduce((accumulator, currentObj) => {
            if (Number(currentObj.productVariantID) === Number(product_variant_id))
              return accumulator + currentObj.quantity
            return accumulator
          }, 0)
        )
      }, 0)

      if (Number(quantity_to_pick) > Number(productCount)) isPartial = true
      if (Number(productCount) > Number(quantity_to_pick)) isExcess = true
    })

    if (isExcess) {
      notification.error({
        message: 'Error:',
        description:
          'Some of the quantities are more than what is supposed to be packaged. Please make sure to pack the right quantity.',
      })
      return
    }

    const mutationVariables = {
      pick_list_id: Number(id),
      isPartial,
      packaging_list_data: Object.values(boxData).map(({ id: boxID, boxCode, tableData }) => ({
        id: boxID ? Number(boxID) : null,
        box_code: boxCode,
        box_data: tableData.map(({ id: rowID, productVariantID, quantity }) => ({
          id: rowID ? Number(rowID) : null,
          product_variant_id: Number(productVariantID),
          quantity: Number(quantity),
        })),
      })),
      deleted_box_ids: deletedBoxIDs,
      deleted_box_data_ids: deletedRowIDs,
    }

    if (isPartial)
      confirm({
        centered: true,
        title: 'Partial Items Packed',
        content:
          'Some of the items packed are in less quantity than what was picked. Do you wish to continue?',
        onOk: () => finalSubmission(mutationVariables),
        onCancel: () => {},
      })
    else finalSubmission(mutationVariables)
  }

  const finalSubmission = (variables) => {
    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertPackagingList({ variables })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/sales-orders/pick-lists')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving packaging-list.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readPackagingList')) return <Error403 />
  if (pickListErr) return `Error occured while fetching data: ${pickListErr.message}`
  if (partialErr) return `Error occured while fetching data: ${partialErr.message}`

  return (
    <div>
      <Helmet title="Packaging" />

      <div className="row mb-4 mr-2 ml-2">
        <div className="col-11">
          <h5 className="mb-2">
            <strong>Package Items</strong>
          </h5>
        </div>
      </div>

      <Spin spinning={pickListLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-body">
            <Row>
              <Col span={4}>
                <strong>Pick List ID:</strong>
              </Col>
              <Col span={4}>{id}</Col>
            </Row>
            <Row>
              <Col span={4}>
                <strong>Sales Order (Buyer PO):</strong>
              </Col>
              <Col span={4}>{pickList.sales_order_name}</Col>
            </Row>
            <Row>
              <Col span={4}>
                <strong>Buyer:</strong>
              </Col>
              <Col span={4}>{pickList.buyer_name}</Col>
            </Row>
            <Row>
              <Col span={4}>
                <strong>Packaging From:</strong>
              </Col>
              <Col span={4}>{pickList.warehouse_name}</Col>
            </Row>

            <div className="mt-5 mb-3" style={{ fontSize: 'medium' }}>
              <strong>Scheduled items to pack:</strong>
            </div>

            <Row>
              <Col span={10}>
                <Table
                  columns={scheduledCols}
                  dataSource={pickListTable}
                  pagination={false}
                  rowKey={(record) => String(record.id)}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                  locale={{
                    emptyText: (
                      <div className="custom-empty-text-parent">
                        <div className="custom-empty-text-child">
                          <i className="fe fe-search" />
                          <h5>No Packaging Data Found</h5>
                        </div>
                      </div>
                    ),
                  }}
                />
              </Col>
            </Row>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-lg-3">
                <Button type="primary" onClick={addBox}>
                  Add Box
                </Button>
              </div>
            </div>
            ​
            <Row>
              {boxDivs.map((div) => {
                let className = 'mb-5 mr-5'
                // prettier-ignore
                if (errors.divError && Object.prototype.hasOwnProperty.call(errors.divError, div.key))
                  className += ' errorDiv custom-pad-t1 custom-pad-l1 custom-pad-r1'

                return (
                  <Col span={10} key={div.key} className={className}>
                    <PackagingComponent
                      uniqueKey={div.key}
                      boxDbID={
                        div.boxPartialData && div.boxPartialData.id ? div.boxPartialData.id : null
                      }
                      productsToPack={pickListTable.map((obj) => ({
                        productVariantID: obj.product_variant_id,
                        productVariantCode: obj.variant_code,
                        qtyToPack: obj.quantity_to_pick,
                      }))}
                      boxPartialData={Object.keys(boxData).length ? boxData[div.key] : null}
                      getBoxData={getBoxData}
                      deleteBox={deleteBox}
                    />
                  </Col>
                )
              })}
            </Row>
            ​
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {permissions.includes('createPackagingList') ||
          permissions.includes('updatePackagingList') ? (
            <Button type="primary" onClick={onSubmit}>
              {okText}
            </Button>
          ) : null}
          &emsp;
          <Button danger onClick={() => history.goBack()}>
            Back
          </Button>
        </div>
      </Spin>
    </div>
  )
}
export default withRouter(connect(mapStateToProps)(GeneratePackagingList))
