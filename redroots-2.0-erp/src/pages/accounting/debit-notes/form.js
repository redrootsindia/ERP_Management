import React, { useEffect, useState } from 'react'
import { withRouter, useParams, useHistory, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Spin, Button, notification, Select, DatePicker, InputNumber, Input } from 'antd'
import { debounce } from 'lodash'
import Error403 from 'components/Errors/403'
import { useMutation, useQuery } from '@apollo/client'
import moment from 'moment'
// import { _, debounce } from 'lodash'
import { UPSERT_DEBIT_NOTE, MATERIALS, DEBIT_NOTE } from './query'
import {
  PRODUCT_VENDOR_NAMES_LIST,
  PRODUCT_PURCHASE_ORDERS,
} from '../../purchase-orders/product/queries'

const { TextArea } = Input

const mapStateToProps = ({ user }) => ({ user })
const VendorAppointment = ({ user: { permissions, type } }) => {
  const { action, id } = useParams()
  const history = useHistory()
  // Vendor ID and List Declaration & Definition Begin
  const [vendorID, setVendorID] = useState(undefined)
  const [vendorIDError, setVendorIDError] = useState(undefined)
  const [vendorList, setVendorList] = useState([])
  const [vendorSearchString, setVendorSearchString] = useState(null)

  const [productPurchaseOrders, setProductPurchaseOrders] = useState([])
  const [poID, setPOID] = useState(undefined)
  const [poIDError, setPOIDError] = useState(undefined)
  const [poSearchString, setPoSearchString] = useState(null)

  const [debitDate, setDebitDate] = useState(moment())
  const [batchCode, setBatchCode] = useState()
  const [labourCost, setLabourCost] = useState()
  const [commentDes, setCommentDes] = useState('')

  const [materialList, setMaterialList] = useState([])
  const [materialID, setMaterialID] = useState(undefined)
  const [materialIDError, setMaterialIDError] = useState(undefined)
  const [materialSearchString, setMaterialSearchString] = useState(null)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateDebitNotes')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  const disabledForVendor = type === 'vendor'
  const debouncedVendorSearch = debounce((value) => setVendorSearchString(value), 500)
  const debouncedPOSearch = debounce((value) => setPoSearchString(value), 500)
  const debouncedMaterialSearch = debounce((value) => setMaterialSearchString(value), 500)
  const [upsertDebitNotes] = useMutation(UPSERT_DEBIT_NOTE)

  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(PRODUCT_VENDOR_NAMES_LIST, {
    variables: { searchString: vendorSearchString },
  })
  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorList(vendorData.vendorNames)
  }, [vendorData, vendorLoad])
  // Vendor ID and List Declaration & Definition End

  const {
    loading: productPurchaseOrderLoad,
    error: productPurchaseOrderErr,
    data: productPurchaseOrderData,
  } = useQuery(PRODUCT_PURCHASE_ORDERS, {
    variables: {
      searchString: poSearchString,
    },
  })

  useEffect(() => {
    if (
      productPurchaseOrderData &&
      productPurchaseOrderData.productPurchaseOrders &&
      productPurchaseOrderData.productPurchaseOrders.rows &&
      productPurchaseOrderData.productPurchaseOrders.rows.length
    ) {
      setProductPurchaseOrders(productPurchaseOrderData.productPurchaseOrders.rows)
    } else {
      setProductPurchaseOrders([])
    }
  }, [productPurchaseOrderLoad, productPurchaseOrderData])

  const {
    loading: materialsLoad,
    data: materialsData,
    error: materialsError,
  } = useQuery(MATERIALS, { variables: { searchString: materialSearchString } })
  useEffect(() => {
    if (
      materialsData &&
      materialsData.materials &&
      materialsData.materials.rows &&
      materialsData.materials.rows.length
    ) {
      setMaterialList(materialsData.materials.rows)
    } else {
      setMaterialList([])
    }
  }, [materialsData, materialsLoad])

  const {
    loading: debitNoteLoad,
    data: debitNoteData,
    error: debitNoteError,
  } = useQuery(DEBIT_NOTE, { variables: { id } })
  useEffect(() => {
    if (!debitNoteLoad && debitNoteData && debitNoteData.debitNote) {
      const { purchase_order_id, vendor_id, material_id, batch_code, comment, date, labour_cast } =
        debitNoteData.debitNote
      if (purchase_order_id) setPOID(purchase_order_id)
      if (vendor_id) setVendorID(vendor_id)
      if (material_id) setMaterialID(material_id)
      if (batch_code) setBatchCode(batch_code)
      if (comment) setCommentDes(comment)
      if (date) setDebitDate(moment(Number(date)))
      if (labour_cast) setLabourCost(labour_cast)
    }
  }, [debitNoteLoad, debitNoteData])
  const onSubmit = () => {
    let isError = false
    if (!vendorID) {
      isError = true
      setVendorIDError('Please select a vendor')
    }
    if (!poID) {
      isError = true
      setPOIDError('please select PO')
    }
    if (!materialID) {
      isError = true
      setMaterialIDError('please select Material')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }
    upsertDebitNotes({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        vendor_id: vendorID,
        purchase_order_id: Number(poID),
        material_id: materialID,
        date: String(debitDate.unix() * 1000),
        comment: commentDes,
        batch_code: Number(batchCode),
        labour_cast: labourCost,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/accounting/debit-notes')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }
  if (!permissions.includes('readDebitNotes')) return <Error403 />
  if (action === 'create' && !permissions.includes('createDebitNotes')) return <Error403 />
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (productPurchaseOrderErr)
    return `Error occured while fetching data: ${productPurchaseOrderErr.message}`
  if (materialsError) return `Error occured while fetching data: ${materialsError.message}`
  if (debitNoteError) return `Error occured while fetching data: ${debitNoteError.message}`

  return (
    <div>
      <Helmet title=" Vendor Appointment" />
      <Spin spinning="" tip="Loading..." size="large">
        <div className=" row mb-4 mr-2 ml-2">
          <div className={action === 'create' ? 'col-4' : 'col-3'}>
            <h5 className="mb-2">
              <strong>
                {id ? 'Edit' : 'Create'} Debit Notes {id ? `#${id}` : ' '}
              </strong>
            </h5>
          </div>
          <div className=" col-12 pull-right" style={{ textAlign: 'right' }}>
            {action === 'update' && permissions.includes('updateDebitNotes') && (
              <Switch
                checked={editMode}
                onChange={(checked) => {
                  setEditMode(checked)
                  setDisabled(!checked)
                }}
                className="ml-3"
              >
                Edit
              </Switch>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="row mb-5">
              <div className="col-lg-3">
                <div className="mb-2">
                  Vendor<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  onSearch={(value) => debouncedVendorSearch(value)}
                  value={vendorID}
                  disabled={disabled || disabledForVendor}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    // const csv = value.split(',')
                    setVendorID(value)
                    // setSameState(csv[1] === 'Maharashtra')
                  }}
                  className={
                    vendorIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select a vendor"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {vendorList && vendorList.length
                    ? vendorList.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {`${obj.company} (${obj.name})`}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{vendorIDError || ''}</div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  P.O<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={poID}
                  onSearch={(value) => debouncedPOSearch(value)}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setPOID(value)
                  }}
                  className={poIDError ? 'custom-error-border' : ''}
                  placeholder="Select PO"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {productPurchaseOrders && productPurchaseOrders.length
                    ? productPurchaseOrders.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.id}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{poIDError || ''}</div>
              </div>
              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Comments <span className="custom-error-text mb-4">*</span>
                </div>
                <TextArea
                  row={2}
                  value={commentDes}
                  onChange={({ target: { value } }) => {
                    setCommentDes(value)
                  }}
                  style={{ width: '100%' }}
                  disabled={disabled}
                />
              </div>
              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Batch Code <span className="custom-error-text mb-4">*</span>
                </div>
                <InputNumber
                  value={batchCode}
                  min={0}
                  onChange={(value) => {
                    setBatchCode(value)
                  }}
                  style={{ width: '100%' }}
                  disabled={disabled}
                />
              </div>

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Labour Cost <span className="custom-error-text mb-4">*</span>
                </div>
                <InputNumber
                  value={labourCost}
                  min={0}
                  onChange={(value) => {
                    setLabourCost(value)
                  }}
                  style={{ width: '100%' }}
                  disabled={disabled}
                />
              </div>
              <div className="col-lg-2">
                <div className="mb-2">
                  Date<span className="custom-error-text"> *</span>
                </div>
                <DatePicker
                  value={debitDate}
                  style={{ width: '100%' }}
                  format="DD-MM-YYYY"
                  onChange={(value) => {
                    setDebitDate(value)
                  }}
                  disabled={disabled || disabledForVendor}
                />
              </div>

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Material<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={materialID}
                  onSearch={(value) => debouncedMaterialSearch(value)}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setMaterialID(value)
                  }}
                  className={materialIDError ? 'custom-error-border' : ''}
                  placeholder="Select Material"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {materialList && materialList.length
                    ? materialList.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.material_code}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{materialIDError || ''}</div>
              </div>
            </div>

            {/*  <div className="row">
              <div className="col-lg-12">
                <Table
                  dataSource={[]}
                  columns={[]}
                  pagination={false}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                />
              </div>
                </div> */}
            {/* <div className="row mt-4">
              <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
                <span className="mr-3">Total 0</span>
                <Button type="default">Add Row</Button>
              </div>
            </div> */}
          </div>
        </div>
        <div className="row mb-4 ml-2 mr-2 pull-right">
          <div className="col-12">
            <Button className="mr-2" type="primary" onClick={onSubmit} disabled={disabled}>
              {okText}
            </Button>
            <Button danger onClick={() => history.goBack()}>
              Back
            </Button>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(VendorAppointment))
