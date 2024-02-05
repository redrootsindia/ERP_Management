// /* eslint-disable prefer-destructuring */
/* eslint "no-unused-vars": "off" */
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { withRouter, useHistory, useParams, Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { useQuery, useMutation } from '@apollo/client'
import _ from 'lodash'
import {
  Input,
  InputNumber,
  Button,
  Select,
  notification,
  Table,
  Popconfirm,
  Tabs,
  Tag,
  Spin,
  Image,
} from 'antd'
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import HandsOnTableComponent from './handsOnTable'
import Versions from './versions'
import { MATERIAL_SUBCATEGORIES } from '../materials/all-materials/queries'
import { PRODUCT_COSTING_VERSION, UPSERT_PRODUCT_COSTING } from './queries'
// import { element } from 'prop-types'

const { TabPane } = Tabs

const mapStateToProps = ({ user }) => ({ user })

const Costing = () => {
  // const querySearch = useLocation().search
  // const readOnly = new URLSearchParams(querySearch).get('readOnly')
  // const { version } = useParams()
  const { id, version } = useParams()
  const history = useHistory()
  const [readOnly, setReadOnly] = useState(localStorage.getItem('readOnly') || false)
  // const [product, setProduct] = useState([])
  const [version_id, setVersion_id] = useState(version || undefined)
  const [subCategoryID, setSubCategoryID] = useState(null)
  const [subCategoriesList, setSubCategoriesList] = useState(null)
  const [subCategories, setSubCategories] = useState([])
  const [fittingSubCategoriesList, setFittingSubCategoriesList] = useState([])
  const [activeKey, setActiveKey] = useState(0)
  const [fabricData, setFabricData] = useState([])
  const [productCostingDataCSV, setProductCostingDataCSV] = useState([])
  const [fittingData, setFittingData] = useState([
    {
      key: new Date().getTime(),
      category: 'Fitting',
      sub_category: ' ',
      rate: 0,
      quantity: 0,
      total: 0,
    },
  ])
  // console.log('csv=', productCostingDataCSV)
  const [otherData, setOtherData] = useState([
    {
      key: new Date().getTime(),
      other_category: ' ',
      rate: 0,
      quantity: 0,
    },
  ])

  const [headsData, setHeadsData] = useState([
    {
      key: 1,
      head: 'Sub Total (Material Cost)',
      total: 0,
    },
    {
      key: 2,
      head: 'Over Head',
      total: 10,
    },
    {
      key: 3,
      head: 'Transport',
      total: 10,
    },
    {
      key: 4,
      head: 'Labour',
      total: 0,
    },
    {
      key: 5,
      head: 'Total Cost',
      total: 0,
    },
    // {
    //   key: 6,
    //   head: 'Profit',
    //   total: 0,
    // },
    // {
    //   key: 7,
    //   head: 'Grand Total',
    //   total: 0,
    // },
    // {
    //   key: 8,
    //   head: 'Difference',
    //   total: 0,
    // },
    // {
    //   key: 9,
    //   head: 'Transfer Price',
    //   percentage: 0,
    //   total: 0,
    // },
    // {
    //   key: 10,
    //   head: 'Selling Price',
    //   total: 0,
    // },
    // {
    //   key: 11,
    //   head: 'MRP',
    //   total: 0,
    // },
  ])

  const [versionNote, setVersionNote] = useState(null)
  const [upsertProductCosting] = useMutation(UPSERT_PRODUCT_COSTING)

  useEffect(() => {
    const tempHeadsData = _.cloneDeep(headsData)
    const subTotal =
      fabricData.reduce((acc, obj) => acc + obj.rate * obj.quantity, 0) +
      fittingData.reduce((acc, obj) => acc + obj.rate * obj.quantity, 0) +
      otherData.reduce((acc, obj) => acc + obj.rate * obj.quantity, 0)

    // tempHeadsData.forEach((row) => {
    //   if (row.key === 1) {
    //     row.total = Number(subTotal.toFixed(2))
    //   }
    // })
    tempHeadsData[0].total = Number(subTotal.toFixed(2))
    tempHeadsData[4].total =
      Number(subTotal.toFixed(2)) +
      Number(tempHeadsData[1].total) +
      Number(tempHeadsData[2].total) +
      Number(tempHeadsData[3].total)

    setHeadsData(tempHeadsData)
  }, [fabricData, fittingData, otherData])

  const deleteRow = (key, table) => {
    if (table === 'fitting') setFittingData(fittingData.filter((item) => item.key !== key))
    if (table === 'other') setOtherData(otherData.filter((item) => item.key !== key))
  }

  // const tableColumns = [
  //   {
  //     title: 'Image',
  //     dataIndex: 'image',
  //     key: 'image',
  //     render: (image) => (
  //       <div>
  //         <Image
  //           src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + image}
  //           height={image ? 35 : 20}
  //           width={image ? 35 : 20}
  //           alt="general"
  //           fallback="resources/images/placeholder/general.png"
  //           preview={{ mask: <EyeOutlined /> }}
  //         />
  //       </div>
  //     ),
  //   },
  //   {
  //     title: 'Product Name',
  //     dataIndex: 'name',
  //     key: 'name',
  //     render: (text, record) => (
  //       <Link to={`/products/all-products/update/${record.id}`}>{text}</Link>
  //     ),
  //   },
  //   {
  //     title: 'Brand',
  //     dataIndex: 'brand',
  //     key: 'brand',
  //     // render: (text) => <Link to="/settings/misc/brands">{text}</Link>,
  //   },
  //   {
  //     title: 'Product Category',
  //     dataIndex: 'product_category',
  //     key: 'product_category',
  //     // render: (text) => <Link to="/settings/product-settings/categories">{text}</Link>,
  //   },
  //   {
  //     title: 'Product Subcategory',
  //     dataIndex: 'product_subcategory',
  //     key: 'product_subcategory',
  //     // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
  //   },
  //   {
  //     title: 'Vendors',
  //     dataIndex: 'vendors',
  //     key: 'vendors',
  //     render: (vendors) =>
  //       vendors && vendors.length
  //         ? vendors.map((type, i) => {
  //           if (i === vendors.length - 1) return type
  //           return `${type} | `
  //         })
  //         : null,
  //   },
  // ]

  const fabricColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Sub-Category',
      dataIndex: 'subcategory_id',
      key: 'subcategory_id',
      render: (text) =>
        subCategoriesList &&
        subCategoriesList.length &&
        subCategoriesList.find((obj) => obj.id === String(text)).name,
    },

    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (text, record) =>
        readOnly ? (
          record.rate
        ) : (
          <InputNumber
            value={record.rate}
            min={0}
            style={{ width: '80%' }}
            onChange={(value) => {
              const intermediateTableData = _.cloneDeep(fabricData)
              intermediateTableData.forEach((row) => {
                if (row.key === record.key) {
                  row.rate = value
                }
              })
              setFabricData(intermediateTableData)
            }}
          />
        ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => text || 0,
    },
    {
      title: 'Rate/pc',
      dataIndex: 'total',
      key: 'total',
      render: (text, record) => {
        let total = 0
        if (record.rate && record.quantity) total = record.rate * record.quantity
        return parseFloat(total).toFixed(2)
      },
    },
  ]

  const fittingColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Sub-Category',
      dataIndex: 'subcategory_id',
      key: 'subcategory_id',
      render: (text, record) => (
        <>
          {readOnly ? (
            record.subcategory_name
          ) : (
            <Select
              showSearch
              value={record.subcategory_id || null}
              style={{ width: 100 }}
              onChange={(e) => {
                const intermediateTableData = _.cloneDeep(fittingData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.subcategory_id = e
                })
                setFittingData(intermediateTableData)
              }}
              placeholder="Select an Sub-category"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {fittingSubCategoriesList && fittingSubCategoriesList.length
                ? fittingSubCategoriesList.map((obj) => (
                    <Select.Option key={String(obj.id)} value={String(obj.id)}>
                      {obj.name}
                    </Select.Option>
                  ))
                : null}
            </Select>
          )}
        </>
      ),
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (text, record) =>
        readOnly ? (
          record.rate
        ) : (
          <InputNumber
            value={record.rate}
            min={0}
            style={{ width: '100%' }}
            onChange={(value) => {
              const intermediateTableData = _.cloneDeep(fittingData)
              intermediateTableData.forEach((row) => {
                if (row.key === record.key) {
                  row.rate = value
                }
              })
              setFittingData(intermediateTableData)
            }}
          />
        ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) =>
        readOnly ? (
          record.rate
        ) : (
          <InputNumber
            value={record.quantity}
            min={0}
            style={{ width: '80%' }}
            onChange={(value) => {
              const intermediateTableData = _.cloneDeep(fittingData)
              intermediateTableData.forEach((row) => {
                if (row.key === record.key) {
                  row.quantity = value
                }
              })
              setFittingData(intermediateTableData)
            }}
          />
        ),
    },
    {
      title: 'Rate/pc',
      dataIndex: 'total',
      key: 'total',
      render: (text, record) => {
        let total = 0
        if (record.rate && record.quantity) total = record.rate * record.quantity
        return parseFloat(total).toFixed(2)
      },
    },
    {
      title: '',
      key: 'action',
      sort: false,
      filter: false,
      type: 'string',
      render: (text, record) => (
        <Popconfirm title="Sure to delete?" onConfirm={() => deleteRow(record.key, 'fitting')}>
          <Button type="danger" disabled={readOnly}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const otherColumns = [
    {
      title: 'Category',
      dataIndex: 'other_category',
      key: 'other_category',
      render: (text, record) =>
        readOnly ? (
          text
        ) : (
          <Input
            value={record.other_category}
            onChange={(e) => {
              const intermediateTableData = _.cloneDeep(otherData)
              intermediateTableData.forEach((row) => {
                if (row.key === record.key) row.other_category = e.target.value
              })
              setOtherData(intermediateTableData)
            }}
          />
        ),
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (text, record) =>
        readOnly ? (
          record.rate
        ) : (
          <>
            <InputNumber
              value={record.rate}
              min={0}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(otherData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.rate = value
                  }
                })
                setOtherData(intermediateTableData)
              }}
            />
          </>
        ),
    },
    {
      title: 'Consumption',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) =>
        readOnly ? (
          text
        ) : (
          <>
            <InputNumber
              value={record.quantity}
              min={0}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(otherData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.quantity = value
                  }
                })
                setOtherData(intermediateTableData)
              }}
            />
          </>
        ),
    },
    {
      title: 'Rate/pc',
      dataIndex: 'total',
      key: 'total',
      render: (text, record) => {
        let total = 0
        if (record.rate && record.quantity) total = record.rate * record.quantity
        return parseFloat(total).toFixed(2)
      },
    },
    {
      title: '',
      key: 'action',
      filter: false,
      type: 'string',
      render: (text, record) => (
        <Popconfirm title="Sure to delete?" onConfirm={() => deleteRow(record.key, 'other')}>
          <Button type="danger" disabled={readOnly}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const headsColumn = [
    {
      title: 'Heads',
      dataIndex: 'head',
      key: 'head',
      render: (text) => <span>{text}</span>,
    },
    // {
    //   title: 'Percentage',
    //   dataIndex: 'percentage',
    //   key: 'percentage',
    //   render: (text, record) =>
    //     readOnly ? (
    //       text
    //     ) : Number(record.key) === 9 ? (
    //       <InputNumber
    //         min={0}
    //         value={record.percentage}
    //         onChange={(value) => {
    //           const intermediateTableData = _.cloneDeep(headsData)
    //           intermediateTableData[8].percentage = value
    //           intermediateTableData[8].total = (
    //             intermediateTableData[9].total *
    //             (value / 100)
    //           ).toFixed(2)
    //           intermediateTableData[7].total = (
    //             (intermediateTableData[9].total * (value / 100)).toFixed(2) -
    //             intermediateTableData[6].total
    //           ).toFixed(2)

    //           setHeadsData(intermediateTableData)
    //         }}
    //       />
    //     ) : (
    //       ' '
    //     ),
    // },
    {
      title: 'Total Value',
      dataIndex: 'total',
      key: 'total',
      render: (text, record) =>
        readOnly ? (
          record.total
        ) : (
          <InputNumber
            value={record.total}
            style={{ width: '50%' }}
            onChange={(value) => {
              const intermediateTableData = _.cloneDeep(headsData)
              intermediateTableData.forEach((row) => {
                if (row.key === record.key) {
                  row.total = value
                }
              })
              if (
                Number(record.key) === 1 ||
                Number(record.key) === 2 ||
                Number(record.key) === 3 ||
                Number(record.key) === 4
              )
                intermediateTableData[4].total =
                  Number(intermediateTableData[0].total) +
                  Number(intermediateTableData[1].total) +
                  Number(intermediateTableData[2].total) +
                  Number(intermediateTableData[3].total)

              // if (Number(record.key) === 6)
              //   intermediateTableData[6].total =
              //     intermediateTableData[4].total + intermediateTableData[5].total

              // if (
              //   Number(record.key) === 9 ||
              //   Number(record.key) === 7 ||
              //   Number(record.key) === 8 ||
              //   Number(record.key) === 10
              // )
              //   intermediateTableData[7].total =
              //     intermediateTableData[8].total - intermediateTableData[6].total
              console.log('intermediateTableData', intermediateTableData)

              setHeadsData(intermediateTableData)
            }}
          />
        ),
    },
  ]

  const onRemove = (key) => {
    let lastIndex = -1
    subCategories.forEach((e, i) => {
      if (e.key === key) {
        lastIndex = i - 1
      }
    })
    if (subCategories.length && activeKey === key) {
      let newActiveKey
      if (lastIndex >= 0) {
        newActiveKey = subCategories[lastIndex].key
      } else {
        newActiveKey = subCategories[0].key
      }
      setActiveKey(newActiveKey)
    }
    console.log('key', typeof key)
    console.log('key', key)
    console.log('subCategories', subCategories)
    setSubCategories(subCategories.filter((obj) => obj.key !== key))
    console.log('fabricData', fabricData)
    setFabricData(fabricData.filter((obj) => obj.key !== key))
  }

  const onChange = (key) => {
    setActiveKey(key)
  }

  const addFittingRow = () => {
    const count = fittingData.length + 1 + new Date().getTime()
    const newRow = {
      key: count,
      category: 'fitting',
      sub_category: null,
      rate: 0,
      quantity: 0,
      total: 0,
    }
    const newTableData = [...fittingData, newRow]
    setFittingData(newTableData)
  }

  const addOtherRow = () => {
    const count = otherData.length + 1 + new Date().getTime()
    const newRow = {
      key: count,
      category: ' ',
      rate: 0,
      consumption: 0,
      total: 0,
    }
    const newTableData = [...otherData, newRow]
    setOtherData(newTableData)
  }

  const {
    loading: subcatLoad,
    error: subcatErr,
    data: subcatData,
  } = useQuery(MATERIAL_SUBCATEGORIES)

  const {
    loading: productCostingLoad,
    error: productCostingErr,
    data: productCostingData,
    refetch,
  } = useQuery(PRODUCT_COSTING_VERSION, {
    variables: { version: version_id, product_id: id },
  })

  // const {
  //   loading: productLoad,
  //   error: productErr,
  //   data: productData,
  // } = useQuery(PRODUCT_DETAIL_BY_ID, {
  //   variables: { id: product_id },
  // })

  // useEffect(() => {
  //   if (productData && productData.productDetailsByID) setProduct([productData.productDetailsByID])
  // }, [productLoad, productData])

  useEffect(() => {
    if (!productCostingLoad && productCostingData && productCostingData.productCostingVersion) {
      const { product_costing_subcategory, product_costing_main, product_costing_total } =
        productCostingData.productCostingVersion
      const mergedData = [
        ...product_costing_main,
        ...product_costing_total,
        ...product_costing_subcategory,
      ]

      setProductCostingDataCSV(mergedData)
      const tempProductCostingSubategory = []
      const tempProductCostingMainFabric = []
      if (product_costing_subcategory && product_costing_subcategory.length) {
        product_costing_subcategory.forEach((obj) => {
          product_costing_main.forEach((element) => {
            if (String(obj.id) === String(element.product_costing_subcategory_id)) {
              let tempSubcategories = null
              if (subCategoriesList && subCategoriesList.length) {
                tempSubcategories = subCategoriesList.find(
                  (e) => Number(e.id) === Number(obj.subcategory_id),
                )
              }
              let subTotal = 0
              if (
                obj.product_costing_subcategory_data &&
                obj.product_costing_subcategory_data.length
              ) {
                subTotal = obj.product_costing_subcategory_data
                  .reduce((a, b) => a + b.length * b.width * b.panel, 0)
                  .toFixed(2)
              }
              console.log('subTotal', subTotal)
              const wastagePercent = obj.wastage_percent

              const wastageTotal = (subTotal / 100) * wastagePercent

              const grandTotal = Number(subTotal) + Number(wastageTotal)
              tempProductCostingSubategory.push({
                subcategory_id: obj.subcategory_id,
                key: obj.id,
                title: tempSubcategories?.name || '',
                length: obj.length,
                width: obj.width,
                handsOnTableData:
                  obj.product_costing_subcategory_data &&
                  obj.product_costing_subcategory_data.length
                    ? [
                        ...obj.product_costing_subcategory_data.map((e) => ({
                          part: e.part,
                          L: e.length,
                          W: e.width,
                          P: e.panel,
                          Total: (e.length * e.width * e.panel).toFixed(2),
                        })),
                        { part: '', L: 0, W: 0, P: 0, Total: 0 },
                        { part: '', L: 0, W: 0, P: 0, Total: 0 },
                        { part: '', L: 0, W: 0, P: 0, Total: 0 },
                        { part: 'Sub Total', L: ' ', W: ' ', P: ' ', Total: subTotal },
                        {
                          part: 'Wastage',
                          L: ' ',
                          W: ' ',
                          P: wastagePercent,
                          Total: wastageTotal.toFixed(2),
                        },
                        {
                          part: 'Grand Total',
                          L: ' ',
                          W: ' ',
                          P: ' ',
                          Total: grandTotal,
                        },
                      ]
                    : [],
              })
              tempProductCostingMainFabric.push({
                category: 'Fabric',
                key: obj.id,
                subcategory_id: String(obj.subcategory_id),
                subcategory_name: tempSubcategories?.name || '',
                quantity: element.quantity,
                rate: element.rate,
              })
            }
          })
        })
      }

      const tempProductCostingMainFitting = []
      const tempProductCostingMainOther = []
      if (product_costing_main && product_costing_main) {
        product_costing_main.forEach((obj) => {
          if (obj.category_id === 1) {
            tempProductCostingMainFitting.push({
              category: 'Fitting',
              key: obj.id,
              subcategory_id: String(obj.subcategory_id),
              subcategory_name:
                fittingSubCategoriesList &&
                fittingSubCategoriesList.length &&
                fittingSubCategoriesList.find((e) => e.id === String(obj.subcategory_id)).name,
              quantity: obj.quantity,
              rate: obj.rate,
            })
          } else if (!obj.category_id) {
            tempProductCostingMainOther.push({
              key: obj.id,
              other_category: obj.other_category,
              quantity: obj.quantity,
              rate: obj.rate,
            })
          }
        })
      }

      const intermediateHeadsData = _.cloneDeep(headsData)
      if (product_costing_total && product_costing_total) {
        product_costing_total.forEach((obj) => {
          intermediateHeadsData.forEach((row) => {
            if (row.key === obj.row_key) {
              row.total = obj.total
            }
          })
          intermediateHeadsData[4].total =
            intermediateHeadsData[0].total +
            intermediateHeadsData[1].total +
            intermediateHeadsData[2].total +
            intermediateHeadsData[3].total

          // intermediateHeadsData[6].total =
          //   intermediateHeadsData[4].total + intermediateHeadsData[5].total

          // intermediateHeadsData[7].total = (
          //   intermediateHeadsData[8].total - intermediateHeadsData[6].total
          // ).toFixed(2)
        })
      }
      setActiveKey(String(tempProductCostingSubategory[0].key))
      setSubCategories(tempProductCostingSubategory)
      setHeadsData(intermediateHeadsData)
      setFabricData(tempProductCostingMainFabric)
      setFittingData(tempProductCostingMainFitting)
      setOtherData(tempProductCostingMainOther)
    }
  }, [productCostingLoad, productCostingData, subCategoriesList])

  useEffect(() => {
    if (
      !subcatLoad &&
      subcatData &&
      subcatData.materialSubcategories &&
      subcatData.materialSubcategories.length
    ) {
      setSubCategoriesList(
        subcatData.materialSubcategories.filter((obj) => obj.material_category_id === 2),
      )
      setFittingSubCategoriesList(
        subcatData.materialSubcategories.filter((obj) => obj.material_category_id === 1),
      )
    }
  }, [subcatLoad, subcatData])

  const onSubmit = () => {
    const productCostingSubcategory = []
    subCategories.forEach((e) => {
      productCostingSubcategory.push({
        key: String(e.key),
        subcategory_id: Number(e.subcategory_id),
        length: e.length,
        width: e.width,
        wastage_percent: e.handsOnTableData.P ? e.handsOnTableData.at(-2).P : null,
        product_costing_subcategory_data: e.handsOnTableData
          .slice(0, -3)
          .filter((obj) => obj.part && obj.L && obj.W && obj.P)
          .map((obj) => ({
            part: obj.part,
            length: obj.L,
            width: obj.W,
            panel: obj.P,
          })),
      })
    })
    const productCostingMain = []
    const costingMain = [...fabricData, ...fittingData, ...otherData]
    costingMain.forEach((obj) => {
      productCostingMain.push({
        key: String(obj.key) || null,
        other_category: obj.other_category || null,
        subcategory_id: Number(obj.subcategory_id) || null,
        quantity: Number(obj.quantity),
        rate: obj.rate,
      })
    })
    const productCostingTotal = []
    headsData.forEach((obj) => {
      productCostingTotal.push({
        row_key: obj.key,
        total: Number(obj.total),
      })
    })
    console.log('product_costing_subcategory', productCostingSubcategory)
    console.log('product_costing_main', productCostingMain)
    upsertProductCosting({
      variables: {
        product_id: Number(id),
        comment: versionNote,
        product_costing_subcategory: productCostingSubcategory,
        product_costing_main: productCostingMain,
        product_costing_total: productCostingTotal,
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        history.push('/costing')
        if (refetch) refetch()
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while saving costing.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const subcategoryTableCallback = (wastageTotal, key) => {
    console.log('wastageTotal', wastageTotal)
    console.log('key', key)
    const intermediateFabricData = _.cloneDeep(fabricData)
    console.log('intermediateFabricData', intermediateFabricData)
    const intermediateTableData = _.cloneDeep(subCategories)

    intermediateFabricData.forEach((row) => {
      intermediateTableData.forEach((record) => {
        if (row.key === key && record.key === key) {
          row.quantity = (wastageTotal / (record.length * record.width)).toFixed(2)
        }
      })
    })
    setFabricData(intermediateFabricData)
  }
  const versionCallback = (versionID, read) => {
    if (versionID) setVersion_id(versionID)
    if (read) setReadOnly(read)
  }
  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`
  if (productCostingErr) return `Error occured while fetching data: ${productCostingErr.message}`

  return (
    <div>
      <Helmet title="Costing" />
      <Spin spinning={productCostingLoad} tip="Loading..." size="large">
        <div className="row mb-4">
          <div className="col-6">
            <h5 className="mb-2">
              <strong>Costing</strong>
            </h5>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-lg-12">
            <Versions
              product_id={id}
              versionCallback={versionCallback}
              data={productCostingDataCSV}
            />
          </div>
        </div>
        {/* <div className="row mb-4">
        //   <div className="col-lg-12">
        //     <div className="card">
        //       <div className="card-body">
        //         <div className="kit__utils__table">
        //           <Table
        //             columns={tableColumns}
        //             dataSource={product}
        //             pagination={false}
        //             rowKey={(record) => String(record.id)}
        //           />
        //         </div>
        //       </div>
        //     </div>
        //   </div>
  </div> */}
        <div className="row mb-4 mr-2 ml-2">
          {readOnly && (
            <div className="col-6 pull-right" style={{ textAlign: 'right' }}>
              <Button
                onClick={() => {
                  setReadOnly(false)
                  setVersion_id(version_id)
                }}
                type="default"
              >
                Back
              </Button>
            </div>
          )}
        </div>
        <div className="row costing_form">
          <div className="col-lg-6">
            <div className="card">
              <h5 className=" ml-4 mt-4">
                <strong>Fabric</strong>
              </h5>
              <div className="card-body">
                <Table
                  columns={fabricColumns}
                  dataSource={fabricData}
                  pagination={false}
                  rowKey={(record) => String(record.key)}
                />
              </div>
            </div>
            <div className="card">
              <h5 className=" ml-4 mt-4">
                <strong>Fitting</strong>
              </h5>
              <div className="card-body">
                <Table
                  columns={fittingColumns}
                  dataSource={fittingData}
                  pagination={false}
                  // scroll={{ x: '130%' }}
                  rowKey={(record) => String(record.key)}
                />
                <div className="row mt-4">
                  <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
                    <Button onClick={addFittingRow} type="default" disabled={readOnly}>
                      Add Row
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <h5 className=" ml-4 mt-4">
                <strong>Other</strong>
              </h5>
              <div className="card-body">
                <Table
                  columns={otherColumns}
                  dataSource={otherData}
                  pagination={false}
                  rowKey={(record) => String(record.key)}
                />
                <div className="row mt-4">
                  <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
                    <Button onClick={addOtherRow} type="default" disabled={readOnly}>
                      Add Row
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <Table
                  columns={headsColumn}
                  dataSource={headsData}
                  pagination={false}
                  rowKey={(record) => String(record.key)}
                />
                {!readOnly ? (
                  <>
                    <div className="mt-4 mr-2">
                      <h5 className="mb-2">
                        <strong>Notes</strong>
                      </h5>
                      <Input
                        placeholder="Notes for New Version"
                        value={versionNote}
                        onChange={({ target: { value } }) => setVersionNote(value)}
                      />
                    </div>
                    <div className="row mt-4 mb-4">
                      <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
                        <Button onClick={onSubmit} type="primary" disabled={readOnly}>
                          Save New Version
                        </Button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card">
              {!readOnly ? (
                <div className="row mt-2">
                  <div className="col-lg-3">
                    <div className="ml-4 mt-1">Select Material</div>
                  </div>
                  <div className="col-lg-3">
                    <Select
                      showSearch
                      value={subCategoryID}
                      disabled={readOnly}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setSubCategoryID(value)
                        const subCategory = subCategoriesList.find(
                          (obj) => obj.id === String(value),
                        )
                        // eslint-disable-next-line no-plusplus
                        const count = String(new Date().getTime())
                        setActiveKey(count)
                        setSubCategories([
                          ...subCategories,
                          {
                            id: subCategory.id,
                            subcategory_id: subCategory.id,
                            title: subCategory.name,
                            key: count,
                            length: 0,
                            width: 0,
                            consumption: 0,
                            handsOnTableData: [
                              { part: '', L: 0, W: 0, P: 0, Total: 0 },
                              { part: '', L: 0, W: 0, P: 0, Total: 0 },
                              { part: '', L: 0, W: 0, P: 0, Total: 0 },
                              { part: '', L: 0, W: 0, P: 0, Total: 0 },
                              { part: '', L: 0, W: 0, P: 0, Total: 0 },
                              { part: 'Sub Total', L: ' ', W: ' ', P: ' ', Total: 0 },
                              { part: 'Wastage', L: ' ', W: ' ', P: 2, Total: 0 },
                              { part: 'Grand Total', L: ' ', W: ' ', P: ' ', Total: 0 },
                            ],
                          },
                        ])
                        setFabricData([
                          ...fabricData,
                          {
                            subcategory_id: subCategory.id,
                            category: 'Fabric',
                            key: count,
                            quantity: 0,
                            rate: 0,
                            total_price: 0,
                          },
                        ])
                      }}
                      placeholder="Select an Material"
                    >
                      {subCategoriesList && subCategoriesList.length
                        ? subCategoriesList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>
                </div>
              ) : null}
              <div className="card-body">
                <Tabs
                  hideAdd
                  onChange={onChange}
                  activeKey={activeKey}
                  type={!readOnly ? 'editable-card' : 'card'}
                  tabPosition="left"
                  onEdit={onRemove}
                >
                  {subCategories.map((pane) => (
                    <TabPane tab={pane.title} key={pane.key}>
                      <HandsOnTableComponent
                        subCategory={pane}
                        readOnly={readOnly}
                        subcategoryTableCallback={subcategoryTableCallback}
                      />
                      <div className="row mt-4">
                        <div className="col-4">
                          <div className="mb-2">
                            Length<span className="custom-error-text"> *</span>
                          </div>
                          {readOnly ? (
                            pane.length
                          ) : (
                            <InputNumber
                              value={pane.length}
                              onChange={(value) => {
                                const intermediateTableData = _.cloneDeep(subCategories)
                                const intermediateFabricData = _.cloneDeep(fabricData)

                                intermediateTableData.forEach((row) => {
                                  if (row.key === pane.key) {
                                    row.length = value
                                  }
                                })
                                setSubCategories(intermediateTableData)
                                intermediateFabricData.forEach((row) => {
                                  if (row.key === pane.key) {
                                    row.quantity = (
                                      pane.handsOnTableData.at(-1).Total /
                                      (pane.width * value)
                                    ).toFixed(2)
                                  }
                                })
                                setFabricData(intermediateFabricData)
                              }}
                              // disabled={disabled}
                              // className={
                              //   pricePerUOMError
                              //     ? 'custom-error-border'
                              //     : disabled
                              //     ? 'disabledStyle'
                              //     : ''
                              // }
                              style={{ width: '100%' }}
                            />
                          )}
                        </div>
                        <div className="col-4">
                          <div className="mb-2">
                            Width<span className="custom-error-text"> *</span>
                          </div>
                          {readOnly ? (
                            pane.width
                          ) : (
                            <InputNumber
                              value={pane.width}
                              onChange={(value) => {
                                const intermediateTableData = _.cloneDeep(subCategories)
                                const intermediateFabricData = _.cloneDeep(fabricData)
                                intermediateTableData.forEach((row) => {
                                  if (row.key === pane.key) {
                                    row.width = value
                                  }
                                })
                                setSubCategories(intermediateTableData)
                                intermediateFabricData.forEach((row) => {
                                  if (row.key === pane.key) {
                                    row.quantity = (
                                      pane.handsOnTableData.at(-1).Total /
                                      (pane.length * value)
                                    ).toFixed(2)
                                  }
                                })
                                setFabricData(intermediateFabricData)
                              }}
                              // disabled={disabled}
                              // className={
                              //   pricePerUOMError
                              //     ? 'custom-error-border'
                              //     : disabled
                              //     ? 'disabledStyle'
                              //     : ''
                              // }
                              style={{ width: '100%' }}
                            />
                          )}
                        </div>
                        <div className="col-4">
                          <div className="mb-2">
                            <Tag color="#108ee9">
                              Consumption :{' '}
                              {pane.width && pane.length && pane.handsOnTableData.at(-1).Total
                                ? (
                                    pane.handsOnTableData.at(-1).Total /
                                    (pane.length * pane.width)
                                  ).toFixed(2)
                                : 0}
                              {/* {(
                              materialSubcategoryData.handsOnTableData.at(-1).Total /
                              (materialSubcategoryData.length * materialSubcategoryData.width)
                            ).toFixed(2)} */}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    </TabPane>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(Costing))
