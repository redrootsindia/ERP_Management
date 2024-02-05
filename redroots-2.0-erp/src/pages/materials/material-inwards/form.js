import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  Table,
  Spin,
  Checkbox,
  Button,
  Switch,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col,
  notification,
} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import moment from 'moment'
import _ from 'lodash'
import ImageUpload from 'components/ImageUpload'
import Error403 from 'components/Errors/403'
import GeneralModeForm from './generalModeForm'
import RollsBatchesExpand from './rollsBatchesExpand'
import {
  VENDOR_NAMES_LIST,
  PURCHASE_ORDER_ID_MATERIAL_INWARD,
  WAREHOUSES,
  PURCHASE_ORDER_DATA_MATERIAL_INWARD,
  UPSERT_MATERIAL_INWARD,
  MATERIAL_INWARD,
} from './queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const MaterialInward = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [generalMode, setGeneralMode] = useState(false)
  const [generalModeData, setGeneralModeData] = useState({})

  const [inwardDate, setInwardDate] = useState(moment())
  const [inwardDateError, setInwardDateError] = useState(undefined)

  const [vendorID, setVendorID] = useState(undefined)
  const [vendorIDError, setVendorIDError] = useState(undefined)
  const [vendorNamesList, setVendorNamesList] = useState([])
  const [vendorSearchString, setVendorSearchString] = useState(null)

  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [purchaseOrdersID, setPurchaseOrdersID] = useState(undefined)
  const [purchaseOrdersIDError, setPurchaseOrdersIDError] = useState(undefined)

  const [invoiceNumber, setInvoiceNumber] = useState(undefined)
  const [invoiceNumberError, setInvoiceNumberError] = useState(undefined)

  const [warehouseID, setWarehouseID] = useState(undefined)
  const [warehouseIDError, setWarehouseIDError] = useState(undefined)
  const [WarehousesList, setWarehousesList] = useState([])

  const [companyName, setCompanyName] = useState(false)
  const [companyNameError, setCompanyNameError] = useState(undefined)

  const [address, setAddress] = useState(false)
  const [addressError, setAddressError] = useState(undefined)

  const [gst, setGst] = useState(false)
  const [gstError, setGstError] = useState(undefined)

  const [stamp, setStamp] = useState(false)
  const [stampError, setStampError] = useState(undefined)

  const [totalQuantity, setTotalQuantity] = useState(false)
  const [totalQuantityError, setTotalQuantityError] = useState(undefined)

  const [totalAmount, setTotalAmount] = useState(false)
  const [totalAmountError, setTotalAmountError] = useState(undefined)

  const [rriCompany, setRriCompany] = useState(false)
  const [rriCompanyError, setRriCompanyError] = useState(undefined)

  const [rriAddress, setRriAddress] = useState(false)
  const [rriAddressError, setRriAddressError] = useState(undefined)

  const [rriGst, setRriGst] = useState(false)
  const [rriGstError, setRriGstError] = useState(undefined)

  const [rriPo, setRriPo] = useState(false)
  const [rriPoError, setRriPoError] = useState(undefined)

  const [vendorSign, setVendorSign] = useState(false)
  const [vendorSignError, setVendorSignError] = useState(undefined)

  const [existingChallanImages, setExistingChallanImages] = useState([])
  const [challanImage, setChallanImage] = useState(null)
  const [challanImageError, setChallanImageError] = useState(undefined)
  const [ischallanImagechanged, setIsChallanImageChanged] = useState(false)

  const [existingInvoiceImages, setExistingInvoiceImages] = useState([])
  const [invoiceImage, setInvoiceImage] = useState(null)
  const [invoiceImageError, setInvoiceImageError] = useState(undefined)
  const [isinvoiceImagechanged, setIsInvoiceImageChanged] = useState(false)

  const [purchaseOrderDataList, setPurchaseOrderDataList] = useState([])

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateMaterialInward')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertMaterialInward] = useMutation(UPSERT_MATERIAL_INWARD)
  const {
    loading: materialinwardLoad,
    error: materialinwardErr,
    data: materialinwardData,
  } = useQuery(MATERIAL_INWARD, { variables: { id } })

  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(VENDOR_NAMES_LIST, {
    variables: { vendorIDs: vendorID ? [vendorID] : [], searchString: vendorSearchString },
  })

  const {
    loading: purchaseOrderIdMaterialInwardLoad,
    data: purchaseOrderIdMaterialInwardData,
    error: purchaseOrderIdMaterialInwardErr,
  } = useQuery(PURCHASE_ORDER_ID_MATERIAL_INWARD, {
    variables: { vendor_id: vendorID },
  })

  const { loading: warehouseLoad, error: warehouseErr, data: warehouseData } = useQuery(WAREHOUSES)

  const [
    generatePoTable,
    {
      loading: purchaseOrderDataMaterialInwardLoad,
      data: purchaseOrderDataMaterialInwardData,
      error: purchaseOrderDataMaterialInwardrErr,
    },
  ] = useLazyQuery(PURCHASE_ORDER_DATA_MATERIAL_INWARD, {
    variables: { purchase_order_id: purchaseOrdersID },
  })

  useEffect(() => {
    if (
      action === 'update' &&
      !materialinwardLoad &&
      materialinwardData &&
      materialinwardData.materialInward
    ) {
      if (materialinwardData.materialInward.purchase_order_id) {
        const {
          inward_date,
          vendor_id,
          purchase_order_id,
          invoice_number,
          warehouse_id,
          checklist_company_name,
          checklist_address,
          checklist_gst,
          checklist_stamp,
          checklist_total_quantity,
          checklist_total_amount,
          checklist_rri_company,
          checklist_rri_address,
          checklist_rri_gst,
          checklist_rri_po,
          checklist_vendor_sign,
          challan_image,
          invoice_image,
          batch_data,
        } = materialinwardData.materialInward
        if (inward_date) setInwardDate(moment(Number(inward_date)))
        if (vendor_id) setVendorID(String(vendor_id))
        if (purchase_order_id) setPurchaseOrdersID(purchase_order_id)
        if (invoice_number) setInvoiceNumber(invoice_number)
        if (warehouse_id) setWarehouseID(String(warehouse_id))
        setCompanyName(checklist_company_name)
        setAddress(checklist_address)
        setGst(checklist_gst)
        setStamp(checklist_stamp)
        setTotalQuantity(checklist_total_quantity)
        setTotalAmount(checklist_total_amount)
        setRriCompany(checklist_rri_company)
        setRriAddress(checklist_rri_address)
        setRriGst(checklist_rri_gst)
        setRriPo(checklist_rri_po)
        setVendorSign(checklist_vendor_sign)
        if (challan_image) {
          setChallanImage(challan_image)
          setExistingChallanImages([
            `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_MATERIAL_INWARDS_URL}${challan_image}`,
          ])
        }
        if (invoice_image) {
          setInvoiceImage(invoice_image)
          setExistingInvoiceImages([
            `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_MATERIAL_INWARDS_URL}${invoice_image}`,
          ])
        }
        setPurchaseOrderDataList(batch_data)
      } else {
        setGeneralMode(true)
        setGeneralModeData(materialinwardData.materialInward)
      }
    }
  }, [materialinwardData, materialinwardLoad])

  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorNamesList(vendorData.vendorNames)
  }, [vendorData, vendorLoad])

  useEffect(() => {
    if (
      !purchaseOrderIdMaterialInwardLoad &&
      purchaseOrderIdMaterialInwardData &&
      purchaseOrderIdMaterialInwardData.purchaseOrderIDsForMaterialInward
    ) {
      setPurchaseOrders(purchaseOrderIdMaterialInwardData.purchaseOrderIDsForMaterialInward)
    }
  }, [purchaseOrderIdMaterialInwardData, purchaseOrderIdMaterialInwardLoad])

  useEffect(() => {
    if (
      !warehouseLoad &&
      warehouseData &&
      warehouseData.warehouses &&
      warehouseData.warehouses.length
    )
      setWarehousesList(warehouseData.warehouses)
  }, [warehouseData, warehouseLoad])

  useEffect(() => {
    if (
      action === 'create' &&
      !purchaseOrderDataMaterialInwardLoad &&
      purchaseOrderDataMaterialInwardData &&
      purchaseOrderDataMaterialInwardData.purchaseOrderDataForMaterialInward &&
      purchaseOrderDataMaterialInwardData.purchaseOrderDataForMaterialInward.length
    )
      setPurchaseOrderDataList(
        purchaseOrderDataMaterialInwardData.purchaseOrderDataForMaterialInward,
      )
  }, [purchaseOrderDataMaterialInwardData, purchaseOrderDataMaterialInwardLoad])

  const addRollsBatches = (rolls, recordID) => {
    const tempNumberOfRolls = JSON.parse(JSON.stringify(purchaseOrderDataList))
    const foundIndex = tempNumberOfRolls.findIndex((e) => Number(e.id) === Number(recordID))
    if (foundIndex > -1) tempNumberOfRolls[foundIndex].number_of_rolls = Number(rolls)
    setPurchaseOrderDataList(tempNumberOfRolls)
  }

  const callback = (rollID, obj) => {
    const tempDatawithRolls = JSON.parse(JSON.stringify(purchaseOrderDataList))
    const foundIndex = tempDatawithRolls.findIndex((e) => Number(e.id) === Number(rollID))
    if (foundIndex > -1) tempDatawithRolls[foundIndex].batches = obj
    setPurchaseOrderDataList(tempDatawithRolls)
  }

  const tableColumns = [
    {
      title: 'Material Code',
      dataIndex: 'material_code',
      key: 'material_code',
    },
    {
      title: 'Material Name',
      dataIndex: 'material_name',
      key: 'material_name',
    },
    {
      title: 'P.O. Qty.',
      dataIndex: 'ordered_quantity',
      key: 'ordered_quantity',
    },
    {
      title: 'Pending Qty.',
      dataIndex: 'pending_quantity',
      key: 'pending_quantity',
    },
    {
      title: 'No of Rolls',
      dataIndex: 'number_of_rolls',
      key: 'number_of_rolls',
      render: (text, record) => (
        <>
          {action === 'update' ? (
            record.batches.length
          ) : (
            <InputNumber
              disabled={action === 'update'}
              onChange={(e) => addRollsBatches(e, record.id)}
            />
          )}
        </>
      ),
    },
  ]

  const onSubmit = () => {
    setInwardDateError(undefined)
    setVendorIDError(undefined)
    setPurchaseOrdersIDError(undefined)
    setInvoiceNumberError(undefined)
    setWarehouseIDError(undefined)
    setCompanyNameError(undefined)
    setAddressError(undefined)
    setGstError(undefined)
    setStampError(undefined)
    setTotalQuantityError(undefined)
    setTotalAmountError(undefined)
    setRriCompanyError(undefined)
    setRriAddressError(undefined)
    setRriGstError(undefined)
    setRriPoError(undefined)
    setVendorSignError(undefined)
    setChallanImageError(undefined)
    setInvoiceImageError(undefined)

    let isError = false

    if (!inwardDate) {
      isError = true
      setInwardDateError('Inward Date cannot be empty')
    }
    if (!vendorID) {
      isError = true
      setVendorIDError('Vendor name cannot be empty')
    }
    if (!purchaseOrdersID) {
      isError = true
      setPurchaseOrdersIDError('Puerchase order ID cannot be empty')
    }
    if (!invoiceNumber) {
      isError = true
      setInvoiceNumberError('Invoice Number cannot be empty')
    }
    if (!warehouseID) {
      isError = true
      setWarehouseIDError('Warehouse name cannot be empty')
    }
    if (!companyName) {
      isError = true
      setCompanyNameError(true)
    }
    if (!address) {
      isError = true
      setAddressError(true)
    }
    if (!gst) {
      isError = true
      setGstError(true)
    }
    if (!stamp) {
      isError = true
      setStampError(true)
    }
    if (!totalQuantity) {
      isError = true
      setTotalQuantityError(true)
    }
    if (!totalAmount) {
      isError = true
      setTotalAmountError(true)
    }
    if (!rriCompany) {
      isError = true
      setRriCompanyError(true)
    }
    if (!rriAddress) {
      isError = true
      setRriAddressError(true)
    }
    if (!rriGst) {
      isError = true
      setRriGstError(true)
    }
    if (!rriPo) {
      isError = true
      setRriPoError(true)
    }
    if (!vendorSign) {
      isError = true
      setVendorSignError(true)
    }
    if (!challanImage) {
      isError = true
      setChallanImageError('Upload Challan')
    }
    if (!invoiceImage) {
      isError = true
      setInvoiceImageError('Upload Image')
    }
    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    let quantitiesFilled = true
    purchaseOrderDataList.forEach((obj) => {
      if (!obj.batches || !obj.batches.length) quantitiesFilled = false
      else
        obj.batches.forEach((batch) => {
          if (batch.quantity === null || batch.quantity === undefined) quantitiesFilled = false
        })
    })

    if (!quantitiesFilled) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the rolls are filled.',
      })
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    const batch_data = []

    purchaseOrderDataList.forEach((obj) => {
      batch_data.push(
        ...obj.batches.map((e) => ({
          id: e.id,
          material_id: obj.material_id,
          quantity: e.quantity,
        })),
      )
    })

    upsertMaterialInward({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        inward_data: {
          inward_date: String(inwardDate.valueOf()),
          vendor_id: vendorID,
          purchase_order_id: purchaseOrdersID,
          invoice_number: String(invoiceNumber),
          warehouse_id: Number(warehouseID),
          challan_image: challanImage,
          is_challan_image_changed: ischallanImagechanged,
          invoice_image: invoiceImage,
          is_invoice_image_changed: isinvoiceImagechanged,
          checklist_company_name: companyName,
          checklist_address: address,
          checklist_gst: gst,
          checklist_stamp: stamp,
          checklist_total_quantity: totalQuantity,
          checklist_total_amount: totalAmount,
          checklist_rri_company: rriCompany,
          checklist_rri_address: rriAddress,
          checklist_rri_gst: rriGst,
          checklist_rri_po: rriPo,
          checklist_vendor_sign: vendorSign,
        },
        batch_data,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/materials/material-inwards')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving material inward.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const debouncedVendorSearch = _.debounce((value) => setVendorSearchString(value), 500)

  if (!permissions.includes('readMaterialInward')) return <Error403 />
  if (action === 'create' && !permissions.includes('createMaterialInward')) return <Error403 />
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (purchaseOrderIdMaterialInwardErr)
    return `Error occured while fetching data: ${purchaseOrderIdMaterialInwardErr.message}`
  if (warehouseErr) return `Error occured while fetching data: ${warehouseErr.message}`
  if (materialinwardErr) return `Error occured while fetching data: ${materialinwardErr.message}`
  if (purchaseOrderDataMaterialInwardrErr)
    return `Error occured while fetching data: ${purchaseOrderDataMaterialInwardrErr.message}`

  return (
    <div>
      <Helmet title="Material Inward" />
      <Spin
        spinning={
          vendorLoad ||
          purchaseOrderDataMaterialInwardLoad ||
          warehouseLoad ||
          purchaseOrderIdMaterialInwardLoad
        }
        tip="Loading..."
        size="large"
      >
        <Row className="mb-4 mr-2 ml-2">
          <Col span={21}>
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Inward</strong>
            </h5>
          </Col>
          {action === 'create' && permissions.includes('createMaterialInward') ? (
            <Col span={3}>
              <Switch checked={!generalMode} onChange={(checked) => setGeneralMode(!checked)} />
              &ensp;P.O. Based Inward
            </Col>
          ) : (
            action === 'update' &&
            permissions.includes('updateMaterialInward') && (
              <Col span={3}>
                <Switch
                  checked={editMode}
                  onChange={(checked) => {
                    setEditMode(checked)
                    setDisabled(!checked)
                  }}
                />
                &ensp;Edit
              </Col>
            )
          )}
        </Row>

        {generalMode ? (
          <GeneralModeForm
            action={action}
            disabled={disabled}
            permissions={permissions}
            WarehousesList={WarehousesList}
            id={id}
            inwardData={generalModeData}
          />
        ) : (
          <div className="row mt-4">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-lg-2">
                      <div className="mb-2">
                        <strong>
                          Inward Date<span className="custom-error-text"> *</span>
                        </strong>
                      </div>
                      <div>
                        <DatePicker
                          value={inwardDate}
                          style={{ width: '100%' }}
                          format="Do MMM YYYY"
                          disabled={disabled || !permissions.includes('approveMaterialInward')}
                          className={
                            inwardDateError
                              ? 'custom-error-border'
                              : disabled
                              ? 'disabledStyle'
                              : ''
                          }
                          onChange={(value) => setInwardDate(value)}
                        />
                        <div className="custom-error-text mb-4">{inwardDateError || ''}</div>
                      </div>
                    </div>

                    <div className="col-lg-3">
                      <div className="mb-2">
                        <strong>
                          Vendor<span className="custom-error-text"> *</span>
                        </strong>
                      </div>
                      <Select
                        showSearch
                        onSearch={(value) => debouncedVendorSearch(value)}
                        value={vendorID}
                        style={{ width: '100%' }}
                        disabled={action === 'update' || disabled}
                        className={
                          vendorIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                        }
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={(value) => setVendorID(value)}
                        placeholder="Select Vendor Name"
                      >
                        {vendorNamesList && vendorNamesList.length
                          ? vendorNamesList.map((obj) => (
                              <Option key={String(obj.id)} value={String(obj.id)}>
                                {obj.name}
                              </Option>
                            ))
                          : null}
                      </Select>
                      <div className="custom-error-text mb-4">{vendorIDError || ''}</div>
                    </div>

                    <div className="col-lg-2">
                      <div className="mb-2">
                        <strong>
                          P.O. #<span className="custom-error-text"> *</span>
                        </strong>
                      </div>
                      <Select
                        value={purchaseOrdersID}
                        style={{ width: '100%' }}
                        onChange={(value) => {
                          setPurchaseOrdersID(value)
                          generatePoTable()
                        }}
                        disabled={action === 'update' || disabled}
                        placeholder="Select PO Number"
                        className={purchaseOrdersIDError ? 'custom-error-border' : ''}
                      >
                        {purchaseOrders && purchaseOrders.length
                          ? purchaseOrders.map((obj) => (
                              <Option key={String(obj.id)} value={String(obj.id)}>
                                {String(obj.id)}
                              </Option>
                            ))
                          : null}
                      </Select>
                      <div className="custom-error-text mb-4">{purchaseOrdersIDError || ''}</div>
                    </div>

                    <div className="col-lg-2">
                      <div className="mb-2">
                        <strong>
                          Invoice Number<span className="custom-error-text"> *</span>
                        </strong>
                      </div>
                      <Input
                        placeholder="Invoice Number"
                        value={invoiceNumber}
                        disabled={disabled}
                        onChange={({ target: { value } }) => setInvoiceNumber(value)}
                        allowClear
                        className={
                          invoiceNumberError
                            ? 'custom-error-border'
                            : disabled
                            ? 'disabledStyle'
                            : ''
                        }
                      />
                      <div className="custom-error-text mb-4">{invoiceNumberError || ''}</div>
                    </div>

                    <div className="col-lg-2">
                      <div className="mb-2">
                        <strong>
                          Warehouse<span className="custom-error-text"> *</span>
                        </strong>
                      </div>
                      <Select
                        value={warehouseID}
                        style={{ width: '100%' }}
                        disabled={disabled}
                        onChange={(value) => setWarehouseID(value)}
                        placeholder="Select Warehouse"
                        className={warehouseIDError ? 'custom-error-border' : ''}
                      >
                        {WarehousesList && WarehousesList.length
                          ? WarehousesList.map((obj) => (
                              <Option key={String(obj.id)} value={String(obj.id)}>
                                {obj.name}
                              </Option>
                            ))
                          : null}
                      </Select>
                      <div className="custom-error-text mb-4">{warehouseIDError || ''}</div>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-lg-12 mb-2">
                      <strong>
                        Invoice list<span className="custom-error-text"> *</span>
                      </strong>
                    </div>
                    <div className="col">
                      <Checkbox
                        disabled={disabled}
                        className={companyNameError ? 'custom-error-border' : ''}
                        checked={companyName}
                        onChange={(value) => setCompanyName(value.target.checked)}
                      >
                        Company Name
                      </Checkbox>
                      <Checkbox
                        disabled={disabled}
                        checked={address}
                        className={addressError ? 'custom-error-border' : ''}
                        onChange={(value) => setAddress(value.target.checked)}
                      >
                        Address
                      </Checkbox>
                      <Checkbox
                        className={gstError ? 'custom-error-border' : ''}
                        disabled={disabled}
                        checked={gst}
                        onChange={(value) => setGst(value.target.checked)}
                      >
                        GST Number
                      </Checkbox>
                      <Checkbox
                        disabled={disabled}
                        className={stampError ? 'custom-error-border' : ''}
                        checked={stamp}
                        onChange={(value) => setStamp(value.target.checked)}
                      >
                        Stamp
                      </Checkbox>
                      <Checkbox
                        disabled={disabled}
                        className={totalQuantityError ? 'custom-error-border' : ''}
                        checked={totalQuantity}
                        onChange={(value) => setTotalQuantity(value.target.checked)}
                      >
                        Total Quantity
                      </Checkbox>
                      <Checkbox
                        disabled={disabled}
                        className={totalAmountError ? 'custom-error-border' : ''}
                        checked={totalAmount}
                        onChange={(value) => setTotalAmount(value.target.checked)}
                      >
                        Total Amount
                      </Checkbox>
                      <Checkbox
                        disabled={disabled}
                        className={rriCompanyError ? 'custom-error-border' : ''}
                        checked={rriCompany}
                        onChange={(value) => setRriCompany(value.target.checked)}
                      >
                        RRI Company Name
                      </Checkbox>
                      <Checkbox
                        disabled={disabled}
                        className={rriAddressError ? 'custom-error-border' : ''}
                        checked={rriAddress}
                        onChange={(value) => setRriAddress(value.target.checked)}
                      >
                        RRI Address
                      </Checkbox>
                      <Checkbox
                        disabled={disabled}
                        className={rriGstError ? 'custom-error-border' : ''}
                        checked={rriGst}
                        onChange={(value) => setRriGst(value.target.checked)}
                      >
                        RRI GST Number
                      </Checkbox>

                      <Checkbox
                        disabled={disabled}
                        className={rriPoError ? 'custom-error-border' : ''}
                        checked={rriPo}
                        onChange={(value) => setRriPo(value.target.checked)}
                      >
                        RRI PO Number
                      </Checkbox>
                      <Checkbox
                        disabled={disabled}
                        className={vendorSignError ? 'custom-error-border' : ''}
                        checked={vendorSign}
                        onChange={(value) => setVendorSign(value.target.checked)}
                      >
                        Vendor Sign
                      </Checkbox>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-lg-3">
                      <div className="mb-2">
                        <strong>
                          Challan<span className="custom-error-text"> *</span>
                        </strong>
                      </div>
                      <ImageUpload
                        existingImages={existingChallanImages}
                        // Always pass an array. If not empty, it should have fully-formed URLs of images
                        placeholderType="general" // Accepted values: 'general' or 'profile'
                        onUploadCallback={(imgFile) => {
                          setChallanImage(imgFile)
                          setIsChallanImageChanged(true)
                        }}
                        onRemoveCallback={() => {
                          setChallanImage(null)
                          setIsChallanImageChanged(true)
                        }}
                        maxImages={1}
                        editMode={!disabled}
                      />
                      <div className="custom-error-text mb-4">{challanImageError || ''}</div>
                    </div>
                    <div className="col-lg-3">
                      <div className="mb-2">
                        <strong>
                          Invoice<span className="custom-error-text"> *</span>
                        </strong>
                      </div>
                      <ImageUpload
                        existingImages={existingInvoiceImages}
                        // Always pass an array. If not empty, it should have fully-formed URLs of images
                        placeholderType="general" // Accepted values: 'general' or 'profile'
                        onUploadCallback={(imgFile) => {
                          setInvoiceImage(imgFile)
                          setIsInvoiceImageChanged(true)
                        }}
                        onRemoveCallback={() => {
                          setInvoiceImage(null)
                          setIsInvoiceImageChanged(true)
                        }}
                        maxImages={1}
                        editMode={!disabled}
                      />
                      <div className="custom-error-text mb-4">{invoiceImageError || ''}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {purchaseOrderDataList && purchaseOrderDataList.length ? (
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-body">
                    <div className="kit__utils__table">
                      <Table
                        columns={tableColumns}
                        dataSource={purchaseOrderDataList}
                        pagination={{
                          defaultPageSize: 20,
                          showSizeChanger: true,
                          pageSizeOptions: [
                            '20',
                            '40',
                            '60',
                            '80',
                            '100',
                            '150',
                            '200',
                            '300',
                            '400',
                            '500',
                          ],
                        }}
                        expandable={{
                          expandedRowRender: (record) => (
                            <RollsBatchesExpand
                              record={record}
                              disabled={disabled}
                              action={action}
                              parentCallback={callback}
                            />
                          ),
                          defaultExpandAllRows: true,
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
            ) : null}

            <div className="row mt-3 mb-4 ml-2">
              {(action === 'create' && permissions.includes('createMaterialInward')) ||
              (action === 'update' && permissions.includes('updateMaterialInward')) ? (
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
        )}
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(MaterialInward))
