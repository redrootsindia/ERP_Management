import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Spin,
  Row,
  Col,
  Modal,
  notification,
  Input,
  Select,
  DatePicker,
  Image,
  Switch,
} from 'antd'
import { LoadingOutlined, EyeOutlined } from '@ant-design/icons'
import { connect } from 'react-redux'
import { withRouter, useParams, useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import Error403 from 'components/Errors/403'
import moment from 'moment'
import _ from 'lodash'
import PackagingComponent from '../../../components/PackagingComponent'
import validation from './packagingValidation'
import {
  PRODUCT_DELIVERY_APPOINTMENT,
  PRODUCT_QC_APPOINTMENT,
  WAREHOUSES,
  PURCHASE_ORDER_IDS,
  UPSERT_PRODUCT_DELIVERY_APPOINTMENT,
  PRODUCT_PO_GRN_DISPATCH,
} from './queries'
import { PURCHASE_ORDER } from '../../qc/appointments/queries'
import { PRODUCT_VENDOR_NAMES_LIST } from '../../purchase-orders/product/queries'
import PDFDownload from './pdfDownload'

const { confirm } = Modal

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const AppointmentForm = ({ user: { permissions, type } }) => {
  const { qcID, id, action } = useParams()
  const history = useHistory()

  const [qcAppointmentID, setQcAppointmentID] = useState(qcID)
  const [deliveryAppointmentID, setDeliveryAppointmentID] = useState(id)

  const [isPack, setIsPack] = useState(false)
  const [vendorID, setVendorID] = useState(undefined)
  const [vendorSearchString, setVendorSearchString] = useState(null)

  const [deliveryAppointmentStatus, setDeliveryAppointmentStatus] = useState(undefined)

  const [editMode, setEditMode] = useState(
    !id ||
      (id &&
        permissions.includes('updateDeliveryAppointment') &&
        !(type === 'vendor' && deliveryAppointmentStatus !== 'Scheduled')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  // const disabled = type === 'vendor' && deliveryAppointmentStatus !== 'Scheduled'

  const [warehouseID, setWarehouseID] = useState(undefined)
  const [warehouseIDError, setWarehouseIDError] = useState(undefined)

  const [invoiceNumber, setInvoiceNumber] = useState(undefined)
  const [invoiceNumberError, setInvoiceNumberError] = useState(undefined)

  const [deliveryAppointmentDate, setDeliveryAppointmentDate] = useState(undefined)
  const [deliveryAppointmentDateError, setDeliveryAppointmentDateError] = useState(undefined)

  const [deliveredAt, setDeliveredAt] = useState(undefined)
  const [deliveredAtError, setDeliveredAtError] = useState(undefined)

  const [warehousesList, setWarehousesList] = useState([])

  const [productQCAppointmentTable, setProductQCAppointmentTable] = useState([])
  console.log('productQCAppointmentTable', productQCAppointmentTable)
  const [count, setCount] = useState(1)

  const [boxDivs, setBoxDivs] = useState([{ key: 0, boxPartialData: null }])
  const [boxData, setBoxData] = useState({})
  const [deletedBoxIDs, setDeletedBoxIDs] = useState([])
  const [deletedRowIDs, setDeletedRowIDs] = useState([])

  const [errors, setErrors] = useState({ divError: null })
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [vendorNameLists, setVendorNameLists] = useState([])

  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [purchaseOrderID, setPurchaseOrderID] = useState(undefined)

  const scheduledCols = [
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
            alt="variant-image"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Item Code',
      dataIndex: isPack ? 'pack_code' : 'variant_code',
      key: 'item_code',
    },
    {
      title: 'Quantity to dispatch',
      key: 'appointment_quantity',
      dataIndex: 'appointment_quantity',
      render: (text, record) => text || record.quantity,
    },
    {
      title: 'Remaining Quantity',
      key: 'dispatched_quantity',
      dataIndex: 'dispatched_quantity',
      render: (text, record) => (text ? record.quantity - text : record.quantity),
    },
  ]

  const [upsertProductDeliveryAppointment] = useMutation(UPSERT_PRODUCT_DELIVERY_APPOINTMENT)
  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(PRODUCT_VENDOR_NAMES_LIST, {
    variables: { vendorIDs: vendorID ? [vendorID] : [], searchString: vendorSearchString },
  })

  const {
    loading: poIDsLoad,
    error: poIDsErr,
    data: poIDsData,
  } = useQuery(PURCHASE_ORDER_IDS, { variables: { vendor_id: vendorID } })

  const {
    loading: poGRNLoad,
    error: poGRNErr,
    data: poGRNData,
  } = useQuery(PRODUCT_PO_GRN_DISPATCH, { variables: { purchase_order_id: purchaseOrderID } })

  const {
    loading: warehousesLoad,
    error: warehousesErr,
    data: warehousesData,
  } = useQuery(WAREHOUSES)

  const {
    loading: productQCAppointmentLoad,
    error: productQCAppointmentErr,
    data: productQCAppointmentData,
  } = useQuery(PRODUCT_QC_APPOINTMENT, { variables: { id: qcAppointmentID } })

  const {
    loading: deliveryAppointmentLoad,
    error: deliveryAppointmentErr,
    data: deliveryAppointmentData,
  } = useQuery(PRODUCT_DELIVERY_APPOINTMENT, { variables: { id, qcID: qcAppointmentID } })

  const {
    loading: poLoad,
    error: poErr,
    data: poData,
  } = useQuery(PURCHASE_ORDER, { variables: { purchase_order_id: purchaseOrderID } })

  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorNameLists(vendorData.vendorNames)
  }, [vendorData, vendorLoad])

  useEffect(() => {
    if (poIDsData && poIDsData.purchaseOrderIDsForProductDelivery)
      setPurchaseOrders(poIDsData.purchaseOrderIDsForProductDelivery)
  }, [poIDsData, poIDsLoad])

  useEffect(() => {
    if (!qcID && !poLoad && poData && poData.productPurchaseOrderQCDetails) {
      const { detail, pack, pack_detail } = poData.productPurchaseOrderQCDetails
      if (pack) setIsPack(true)
      if (pack) setProductQCAppointmentTable(pack_detail)
      else {
        const tempDetail = _.cloneDeep(detail)
        if (
          poGRNData &&
          poGRNData.productPOGRNDispatched &&
          poGRNData.productPOGRNDispatched.length
        ) {
          poGRNData.productPOGRNDispatched.forEach((item) => {
            const foundIndex = tempDetail.findIndex(
              (obj) => Number(obj.variant_id) === Number(item.product_variant_id),
            )
            if (foundIndex > -1)
              tempDetail[foundIndex].dispatched_quantity = item.dispatched_quantity
          })
        }
        setProductQCAppointmentTable(tempDetail)
      }
      // setProductQCAppointmentTable(pack ? pack_detail : detail)
    }
  }, [poData, poLoad, poGRNData, poGRNLoad])

  useEffect(() => {
    if (!warehousesLoad && warehousesData && warehousesData.warehouses)
      setWarehousesList(warehousesData.warehouses)
    else setWarehousesList([])
  }, [warehousesData, warehousesLoad])

  useEffect(() => {
    if (
      !productQCAppointmentLoad &&
      productQCAppointmentData &&
      productQCAppointmentData.productQCAppointment
    ) {
      const { vendor_id, purchase_order_id, pack, qc_details } =
        productQCAppointmentData.productQCAppointment
      setVendorID(String(vendor_id))
      setPurchaseOrderID(purchase_order_id)
      setProductQCAppointmentTable(
        qc_details.map((obj) => ({
          ...obj,
          item_code: pack ? obj.pack_code : obj.variant_code,
        })),
      )
      if (pack) setIsPack(true)
    }
    //  else {
    //   setVendorID(undefined)
    //   setPurchaseOrderID(undefined)
    //   setProductQCAppointmentTable([])
    //   setIsPack(false)
    // }
  }, [productQCAppointmentData, productQCAppointmentLoad])

  useEffect(() => {
    if (
      !deliveryAppointmentLoad &&
      deliveryAppointmentData &&
      deliveryAppointmentData.productDeliveryAppointment
    ) {
      const tempBoxDivs = []
      const tempBoxData = {}
      const {
        warehouse_id,
        vendor_id,
        purchase_order_id,
        qc_appointment_id,
        delivery_appointment_date,
        product_delivery_appointment_box,
        invoice_number,
        status,
        delivered_at,
        pack,
      } = deliveryAppointmentData.productDeliveryAppointment

      if (product_delivery_appointment_box && product_delivery_appointment_box.length)
        product_delivery_appointment_box.forEach((e, index) => {
          tempBoxDivs.push({ id: e.id, key: index + 1, boxPartialData: e })
          tempBoxData[index + 1] = {
            id: e.id,
            boxCode: e.box_code,
            tableData: e.box_data.map((obj, i) => ({
              id: obj.id,
              productVariantID: pack ? obj.pack_id : obj.product_variant_id || null,
              quantity: obj.dispatched_quantity,
              key: i + 1,
            })),
          }
        })
      setDeliveryAppointmentID(deliveryAppointmentData.productDeliveryAppointment.id)
      setVendorID(vendor_id)
      setPurchaseOrderID(purchase_order_id)
      setWarehouseID(warehouse_id)
      setInvoiceNumber(invoice_number)
      setDeliveryAppointmentStatus(status)
      setQcAppointmentID(qc_appointment_id)
      if (delivery_appointment_date)
        setDeliveryAppointmentDate(moment(Number(delivery_appointment_date)))

      if (delivered_at) setDeliveredAt(moment(Number(delivered_at)))

      if (tempBoxDivs && tempBoxDivs.length) setBoxDivs(tempBoxDivs)
      setBoxData(tempBoxData)
      setCount(tempBoxDivs.length)

      // prettier-ignore
      const tempEditMode = !id || (
        id &&
        permissions.includes('updateDeliveryAppointment') &&
        !(type === 'vendor' && status !== 'Scheduled')
      )
      setEditMode(tempEditMode)
      setDisabled(!tempEditMode)
    } else if (deliveryAppointmentData && !deliveryAppointmentData.productDeliveryAppointment) {
      // Initial Entry when partial data is null, so disabled property will work as expected
      setDeliveryAppointmentStatus('Scheduled')
    }
  }, [deliveryAppointmentData, deliveryAppointmentLoad])

  const addBox = () => {
    // console.log('count ->', count)
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
    let isError = false
    if (!warehouseID) {
      setWarehouseIDError('Please select warehouse.')
      isError = true
    }
    if (!invoiceNumber) {
      setInvoiceNumberError('Please enter invoice number.')
      isError = true
    }
    if (!deliveryAppointmentDate) {
      setDeliveryAppointmentDateError('Please enter delivery appointment date.')
      isError = true
    }
    if (!deliveredAt) {
      setDeliveredAtError('Please enter delivered Date.')
    }
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

    productQCAppointmentTable.forEach(({ variant_id, pack_id, quantity, dispatched_quantity }) => {
      console.log('boxData', boxData)
      const productCount = Object.values(boxData).reduce((sum, { tableData }) => {
        return (
          sum +
          tableData.reduce((accumulator, currentObj) => {
            console.log('variant_id', variant_id)
            const itemID = variant_id || pack_id
            if (Number(currentObj.productVariantID) === Number(itemID))
              return accumulator + currentObj.quantity
            console.log('acumulator', accumulator)
            return accumulator
          }, 0)
        )
      }, 0)

      const total_quantity = dispatched_quantity ? quantity - dispatched_quantity : quantity
      console.log('total_quantity', total_quantity)
      console.log('productCount', productCount)
      // if (Number(total_quantity) > Number(productCount)) isPartial = true;
      if (
        Number(total_quantity) > Number(productCount) ||
        Number(total_quantity) === Number(productCount)
      )
        isPartial = true
      if (Number(productCount) > Number(total_quantity)) isExcess = true
    })

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    if (isExcess) {
      notification.error({
        message: 'Error:',
        description:
          'Some of the quantities are more than what is supposed to be packaged. Please make sure to pack the right quantity.',
      })
      return
    }

    const mutationVariables = {
      upsertType: id ? 'update' : 'create',
      id: Number(deliveryAppointmentID),
      qc_appointment_id: Number(qcAppointmentID) || null,
      isPartial,
      vendor_id: vendorID,
      purchase_order_id: purchaseOrderID,
      pack: isPack || false,
      warehouse_id: warehouseID,
      delivery_appointment_date: String(deliveryAppointmentDate.valueOf()),
      invoice_number: invoiceNumber,
      status: type === 'vendor' ? 'Scheduled' : deliveryAppointmentStatus,
      delivered_at:
        deliveryAppointmentStatus === 'Delivered' ? String(deliveredAt.valueOf()) : null,
      productDeliveryAppointmentBoxInput: Object.values(boxData).map(
        ({ id: boxID, boxCode, tableData }) => ({
          id: boxID ? Number(boxID) : null,
          box_code: boxCode,
          productDeliveryAppointmentBoxDataInput: tableData.map(
            ({ id: rowID, productVariantID, quantity }) => ({
              id: rowID ? Number(rowID) : null,
              product_variant_id: isPack ? null : Number(productVariantID),
              pack_id: isPack ? Number(productVariantID) : null,
              dispatched_quantity: Number(quantity),
            }),
          ),
        }),
      ),
      deleted_box_ids: deletedBoxIDs,
      deleted_box_data_ids: deletedRowIDs,
    }

    if (isPartial)
      confirm({
        centered: true,
        title: 'Partial Items Packed',
        content:
          'Some of the items packed have a quantity equal to or less than what was picked. Do you wish to continue?',
        onOk: () => finalSubmission(mutationVariables),
        onCancel: () => {},
      })
    else finalSubmission(mutationVariables)
  }

  const finalSubmission = (variables) => {
    // console.log('variables --> ', variables)
    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertProductDeliveryAppointment({ variables })
      .then(() => {
        setOkText(deliveryAppointmentID ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/delivery/appointments')
      })
      .catch((err) => {
        setOkText(deliveryAppointmentID ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product delivery appointment details.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const warehouseData = () => {
    if (warehousesList && warehousesList.length && warehouseID) {
      const warehouseObj = _.find(warehousesList, { id: warehouseID })
      return <span>{`${warehouseObj.name} (${warehouseObj.location})`}</span>
    }
    return null
  }

  const debouncedVendorSearch = _.debounce((value) => setVendorSearchString(value), 500)

  if (!permissions.includes('readDeliveryAppointment')) return <Error403 />
  if (!id && !permissions.includes('createDeliveryAppointment')) return <Error403 />
  if (warehousesErr) return `Error occured while fetching data: ${warehousesErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (poIDsErr) return `Error occured while fetching data: ${poIDsErr.message}`
  if (poErr) return `Error occured while fetching data: ${poErr.message}`
  if (poGRNErr) return `Error occured while fetching data: ${poGRNErr.message}`
  if (productQCAppointmentErr)
    return `Error occured while fetching data: ${productQCAppointmentErr.message}`
  if (deliveryAppointmentErr)
    return `Error occured while fetching data: ${deliveryAppointmentErr.message}`

  return (
    <div>
      <Helmet title="Delivery Appointment" />

      <Spin spinning={productQCAppointmentLoad} tip="Loading..." size="large">
        <Row className="mb-4 mr-2 ml-2">
          <Col span={18}>
            <h5 className="mb-2">
              <strong>Delivery Appointment</strong>
            </h5>
          </Col>

          <Col span={4} style={{ textAlign: 'right', paddingRight: '8px' }}>
            &emsp;
            {id && permissions.includes('updateDeliveryAppointment') ? (
              <PDFDownload id={id} />
            ) : null}
          </Col>

          {id &&
          permissions.includes('updateDeliveryAppointment') &&
          !(type === 'vendor' && deliveryAppointmentStatus !== 'Scheduled') ? (
            <Col span={2}>
              <Switch
                checked={editMode}
                onChange={(checked) => {
                  setEditMode(checked)
                  setDisabled(!checked)
                }}
              />
              &ensp;Edit
            </Col>
          ) : null}
        </Row>

        <div className="card">
          <div className="card-header">
            <div className="row">
              {action && (
                <>
                  <div className="col-lg-3">
                    <div className="mb-2">Select Vendor </div>
                    <Select
                      showSearch
                      onSearch={(value) => debouncedVendorSearch(value)}
                      value={vendorID}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setVendorID(value)
                        setProductQCAppointmentTable([])
                      }}
                      placeholder="Select Vendor"
                      className="custom-pad-r1"
                      disabled={disabled || action === 'update'}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {vendorNameLists && vendorNameLists.length
                        ? vendorNameLists.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {`${obj.company} (${obj.name})`}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </div>

                  <div className="col-lg-3">
                    <div className="mb-2">Against P.O.</div>
                    <Select
                      value={purchaseOrderID}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setPurchaseOrderID(value)
                        setProductQCAppointmentTable([])
                      }}
                      disabled={disabled || action === 'update'}
                      placeholder="Select P.O."
                      className="custom-pad-r1"
                    >
                      {purchaseOrders && purchaseOrders.length
                        ? purchaseOrders.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.id}
                            </Option>
                          ))
                        : null}
                    </Select>
                  </div>
                </>
              )}
              <div className="col-lg-3">
                <div className="mb-2">
                  Warehouse<span className="custom-error-text"> *</span>
                </div>
                {disabled ? (
                  warehouseData()
                ) : (
                  <Select
                    showSearch
                    disabled={disabled}
                    value={warehouseID}
                    style={{ width: '100%' }}
                    onChange={(value) => setWarehouseID(value)}
                    className={warehouseIDError ? 'custom-error-border' : ''}
                    placeholder="Select the warehouse"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {warehousesList && warehousesList.length
                      ? warehousesList.map((obj) => (
                          <Option key={String(obj.id)} value={String(obj.id)}>
                            {`${obj.name} (${obj.location})`}
                          </Option>
                        ))
                      : null}
                  </Select>
                )}

                <div className="custom-error-text mb-4">{warehouseIDError || ''}</div>
              </div>

              <div className="col-lg-3">
                <div className="mb-2">
                  Delivery Appointment Date<span className="custom-error-text"> *</span>
                </div>
                {disabled ? (
                  deliveryAppointmentDate && Object.keys(deliveryAppointmentDate).length ? (
                    <span>{deliveryAppointmentDate.format('Do MMM YYYY')}</span>
                  ) : null
                ) : (
                  <DatePicker
                    format="Do MMM YYYY"
                    disabled={disabled}
                    value={deliveryAppointmentDate}
                    className={deliveryAppointmentDateError ? 'custom-error-border' : ''}
                    onChange={(value) => setDeliveryAppointmentDate(value)}
                    style={{ width: '100%' }}
                  />
                )}

                <div className="custom-error-text mb-4">{deliveryAppointmentDateError || ''}</div>
              </div>

              <div className="col-lg-2">
                <div className="mb-2">
                  Invoice Number<span className="custom-error-text"> *</span>
                </div>
                {disabled ? (
                  invoiceNumber ? (
                    <span>{invoiceNumber}</span>
                  ) : null
                ) : (
                  <Input
                    disabled={disabled}
                    value={invoiceNumber}
                    onChange={({ target: { value } }) => {
                      setInvoiceNumber(value)
                    }}
                    className={invoiceNumberError ? 'custom-error-border' : ''}
                  />
                )}
                <div className="custom-error-text mb-4">{invoiceNumberError || ''}</div>
              </div>

              {type !== 'vendor' ? (
                <div className="col-lg-2">
                  <div className="mb-2">Status</div>
                  {disabled ? (
                    deliveryAppointmentStatus ? (
                      <span>{deliveryAppointmentStatus}</span>
                    ) : null
                  ) : (
                    <Select
                      disabled={disabled}
                      value={deliveryAppointmentStatus}
                      style={{ width: '100%' }}
                      onChange={(value) => setDeliveryAppointmentStatus(value)}
                      placeholder="Select the warehouse"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Option key="Scheduled" value="Scheduled">
                        Scheduled
                      </Option>
                      <Option key="Booked" value="Booked">
                        Booked
                      </Option>
                      <Option key="Delivered" value="Delivered">
                        Delivered
                      </Option>
                      <Option key="Cancelled" value="Cancelled">
                        Cancelled
                      </Option>
                    </Select>
                  )}
                </div>
              ) : deliveryAppointmentStatus ? (
                <div className="col-lg-2">
                  <div className="mb-2">Select Status</div>
                  <span>{deliveryAppointmentStatus}</span>
                </div>
              ) : null}

              {type !== 'vendor' && deliveryAppointmentStatus === 'Delivered' ? (
                <div className="col-lg-2">
                  <div className="mb-2">
                    Delivered At<span className="custom-error-text"> *</span>
                  </div>
                  <DatePicker
                    format="Do MMM YYYY"
                    disabled={disabled}
                    value={deliveredAt}
                    className={deliveredAtError ? 'custom-error-border' : ''}
                    onChange={(value) => setDeliveredAt(value)}
                    style={{ width: '100%' }}
                  />
                  <div className="custom-error-text mb-4">{deliveredAtError || ''}</div>
                </div>
              ) : deliveredAt &&
                Object.keys(deliveredAt).length &&
                deliveryAppointmentStatus === 'Delivered' ? (
                <div className="col-lg-2">
                  <div className="mb-2">Delivered At</div>
                  <span>{deliveredAt.format('Do MMM YYYY')}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="card-body">
            <div style={{ fontSize: 'medium' }}>
              <strong>Scheduled items to dispatch:</strong>
            </div>
            <Row>
              <Col span={10}>
                <Table
                  columns={scheduledCols}
                  dataSource={productQCAppointmentTable}
                  pagination={false}
                  rowKey={(record) => String(record.id)}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
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
              </Col>
            </Row>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-lg-3">
                <Button type="primary" onClick={addBox} disabled={disabled}>
                  Add Box
                </Button>
              </div>
            </div>

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
                      productsToPack={productQCAppointmentTable.map((obj) => ({
                        productVariantID: obj.variant_id
                          ? String(obj.variant_id)
                          : obj.product_variant_id
                          ? String(obj.product_variant_id)
                          : obj.pack_id
                          ? String(obj.pack_id)
                          : null,
                        productVariantCode: obj.variant_code || obj.pack_code,
                        qtyToPack: obj.quantity || obj.appointment_quantity,
                      }))}
                      boxPartialData={Object.keys(boxData).length ? boxData[div.key] : null}
                      getBoxData={getBoxData}
                      deleteBox={deleteBox}
                      disabled={disabled}
                    />
                  </Col>
                )
              })}
            </Row>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {permissions.includes('createDeliveryAppointment') ||
          permissions.includes('updateDeliveryAppointment') ? (
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
export default withRouter(connect(mapStateToProps)(AppointmentForm))
