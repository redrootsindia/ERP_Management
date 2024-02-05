/* eslint "no-unused-vars": "off" */
import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
// prettier-ignore
import { Input, InputNumber, Button, Spin, Switch, Select, Divider, Tabs, Table, Checkbox, message, Popconfirm, notification } from 'antd'
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons'
// prettier-ignore
import {
  debounce, cloneDeep, sortBy, union, isEqual, intersection, uniqBy,
  // groupBy, uniq, flatten, filter as lodashFilter,
} from 'lodash'
import ImageUpload from 'components/ImageUpload'
import FileUpload from 'components/FileUpload'
import Error403 from 'components/Errors/403'
import { PRODUCT, UPSERT_PRODUCT, GROUPED_ATTRIBUTE_VALUES, MARGIN_BY_PRODUCT_ID } from './queries'
import { BRANDS } from '../../settings/misc/brands/queries'
import { HSNS } from '../../settings/misc/hsn/queries'
import { PRODUCT_CATS } from '../../settings/product-settings/categories/queries'
import { PRODUCT_SUBCAT_BY_CAT_ID } from '../../settings/product-settings/subcategories/queries'
import { PRODUCT_SPECIFICATIONS } from '../../settings/qc-settings/product-specifications/queries'
import { VENDOR_NAMES_LIST } from '../../accounts/vendors/queries'
import { BUYER_NAME_LIST } from '../../sales-orders/all-sales-orders/queries'
import { UOMS } from '../../settings/misc/uom/queries'
import PDFDownload from './pdfDownload'
import Costing from '../../costing/form'

