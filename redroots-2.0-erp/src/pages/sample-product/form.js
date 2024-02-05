import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Spin, Select, DatePicker, Space, InputNumber, Button, notification, Switch } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useParams, withRouter, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import Error403 from 'components/Errors/403'
import ImageUpload from 'components/ImageUpload'
import { useMutation, useQuery } from '@apollo/client'
import moment from 'moment'
import { PRODUCTS, VENDORS, UPSERT_SAMPLE_PRODUCT, SAMPLE_PRODUCT } from './query'

const mapStateToProps = ({ user }) => ({ user })
const SampleForm = ({ user: { permissions } }) => {
  const { action, id } = useParams()
  const history = useHistory()

  const [productID, setProductID] = useState(undefined)
  const [productError, setProductError] = useState(undefined)
  const [productList, setProductList] = useState([])
  const [vendorID, setVendorID] = useState(undefined)
  const [vendorList, setVendorList] = useState([])
  const [vendorError, setVendorError] = useState(undefined)
  const [sampleDate, setSampleDate] = useState(undefined)
  const [dateError, setDateError] = useState(undefined)
  const [sampleProductStatus, setSampleProductStatus] = useState('open')
  const [sampleQuantity, setSampleQuantity] = useState()
  const [product_image, setProduct_image] = useState(undefined)
  const [okText, setOkText] = useState(id ? 'save' : 'create')
  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateExpenseManagement')),
  )
  const [disabled, setDisabled] = useState(!editMode)

  const { loading: prodNameLoad, data: prodNameData, error: prodNameErr } = useQuery(PRODUCTS)
  const { loading: vendorsLoad, data: vendorsData, error: vendorDataError } = useQuery(VENDORS)
  const {
    loading: sampleProductLoad,
    data: sampleProductData,
    error: sampleProductError,
  } = useQuery(SAMPLE_PRODUCT, { variables: { id } })

  const [upsertSampleProduct] = useMutation(UPSERT_SAMPLE_PRODUCT)

  useEffect(() => {
    if (!sampleProductLoad && sampleProductData && sampleProductData.sampleProduct) {
      const { product_id, date, vendor_id, quantity, status, image } =
        sampleProductData.sampleProduct
      if (product_id) setProductID(product_id)
      if (date) setSampleDate(moment(Number(date)))
      if (vendor_id) setVendorID(vendor_id)
      if (quantity) setSampleQuantity(quantity)
      if (status) setSampleProductStatus(status)
      if (image) setProduct_image(image)
    }
  }, [sampleProductLoad, sampleProductData])

  useEffect(() => {
    if (
      !prodNameLoad &&
      prodNameData &&
      prodNameData.productNames &&
      prodNameData.productNames.length
    )
      setProductList(prodNameData.productNames)
  }, [prodNameData, prodNameLoad])

  useEffect(() => {
    if (
      !vendorsLoad &&
      vendorsData &&
      vendorsData.vendors &&
      vendorsData.vendors.rows &&
      vendorsData.vendors.rows.length
    )
      setVendorList(vendorsData.vendors.rows)
  }, [vendorsLoad, vendorsData])

  const onSubmit = () => {
    setProductError(undefined)
    setVendorError(undefined)
    setDateError(undefined)
    let isError = false
    if (!productID) {
      isError = true
      setProductError('Product cannot be empty')
    }
    if (!vendorID) {
      isError = true
      setVendorError('Please Select Vendor')
    }
    if (!sampleDate) {
      isError = true
      setDateError('Date can not be empty')
    }
    if (!product_image) {
      isError = true
    }
    if (isError) {
      notification.error({
        message: 'Incorrect / Incomplete Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }
    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertSampleProduct({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        product_id: productID,
        vendor_id: vendorID,
        date: String(sampleDate.valueOf()),
        status: sampleProductStatus,
        quantity: sampleQuantity,
        image: product_image,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Crete')
        notification.success({ descraiption: 'Saved Successfully.' })
        history.push('/sample-product')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving Sample Product.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readSampleProduct')) return <Error403 />
  if (action === 'create' && !permissions.includes('createSampleProduct')) return <Error403 />
  if (prodNameErr) return `Error occured while fetching data: ${prodNameErr.message}`
  if (vendorDataError) return `Error occured while fetching data: ${vendorDataError.message}`
  if (sampleProductError) return `Error occured while fetching data: ${sampleProductError.message}`

  return (
    <div>
      <Helmet title="Sample Product" />
      <Spin spinning={sampleProductLoad} tip="Loading..." size="large">
        <div className="row">
          <div className="col-12">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Sampmle Product</strong>
            </h5>
          </div>
          {action === 'update' && permissions.includes('updateSampleProduct') ? (
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
        </div>
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-3 col-6">
                    <div className="mb-2">
                      Product<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={productID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setProductID(value)
                      }}
                      className={
                        productError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select an brand"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {productList && productList.length
                        ? productList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{productError || ''}</div>
                  </div>

                  <div className="col-lg-3 col-6">
                    <div className="mb-2">
                      Vendor<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={vendorID}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setVendorID(value)
                      }}
                      className={
                        vendorError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select an brand"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {vendorList && vendorList.length
                        ? vendorList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{vendorError || ''}</div>
                  </div>

                  <div className="col-lg-3 col-6">
                    <div className="mb-2">
                      Date<span className="custom-error-text"> *</span>
                    </div>
                    <DatePicker
                      style={{ width: '100%' }}
                      value={sampleDate}
                      format="DD-MM-YYYY"
                      className={dateError ? 'custom-error-border' : ''}
                      onChange={(value) => {
                        setSampleDate(value)
                      }}
                      // disabled={disabled}
                    />
                    <div className="custom-error-text mb-4">{dateError || ''}</div>
                  </div>

                  <div className="col-lg-3 col-6">
                    <div className="mb-2">
                      Status<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      value={sampleProductStatus}
                      onChange={(value) => {
                        setSampleProductStatus(value)
                      }}
                      // className={
                      //   piStatusError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      // }
                      placeholder="Select Status"
                      style={{
                        width: 200,
                      }}
                      // disabled={disabled}
                    >
                      <Select.Option key="Open" value="Open">
                        Open
                      </Select.Option>
                      <Select.Option key="In Progress" value="In Progress">
                        In Progress
                      </Select.Option>
                      <Select.Option key="Completed" value="Completed">
                        Completed
                      </Select.Option>
                    </Select>
                  </div>

                  <div className="col-lg-3 col-12">
                    <div className="mb-2">
                      Quantity<span className="custom-error-text"> *</span>
                    </div>
                    <Space>
                      <InputNumber
                        value={sampleQuantity}
                        min={0}
                        onChange={(value) => setSampleQuantity(value)}
                        style={{ width: '100%' }}
                      />
                    </Space>
                  </div>
                  <div className="col-lg-3">
                    <div className="mb-2">
                      Image<span className="custom-error-text"> *</span>
                    </div>
                    <ImageUpload
                      existingImages={product_image} // Always pass an array. If not empty, it should have fully-formed URLs of images
                      placeholderType="general" // Accepted values: 'general' or 'general'
                      onUploadCallback={(imgFile) => {
                        setProduct_image(imgFile)
                      }}
                      onRemoveCallback={() => {
                        setProduct_image(null)
                      }}
                      maxImages={1}
                      editMode={editMode}
                      className="border-blue"
                    />
                  </div>
                </div>
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
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(SampleForm))
