import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  Input,
  Button,
  Spin,
  InputNumber,
  Select,
  Switch,
  Col,
  Row,
  notification,
  Checkbox,
} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { groupBy, flatten, uniq, cloneDeep, uniqBy, filter as lodashFilter } from 'lodash'
import Error403 from 'components/Errors/403'
import PackComponent from './PackComponent'
import { PRODUCTS, PRODUCT, UPSERT_PACK, PACK } from './queries'
import { PRODUCTS_BY_IDS } from '../products/all-products/queries'
import { BRANDS } from '../settings/misc/brands/queries'
import { PRODUCT_CATS } from '../settings/product-settings/categories/queries'
import { PRODUCT_SUBCAT_BY_CAT_ID } from '../settings/product-settings/subcategories/queries'
import { VENDORS } from '../accounts/vendors/queries'
import { HSNS } from '../settings/misc/hsn/queries'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const PackForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [packsDetail, setPacksDetail] = useState([])

  const [packsData, setPackData] = useState([])
  const [containsSameProduct, setContainsSameProduct] = useState(undefined)
  const [count, setCount] = useState(0)

  const [packOf, setPackOf] = useState(undefined)
  const [packOfError, setPackOfError] = useState(undefined)

  const [description, setDescription] = useState(undefined)

  const [sp, setSp] = useState(0)
  const [spError, setSpError] = useState(undefined)

  const [tp, setTp] = useState(0)
  const [tpError, setTpError] = useState(undefined)

  const [mrp, setMrp] = useState(0)
  const [mrpError, setMrpError] = useState(undefined)

  const [vendorIDs, setVendorIDs] = useState([])

  const [hsnID, setHsnID] = useState(undefined)
  const [hsnIDError, setHsnIDError] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updatePack')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [disabledUpdate, setDisabledUpdate] = useState(false)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [brandID, setBrandID] = useState(undefined)
  const [brandIDError, setBrandIDError] = useState(undefined)
  const [brandsList, setBrandsList] = useState([])

  const [categoryID, setCategoryID] = useState(undefined)
  const [categoryIDError, setCategoryIDError] = useState(undefined)
  const [categoriesList, setCategoriesList] = useState([])

  const [subcategoryID, setSubcategoryID] = useState(undefined)
  const [subcategoryIDError, setSubcategoryIDError] = useState(undefined)
  const [subcategoriesList, setSubcategoriesList] = useState([])

  const [products, setProducts] = useState([])
  const [productIDs, setProductIDs] = useState({})
  const [currentProdIDIndex, setCurrentProdIDIndex] = useState(undefined)
  const [productVariants, setProductVariants] = useState([])

  const [vendorList, setVendorList] = useState([])
  const [hsns, setHsns] = useState([])

  const [upsertPack] = useMutation(UPSERT_PACK)

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  const { loading: catLoad, error: catErr, data: catData } = useQuery(PRODUCT_CATS)
  const { loading: vendorLoad, error: vendorErr, data: vendorData } = useQuery(VENDORS)
  const { loading: hsnLoad, error: hsnErr, data: hsnData } = useQuery(HSNS)

  const {
    loading: subcatLoad,
    error: subcatErr,
    data: subcatData,
  } = useQuery(PRODUCT_SUBCAT_BY_CAT_ID, { variables: { product_category_id: categoryID } })

  const { loading: singlePackLoad, error: singlePackErr, data: singlePackData } = useQuery(PACK, {
    variables: { id },
  })

  const [getProductsList, { loading: prodLoad, error: prodErr, data: prodData }] = useLazyQuery(
    PRODUCTS,
  )

  const [
    getProductVariants,
    { loading: prodVariantLoad, error: prodVariantErr, data: prodVariantData },
  ] = useLazyQuery(PRODUCT)

  const { loading: productByIDsLoad, error: productByIDsErr, data: productByIDsData } = useQuery(
    PRODUCTS_BY_IDS,
    {
      variables: {
        ids: productIDs && Object.keys(productIDs).length ? Object.values(productIDs) : [],
      },
    },
  )

  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length)
      setBrandsList(brandData.brands)
  }, [brandData, brandLoad])

  useEffect(() => {
    if (!catLoad && catData && catData.productCategories && catData.productCategories.length)
      setCategoriesList(catData.productCategories)
  }, [catData, catLoad])

  // prettier-ignore
  useEffect(() => {
    if (subcatData && subcatData.productSubcategoryByCategoryID && subcatData.productSubcategoryByCategoryID.length)
      setSubcategoriesList(subcatData.productSubcategoryByCategoryID)
  }, [subcatData])

  // prettier-ignore
  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendors && vendorData.vendors.rows && vendorData.vendors.rows.length)
      setVendorList(vendorData.vendors.rows)
  }, [vendorLoad, vendorData])

  useEffect(() => {
    if (!hsnLoad && hsnData && hsnData.hsns && hsnData.hsns.length) setHsns(hsnData.hsns)
  }, [setHsns, hsnData])

  // prettier-ignore
  useEffect(() => {
    if (!prodLoad && prodData && prodData.products && prodData.products.rows && prodData.products.rows.length)
      setProducts(prodData.products.rows)
    else setProducts([])
  }, [prodLoad, prodData])

  useEffect(() => {
    if (
      !prodVariantLoad &&
      prodVariantData &&
      prodVariantData.product &&
      prodVariantData.product.variants &&
      prodVariantData.product.variants.length
    ) {
      const { name, image, variants } = prodVariantData.product
      let tempVariantObj
      let tempProductsObj
      if (containsSameProduct) {
        tempVariantObj = []
        tempProductsObj = []
        variants.forEach((item) => {
          tempVariantObj.push({
            product_id: prodVariantData.product.id,
            variant_id: item.id,
            code: item.code,
            name,
            image,
          })
        })
        tempProductsObj.push(tempVariantObj)
        setProductVariants(tempProductsObj)
      } else if (action === 'update' && !containsSameProduct) {
        tempVariantObj = []
        tempProductsObj = []
        variants.forEach((item) => {
          tempVariantObj.push({
            product_id: prodVariantData.product.id,
            variant_id: item.id,
            code: item.code,
            name,
            image,
          })
        })
        tempProductsObj.push(tempVariantObj)
        setProductVariants(tempProductsObj)
      } else {
        tempVariantObj = []
        tempProductsObj = cloneDeep(productVariants)
        variants.forEach((item) => {
          tempVariantObj.push({
            product_id: prodVariantData.product.id,
            variant_id: item.id,
            code: item.code,
            name,
            image,
          })
        })

        tempProductsObj[currentProdIDIndex] = tempVariantObj
        setProductVariants(tempProductsObj)
      }
    }
  }, [prodVariantLoad, prodVariantData])

  useEffect(() => {
    if (
      !productByIDsLoad &&
      productByIDsData &&
      productByIDsData.productsByIDs &&
      productByIDsData.productsByIDs.length
    ) {
      const tempProductsObj = []
      const tempProductIDs = {}
      productByIDsData.productsByIDs.forEach((product, i) => {
        const { name, image, variants } = product
        const tempVariantObj = []
        variants.forEach((item) => {
          tempVariantObj.push({
            product_id: product.id,
            variant_id: item.id,
            code: item.code,
            name,
            image,
          })
        })
        tempProductIDs[i] = product.id
        tempProductsObj.push(tempVariantObj)
      })
      setProductIDs(tempProductIDs)
      setProductVariants(tempProductsObj)
    }
  }, [productByIDsLoad, productByIDsData])

  useEffect(async () => {
    if (!singlePackLoad && singlePackData && singlePackData.pack) {
      const {
        brand_id,
        category_id,
        sub_category_id,
        contains_same_product,
        pack_of,
        packs,
      } = singlePackData.pack

      const tempPacksData = []
      const tempPacksDetail = []
      let tempProductIDs = []
      let productIDsSet = false
      packs.forEach((item, index) => {
        if (!productIDsSet && item.pack_variant_detail && item.pack_variant_detail.length) {
          tempProductIDs = item.pack_variant_detail.map((obj) => obj.product_id)
          productIDsSet = true
        }

        tempPacksData.push({
          key: index,
          isError: false,
          packDiv: [
            {
              key: index,
              id: item.id,
              packCode: item.code,
              ean: item.ean,
              asin: item.asin,
              packImage: item.image
                ? [
                    `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_PRODUCT_URL}${item.image}`,
                  ]
                : [],
              is_image_changed: undefined,
              productVariantObjs: item.pack_variant_detail.map((productVariant) => ({
                id: productVariant.id,
                pack_id: productVariant.pack_id,
                product_id: productVariant.product_id,
                variant_id: productVariant.variant_id,
              })),
            },
          ],
          divError: {
            packCode: '',
            packImage: '',
            is_image_changed: '',
            productVariantObjs: {},
          },
        })

        tempPacksDetail.push({
          key: index,
          id: item.id,
          packCode: item.code,
          ean: item.ean,
          asin: item.asin,
          packImage: item.image
            ? [
                `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_PRODUCT_URL}${item.image}`,
              ]
            : [],
          is_image_changed: undefined,
          productVariantObjs: item.pack_variant_detail.map((productVariant) => ({
            id: productVariant.id,
            pack_id: productVariant.pack_id,
            product_id: productVariant.product_id,
            variant_id: productVariant.variant_id,
          })),
        })
      })

      getProductsList({
        variables: {
          brandIDs: brand_id ? [brand_id] : [],
          categoryIDs: category_id ? [category_id] : [],
          subcategoryIDs: sub_category_id ? [sub_category_id] : [],
        },
      })

      setProductIDs(Object.assign({}, tempProductIDs))
      setDisabledUpdate(true)
      setPackOf(pack_of)
      setBrandID(brand_id)
      setCategoryID(category_id)
      setSubcategoryID(sub_category_id)
      setContainsSameProduct(contains_same_product)
      setDescription(singlePackData.pack.description)
      setSp(singlePackData.pack.sp)
      setTp(singlePackData.pack.tp)
      setMrp(singlePackData.pack.mrp)
      setVendorIDs(singlePackData.pack.vendor_ids)
      setHsnID(singlePackData.pack.hsn_id)
      setPackData(tempPacksData)
      setPacksDetail(tempPacksDetail)
      setCount(tempPacksData.length)
    }
  }, [singlePackData])

  useEffect(() => {
    getProductsList({
      variables: {
        brandIDs: brandID ? [brandID] : [],
        categoryIDs: categoryID ? [categoryID] : [],
        subcategoryIDs: subcategoryID ? [subcategoryID] : [],
      },
    })
  }, [brandID, categoryID, subcategoryID])

  const addPack = () => {
    setPackData([
      ...packsData,
      {
        key: count,
        isError: false,
        packDiv: [],
        divError: { packCode: '', productVariantObjs: {} },
      },
    ])
    setCount(count + 1)
  }

  const deletePack = (packID) => {
    const tempPackData = []
    packsData.forEach((pack) => {
      if (pack.key !== packID) tempPackData.push(pack)
    })
    const tempPacksDetail = JSON.parse(JSON.stringify(packsDetail))
    delete tempPacksDetail[packID]
    setPackData(tempPackData)
    setPacksDetail(tempPacksDetail)
  }

  const getProducts = () => {
    const product = []
    if (containsSameProduct) {
      product.push(
        products && products.length ? (
          <div className="col-lg-4" key={0}>
            <div className="mb-1">
              Select Product
              <span className="custom-error-text"> *</span>
            </div>
            <Select
              showSearch
              value={productIDs[0]}
              onChange={(value) => {
                setProductIDs({ ...productIDs, 0: value })
                setCurrentProdIDIndex(0)
                getProductVariants({ variables: { id: value } })
              }}
              style={{ width: '100%' }}
              disabled={disabled || disabledUpdate}
            >
              {products.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
            <div className="custom-error-text mb-4" />
          </div>
        ) : null,
      )
    } else {
      for (let i = 0; i < packOf; i += 1) {
        product.push(
          products && products.length ? (
            <div className="col-lg-4" key={i}>
              <div className="mb-1">
                Select Product {i + 1}
                <span className="custom-error-text"> *</span>
              </div>
              <Select
                showSearch
                value={productIDs[i]}
                onChange={(value) => {
                  setProductIDs({ ...productIDs, [i]: value })
                  setCurrentProdIDIndex(i)
                  getProductVariants({ variables: { id: value } })
                }}
                style={{ width: '100%' }}
                disabled={disabled || disabledUpdate}
              >
                {products.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
              <div className="custom-error-text mb-4" />
            </div>
          ) : null,
        )
      }
    }

    return <div className="row mb-4">{product}</div>
  }

  const getPackData = async (packDetail, uniqueKey) => {
    setPacksDetail({ ...packsDetail, [uniqueKey]: { ...packDetail } })
  }

  const onSubmit = () => {
    let isError = false
    let isProductError = false
    let isVariantError = false

    if (!packOf) {
      setPackOfError('Please select Pack Size.')
      isError = true
    } else {
      setPackOfError('')
    }
    if (!brandID) {
      setBrandIDError('Please select Brand.')
      isError = true
    } else {
      setBrandIDError('')
    }
    if (!categoryID) {
      setCategoryIDError('Please select Category.')
      isError = true
    } else {
      setCategoryIDError('')
    }
    if (!subcategoryID) {
      setSubcategoryIDError('Please select Sub-Category.')
      isError = true
    } else {
      setSubcategoryIDError('')
    }
    if (Number(sp) < 0) {
      setSpError('Selling Price should be a positive number')
      isError = true
    } else {
      setSpError('')
    }
    if (Number(tp) < 0) {
      setTpError('Transfer Price should be a positive number')
      isError = true
    } else {
      setTpError('')
    }
    if (Number(mrp) < 0) {
      setMrpError('MRP should be a positive number')
      isError = true
    } else {
      setMrpError('')
    }
    if (!hsnID) {
      setHsnIDError('Please Select HSN ID')
      isError = true
    } else {
      setHsnIDError()
    }
    if (
      Object.keys(productIDs).length === 0 ||
      (!containsSameProduct && Object.keys(productIDs).length !== Number(packOf))
    ) {
      isProductError = true
    }

    const interMediatePackData = cloneDeep(packsData)

    Object.values(packsDetail).forEach((packdetail, index) => {
      if (packdetail.key === interMediatePackData[index].key) {
        if (!packdetail.packCode) {
          interMediatePackData[index].divError.packCode = 'Please Enter Pack Code'
          isError = true
        } else {
          interMediatePackData[index].divError.packCode = ''
        }
        if (containsSameProduct) {
          if (Object.keys(packdetail.productVariantObjs).length === 0) {
            isVariantError = true
          }
        } else if (
          !containsSameProduct &&
          Object.keys(packdetail.productVariantObjs).length === 0
        ) {
          isVariantError = true
        } else if (
          !containsSameProduct &&
          Object.keys(packdetail.productVariantObjs).length !== Number(packOf)
        ) {
          isVariantError = true
        }
      }
    })

    setPackData(interMediatePackData)

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    if (isProductError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please select Product details',
      })
      return
    }

    if (isVariantError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please select variant details',
      })
      return
    }

    if (interMediatePackData.length === 0) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Pack Details Cannot be Empty, please Add The Pack',
      })
      return
    }

    const nonEmptyCodes = Object.values(packsDetail).filter((obj) => !!obj.packCode)
    if (
      uniqBy(nonEmptyCodes, (obj) => obj.packCode.toLowerCase().trim()).length !==
      nonEmptyCodes.length
    ) {
      notification.error({
        message: (
          <>
            <strong>
              Some Pack-Codes are <u>REPEATED</u>.
            </strong>
          </>
        ),
        description: 'Please make sure that all the Pack-Codes are unique.',
      })
      return
    }

    const nonEmptyEANs = Object.values(packsDetail).filter((obj) => !!obj.ean)
    if (
      uniqBy(nonEmptyEANs, (obj) => obj.ean.toLowerCase().trim()).length !== nonEmptyEANs.length
    ) {
      notification.error({
        message: (
          <>
            <strong>
              Some EAN-Codes are <u>REPEATED</u>.
            </strong>
          </>
        ),
        description: 'Please make sure that all the entered EAN-Codes are unique.',
      })
      return
    }

    const nonEmptyASINs = Object.values(packsDetail).filter((obj) => !!obj.asin)
    if (
      uniqBy(nonEmptyASINs, (obj) => obj.asin.toLowerCase().trim()).length !== nonEmptyASINs.length
    ) {
      notification.error({
        message: (
          <>
            <strong>
              Some ASIN-Codes are <u>REPEATED</u>.
            </strong>
          </>
        ),
        description: 'Please make sure that all the entered EAN-Codes are unique.',
      })
      return
    }

    // const nonEmptyVariants = []
    // let VariantDetail = []
    // Object.values(packsDetail).forEach((item) => {
    //   VariantDetail = []
    //   Object.values(item.productVariantObjs).forEach((productVariant) => {
    //     VariantDetail.push(productVariant.variant_id)
    //   })
    //   nonEmptyVariants.push({ variantIDs: VariantDetail })
    // })

    const groupped = groupBy(packsDetail, (obj) => obj.variantIDs)

    if (uniq(flatten(lodashFilter(groupped, (arr) => arr.length > 1))).length) {
      notification.error({
        message: (
          <>
            <strong>
              The variant-pairs are <u>REPEATED</u>.
            </strong>
          </>
        ),
        description: 'Please make sure that all the packs have unique pairs of variants.',
      })
      return
    }

    const mutationVariables = {
      upsertType: id ? 'update' : 'create',
      id,
      brand_id: brandID,
      category_id: categoryID,
      sub_category_id: subcategoryID,
      pack_of: Number(packOf),
      contains_same_product: containsSameProduct,
      description,
      sp,
      tp,
      mrp,
      vendor_ids: vendorIDs,
      hsn_id: hsnID,
      pack_input: Object.values(packsDetail).map((item) => ({
        id: item.id ? Number(item.id) : null,
        isNew: item.isNew || false,
        name: item.packName,
        code: item.packCode,
        ean: item.ean,
        asin: item.asin,
        image: item.packImage || null,
        is_image_changed: item.is_image_changed,
        pack_variant_detail_input: containsSameProduct
          ? [
              {
                id: item.productVariantObjs[0].id ? Number(item.productVariantObjs[0].id) : null,
                product_id: Number(item.productVariantObjs[0].product_id),
                variant_id: Number(item.productVariantObjs[0].variant_id),
              },
            ]
          : Object.values(item.productVariantObjs).map((productVariant) => ({
              id: productVariant.id ? Number(productVariant.id) : null,
              product_id: Number(productVariant.product_id),
              variant_id: Number(productVariant.variant_id),
            })),
      })),
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )
    upsertPack({
      variables: mutationVariables,
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/packs/')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving pack details.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readPack')) return <Error403 />
  if (action === 'create' && !permissions.includes('createPack')) return <Error403 />
  if (catErr) return `Error occured while fetching data: ${catErr.message}`
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (prodErr) return `Error occured while fetching data: ${prodErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (hsnErr) return `Error occured while fetching data: ${hsnErr.message}`
  if (prodVariantErr) return `Error occured while fetching data: ${prodVariantErr.message}`
  if (singlePackErr) return `Error occured while fetching data: ${singlePackErr.message}`
  if (productByIDsErr) return `Error occured while fetching data: ${productByIDsErr.message}`

  return (
    <div>
      <Helmet title="Packs" />

      <Spin spinning={singlePackLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-1">
              <strong>Pack Generator</strong>
            </h5>
          </div>
          {action === 'update' && permissions.includes('updatePack') ? (
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

        <div className="row">
          <div className="col-xl-12 col-lg-12">
            <div className="card">
              <div className="card-body">
                <h6 className="text-black mb-4">
                  <strong>GENERAL DETAILS</strong>
                </h6>
                <div className="row mb-4">
                  <div className="col-lg-1">
                    <div className="mb-1">
                      Pack Of<span className="custom-error-text"> *</span>
                    </div>
                  </div>
                  <div className="col-lg-2">
                    <Select
                      value={packOf}
                      disabled={disabled || disabledUpdate}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setPackOf(value)
                      }}
                      className={
                        packOfError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select Pack Size"
                    >
                      <Option key="2" value="2">
                        2
                      </Option>
                      <Option key="3" value="3">
                        3
                      </Option>
                      <Option key="4" value="4">
                        4
                      </Option>
                      <Option key="5" value="5">
                        5
                      </Option>
                      <Option key="6" value="6">
                        6
                      </Option>
                    </Select>
                    <div className="custom-error-text mb-4">{packOfError || ''}</div>
                  </div>
                  <div className="col-lg-3">
                    <Checkbox
                      checked={containsSameProduct}
                      disabled={disabled || disabledUpdate}
                      onChange={({ target: { checked } }) => {
                        setProductIDs({})
                        setProductVariants([])
                        setContainsSameProduct(checked)
                      }}
                    >
                      Contains Same Product
                    </Checkbox>
                  </div>
                </div>

                {packOf ? (
                  <>
                    <div className="row mb-4">
                      <div className="col-lg-4">
                        <div className="mb-1">
                          Brand<span className="custom-error-text"> *</span>
                        </div>
                        <Select
                          showSearch
                          value={brandID}
                          disabled={disabled || disabledUpdate}
                          style={{ width: '100%' }}
                          onChange={(value) => {
                            setBrandID(value)
                            setProductIDs({})
                            setProductVariants([])
                          }}
                          className={
                            brandIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                          placeholder="Select a brand"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {brandsList && brandsList.length
                            ? brandsList.map((obj) => (
                                <Option key={String(obj.id)} value={String(obj.id)}>
                                  {obj.name}
                                </Option>
                              ))
                            : null}
                        </Select>
                        <div className="custom-error-text mb-4">{brandIDError || ''}</div>
                      </div>

                      <div className="col-lg-4">
                        <div className="mb-1">
                          Product Category<span className="custom-error-text"> *</span>
                        </div>
                        {brandID ? (
                          <Select
                            showSearch
                            value={categoryID}
                            disabled={disabled || disabledUpdate}
                            style={{ width: '100%' }}
                            onChange={(value) => {
                              setCategoryID(value)
                              setProductIDs({})
                              setProductVariants([])
                            }}
                            className={
                              categoryIDError
                                ? 'custom-error-border'
                                : disabled
                                ? 'disabledStyle'
                                : ''
                            }
                            placeholder="Select a category"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {categoriesList && categoriesList.length
                              ? categoriesList.map((obj) => (
                                  <Option key={String(obj.id)} value={String(obj.id)}>
                                    {obj.name}
                                  </Option>
                                ))
                              : null}
                          </Select>
                        ) : (
                          <div>(Please select a brand first)</div>
                        )}

                        <div className="custom-error-text mb-4">{categoryIDError || ''}</div>
                      </div>

                      <div className="col-lg-4">
                        <div className="mb-1">
                          Product Subcategory<span className="custom-error-text"> *</span>
                        </div>

                        {categoryID ? (
                          subcatLoad ? (
                            <div>Loading ...</div>
                          ) : (
                            <Select
                              showSearch
                              value={subcategoryID}
                              disabled={disabled || disabledUpdate}
                              style={{ width: '100%' }}
                              onChange={(value) => {
                                setSubcategoryID(value)
                                setProductIDs({})
                                setProductVariants([])
                              }}
                              className={
                                subcategoryIDError
                                  ? 'custom-error-border'
                                  : disabled
                                  ? 'disabledStyle'
                                  : ''
                              }
                              placeholder="Select a subcategory"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {subcategoriesList && subcategoriesList.length
                                ? subcategoriesList.map((obj) => (
                                    <Option key={String(obj.id)} value={String(obj.id)}>
                                      {obj.name}
                                    </Option>
                                  ))
                                : null}
                            </Select>
                          )
                        ) : (
                          <div>(Please select a category first)</div>
                        )}
                        <div className="custom-error-text mb-4">{subcategoryIDError || ''}</div>
                      </div>
                    </div>

                    {brandID && categoryID && subcategoryID ? getProducts() : null}

                    <div className="row mb-4">
                      <div className="col-lg-12">
                        <div className="mb-1">Pack Description</div>
                        <Input.TextArea
                          value={description}
                          onChange={({ target: { value } }) => setDescription(value)}
                          disabled={disabled}
                        />
                        <div className="custom-error-text mb-4" />
                      </div>
                    </div>

                    <Row className="mb-4">
                      <Col span={3} className="custom-pad-r1">
                        <div className="mb-1">
                          Selling Price<span className="custom-error-text"> *</span>
                        </div>
                        <InputNumber
                          value={sp}
                          className={
                            spError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                          onChange={(value) => setSp(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                        <div className="custom-error-text mb-4">{spError || ''}</div>
                      </Col>
                      <Col span={3} className="custom-pad-r1">
                        <div className="mb-1">
                          Transfer Price<span className="custom-error-text"> *</span>
                        </div>
                        <InputNumber
                          value={tp}
                          className={
                            tpError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                          onChange={(value) => setTp(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                        <div className="custom-error-text mb-4">{tpError || ''}</div>
                      </Col>
                      <Col span={3} className="custom-pad-r1">
                        <div className="mb-1">
                          MRP<span className="custom-error-text"> *</span>
                        </div>
                        <InputNumber
                          value={mrp}
                          className={
                            mrpError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                          onChange={(value) => setMrp(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                        <div className="custom-error-text mb-4">{mrpError || ''}</div>
                      </Col>
                      <Col span={5} className="custom-pad-r1">
                        <div className="mb-1">
                          HSN<span className="custom-error-text"> *</span>
                        </div>
                        <Select
                          showSearch
                          value={hsnID}
                          className={
                            hsnIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                          onChange={(value) => setHsnID(value)}
                          style={{ width: '100%' }}
                          disabled={disabled}
                        >
                          {hsns.map((item) => (
                            <Option key={item.id} value={item.id}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
                        <div className="custom-error-text mb-4">{hsnIDError || ''}</div>
                      </Col>
                      <Col span={10} className="custom-pad-r1">
                        <div className="mb-1">Select Vendors</div>
                        <Select
                          mode="multiple"
                          showSearch
                          value={vendorIDs}
                          onChange={(value) => setVendorIDs(value)}
                          style={{ width: '100%' }}
                          disabled={disabled}
                        >
                          {vendorList.map((item) => (
                            <Option key={item.id} value={item.id}>
                              {`${item.name} (${item.company})`}
                            </Option>
                          ))}
                        </Select>
                      </Col>
                    </Row>

                    {productVariants && productVariants.length ? (
                      <div className="row mb-4">
                        <div className="col-lg-3">
                          <Button type="primary" onClick={addPack} disabled={disabled}>
                            Add Pack
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>

            {packsData && packsData.length
              ? packsData.map((p, i) => {
                  let className = ''
                  if (p.isError) className += 'errorDiv custom-pad-t1 custom-pad-l1 custom-pad-r1'
                  return (
                    <div className={className}>
                      <PackComponent
                        uniqueKey={p.key}
                        key={i}
                        deletePack={deletePack}
                        productVariants={productVariants}
                        vendorList={vendorList}
                        hsns={hsns}
                        packDiv={p.packDiv}
                        getPackData={getPackData}
                        packOf={packOf}
                        divError={p.divError}
                        containsSameProduct={containsSameProduct}
                        action={action}
                      />
                    </div>
                  )
                })
              : null}
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {permissions.includes('createPack') || permissions.includes('updatePack') ? (
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

export default withRouter(connect(mapStateToProps)(PackForm))