const { TabPane } = Tabs
const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const ProductForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [name, setName] = useState(undefined)
  const [nameError, setNameError] = useState(undefined)
  const [code, setCode] = useState(undefined)
  const [codeExists, setCodeExists] = useState(false)
  const [codeError, setCodeError] = useState(undefined)

  const [image, setImage] = useState(undefined)
  const [existingImages, setExistingImages] = useState([])
  const [imageChanged, setImageChanged] = useState(false)

  const [brandID, setBrandID] = useState(undefined)
  const [brandIDError, setBrandIDError] = useState(undefined)
  const [brandsList, setBrandsList] = useState([])

  const [categoryID, setCategoryID] = useState(undefined)
  const [categoryIDError, setCategoryIDError] = useState(undefined)
  const [categoriesList, setCategoriesList] = useState([])

  const [subcategoryID, setSubcategoryID] = useState(undefined)
  const [subcategoryIDError, setSubcategoryIDError] = useState(undefined)
  const [subcategoriesList, setSubcategoriesList] = useState([])

  const [vendorIDs, setVendorIDs] = useState([])
  const [vendorIDsError, setVendorIDsError] = useState(undefined)
  const [vendorsList, setVendorsList] = useState([])
  const [vendorSearchString, setVendorSearchString] = useState(null)

  const [groupedAttributeValues, setGroupedAttributeValues] = useState([])
  const [attributeValueIDs, setAttributeValueIDs] = useState([])
  const [variantAttributeIDs, setVariantAttributeIDs] = useState([])
  const [variantCheckValues, setVariantCheckValues] = useState([])
  const [attributeValuesToAppend, setAttributeValuesToAppend] = useState([])

  const [variants, setVariants] = useState([])
  const [variantExistingImages, setVariantExistingImages] = useState({})

  const [hsnID, setHSNID] = useState(undefined)
  const [hsnIDError, setHSNIDError] = useState(undefined)
  const [hsnList, setHSNList] = useState([])

  const [uomList, setUOMList] = useState([])

  const [productQCSpecs, setProductQCSpecs] = useState([])
  // const [productQCSpecsError, setProductQCSpecsError] = useState(undefined)
  const [qcSpecsList, setQCSpecsList] = useState([])

  const [sp, setSP] = useState(0)
  const [spError, setSPError] = useState(undefined)
  const [tp, setTP] = useState(0)
  const [tpError, setTPError] = useState(undefined)
  const [mrp, setMRP] = useState(0)
  const [mrpError, setMRPError] = useState(undefined)

  const [productDescription, setProductDescription] = useState(undefined)

  const [productLength, setProductLength] = useState(0)
  const [productWidth, setProductWidth] = useState(0)
  const [productHeight, setProductHeight] = useState(0)
  const [productWeight, setProductWeight] = useState(0)

  const [packageLength, setPackageLength] = useState(0)
  const [packageWidth, setPackageWidth] = useState(0)
  const [packageHeight, setPackageHeight] = useState(0)
  const [packageWeight, setPackageWeight] = useState(0)

  const [igst, setIGST] = useState(undefined)

  const [version, setVersion] = useState(undefined)

  const [styles, setStyles] = useState(0)
  const [disabledStyles, setDisabledStyles] = useState(false)

  const [marginTableData, setMarginTableData] = useState([])

  const [buyers, setBuyers] = useState([])
  const [existingBuyerIDs, setExistingBuyerIDs] = useState([])
  const [vendors, setVendors] = useState([])
  const [buyerMarginSearchString, setBuyerMarginSearchString] = useState(null)
  const [vendorMarginSearchString, setVendorMarginSearchString] = useState(null)

  const [deletedBuyerMarginIDs, setDeletedBuyerMarginIDs] = useState([])
  const [deletedVendorMarginIDs, setDeletedVendorMarginIDs] = useState([])

  const [uploadedPhotoshoots, setUploadedPhotoshoots] = useState([])
  const [existingPhotoshoots, setExistingPhotoshoots] = useState([])
  const [deletedPhotoshoots, setDeletedPhotoshoots] = useState([])

  const [uploadedPhotoshootsVideos, setUploadedPhotoshootsVideos] = useState([])
  const [existingPhotoshootsVideos, setExistingPhotoshootsVideos] = useState([])
  const [deletedPhotoshootsVideos, setDeletedPhotoshootsVideos] = useState([])

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateProduct')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertProduct] = useMutation(UPSERT_PRODUCT)

  const { loading: hsnLoad, error: hsnErr, data: hsnData } = useQuery(HSNS)
  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  const { loading: catLoad, error: catErr, data: catData } = useQuery(PRODUCT_CATS)
  const { loading: uomLoad, error: uomErr, data: uomData } = useQuery(UOMS)

  const {
    loading: specsListLoad,
    error: specsListErr,
    data: specsListData,
  } = useQuery(PRODUCT_SPECIFICATIONS)

  const {
    loading: groupedLoad,
    error: groupedErr,
    data: groupedAttributeValuesData,
  } = useQuery(GROUPED_ATTRIBUTE_VALUES)

  const {
    loading: subcatLoad,
    error: subcatErr,
    data: subcatData,
  } = useQuery(PRODUCT_SUBCAT_BY_CAT_ID, { variables: { product_category_id: categoryID } })

  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(VENDOR_NAMES_LIST, { variables: { searchString: vendorSearchString, vendorIDs } })

  const {
    loading: productLoad,
    error: productErr,
    data: productData,
  } = useQuery(PRODUCT, { variables: { id } })

  const {
    loading: marginLoad,
    error: marginErr,
    data: marginData,
  } = useQuery(MARGIN_BY_PRODUCT_ID, { variables: { product_id: id } })

  const {
    loading: buyerMarginLoad,
    error: buyerMarginErr,
    data: buyerMarginData,
  } = useQuery(BUYER_NAME_LIST, {
    variables: {
      buyerIDs: existingBuyerIDs,
      searchString: buyerMarginSearchString,
    },
  })

  const {
    loading: vendorMarginLoad,
    error: vendorMarginErr,
    data: vendorMarginData,
  } = useQuery(VENDOR_NAMES_LIST, {
    variables: { vendorTypeIDs: [1, 2], searchString: vendorMarginSearchString, vendorIDs },
  })

  useEffect(() => {
    if (productData && productData.product) {
      // prettier-ignore
      const { brand_id, product_category_id, product_subcategory_id, vendor_ids, hsn_id, attribute_value_ids,
        variant_attribute_ids, product_description, product_length, product_width, product_height,
        product_weight, package_length, package_width, package_height, package_weight,
        append_to_name_attribute_ids, product_qc_specs, version,photoshoot_images,photoshoot_videos }
        = productData.product

      if (productData.product.name) setName(productData.product.name)

      if (version) setVersion(version)

      if (productData.product.code) {
        setCode(productData.product.code)
        setCodeExists(true)
      }

      if (brand_id) setBrandID(String(brand_id))
      if (product_category_id) setCategoryID(String(product_category_id))
      if (product_subcategory_id) setSubcategoryID(String(product_subcategory_id))
      if (product_description) setProductDescription(product_description)
      if (hsn_id) {
        setHSNID(String(hsn_id))
        const tempCurrentHSN = hsnList.find((element) => String(element.id) === String(hsn_id))
        setIGST(tempCurrentHSN.igst)
      }
      if (vendor_ids && vendor_ids.length)
        setVendorIDs(vendor_ids.map((vendorID) => String(vendorID)))
      if (append_to_name_attribute_ids && append_to_name_attribute_ids.length)
        setAttributeValuesToAppend(append_to_name_attribute_ids.map((attrID) => String(attrID)))

      setSP(productData.product.sp)
      setTP(productData.product.tp)
      setMRP(productData.product.mrp)

      setProductLength(product_length)
      setProductWidth(product_width)
      setProductHeight(product_height)
      setProductWeight(product_weight)

      setPackageLength(package_length)
      setPackageWidth(package_width)
      setPackageHeight(package_height)
      setPackageWeight(package_weight)

      if (attribute_value_ids && attribute_value_ids.length)
        setAttributeValueIDs(
          attribute_value_ids.map((attributeValueID) => String(attributeValueID)),
        )

      if (variant_attribute_ids && variant_attribute_ids.length) {
        const tempCheckValues = {}
        const tempVariantIDs = variant_attribute_ids.map((variantID) => {
          tempCheckValues[variantID] = true
          return String(variantID)
        })
        setVariantAttributeIDs(tempVariantIDs)
        setVariantCheckValues(tempCheckValues)
      }

      if (productData.product.image) {
        setImage(productData.product.image)
        setExistingImages([
          `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_PRODUCT_URL}${productData.product.image}`,
        ])
      }

      if (photoshoot_images) setExistingPhotoshoots(photoshoot_images)
      if (photoshoot_videos) setExistingPhotoshootsVideos(photoshoot_videos)

      setVariants(productData.product.variants || [])

      if (productData.product.variants && productData.product.variants.length) {
        const tempVariantExistingImages = {}
        productData.product.variants.forEach((obj) => {
          tempVariantExistingImages[obj.id] = obj.image
            ? [`${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_PRODUCT_URL}${obj.image}`]
            : []
        })
        setVariantExistingImages(tempVariantExistingImages)
      }

      if (product_qc_specs && product_qc_specs.length)
        setProductQCSpecs(
          product_qc_specs.map((obj) => ({
            id: obj.id,
            specs_id: String(obj.specs_id),
            specs_expected_value: obj.specs_expected_value,
            uom_id: String(obj.uom_id),
            specs_threshold: obj.specs_threshold,
            active: obj.active,
          })),
        )
    }
  }, [productData])

  useEffect(() => {
    if (!uomLoad && uomData && uomData.uoms && uomData.uoms.length) setUOMList(uomData.uoms)
  }, [uomData, uomLoad])

  useEffect(() => {
    if (!hsnLoad && hsnData && hsnData.hsns && hsnData.hsns.length) setHSNList(hsnData.hsns)
  }, [hsnData, hsnLoad])

  useEffect(() => {
    if (
      !specsListLoad &&
      specsListData &&
      specsListData.productSpecificationNames &&
      specsListData.productSpecificationNames.length
    )
      setQCSpecsList(specsListData.productSpecificationNames)
  }, [specsListData, specsListLoad])

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

  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length)
      setVendorsList(vendorData.vendorNames)
  }, [vendorData, vendorLoad])

  useEffect(() => {
    if (!marginLoad && marginData && marginData.marginsByProductID) {
      const { buyer_margin, vendor_margin } = marginData.marginsByProductID
      if (buyer_margin && buyer_margin.length) {
        const tempBuyerMargin = buyer_margin.map((obj, index) => ({
          key: index,
          id: obj.id,
          buyer_id: obj.buyer_id,
          mrp: obj.mrp,
          discount_value: obj.discount_value,
          target_selling_price: obj.target_selling_price,
          margin_percent: obj.margin_percent,
        }))
        setBuyerMarginTableData(tempBuyerMargin)
      }
      if (vendor_margin && vendor_margin.length) {
        const tempVendorMargin = vendor_margin.map((obj, index) => ({
          key: index,
          id: obj.id,
          vendor_id: obj.vendor_id,
          cost_price: obj.cost_price,
          transport_cost: obj.transport_cost,
          transfer_price_marketing_percent: obj.transfer_price_marketing,
          transfer_price_marketing: Math.round(
            (obj.cost_price +
              obj.transport_cost +
              obj.packaging +
              obj.photoshoot +
              (obj.cost_price + obj.transport_cost + obj.packaging + obj.photoshoot) *
                (obj.margin_percent / 100 + obj.brand_marketing / 100)) *
              (1 + obj.transfer_price_marketing / 100),
          ),
          margin_percent: obj.margin_percent,
          packaging: obj.packaging,
          photoshoot: obj.photoshoot,
          brand_marketing: obj.brand_marketing,
        }))
        console.log('tempVendorMargin', tempVendorMargin)
        setVendorMarginTableData(tempVendorMargin)
      }
      if (buyer_margin && buyer_margin.length && vendor_margin && vendor_margin.length) {
        const tempMarginTableData = []
        buyer_margin.forEach((buyerObj) =>
          vendor_margin.forEach((vendorObj) => {
            const price_before_gst = buyerObj.target_selling_price / (Number(igst) / 100 + 1)
            const totalCP =
              Number(vendorObj.cost_price) +
              Number(vendorObj.transport_cost) +
              Number(vendorObj.packaging) +
              Number(vendorObj.photoshoot)
            const currentMarginVendor =
              totalCP *
              (Number(vendorObj.margin_percent) / 100 + Number(vendorObj.brand_marketing) / 100)
            const transferPrice = totalCP + currentMarginVendor
            const estimatedTargetPrice =
              price_before_gst - price_before_gst * (Number(buyerObj.margin_percent) / 100)
            const excessShortfall =
              estimatedTargetPrice -
              (
                transferPrice +
                transferPrice * (vendorObj.transfer_price_marketing_percent / 100) +
                transferPrice * (vendorObj.brand_marketing / 100)
              ).toFixed(2)

            const tempMarginRow = {
              buyer_id: buyerObj.buyer_id,
              vendor_id: vendorObj.vendor_id,
              mrp: buyerObj.mrp,
              // discount_value: buyerObj.discount_value.toFixed(2),
              // discount_percent: (
              //   ((Number(buyerObj.mrp) - Number(buyerObj.discount_value)) / Number(buyerObj.mrp)) *
              //   100
              // ).toFixed(2),
              discount_percent: buyerObj.discount_value.toFixed(2),
              discount_value: (buyerObj.mrp * (buyerObj.discount_value / 100)).toFixed(2),
              // selling_price: Number(buyerObj.mrp) - Number(buyerObj.discount_value),
              target_selling_price: buyerObj.target_selling_price,
              price_before_gst: price_before_gst.toFixed(2),
              buyer_margin_percent: buyerObj.margin_percent,
              estimated_target_price: estimatedTargetPrice.toFixed(2),
              cost_price: vendorObj.cost_price,
              transport_cost: vendorObj.transport_cost,
              total_cp: totalCP,
              brand_marketing_price: (transferPrice * (vendorObj.brand_marketing / 100)).toFixed(2),
              brand_marketing: vendorObj.brand_marketing || '-',
              packaging: vendorObj.packaging || '-',
              photoshoot: vendorObj.photoshoot || '-',
              vendor_margin_percent: vendorObj.margin_percent,
              transfer_price: transferPrice,
              transfer_price_marketing: (
                transferPrice +
                transferPrice * (vendorObj.transfer_price_marketing_percent / 100) +
                transferPrice * (vendorObj.brand_marketing / 100)
              ).toFixed(2),
              marketing_value: (
                transferPrice *
                (vendorObj.transfer_price_marketing_percent / 100)
              ).toFixed(2),
              multiple: (Number(buyerObj.target_selling_price) / transferPrice).toFixed(2),
              current_margin: currentMarginVendor,
              excess_shortfall: Math.round(excessShortfall),
            }
            tempMarginTableData.push(tempMarginRow)
          }),
        )
        console.log('tempMarginTableData', tempMarginTableData)
        setMarginTableData(tempMarginTableData)
      }
    }
  }, [marginData, marginLoad, igst])

  useEffect(() => {
    if (
      !groupedLoad &&
      groupedAttributeValuesData &&
      groupedAttributeValuesData.groupedAttributeValues &&
      groupedAttributeValuesData.groupedAttributeValues.length
    )
      setGroupedAttributeValues(groupedAttributeValuesData.groupedAttributeValues)
  }, [groupedAttributeValuesData, groupedLoad])

  useEffect(() => {
    if (
      !buyerMarginLoad &&
      buyerMarginData &&
      buyerMarginData.buyerNames &&
      buyerMarginData.buyerNames.length
    )
      setBuyers(buyerMarginData.buyerNames)
  }, [buyerMarginLoad, buyerMarginData])

  useEffect(() => {
    if (
      !vendorMarginLoad &&
      vendorMarginData &&
      vendorMarginData.vendorNames &&
      vendorMarginData.vendorNames.length
    )
      setVendors(vendorMarginData.vendorNames)
  }, [vendorMarginLoad, vendorMarginData])

  const debouncedBuyerMarginSearch = debounce((value) => setBuyerMarginSearchString(value), 500)

  const debouncedVendorMarginSearch = debounce((value) => setVendorMarginSearchString(value), 500)

  const debouncedVendorSearch = debounce((value) => setVendorSearchString(value), 500)

  const createVariants = () => {
    setDisabledStyles(true)
    const selectedAttributeAndValues = []

    variantAttributeIDs.forEach((selectedAttribute) => {
      groupedAttributeValues.forEach((attribute) => {
        if (selectedAttribute === attribute.attribute_id) {
          selectedAttributeAndValues.push(
            attribute.attribute_values
              .filter((o) => attributeValueIDs.includes(o.id))
              .map((a) => a.id),
          )
        }
      })
    })

    let tempVariantsArray = []

    if (!variantAttributeIDs.length) {
      tempVariantsArray = []
    } else if (variantAttributeIDs.length === 1) {
      // If only a single attribute is selected as a variant, no need for cartesian
      // eslint-disable-next-line prefer-destructuring
      tempVariantsArray = cloneDeep(selectedAttributeAndValues)[0]
    } else {
      let cartesianArray = cloneDeep(selectedAttributeAndValues)[0]

      /* eslint "no-shadow": "off" */
      const cartesian = (...a) => a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())))

      selectedAttributeAndValues.forEach((item, index) => {
        if (index > 0) {
          const output = cartesian(cartesianArray, item)
          cartesianArray = output
        }
      })

      tempVariantsArray = cloneDeep(cartesianArray)
    }

    // Gets the list of parent attributes (along with it's children values),
    // that are to be used in appending to BOM-Code name, as per the checked boxes
    const groupedValuesToAppend = groupedAttributeValues.filter((obj) =>
      attributeValuesToAppend.includes(obj.attribute_id),
    )

    // From the above grouping, get the un-nested list of all children "attribute_values"
    // This will be used in forEach below
    const ungroupedValues = []
    groupedValuesToAppend.forEach((obj) => {
      if (obj.attribute_values && obj.attribute_values.length)
        ungroupedValues.push(...obj.attribute_values)
    })

    const tempVariantsObjects = []
    console.log('tempVariantsArray', tempVariantsArray)

    tempVariantsArray.forEach((item) => {
      /**
         --- STARTS: GET THE NAME TO BE APPENDED TO BOM-CODES
          * Find common IDs between
            (i) @ungroupedValues : this is the array of all ELIGIBLE "attribute_values" that CAN BE appended
            (ii) @item : this is the array of attribute-value-IDs of BOM-Code under consideration
          * Using these common IDs, get a string to be appended.
      */
      let nameToAppend = ''
      if (variantAttributeIDs.length === 1) {
        const foundValue = ungroupedValues.find((obj) => Number(obj.id) === Number(item))
        if (foundValue) nameToAppend = `/${foundValue.name}`
      } else if (item && item.length) {
        const ungroupedValueIDs = ungroupedValues.map((e) => e.id)
        const commonIDs = intersection(ungroupedValueIDs, item)
        if (commonIDs && commonIDs.length)
          commonIDs.forEach((valueID) => {
            nameToAppend += `/${ungroupedValues.find((e) => Number(e.id) === Number(valueID)).name}`
          })
      }
      // --- ENDS

      // "code" key-pair is inserted later-on in this object (during setState) to append a proper number to it
      tempVariantsObjects.push({
        attribute_value_ids: variantAttributeIDs.length === 1 ? [item] : item,
        ean: null,
        asin: null,
        isNew: true,
        nameToAppend,
      })
    })

    variants.forEach((obj) => {
      const foundIndex = tempVariantsObjects.findIndex((intObj) =>
        isEqual(intObj.attribute_value_ids, obj.attribute_value_ids),
      )
      if (foundIndex > -1) tempVariantsObjects.splice(foundIndex, 1)
    })
    const tempCode = []
    console.log('tempVariantsObjects', tempVariantsObjects)
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < styles; i++) {
      if (tempVariantsObjects && tempVariantsObjects.length) {
        // eslint-disable-next-line no-plusplus
        for (let j = 0; j < tempVariantsObjects.length; j++) {
          console.log('tempVariantsObjects', tempVariantsObjects[j])
          tempCode.push({
            ...tempVariantsObjects[j],
            code: `${code}${(variants.length + i + 1).toLocaleString('en-US', {
              minimumIntegerDigits: 3,
              useGrouping: false,
            })}${tempVariantsObjects[j].nameToAppend || ''}`,
          })
        }
      } else {
        console.log('inside IF ')
        tempCode.push({
          code: `${code}${(variants.length + i + 1).toLocaleString('en-US', {
            minimumIntegerDigits: 3,
            useGrouping: false,
          })}`,
          attribute_value_ids: [],
          ean: null,
          asin: null,
          isNew: true,
        })
      }
    }
    // if (tempVariantsObjects.length) {
    //   setVariants([
    //     ...variants,
    //     ...tempVariantsObjects.map((obj, i) => ({
    //       ...obj,
    //       code: `${code}${(variants.length + i + 1).toLocaleString('en-US', {
    //         minimumIntegerDigits: 3,
    //         useGrouping: false,
    //       })}${obj.nameToAppend || ''}`,
    //     })),
    //   ])
    // } else message.warning('No more variations possible !')

    console.log('tempCode', tempCode)

    if (tempVariantsObjects.length) {
      setVariants([...variants, ...tempCode])
    } else if (styles) setVariants([...variants, ...tempCode])
    else message.warning('No more variations possible !')
  }

  const addBlankVariant = () => {
    const tempVariants = cloneDeep(variants)
    console.log('variants', variants)
    console.log('code', code)
    tempVariants.push({
      // code: `${code}${(variants.length + 1).toLocaleString('en-US', {
      //   minimumIntegerDigits: 3,
      //   useGrouping: false,
      // })}`,
      code: `${code}`,
      attribute_value_ids: [],
      ean: null,
      asin: null,
      isNew: true,
    })
    setVariants(tempVariants)
  }

  const addBlankProductQCSpecs = () => {
    const tempProductQCSpecs = cloneDeep(productQCSpecs)
    tempProductQCSpecs.push({
      id: undefined,
      specs_id: undefined,
      specs_expected_value: 0,
      uom_id: undefined,
      specs_threshold: 0,
      active: true,
      isNew: true,
    })
    setProductQCSpecs(tempProductQCSpecs)
  }

  useEffect(() => {
    if (
      !codeExists &&
      brandData &&
      brandData.brands &&
      brandData.brands.length &&
      brandID &&
      Number(brandID) !== 0 &&
      name &&
      name.length > 3
    ) {
      const selectedBrand = brandData.brands.filter((o) => o.id === brandID)

      console.log('selectedBrand', selectedBrand)

      if (selectedBrand && selectedBrand[0] && selectedBrand[0].name) {
        const trimmedName = name.replace(' ', '')
        const tempProductCode =
          selectedBrand[0].name
            .split(' ')
            .map((letter) => letter[0])
            .join('') +
          trimmedName.charAt(0) +
          trimmedName.charAt(2) +
          trimmedName.charAt(4)

        if (tempProductCode) setCode(tempProductCode.toUpperCase())
      }
    }
  }, [name, brandID, brandData])

  const onSubmit = () => {
    setNameError(undefined)
    setCodeError(undefined)
    setBrandIDError(undefined)
    setCategoryIDError(undefined)
    setSubcategoryIDError(undefined)
    setVendorIDsError(undefined)
    setHSNIDError(undefined)
    setSPError(undefined)
    setTPError(undefined)
    setMRPError(undefined)

    let isError = false
    const buyerMargin = []
    const vendorMargin = []

    if (!name) {
      isError = true
      setNameError('Product name cannot be empty')
    }
    if (!code) {
      isError = true
      setCodeError('Product code cannot be empty')
    }
    if (!brandID || Number(brandID) === 0) {
      isError = true
      setBrandIDError('Please select a brand')
    }
    if (!categoryID || Number(categoryID) === 0) {
      isError = true
      setCategoryIDError('Please select a category')
    }
    if (!subcategoryID || Number(subcategoryID) === 0) {
      isError = true
      setSubcategoryIDError('Please select a subcategory')
    }
    if (!vendorIDs || !vendorIDs.length) {
      isError = true
      setVendorIDsError('Please select one/more vendors')
    }
    if (!hsnID || Number(hsnID) === 0) {
      isError = true
      setHSNIDError('Please select a subcategory')
    }
    if (Number(sp < 0)) {
      isError = true
      setSPError('Cost Price should be a positive number')
    }
    if (Number(tp < 0)) {
      isError = true
      setTPError('Transfer Price should be a positive number')
    }
    if (Number(mrp < 0)) {
      isError = true
      setMRPError('MRP should be a positive number')
    }
    if (buyerMarginTableData && buyerMarginTableData.length) {
      const tempTableData = cloneDeep(buyerMarginTableData)
      tempTableData.forEach((record) => {
        record.recordError = {}
        if (!record.buyer_id) {
          isError = true
          record.recordError.buyer_id = true
        }
        if (!record.mrp) {
          isError = true
          record.recordError.mrp = true
        }
        if (!record.discount_value) {
          isError = true
          record.recordError.discount_value = true
        }
        if (!record.target_selling_price) {
          isError = true
          record.recordError.target_selling_price = true
        }
        if (!record.margin_percent) {
          isError = true
          record.recordError.margin_percent = true
        }

        buyerMargin.push({
          isNew: record.isNew || false,
          id: record.id,
          product_id: id,
          buyer_id: record.buyer_id,
          mrp: record.mrp,
          discount_value: record.discount_value,
          target_selling_price: record.target_selling_price,
          margin_percent: record.margin_percent,
        })
      })

      setBuyerMarginTableData(tempTableData)
    }
    if (vendorMarginTableData && vendorMarginTableData.length) {
      const tempTableData = cloneDeep(vendorMarginTableData)
      tempTableData.forEach((record) => {
        record.recordError = {}
        if (!record.vendor_id) {
          isError = true
          record.recordError.vendor_id = true
        }
        if (!record.cost_price) {
          isError = true
          record.recordError.cost_price = true
        }
        if (!record.transport_cost) {
          isError = true
          record.recordError.transport_cost = true
        }
        if (!record.transfer_price_marketing) {
          isError = true
          record.recordError.transfer_price_marketing = true
        }
        if (!record.margin_percent) {
          isError = true
          record.recordError.margin_percent = true
        }

        vendorMargin.push({
          isNew: record.isNew || false,
          id: record.id,
          product_id: id,
          vendor_id: record.vendor_id,
          cost_price: record.cost_price,
          transport_cost: record.transport_cost,
          packaging: record.packaging,
          transfer_price_marketing: record.transfer_price_marketing_percent,
          photoshoot: record.photoshoot,
          brand_marketing: record.brand_marketing,
          margin_percent: record.margin_percent,
        })
      })

      setVendorMarginTableData(tempTableData)
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    if (variants.filter((obj) => !obj.code).length) {
      notification.error({
        message: (
          <>
            <strong>
              Some BOM-Codes are <u>EMPTY</u>.
            </strong>
          </>
        ),
        description: 'Please make sure that all the BOM-Codes are unique and present.',
      })
      return
    }

    if (uniqBy(variants, (obj) => obj.code.toLowerCase().trim()).length !== variants.length) {
      notification.error({
        message: (
          <>
            <strong>
              Some BOM-Codes are <u>REPEATED</u>.
            </strong>
          </>
        ),
        description: 'Please make sure that all the BOM-Codes are unique.',
      })
      return
    }

    const nonEmptyEANs = variants.filter((obj) => !!obj.ean)
    // prettier-ignore
    if (uniqBy(nonEmptyEANs, (obj) => obj.ean.toLowerCase().trim()).length !== nonEmptyEANs.length) {
      notification.error({
        message: <><strong>Some EAN-Codes are <u>REPEATED</u>.</strong></>,
        description: 'Please make sure that all the entered EAN-Codes are unique.',
      })
      return
    }

    const nonEmptyASINs = variants.filter((obj) => !!obj.asin)
    // prettier-ignore
    if (uniqBy(nonEmptyASINs, (obj) => obj.asin.toLowerCase().trim()).length !== nonEmptyASINs.length) {
      notification.error({
        message: <><strong>Some ASIN-Codes are <u>REPEATED</u>.</strong></>,
        description: 'Please make sure that all the entered EAN-Codes are unique.',
      })
      return
    }

    // const nonEmptyAttributes = variants.filter(
    //   (obj) => obj.attribute_value_ids && obj.attribute_value_ids.length,
    // )
    // const groupped = groupBy(nonEmptyAttributes, (obj) => obj.attribute_value_ids)
    // // prettier-ignore
    // if (uniq(flatten(lodashFilter(groupped, (arr) => arr.length > 1))).length) {
    //   notification.error({
    //     message: <><strong>The attribute-pairs are <u>REPEATED</u>.</strong></>,
    //     description: 'Please make sure that all the BOM-Codes have unique pairs of attributes associated with them.',
    //   })
    //   return
    // }

    // prettier-ignore
    if (uniqBy(buyerMarginTableData, (obj) => obj.buyer_id).length !== buyerMarginTableData.length) {
      notification.error({
        message: <><strong>Some Buyer-Margins are <u>REPEATED</u>.</strong></>,
        description: 'Please make sure that all the selected buyers are unique.',
      })
      return
    }

    // prettier-ignore
    if (uniqBy(vendorMarginTableData, (obj) => obj.vendor_id).length !== vendorMarginTableData.length) {
      notification.error({
        message: <><strong>Some Vendor-Margins are <u>REPEATED</u>.</strong></>,
        description: 'Please make sure that all the selected vendors are unique.',
      })
      return
    }

    const finalVariants = variants.map((obj) => ({
      isNew: obj.isNew || false,
      id: obj.id,
      code: obj.code,
      ean: obj.ean,
      asin: obj.asin,
      image: obj.image || null,
      is_image_changed: obj.imageChanged || false,
      attribute_value_ids: obj.attribute_value_ids,
    }))

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )
    upsertProduct({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        name,
        code,
        brand_id: Number(brandID),
        product_category_id: Number(categoryID),
        product_subcategory_id: Number(subcategoryID),
        sp: Number(sp),
        tp: Number(tp),
        mrp: Number(mrp),
        product_description: productDescription,
        product_length: Number(productLength),
        product_width: Number(productWidth),
        product_height: Number(productHeight),
        product_weight: Number(productWeight),
        package_length: Number(packageLength),
        package_width: Number(packageWidth),
        package_height: Number(packageHeight),
        package_weight: Number(packageWeight),
        attribute_value_ids: attributeValueIDs.map((attributeID) => Number(attributeID)),
        variant_attribute_ids: variantAttributeIDs.map((variantID) => Number(variantID)),
        append_to_name_attribute_ids:
          attributeValuesToAppend && attributeValuesToAppend.length
            ? attributeValuesToAppend.map((num) => Number(num))
            : [],
        vendor_ids: vendorIDs.map((vendorID) => Number(vendorID)),
        hsn_id: Number(hsnID),
        image,
        is_image_changed: imageChanged,
        photoshoot_images: uploadedPhotoshoots,
        deleted_photoshoot_images: deletedPhotoshoots,
        photoshoot_videos: uploadedPhotoshootsVideos,
        deleted_photoshoot_videos: deletedPhotoshootsVideos,
        variants: finalVariants,
        product_qc_specs: productQCSpecs,
        buyer_margin:
          buyerMargin && buyerMargin.length
            ? buyerMargin.map((obj) => ({
                ...obj,
                mrp: obj.mrp ? Number(obj.mrp) : 0,
                discount_value: obj.discount_value ? Number(obj.discount_value) : 0,
                target_selling_price: obj.target_selling_price
                  ? Number(obj.target_selling_price)
                  : 0,
                margin_percent: obj.margin_percent ? Number(obj.margin_percent) : 0,
              }))
            : [],
        vendor_margin:
          vendorMargin && vendorMargin.length
            ? vendorMargin.map((obj) => ({
                ...obj,
                cost_price: obj.cost_price ? Number(obj.cost_price) : 0,
                transport_cost: obj.transport_cost ? Number(obj.transport_cost) : 0,
                transfer_price_marketing: obj.transfer_price_marketing
                  ? Number(obj.transfer_price_marketing)
                  : 0,
                margin_percent: obj.margin_percent ? Number(obj.margin_percent) : 0,
                packaging: obj.packaging ? Number(obj.packaging) : 0,
                photoshoot: obj.photoshoot ? Number(obj.photoshoot) : 0,
                brand_marketing: obj.brand_marketing ? Number(obj.brand_marketing) : 0,
              }))
            : [],
        deleted_buyer_margin_ids: deletedBuyerMarginIDs,
        deleted_vendor_margin_ids: deletedVendorMarginIDs,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/products/all-products')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product and its variants.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const getBuyers = () => {
    return buyers.map((buyer) => (
      <Select.Option key={buyer.id} value={buyer.id}>
        {buyer.name}
      </Select.Option>
    ))
  }

  const getVendors = () => {
    return vendors.map(({ id, name, company }) => (
      <Select.Option key={id} value={id}>
        {`${company} (${name})`}
      </Select.Option>
    ))
  }

  const buyerColumns = [
    {
      title: 'Buyer',
      dataIndex: 'buyer_id',
      key: 'buyer_id',
      width: '12%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.buyer_id
                ? {
                    border: '1px solid red',
                  }
                : {},
          },
          children: (
            <Select
              onSearch={(value) => debouncedBuyerMarginSearch(value)}
              onChange={(value) => {
                const tempTableData = cloneDeep(buyerMarginTableData)
                const tempBuyerIDs = cloneDeep(existingBuyerIDs)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.buyer_id = value
                    tempBuyerIDs.push(Number(value))
                  }
                })
                setBuyerMarginTableData(tempTableData)
                setExistingBuyerIDs(tempBuyerIDs)
              }}
              value={record.buyer_id}
              style={{ width: '100%' }}
              placeholder="Please select one"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={disabled}
            >
              {getBuyers()}
            </Select>
          ),
        }
      },
    },
    {
      title: 'MRP (₹)',
      dataIndex: 'mrp',
      key: 'mrp',
      width: '8%',
      render: (text, record) => {
        return {
          props: {
            style: record.recordError && record.recordError.mrp ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.mrp}
              onChange={(value) => {
                const tempTableData = cloneDeep(buyerMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.mrp = value
                    if (row.mrp && row.discount_value)
                      row.target_selling_price = Math.round(
                        row.mrp - (row.discount_value * value) / 100,
                      )
                  }
                })
                setBuyerMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: 'Discount (%)',
      dataIndex: 'discount_value',
      key: 'discount_value',
      width: '8%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.discount_value
                ? {
                    border: '1px solid red',
                  }
                : {},
          },
          children: (
            <InputNumber
              min={0}
              max={100}
              value={record.discount_value}
              onChange={(value) => {
                const tempTableData = cloneDeep(buyerMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.discount_value = value
                    if (row.mrp && row.discount_value)
                      row.target_selling_price = Math.round(row.mrp - (row.mrp * value) / 100)
                  }
                })
                setBuyerMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: 'Target SP (₹)',
      dataIndex: 'target_selling_price',
      key: 'target_selling_price',
      width: '8%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.target_selling_price
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <InputNumber
              value={record.target_selling_price}
              onChange={(value) => {
                const tempTableData = cloneDeep(buyerMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) row.target_selling_price = Math.round(value)
                })
                setBuyerMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: "Buyer's Margin (%)",
      dataIndex: 'margin_percent',
      key: 'margin_percent',
      width: '8%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.margin_percent
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <InputNumber
              value={record.margin_percent}
              onChange={(value) => {
                const tempTableData = cloneDeep(buyerMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) row.margin_percent = value
                })
                setBuyerMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: '',
      key: 'action',
      type: 'string',
      width: '6%',
      render: (text, record) => (
        <Popconfirm
          disabled={disabled}
          title="Sure to delete?"
          onConfirm={() => deleteBuyerMarginRow(record.key)}
        >
          <Button type="danger" disabled={disabled}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const vendorColumns = [
    {
      title: 'Vendor',
      dataIndex: 'vendor_id',
      key: 'vendor_id',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.vendor_id ? { border: '1px solid red' } : {},
          },
          children: (
            <Select
              onSearch={(value) => debouncedVendorMarginSearch(value)}
              onChange={(value) => {
                const tempTableData = cloneDeep(vendorMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) row.vendor_id = value
                })
                setVendorMarginTableData(tempTableData)
              }}
              value={record.vendor_id}
              style={{ width: '100%' }}
              placeholder="Please select one"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={disabled}
            >
              {getVendors()}
            </Select>
          ),
        }
      },
    },
    {
      title: 'Vendor CP (₹)',
      dataIndex: 'cost_price',
      key: 'cost_price',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.cost_price
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <InputNumber
              value={record.cost_price}
              onChange={(value) => {
                const tempTableData = cloneDeep(vendorMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.cost_price = value
                    if (
                      row.cost_price &&
                      row.transport_cost &&
                      row.margin_percent &&
                      row.packaging &&
                      row.photoshoot
                    ) {
                      const totalCP =
                        row.cost_price + row.transport_cost + row.packaging + row.photoshoot
                      row.transfer_price_marketing = Math.round(
                        (totalCP +
                          totalCP * (row.margin_percent / 100 + row.brand_marketing / 100)) *
                          (1 + row.transfer_price_marketing_percent / 100),
                      )
                    }
                  }
                })
                setVendorMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: 'Transport (₹)',
      dataIndex: 'transport_cost',
      key: 'transport_cost',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.transport_cost
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <InputNumber
              value={record.transport_cost}
              onChange={(value) => {
                const tempTableData = cloneDeep(vendorMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) row.transport_cost = value
                  if (
                    row.cost_price &&
                    row.transport_cost &&
                    row.margin_percent &&
                    row.packaging &&
                    row.photoshoot
                  ) {
                    const totalCP =
                      row.cost_price + row.transport_cost + row.packaging + row.photoshoot
                    row.transfer_price_marketing = Math.round(
                      (totalCP + totalCP * (row.margin_percent / 100 + row.brand_marketing / 100)) *
                        (1 + row.transfer_price_marketing_percent / 100),
                    )
                  }
                })
                setVendorMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: 'Std Margin (%)',
      dataIndex: 'margin_percent',
      key: 'margin_percent',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.margin_percent
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <InputNumber
              value={record.margin_percent}
              onChange={(value) => {
                const tempTableData = cloneDeep(vendorMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.margin_percent = value
                    if (
                      row.cost_price &&
                      row.transport_cost &&
                      row.margin_percent &&
                      row.packaging &&
                      row.photoshoot
                    ) {
                      const totalCP =
                        row.cost_price + row.transport_cost + row.packaging + row.photoshoot
                      row.transfer_price_marketing = Math.round(
                        (totalCP +
                          totalCP * (row.margin_percent / 100 + row.brand_marketing / 100)) *
                          (1 + row.transfer_price_marketing_percent / 100),
                      )
                    }
                  }
                })
                setVendorMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: 'Packaging (₹)',
      dataIndex: 'packaging',
      key: 'packaging',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.packaging ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.packaging}
              onChange={(value) => {
                const tempTableData = cloneDeep(vendorMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) row.packaging = value
                  if (
                    row.cost_price &&
                    row.transport_cost &&
                    row.margin_percent &&
                    row.packaging &&
                    row.photoshoot
                  ) {
                    const totalCP =
                      row.cost_price + row.transport_cost + row.packaging + row.photoshoot
                    row.transfer_price_marketing = Math.round(
                      (totalCP + totalCP * (row.margin_percent / 100 + row.brand_marketing / 100)) *
                        (1 + row.transfer_price_marketing_percent / 100),
                    )
                  }
                })
                setVendorMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: 'PhotoShoot (₹)',
      dataIndex: 'photoshoot',
      key: 'photoshoot',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.photoshoot
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <InputNumber
              value={record.photoshoot}
              onChange={(value) => {
                const tempTableData = cloneDeep(vendorMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) row.photoshoot = value
                  if (
                    row.cost_price &&
                    row.transport_cost &&
                    row.margin_percent &&
                    row.packaging &&
                    row.photoshoot
                  ) {
                    const totalCP =
                      row.cost_price + row.transport_cost + row.packaging + row.photoshoot
                    row.transfer_price_marketing = Math.round(
                      (totalCP + totalCP * (row.margin_percent / 100 + row.brand_marketing / 100)) *
                        (1 + row.transfer_price_marketing_percent / 100),
                    )
                  }
                })
                setVendorMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: 'Brand Marketing (%)',
      dataIndex: 'brand_marketing',
      key: 'brand_marketing',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.brand_marketing
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <InputNumber
              value={record.brand_marketing}
              onChange={(value) => {
                const tempTableData = cloneDeep(vendorMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.brand_marketing = value
                    if (
                      row.cost_price &&
                      row.transport_cost &&
                      row.margin_percent &&
                      row.packaging &&
                      row.photoshoot
                    ) {
                      const totalCP =
                        row.cost_price + row.transport_cost + row.packaging + row.photoshoot
                      row.transfer_price_marketing = Math.round(
                        (totalCP +
                          totalCP * (row.margin_percent / 100 + row.brand_marketing / 100)) *
                          (1 + row.transfer_price_marketing_percent / 100),
                      )
                    }
                  }
                })
                setVendorMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
              max={100}
            />
          ),
        }
      },
    },
    {
      title: 'TP (With Marketing)(%)',
      dataIndex: 'transfer_price_marketing_percent',
      key: 'transfer_price_marketing_percent',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.transfer_price_marketing_percent
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <InputNumber
              value={record.transfer_price_marketing_percent}
              onChange={(value) => {
                const tempTableData = cloneDeep(vendorMarginTableData)
                tempTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.transfer_price_marketing_percent = value
                    if (
                      row.cost_price &&
                      row.transport_cost &&
                      row.margin_percent &&
                      row.packaging &&
                      row.photoshoot
                    ) {
                      const totalCP =
                        row.cost_price + row.transport_cost + row.packaging + row.photoshoot
                      row.transfer_price_marketing = Math.round(
                        (totalCP +
                          totalCP * (row.margin_percent / 100 + row.brand_marketing / 100)) *
                          (1 + row.transfer_price_marketing_percent / 100),
                      )
                    }
                  }
                })
                setVendorMarginTableData(tempTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    // {
    //   title: 'TP (With Marketing)(₹)',
    //   dataIndex: 'transfer_price_marketing',
    //   key: 'transfer_price_marketing',
    //   // render: (text, record) => {
    //   //   return {
    //   //     props: {
    //   //       style:
    //   //         record.recordError && record.recordError.transfer_price_marketing
    //   //           ? { border: '1px solid red' }
    //   //           : {},
    //   //     },
    //   //     children: (
    //   //       <InputNumber
    //   //         value={record.transfer_price_marketing}
    //   //         onChange={(value) => {
    //   //           const tempTableData = cloneDeep(vendorMarginTableData)
    //   //           tempTableData.forEach((row) => {
    //   //             if (row.key === record.key) row.transfer_price_marketing = value
    //   //           })
    //   //           setVendorMarginTableData(tempTableData)
    //   //         }}
    //   //         style={{ width: '100%' }}
    //   //         disabled={disabled}
    //   //       />
    //   //     ),
    //   //   }
    //   // },
    // },
    {
      title: '',
      key: 'action',
      type: 'string',
      render: (text, record) => (
        <Popconfirm
          disabled={disabled}
          title="Sure to delete?"
          onConfirm={() => deleteVendorMarginRow(record.key)}
        >
          <Button type="danger" disabled={disabled}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const marginColumns = [
    {
      title: 'Buyer',
      dataIndex: 'buyer_id',
      key: 'buyer_id',
      width: '15%',
      align: 'center',
      render: (buyerID) =>
        buyerID && Number(buyerID) !== 0 && buyers && buyers.length
          ? buyers.find(({ id }) => Number(buyerID) === Number(id)).name
          : null,
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_id',
      key: 'vendor_id',
      width: '15%',
      align: 'center',
      render: (vendorID) =>
        vendorID && Number(vendorID) !== 0 && vendors && vendors.length
          ? vendors.find(({ id }) => Number(vendorID) === Number(id)).company
          : null,
    },
    {
      title: 'MRP (₹)',
      dataIndex: 'mrp',
      key: 'mrp',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Discount (₹)',
      dataIndex: 'discount_value',
      key: 'discount_value',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Discount (%)',
      dataIndex: 'discount_percent',
      key: 'discount_percent',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Target SP (₹)',
      dataIndex: 'target_selling_price',
      key: 'target_selling_price',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Price before GST (₹)',
      dataIndex: 'price_before_gst',
      key: 'price_before_gst',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Buyer Margin (%)',
      dataIndex: 'buyer_margin_percent',
      key: 'buyer_margin_percent',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Estimated TP (₹)',
      dataIndex: 'estimated_target_price',
      key: 'estimated_target_price',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-green' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Vendor CP (₹)',
      dataIndex: 'cost_price',
      key: 'cost_price',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Transport (₹)',
      dataIndex: 'transport_cost',
      key: 'transport_cost',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Packaging (₹)',
      dataIndex: 'packaging',
      key: 'packaging',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'PhotoShoot (₹)',
      dataIndex: 'photoshoot',
      key: 'photoshoot',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Total CP (₹)',
      dataIndex: 'total_cp',
      key: 'total_cp',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Std Margin (%)',
      dataIndex: 'vendor_margin_percent',
      key: 'vendor_margin_percent',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Vendor TP (₹)',
      dataIndex: 'transfer_price',
      key: 'transfer_price',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },

    {
      title: 'Marketing AMS(₹)',
      dataIndex: 'marketing_value',
      key: 'marketing_value',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },

    {
      title: 'Brand Marketing (%)',
      dataIndex: 'brand_marketing',
      key: 'brand_marketing',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Brand Marketing (₹)',
      dataIndex: 'brand_marketing_price',
      key: 'brand_marketing_price',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'TP (With Marketing) (₹)',
      dataIndex: 'transfer_price_marketing',
      key: 'transfer_price_marketing',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Multiple',
      dataIndex: 'multiple',
      key: 'multiple',
      width: '15%',
      align: 'center',
      onCell: () => ({ className: 'table-cellColor-purple' }),
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Current Margin (₹)',
      dataIndex: 'current_margin',
      key: 'current_margin',
      width: '15%',
      fixed: 'right',
      align: 'center',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Excess / Short (₹)',
      dataIndex: 'excess_shortfall',
      key: 'excess_shortfall',
      width: '13%',
      fixed: 'right',
      align: 'center',
      render: (text) => {
        return {
          props: {
            style: {
              color: Number(text) > 0 ? 'green' : Number(text) < 0 && 'red',
              fontWeight: 'bold',
            },
          },
          children: <div>{text}</div>,
        }
      },
    },
  ]

  const [buyerMarginTableData, setBuyerMarginTableData] = useState([])

  const [vendorMarginTableData, setVendorMarginTableData] = useState([])

  const addBuyerMarginRow = () => {
    const count = buyerMarginTableData.length + 1
    const newRow = {
      key: count,
      id: null,
      buyer_id: null,
      mrp: 0,
      discount_value: 0,
      target_selling_price: 0,
      margin_percent: 30,
      isNew: true,
    }
    const newTableData = [...buyerMarginTableData, newRow]
    setBuyerMarginTableData(newTableData)
  }

  const addVendorMarginRow = () => {
    const count = vendorMarginTableData.length + 1
    const newRow = {
      key: count,
      id: null,
      vendor_id: null,
      cost_price: 0,
      transport_cost: 8,
      packaging: 0,
      photoshoot: 0,
      brand_marketing: 0,
      margin_percent: 25,
      transfer_price_marketing_percent: 10,
      transfer_price_marketing: 0,
      isNew: true,
    }
    const newTableData = [...vendorMarginTableData, newRow]
    setVendorMarginTableData(newTableData)
  }

  const deleteBuyerMarginRow = async (key) => {
    const deletedRowIDs = cloneDeep(deletedBuyerMarginIDs)
    const newTableData = buyerMarginTableData.filter((item) => {
      if (item.key !== key) return true
      if (item.key === key && item.id) {
        deletedRowIDs.push(item.id)
      }
      return false
    })
    setBuyerMarginTableData(newTableData)
    setDeletedBuyerMarginIDs(deletedRowIDs)
  }

  const deleteVendorMarginRow = async (key) => {
    const deletedRowIDs = cloneDeep(deletedVendorMarginIDs)
    const newTableData = vendorMarginTableData.filter((item) => {
      if (item.key !== key) return true
      if (item.key === key && item.id) {
        deletedRowIDs.push(item.id)
      }
      return false
    })
    setVendorMarginTableData(newTableData)
    setDeletedVendorMarginIDs(deletedRowIDs)
  }

  useEffect(() => {
    if (
      buyerMarginTableData &&
      buyerMarginTableData.length &&
      vendorMarginTableData &&
      vendorMarginTableData.length
    ) {
      const tempMarginTableData = []
      console.log('vendorMarginTableData,', vendorMarginTableData)
      buyerMarginTableData.forEach((buyerObj) =>
        vendorMarginTableData.forEach((vendorObj) => {
          const price_before_gst =
            buyerObj.target_selling_price && igst
              ? (buyerObj.target_selling_price / (Number(igst) / 100 + 1)).toFixed(2)
              : 0

          const estimatedTargetPrice =
            price_before_gst && buyerObj.margin_percent
              ? (
                  Number(price_before_gst) -
                  Number(price_before_gst) * (Number(buyerObj.margin_percent) / 100)
                ).toFixed(2)
              : 0

          const totalCP =
            (vendorObj.cost_price ? Number(vendorObj.cost_price) : 0) +
            (vendorObj.transport_cost ? Number(vendorObj.transport_cost) : 0) +
            (vendorObj.packaging ? Number(vendorObj.packaging) : 0) +
            (vendorObj.photoshoot ? Number(vendorObj.photoshoot) : 0)

          const currentMarginVendor =
            totalCP && vendorObj.margin_percent
              ? ((Number(totalCP) * Number(vendorObj.margin_percent)) / 100).toFixed(2)
              : 0

          const transferPrice = Number(totalCP) + Number(currentMarginVendor)
          console.log('transfer_price_marketing', vendorObj.transfer_price_marketing)
          const excessShortfall =
            estimatedTargetPrice -
            (
              transferPrice +
              transferPrice * (vendorObj.transfer_price_marketing_percent / 100) +
              transferPrice * (vendorObj.brand_marketing / 100)
            ).toFixed(2)

          console.log('estimatedTargetPrice', estimatedTargetPrice)
          console.log(
            'ams',
            transferPrice +
              transferPrice * (vendorObj.transfer_price_marketing_percent / 100) +
              transferPrice * (vendorObj.brand_marketing / 100),
          )
          const tempMarginRow = {
            buyer_id: buyerObj.buyer_id,
            vendor_id: vendorObj.vendor_id,
            mrp: buyerObj.mrp ? Math.round(buyerObj.mrp) : '-',
            // discount_value: buyerObj.discount_value.toFixed(2) || '-',
            // discount_percent:
            //   buyerObj.mrp && buyerObj.discount_value
            //     ? (
            //         ((Number(buyerObj.mrp) - Number(buyerObj.discount_value)) /
            //           Number(buyerObj.mrp)) *
            //         100
            //       ).toFixed(2) || '-'
            //     : '-',
            discount_percent: buyerObj.discount_value ? buyerObj.discount_value : 0,
            discount_value: Math.round(buyerObj.mrp * (buyerObj.discount_value / 100)),
            // selling_price: Number(buyerObj.mrp) - Number(buyerObj.discount_value) || '-',
            target_selling_price: buyerObj.target_selling_price
              ? Math.round(buyerObj.target_selling_price)
              : '-',
            price_before_gst: Math.round(Number(price_before_gst)) || '-',
            buyer_margin_percent: buyerObj.margin_percent || '-',
            estimated_target_price: Math.round(Number(estimatedTargetPrice)) || '-',
            cost_price: vendorObj.cost_price ? Math.round(vendorObj.cost_price) : '-',
            transport_cost: vendorObj.transport_cost ? Math.round(vendorObj.transport_cost) : '-',
            total_cp: totalCP ? Math.round(totalCP) : '-',
            vendor_margin_percent: vendorObj.margin_percent || '-',
            brand_marketing: vendorObj.brand_marketing || '-',
            packaging: vendorObj.packaging || '-',
            photoshoot: vendorObj.photoshoot || '-',
            brand_marketing_price: (transferPrice * (vendorObj.brand_marketing / 100)).toFixed(2),
            transfer_price: transferPrice ? Math.round(transferPrice) : '-',
            transfer_price_marketing: (
              transferPrice +
              transferPrice * (vendorObj.transfer_price_marketing_percent / 100) +
              transferPrice * (vendorObj.brand_marketing / 100)
            ).toFixed(2),
            marketing_value: (
              transferPrice *
              (vendorObj.transfer_price_marketing_percent / 100)
            ).toFixed(2),
            multiple:
              (Number(buyerObj.target_selling_price) / Number(transferPrice)).toFixed(2) || '-',
            current_margin: Math.round(currentMarginVendor),
            excess_shortfall: Math.round(excessShortfall) || '-',
          }
          tempMarginTableData.push(tempMarginRow)
        }),
      )
      setMarginTableData(tempMarginTableData)
    }
  }, [buyerMarginTableData, vendorMarginTableData])

  if (!permissions.includes('readProduct')) return <Error403 />
  if (action === 'create' && !permissions.includes('createProduct')) return <Error403 />
  if (productErr) return `Error occured while fetching data: ${productErr.message}`
  if (uomErr) return `Error occured while fetching data: ${uomErr.message}`
  if (hsnErr) return `Error occured while fetching data: ${hsnErr.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (catErr) return `Error occured while fetching data: ${catErr.message}`
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (groupedErr) return `Error occured while fetching data: ${groupedErr.message}`
  if (specsListErr) return `Error occured while fetching data: ${specsListErr.message}`
  if (marginErr) return `Error occured while fetching data: ${marginErr.message}`
  if (buyerMarginErr) return `Error occured while fetching data: ${buyerMarginErr.message}`
  if (vendorMarginErr) return `Error occured while fetching data: ${vendorMarginErr.message}`

  return (
    <div>
      <Helmet title="Products" />

      <Spin spinning={productLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Product</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateProduct') ? (
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
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-10">
                    <div className="row">
                      <div className="col-lg-4">
                        <div className="mb-2">
                          Product Name<span className="custom-error-text"> *</span>
                        </div>
                        <Input
                          value={name}
                          onChange={({ target: { value } }) => setName(value)}
                          disabled={disabled}
                          className={
                            nameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                        />
                        <div className="custom-error-text mb-4">{nameError || ''}</div>
                      </div>

                      <div className="col-lg-4">
                        <div className="mb-2">
                          Brand<span className="custom-error-text"> *</span>
                        </div>
                        <Select
                          showSearch
                          value={brandID}
                          disabled={disabled}
                          style={{ width: '100%' }}
                          onChange={(value) => setBrandID(value)}
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
                        <div className="mb-2">
                          Product Category<span className="custom-error-text"> *</span>
                        </div>
                        <Select
                          showSearch
                          value={categoryID}
                          disabled={disabled}
                          style={{ width: '100%' }}
                          onChange={(value) => setCategoryID(value)}
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
                        <div className="custom-error-text mb-4">{categoryIDError || ''}</div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-4">
                        <div className="mb-2">
                          Product Subcategory<span className="custom-error-text"> *</span>
                        </div>
                        {categoryID ? (
                          subcatLoad ? (
                            <div>Loading ...</div>
                          ) : (
                            <Select
                              showSearch
                              value={subcategoryID}
                              disabled={disabled}
                              style={{ width: '100%' }}
                              onChange={(value) => setSubcategoryID(value)}
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
                      <div className="col-lg-4">
                        <div className="mb-2">
                          Product Code<span className="custom-error-text"> *</span>
                        </div>
                        <Input
                          value={code}
                          onChange={({ target: { value } }) => {
                            if (value) {
                              setCode(value)
                              setCodeExists(true)
                            } else {
                              setCode(undefined)
                              setCodeExists(false)
                            }
                          }}
                          disabled={disabled}
                          className={
                            codeError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                        />
                        <div className="custom-error-text mb-4">{codeError || ''}</div>
                      </div>

                      <div className="col-lg-4">
                        <div className="mb-2">Product Description</div>
                        <Input.TextArea
                          value={productDescription}
                          onChange={({ target: { value } }) => setProductDescription(value)}
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-2">
                    <div className="row">
                      <div className="col-lg-12">
                        <div>Image</div>
                        <ImageUpload
                          existingImages={existingImages} // Always pass an array. If not empty, it should have fully-formed URLs of Photoshoots
                          placeholderType="general" // Accepted values: 'general' or 'general'
                          onUploadCallback={(imgFile) => {
                            setImage(imgFile)
                            setImageChanged(true)
                          }}
                          onRemoveCallback={() => {
                            setImage(null)
                            setImageChanged(true)
                          }}
                          maxImages={1}
                          editMode={!disabled}
                        />
                        <div className="mb-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <Tabs tabPosition="top">
                  <TabPane tab="Vendors" key="1">
                    <div className="mb-2">
                      Vendors<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      mode="multiple"
                      showSearch
                      value={vendorIDs}
                      disabled={disabled}
                      style={{ width: '100%' }}
                      onSearch={(value) => debouncedVendorSearch(value)}
                      onChange={(value) => setVendorIDs(value)}
                      className={
                        vendorIDsError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
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
                  </TabPane>

                  <TabPane tab="Dimensions" key="2">
                    <div className="row mb-5">
                      <div className="col-lg-12 mb-2">Product Dimensions</div>
                      <div className="col-lg-2">
                        <div className="mb-2">Length (in)</div>
                        <InputNumber
                          value={productLength}
                          onChange={(value) => setProductLength(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="col-lg-2">
                        <div className="mb-2">Width (in)</div>
                        <InputNumber
                          value={productWidth}
                          onChange={(value) => setProductWidth(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="col-lg-2">
                        <div className="mb-2">Height (in)</div>
                        <InputNumber
                          value={productHeight}
                          onChange={(value) => setProductHeight(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="col-lg-2">
                        <div className="mb-2">Weight (g)</div>
                        <InputNumber
                          value={productWeight}
                          onChange={(value) => setProductWeight(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    <hr />
                    <div className="row mt-4 mb-5">
                      <div className="col-lg-12 mb-2">Package Dimensions</div>
                      <div className="col-lg-2">
                        <div className="mb-2">Length (in)</div>
                        <InputNumber
                          value={packageLength}
                          onChange={(value) => setPackageLength(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="col-lg-2">
                        <div className="mb-2">Width (in)</div>
                        <InputNumber
                          value={packageWidth}
                          onChange={(value) => setPackageWidth(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="col-lg-2">
                        <div className="mb-2">Height (in)</div>
                        <InputNumber
                          value={packageHeight}
                          onChange={(value) => setPackageHeight(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="col-lg-2">
                        <div className="mb-2">Weight (g)</div>
                        <InputNumber
                          value={packageWeight}
                          onChange={(value) => setPackageWeight(value)}
                          disabled={disabled}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </TabPane>

                  <TabPane tab="Pricing" key="3">
                    <div className="row">
                      <div className="col-lg-3">
                        <div className="mb-2">
                          HSN<span className="custom-error-text"> *</span>
                        </div>
                        <Select
                          showSearch
                          value={hsnID}
                          disabled={disabled}
                          style={{ width: '100%' }}
                          onChange={(value) => {
                            setHSNID(value)
                            const tempCurrentHSN = hsnList.find(
                              (element) => String(element.id) === String(value),
                            )
                            setIGST(tempCurrentHSN.igst)
                          }}
                          className={
                            hsnIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
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

                    <div className="row" key="prices-row">
                      <div className="col-lg-3" key="sp">
                        <div className="mb-2">Selling Price</div>
                        <InputNumber
                          value={sp}
                          onChange={(value) => setSP(value)}
                          disabled={disabled}
                          className={
                            spError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                          style={{ width: '100%' }}
                        />
                        <div className="custom-error-text mb-4">{spError || ''}</div>
                      </div>

                      <div className="col-lg-3" key="tp">
                        <div className="mb-2">Transfer Price</div>
                        <InputNumber
                          value={tp}
                          onChange={(value) => setTP(value)}
                          disabled={disabled}
                          className={
                            tpError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                          style={{ width: '100%' }}
                        />
                        <div className="custom-error-text mb-4">{tpError || ''}</div>
                      </div>

                      <div className="col-lg-3" key="mrp">
                        <div className="mb-2">MRP</div>
                        <InputNumber
                          value={mrp}
                          onChange={(value) => setMRP(value)}
                          disabled={disabled}
                          className={
                            mrpError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                          }
                          style={{ width: '100%' }}
                        />
                        <div className="custom-error-text mb-4">{mrpError || ''}</div>
                      </div>
                    </div>
                  </TabPane>

                  <TabPane tab="QC Specs" key="4">
                    <Button
                      type="primary"
                      onClick={addBlankProductQCSpecs}
                      className="mb-4"
                      disabled={disabled}
                    >
                      Add QC Specifications
                    </Button>
                    {productQCSpecs.map((specsObj, i) => (
                      <div className="row mt-2 mb-4" key={`specs-${i}`}>
                        <div className="col-3">
                          <div className="mb-2">Specification Name</div>
                          <Select
                            value={specsObj.specs_id}
                            disabled={disabled}
                            style={{ width: '100%' }}
                            onChange={(value) => {
                              const tempProductQCSpecs = cloneDeep(productQCSpecs)
                              tempProductQCSpecs[i].specs_id = value
                              setProductQCSpecs(tempProductQCSpecs)
                            }}
                          >
                            {qcSpecsList && qcSpecsList.length
                              ? qcSpecsList.map((obj) => (
                                  <Option key={String(obj.id)} value={String(obj.id)}>
                                    {obj.specs_name}
                                  </Option>
                                ))
                              : null}
                          </Select>
                        </div>
                        <div className="col-2">
                          <div className="mb-2">Exp. Value</div>
                          <InputNumber
                            min={0}
                            value={specsObj.specs_expected_value}
                            onChange={(value) => {
                              const tempProductQCSpecs = cloneDeep(productQCSpecs)
                              tempProductQCSpecs[i].specs_expected_value = value
                              setProductQCSpecs(tempProductQCSpecs)
                            }}
                            disabled={disabled}
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div className="col-2">
                          <div className="mb-2">U.o.M.</div>
                          <Select
                            value={specsObj.uom_id}
                            disabled={disabled}
                            style={{ width: '100%' }}
                            onChange={(value) => {
                              const tempProductQCSpecs = cloneDeep(productQCSpecs)
                              tempProductQCSpecs[i].uom_id = value
                              setProductQCSpecs(tempProductQCSpecs)
                            }}
                          >
                            {uomList && uomList.length
                              ? uomList.map((obj) => (
                                  <Option key={String(obj.id)} value={String(obj.id)}>
                                    {obj.name}
                                  </Option>
                                ))
                              : null}
                          </Select>
                        </div>
                        <div className="col-3">
                          <div className="mb-2">Threshold Value</div>
                          <InputNumber
                            min={0}
                            value={specsObj.specs_threshold}
                            onChange={(value) => {
                              const tempProductQCSpecs = cloneDeep(productQCSpecs)
                              tempProductQCSpecs[i].specs_threshold = value
                              setProductQCSpecs(tempProductQCSpecs)
                            }}
                            disabled={disabled}
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div className="col-2">
                          <div className="mb-2">Active</div>
                          <Switch
                            checked={specsObj.active}
                            className="mr-2"
                            onChange={(checked) => {
                              const tempProductQCSpecs = cloneDeep(productQCSpecs)
                              tempProductQCSpecs[i].active = checked
                              setProductQCSpecs(tempProductQCSpecs)
                            }}
                            disabled={disabled}
                          />
                        </div>
                      </div>
                    ))}
                  </TabPane>

                  <TabPane tab="Attributes" key="5">
                    {sortBy(groupedAttributeValues, 'attribute_id').map((attribute) => {
                      return (
                        attribute && (
                          <div className="row mb-4" key={attribute.attribute_id}>
                            <div className="col-4">{attribute.attribute_name}</div>
                            <div className="col-4 text-align-right">
                              <Checkbox
                                checked={variantCheckValues[attribute.attribute_id]}
                                // prettier-ignore
                                onChange={(e) => {
                                  const tempVariantAttributeIDs
                                    = JSON.parse(JSON.stringify(variantAttributeIDs))

                                  if (e.target.checked) {
                                    setVariantAttributeIDs(
                                      union(tempVariantAttributeIDs, [attribute.attribute_id])
                                    )
                                    setVariantCheckValues({
                                      ...variantCheckValues,
                                      [attribute.attribute_id]: true
                                    })
                                  } else {
                                    // --- STARTS ---
                                    // Find if any BOM-Codes have used the attribute.
                                    // If so, cannot uncheck the checkbox.
                                    const foundAttribute = groupedAttributeValues.find(
                                      (obj) => Number(obj.attribute_id) === Number(attribute.attribute_id)
                                    )

                                    const attributeValues = foundAttribute && foundAttribute.attribute_values

                                    const valueIDs =
                                      attributeValues && attributeValues.length
                                        ? attributeValues.map((obj) => obj.id)
                                        : []

                                    const attributeUsed = variants.find(
                                      (obj) => intersection(obj.attribute_value_ids, valueIDs).length
                                    )
                                    // --- ENDS ---

                                    if (attributeUsed)
                                      message.warning('This attribute has been used in creating BOMs / Variants. Cannot be unchecked')
                                    else {
                                      const index = tempVariantAttributeIDs.indexOf(attribute.attribute_id)
                                      if (index > -1) tempVariantAttributeIDs.splice(index, 1)

                                      setVariantAttributeIDs(tempVariantAttributeIDs)
                                      setVariantCheckValues({
                                        ...variantCheckValues,
                                        [attribute.attribute_id]: false,
                                      })
                                    }
                                  }
                                }}
                              >
                                Use as a variant
                              </Checkbox>
                            </div>
                            <div className="col-4">
                              <Checkbox
                                checked={attributeValuesToAppend.includes(
                                  String(attribute.attribute_id),
                                )}
                                onChange={(e) => {
                                  const tempAttributeValuesToAppend = JSON.parse(
                                    JSON.stringify(attributeValuesToAppend),
                                  )
                                  if (e.target.checked)
                                    setAttributeValuesToAppend([
                                      ...tempAttributeValuesToAppend,
                                      attribute.attribute_id,
                                    ])
                                  else {
                                    const index = tempAttributeValuesToAppend.indexOf(
                                      attribute.attribute_id,
                                    )
                                    if (index > -1) tempAttributeValuesToAppend.splice(index, 1)
                                    setAttributeValuesToAppend(tempAttributeValuesToAppend)
                                  }
                                }}
                              >
                                Use in BOM Name
                              </Checkbox>
                            </div>

                            <Select
                              mode="multiple"
                              value={attributeValueIDs.filter((o) =>
                                attribute.attribute_values.map((a) => a.id).includes(o),
                              )}
                              defaultValue={attributeValueIDs.filter((o) =>
                                attribute.attribute_values.map((a) => a.id).includes(o),
                              )}
                              disabled={disabled}
                              style={{ width: '90%' }}
                              onChange={(value) => {
                                const tempAttributeValueIDs = JSON.parse(
                                  JSON.stringify(attributeValueIDs),
                                )
                                setAttributeValueIDs(union(tempAttributeValueIDs, value))
                              }}
                              onDeselect={(value) => {
                                const tempAttributeValueIDs = JSON.parse(
                                  JSON.stringify(attributeValueIDs),
                                )
                                setAttributeValueIDs(
                                  tempAttributeValueIDs.filter((item) => item !== value),
                                )
                              }}
                              placeholder={`Select ${attribute.attribute_name}(s)`}
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {attribute.attribute_values && attribute.attribute_values.length
                                ? attribute.attribute_values.map((obj) => (
                                    <Option key={String(obj.id)} value={String(obj.id)}>
                                      {`${obj.name}`}
                                    </Option>
                                  ))
                                : null}
                            </Select>
                          </div>
                        )
                      )
                    })}
                  </TabPane>

                  <TabPane tab="Styles" key="6">
                    <div className="col-3">
                      <div className="mb-2">Number of Styles</div>
                      <InputNumber
                        min={0}
                        // value={specsObj.specs_expected_value}
                        onChange={(value) => {
                          setStyles(Number(value))
                        }}
                        disabled={disabled || disabledStyles}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </TabPane>

                  <TabPane tab="Variations" key="7">
                    <div className="row">
                      <div className="col-lg-9">
                        <Button
                          type="primary"
                          onClick={createVariants}
                          className="mb-4"
                          disabled={
                            action === 'update' || disabled || !code || !styles || disabledStyles
                          }
                        >
                          Create BOMs
                        </Button>
                      </div>
                      {action === 'update' ? (
                        <div className="col-lg-3">
                          <PDFDownload id={id} />
                        </div>
                      ) : null}
                    </div>

                    {variants.map((variant, index) => {
                      const parentIndex = index
                      return (
                        <div className="row mt-2 mb-2" key={`main-${index}`}>
                          <div className="col-9">
                            <div className="row mt-2 mb-3" key={`${variants.name}attribute`}>
                              {variantAttributeIDs && variantAttributeIDs.length
                                ? variantAttributeIDs.map((variantAttribute, index) => {
                                    const attributeValue = groupedAttributeValues.filter(
                                      (o) => o.attribute_id === variantAttribute,
                                    )[0]
                                    return (
                                      attributeValue && (
                                        <div className="col-4">
                                          <div className="mb-2">
                                            {attributeValue.attribute_name}
                                          </div>
                                          <Select
                                            value={
                                              variant.attribute_value_ids
                                                ? variant.attribute_value_ids[index]
                                                : undefined
                                            }
                                            disabled={disabled}
                                            style={{ width: '100%' }}
                                            onChange={(value) => {
                                              const tempVariants = cloneDeep(variants)
                                              if (
                                                tempVariants &&
                                                tempVariants[parentIndex] &&
                                                tempVariants[parentIndex].attribute_value_ids
                                              )
                                                tempVariants[parentIndex].attribute_value_ids[
                                                  index
                                                ] = value
                                              setVariants(tempVariants)
                                            }}
                                          >
                                            {attributeValue &&
                                            attributeValue.attribute_values &&
                                            attributeValue.attribute_values.length
                                              ? attributeValue.attribute_values.map((obj) => (
                                                  <Option
                                                    key={String(obj.id)}
                                                    value={String(obj.id)}
                                                  >
                                                    {obj.name}
                                                  </Option>
                                                ))
                                              : null}
                                          </Select>
                                        </div>
                                      )
                                    )
                                  })
                                : null}
                            </div>

                            <div className="row mb-2" key={variants.code}>
                              <div className="col-4">
                                <div className="mb-2">
                                  BOM Code<span className="custom-error-text"> *</span>
                                </div>
                                <Input
                                  value={variant.code}
                                  onChange={({ target: { value } }) => {
                                    const tempVariants = cloneDeep(variants)
                                    tempVariants[index].code = value
                                    setVariants(tempVariants)
                                  }}
                                  disabled={disabled}
                                />
                              </div>

                              <div className="col-4">
                                <div className="mb-2">EAN</div>
                                <Input
                                  value={variant.ean}
                                  onChange={({ target: { value } }) => {
                                    const tempVariants = cloneDeep(variants)
                                    tempVariants[index].ean = value
                                    setVariants(tempVariants)
                                  }}
                                  disabled={disabled}
                                />
                              </div>

                              <div className="col-4">
                                <div className="mb-2">ASIN</div>
                                <Input
                                  value={variant.asin}
                                  onChange={({ target: { value } }) => {
                                    const tempVariants = cloneDeep(variants)
                                    tempVariants[index].asin = value
                                    setVariants(tempVariants)
                                  }}
                                  disabled={disabled}
                                />
                              </div>
                            </div>
                            <hr />
                          </div>
                          <div className="col-3">
                            <ImageUpload
                              existingImages={variantExistingImages[variant.id] || []} // Always pass an array. If not empty, it should have fully-formed URLs of images
                              placeholderType="general" // Accepted values: 'general' or 'general'
                              onUploadCallback={(imgFile) => {
                                const tempVariants = cloneDeep(variants)
                                tempVariants[index].image = imgFile
                                tempVariants[index].imageChanged = true
                                setVariants(tempVariants)
                              }}
                              onRemoveCallback={() => {
                                const tempVariants = cloneDeep(variants)
                                tempVariants[index].image = null
                                tempVariants[index].imageChanged = true
                                setVariants(tempVariants)
                              }}
                              maxImages={1}
                              editMode={!disabled}
                            />
                          </div>
                        </div>
                      )
                    })}

                    <div className="row" key="add-bom-row">
                      <div className="col-12">
                        <Button danger onClick={addBlankVariant}>
                          Add New BOM
                        </Button>
                      </div>
                    </div>
                  </TabPane>

                  <TabPane tab="Margins" key="8">
                    <div className="row mb-5">
                      <div className="col-lg-12 mb-2">Buyer Margin Details</div>
                      <div className="col-12 mb-4" style={{ textAlign: 'left' }}>
                        <Button onClick={addBuyerMarginRow} danger>
                          Add Buyer
                        </Button>
                      </div>
                      <div className="col-lg-12">
                        <Table
                          dataSource={buyerMarginTableData}
                          columns={buyerColumns}
                          pagination={false}
                          onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                          scroll={{ x: '130%' }}
                        />
                      </div>
                    </div>
                    <hr />
                    <div className="row mb-5">
                      <div className="col-lg-12 mb-2">Vendor Margin Details</div>
                      <div className="col-12 mb-4" style={{ textAlign: 'left' }}>
                        <Button onClick={addVendorMarginRow} danger>
                          Add Vendor
                        </Button>
                      </div>
                      <div className="col-lg-12">
                        <Table
                          dataSource={vendorMarginTableData}
                          columns={vendorColumns}
                          pagination={false}
                          onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                          scroll={{ x: '200%' }}
                        />
                      </div>
                    </div>
                    <hr />
                    <div className="row mb-5">
                      <div className="col-lg-12 mb-2">Margin Combinations</div>
                      <div className="col-lg-12">
                        <Table
                          dataSource={marginTableData}
                          columns={marginColumns}
                          pagination={false}
                          size="small"
                          onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                          scroll={{ x: '300%' }}
                        />
                      </div>
                    </div>
                  </TabPane>
                  {/* {action === 'update' && permissions.includes('updateProduct') ? (
                    <TabPane tab="Costing" key="9">
                      <Costing product_id={id} version_id={version} />
                    </TabPane>
                 ) : null} */}

                  <TabPane tab="Photoshoot" key="10">
                    <div className="row">
                      <div className="col-lg-12">
                        <span>PhotoShoot</span>
                        <ImageUpload
                          existingImages={existingPhotoshoots || []} // Always pass an array. If not empty, it should have names of files, without URL
                          prependURL={
                            process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL
                          }
                          placeholderType="general" // Accepted values: 'general' or 'profile'
                          onUploadCallback={(img) =>
                            setUploadedPhotoshoots([...uploadedPhotoshoots, img])
                          }
                          onRemoveCallback={(imgName, isNew) => {
                            console.log('new', isNew)
                            if (isNew) {
                              let tempImages = cloneDeep(uploadedPhotoshoots)
                              tempImages = tempImages.filter((obj) => obj.name !== imgName)
                              setUploadedPhotoshoots(tempImages)
                            } else setDeletedPhotoshoots([...deletedPhotoshoots, imgName])
                          }}
                          maxImages={10}
                          editMode
                        />
                        <div className="mb-4" />
                      </div>
                    </div>
                    <Divider style={{ borderTop: '3px solid black', minWidth: '70%' }} />
                    <span>Videos</span>
                    <br />
                    <FileUpload
                      existingFileNames={existingPhotoshootsVideos || []} // Always pass an array. If not empty, it should have names of files, without URL
                      prependURL={
                        process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL
                      }
                      placeholderType="general" // Accepted values: 'general' or 'profile'
                      onUploadCallback={(img) => {
                        setUploadedPhotoshootsVideos([...uploadedPhotoshootsVideos, ...img])
                      }}
                      onRemoveCallback={(imgName, isNew) => {
                        if (isNew) {
                          let tempFiles = cloneDeep(uploadedPhotoshootsVideos)
                          console.log('tempFiles', tempFiles)
                          tempFiles = tempFiles.filter((obj) => obj.name !== imgName)
                          setUploadedPhotoshootsVideos(tempFiles)
                        } else setDeletedPhotoshootsVideos([...deletedPhotoshootsVideos, imgName])
                      }}
                      maxFiles={20}
                    />
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createProduct')) ||
          (action === 'update' && permissions.includes('updateProduct')) ? (
            <Button type="primary" onClick={onSubmit} disabled={disabled}>
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

export default withRouter(connect(mapStateToProps)(ProductForm))
