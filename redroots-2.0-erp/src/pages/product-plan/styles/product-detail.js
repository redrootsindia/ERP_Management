/* eslint no-unused-vars: off, no-undef:off */

import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { Input, Button, Spin, Switch, Select, notification, Tag, Divider, InputNumber } from 'antd'
import ImageUpload from 'components/ImageUpload'
import { cloneDeep } from 'lodash'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import { HSNS } from '../../settings/misc/hsn/queries'
import { VENDOR_NAMES_LIST } from '../../accounts/vendors/queries'
import { PRODUCT_DETAIL_WITH_PLAN_STYLES, UPSERT_PRODUCT_DETAIL_WITH_PLAN_STYLE } from '../queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const ProductDetail = ({ user: { permissions } }) => {
  const history = useHistory()
  const { plan_id, product_id } = useParams()

  const [name, setName] = useState(undefined)
  const [year, setYear] = useState(undefined)
  const [quarter, setQuarter] = useState(undefined)

  const [categoryName, setCategoryName] = useState(undefined)
  const [subcategoryName, setSubcategoryName] = useState(undefined)
  const [type, setType] = useState(undefined)

  const [sp, setSP] = useState(0)
  const [additionalSP, setAdditionalSP] = useState(0)

  const [spError, setSPError] = useState(undefined)

  const [tp, setTP] = useState(0)
  const [mrp, setMRP] = useState(0)

  const [createdBy, setCreatedBy] = useState(undefined)
  const [createdAt, setCreatedAt] = useState(undefined)

  const [status, setStatus] = useState(undefined)

  const [plannedQuantity, setPlannedQuantity] = useState(0)
  const [plannedQuantityError, setPlannedQuantityError] = useState(0)

  const [remainingBudget, setRemainingBudget] = useState(0)

  const [vendorIDs, setVendorIDs] = useState([])
  const [vendorIDsError, setVendorIDsError] = useState(undefined)
  const [vendorsList, setVendorsList] = useState([])

  const [hsnID, setHSNID] = useState(undefined)
  const [hsnIDError, setHSNIDError] = useState(undefined)
  const [hsnList, setHSNList] = useState([])

  const [image, setImage] = useState(undefined)
  const [existingImages, setExistingImages] = useState([])
  const [imageChanged, setImageChanged] = useState(false)

  const [changesMadeForProduct, setChangesMadeForProduct] = useState(false)
  const [changesMadeForPlanStyles, seChangesMadeForPlanStyles] = useState(false)

  const [upsertProductDetailWithPlanStyle] = useMutation(UPSERT_PRODUCT_DETAIL_WITH_PLAN_STYLE)

  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(VENDOR_NAMES_LIST, { variables: { vendorIDs } })

  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorsList(vendorData.vendorNames)
  }, [vendorData, vendorLoad])

  const { loading: hsnLoad, error: hsnErr, data: hsnData } = useQuery(HSNS)

  useEffect(() => {
    if (!hsnLoad && hsnData && hsnData.hsns && hsnData.hsns.length) setHSNList(hsnData.hsns)
  }, [hsnData, hsnLoad])

  const {
    loading: productDetailLoad,
    error: productDetailErr,
    data: productDetailData,
  } = useQuery(PRODUCT_DETAIL_WITH_PLAN_STYLES, {
    variables: { product_id, product_plan_id: plan_id },
  })

  useEffect(() => {
    if (
      !productDetailLoad &&
      productDetailData &&
      productDetailData.productDetailWithPlanStyles &&
      productDetailData.productDetailWithPlanStyles
    ) {
      const { product_category, product_subcategory, vendor_ids, hsn_id, quantity, user_name } =
        productDetailData.productDetailWithPlanStyles
      if (productDetailData.productDetailWithPlanStyles.image) {
        setImage(productDetailData.productDetailWithPlanStyles.image)
        setExistingImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_PRODUCT_URL}${productDetailData.productDetailWithPlanStyles.image}`,
        ])
      }
      if (productDetailData.productDetailWithPlanStyles.name)
        setName(productDetailData.productDetailWithPlanStyles.name)

      if (productDetailData.productDetailWithPlanStyles.year)
        setYear(productDetailData.productDetailWithPlanStyles.year)

      if (productDetailData.productDetailWithPlanStyles.quarter)
        setQuarter(productDetailData.productDetailWithPlanStyles.quarter)
      if (product_category) setCategoryName(product_category)
      if (product_subcategory) setSubcategoryName(product_subcategory)
      if (productDetailData.productDetailWithPlanStyles.type)
        setType(productDetailData.productDetailWithPlanStyles.type)
      if (productDetailData.productDetailWithPlanStyles.sp) {
        setSP(productDetailData.productDetailWithPlanStyles.sp)
        setAdditionalSP(productDetailData.productDetailWithPlanStyles.sp)
      }
      if (quantity) setPlannedQuantity(quantity)
      if (vendor_ids && vendor_ids.length)
        setVendorIDs(vendor_ids.map((vendorID) => String(vendorID)))

      if (hsn_id) setHSNID(hsn_id)
      if (productDetailData.productDetailWithPlanStyles.tp)
        setTP(productDetailData.productDetailWithPlanStyles.tp)

      if (productDetailData.productDetailWithPlanStyles.mrp)
        setMRP(productDetailData.productDetailWithPlanStyles.mrp)

      if (user_name) setCreatedBy(user_name)
      if (productDetailData.productDetailWithPlanStyles.createdAt)
        setCreatedAt(productDetailData.productDetailWithPlanStyles.createdAt)
      if (productDetailData.productDetailWithPlanStyles.status)
        setStatus(productDetailData.productDetailWithPlanStyles.status)
      if (productDetailData.productDetailWithPlanStyles.remainingBudget)
        setRemainingBudget(productDetailData.productDetailWithPlanStyles.remainingBudget)
    }
  }, [productDetailData, productDetailLoad])

  const onSubmit = () => {
    setSPError(undefined)
    setPlannedQuantityError(undefined)
    setVendorIDsError(undefined)
    setHSNIDError(undefined)

    let isError = false
    if (Number(sp < 0)) {
      isError = true
      setSPError('Cost Price should be a positive number')
    }

    if (Number(plannedQuantity < 0)) {
      isError = true
      setPlannedQuantityError('Planned Quantity should be a positive number')
    }

    if (Number(plannedQuantity) * Number(sp) > Number(remainingBudget)) {
      isError = true
      setPlannedQuantityError(
        'Planned Quantity exceeds the budget remaining for this sub-category. Please visit plan details.',
      )
    }

    if (!vendorIDs || !vendorIDs.length) {
      isError = true
      setVendorIDsError('Please select one/more vendors')
    }

    if (!hsnID || Number(hsnID) === 0) {
      isError = true
      setHSNIDError('Please select a subcategory')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    upsertProductDetailWithPlanStyle({
      variables: {
        product_plan_id: plan_id,
        product_id,
        sp: Number(sp),
        quantity: Number(plannedQuantity),
        vendor_ids: vendorIDs.map((vendorID) => Number(vendorID)),
        hsn_id: Number(hsnID),
        image,
        is_image_changed: imageChanged,
        changesMadeForProduct,
        changesMadeForPlanStyles,
        status,
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        history.goBack()
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while saving Product plan.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  //   if (action === 'create' && !permissions.includes('createTicket')) return <Error403 />
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (hsnErr) return `Error occured while fetching data: ${hsnErr.message}`

  return (
    <div>
      <Helmet title="Product Detail" />

      <Spin spinning={productDetailLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-lg-2 ">
                <ImageUpload
                  existingImages={existingImages} // Always pass an array. If not empty, it should have fully-formed URLs of images
                  placeholderType="general" // Accepted values: 'general' or 'general'
                  onUploadCallback={(imgFile) => {
                    setImage(imgFile)
                    setImageChanged(true)
                    setChangesMadeForProduct(true)
                  }}
                  onRemoveCallback={() => {
                    setImage(null)
                    setImageChanged(true)
                    setChangesMadeForProduct(true)
                  }}
                  maxImages={1}
                  editMode
                />
              </div>
              <div className="col-lg-8">
                <div className="ml-2 mb-2 mt-2">Product name </div>
                <div className="ml-2 mb-2">
                  <h4>
                    <strong>{`${name} - ${quarter} ${year}`}</strong>
                  </h4>
                </div>
                <div className="row">
                  <div className="col-lg-7">
                    <Tag color="#2DB7F5">
                      <strong>{categoryName}</strong>
                    </Tag>
                    <Tag color="#465036">
                      <strong>{subcategoryName}</strong>
                    </Tag>
                    <Tag color="#87d068">
                      <strong>{type}</strong>
                    </Tag>
                  </div>
                  <div className="col-lg-5">
                    <span className="mr-2"> Status</span>
                    <Switch
                      checked={status}
                      onChange={(checked) => {
                        setStatus(checked)
                        setChangesMadeForProduct(true)
                      }}
                    />
                  </div>
                </div>
                <div className="row mt-4 ml-2">
                  <div className="col-lg-5">
                    <div className="mb-2">Estimated Cost Price</div>
                    <InputNumber
                      value={sp}
                      onChange={(value) => {
                        setSP(value)
                        setChangesMadeForProduct(true)
                      }}
                      className={spError ? 'custom-error-border' : ''}
                    />
                    <div className="custom-error-text mb-4">{spError || ''}</div>
                  </div>
                  <div className="col-lg-5">
                    <div className="mb-2">Planned Production Quantity</div>
                    <InputNumber
                      value={plannedQuantity}
                      onChange={(value) => {
                        setPlannedQuantity(value)
                        seChangesMadeForPlanStyles(true)
                      }}
                      className={plannedQuantityError ? 'custom-error-border' : ''}
                    />
                    <div className="custom-error-text mb-4">{plannedQuantityError || ''}</div>
                  </div>
                </div>
                <div className="row mt-4 ml-2">
                  <div className="col-lg-6">
                    <div className="mb-2">
                      Vendors<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      mode="multiple"
                      showSearch
                      value={vendorIDs}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setVendorIDs(value)
                        setChangesMadeForProduct(true)
                      }}
                      className={vendorIDsError ? 'custom-error-border' : ''}
                      placeholder="Select vendor(s)"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {vendorsList && vendorsList.length
                        ? vendorsList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {`${obj.company} (${obj.name})`}
                            </Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{vendorIDsError || ''}</div>
                  </div>
                  <div className="col-lg-5">
                    <div className="mb-2">
                      HSN<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={hsnID}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setHSNID(value)
                        setChangesMadeForProduct(true)
                      }}
                      className={hsnIDError ? 'custom-error-border' : ''}
                      placeholder="Select a HSN"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {hsnList && hsnList.length
                        ? hsnList.map((obj) => (
                            <Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{hsnIDError || ''}</div>
                  </div>
                </div>
              </div>
            </div>
            <Divider orientation="left" orientationMargin="0">
              Addition Details
            </Divider>
            <div className="row">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-lg-2">
                    <strong>Transfer Price : </strong>
                  </div>
                  <div className="col-lg-2">{`₹ ${tp}`}</div>
                </div>
                <div className="row">
                  <div className="col-lg-2">
                    <strong>Selling Price : </strong>
                  </div>

                  <div className="col-lg-2"> {`₹ ${additionalSP}`}</div>
                </div>
                <div className="row">
                  <div className="col-lg-2">
                    <strong>MRP : </strong>
                  </div>
                  <div className="col-lg-2"> {`₹ ${mrp}`}</div>
                </div>
                <div className="row">
                  <div className="col-lg-2">
                    <strong>Created By : </strong>
                  </div>
                  <div className="col-lg-2">{createdBy}</div>
                </div>
                <div className="row">
                  <div className="col-lg-2">
                    <strong>Created At : </strong>
                  </div>
                  <div className="col-lg-2">
                    {moment(Number(createdAt)).format('Do MMM YYYY') || '-'}
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-4 mb-4 ml-2">
              <Button type="primary" onClick={onSubmit}>
                Save
              </Button>
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
export default withRouter(connect(mapStateToProps)(ProductDetail))
