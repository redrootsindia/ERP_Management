import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import momentBusinessDays from 'moment-business-days'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  Input,
  InputNumber,
  Button,
  Spin,
  Switch,
  Select,
  notification,
  Table,
  Image,
  Popconfirm,
  DatePicker,
  Modal,
} from 'antd'
import _ from 'lodash'
import { LoadingOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { HotTable } from '@handsontable/react'
import Error403 from 'components/Errors/403'
import {
  BRANDS,
  PRODUCT_VENDOR_NAMES_LIST,
  LEAD_TIMES,
  VARIANTS_BY_BRAND_ID,
  VARIANT,
  VARIANT_BY_CODES,
  UPSERT_PRODUCT_PURCHASE_ORDER,
  PRODUCT_PURCHASE_ORDER,
  AQL_LEVELS,
  PROFORMA_INVOICES,
} from './queries'
import { SALES_ORDER_NAMES_LIST } from '../../sales-orders/all-sales-orders/queries'
import PDFDownload from './pdfDownload'
import PDFDownloadPack from './pdfDownloadPack'
import PackForm from './packForm'
import PDFBarcode from './pdfBarcode'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const ProductPurchaseOrderForm = ({ user: { permissions, type } }) => {
  const history = useHistory()
  const { action, id } = useParams()
  const poID = id
  /* eslint-disable */
  const [mainType, setMainType] = useState('Product')
  const [changesMade, setChangesMade] = useState(false)
  const [totalRow, setTotalRows] = useState(1)
  // Brand ID and List Declaration & Definition Begin
  const [brandID, setBrandID] = useState(undefined)
  const [brandIDError, setBrandIDError] = useState(undefined)
  const [brandList, setBrandList] = useState([])

  // PI Declearation
  const [piID, setPiID] = useState(undefined)
  // const [piIDError, setPiIDError] = useState(undefined)
  const [piList, setPiList] = useState([])

  const {
    loading: piLoad,
    error: piErr,
    data: piData,
  } = useQuery(PROFORMA_INVOICES, { variables: { brandIDs: brandID } })
  useEffect(() => {
    if (
      !piLoad &&
      piData &&
      piData.proformaInvoices &&
      piData.proformaInvoices.rows &&
      piData.proformaInvoices.rows.length
    ) {
      setPiList(piData.proformaInvoices.rows)
    }
  }, [piLoad, piData])

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length)
      setBrandList(brandData.brands)
  }, [brandData, brandLoad])
  // Brand ID and List Declaration & Definition End

  // Vendor ID and List Declaration & Definition Begin
  const [vendorID, setVendorID] = useState(undefined)
  const [vendorIDError, setVendorIDError] = useState(undefined)
  const [vendorList, setVendorList] = useState([])
  const [vendorSearchString, setVendorSearchString] = useState(null)
  const [sameState, setSameState] = useState(true)
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

  // Lead Time Declaration & Definition Begin
  const [leadTimeID, setLeadTimeID] = useState(undefined)
  const [leadTimeIDError, setLeadTimeIDError] = useState(undefined)
  const [leadTime, setLeadTime] = useState(undefined)
  const [leadTimeList, setLeadTimeList] = useState([])
  const { loading: leadTimeLoad, error: leadTimeErr, data: leadTimeData } = useQuery(LEAD_TIMES)
  useEffect(() => {
    if (!leadTimeLoad && leadTimeData && leadTimeData.leadTimes && leadTimeData.leadTimes.length)
      setLeadTimeList(leadTimeData.leadTimes)
  }, [leadTimeData, leadTimeLoad])
  // Lead Time Declaration & Definition End

  // AQL-Level ID and List Declaration & Definition Begin
  const [aqlLevelID, setAQLLevelID] = useState('2')
  const [aqlLevelIDError, setAQLLevelIDError] = useState(undefined)
  const [aqlLevelList, setAQLLevelList] = useState([])
  const { loading: aqlLoad, error: aqlErr, data: aqlLevelData } = useQuery(AQL_LEVELS)
  useEffect(() => {
    if (!aqlLoad && aqlLevelData && aqlLevelData.aqlMains && aqlLevelData.aqlMains.length)
      setAQLLevelList(aqlLevelData.aqlMains)
  }, [aqlLevelData, aqlLoad])
  // AQL-Level and List Declaration & Definition End

  // PO Date Declaration Begin
  const [poDate, setPODate] = useState(moment())
  const [poDateError, setPODateError] = useState(undefined)
  // PO Date Declaration End

  // PO Date Declaration Begin
  const [dueDate, setDueDate] = useState(undefined)
  const [dueDateError, setDueDateError] = useState(undefined)
  // PO Date Declaration End

  // PO Status Declaration Begin
  const [poStatus, setPOStatus] = useState('Draft')
  const [poStatusError, setPOStatusError] = useState(undefined)
  // PO Status Declaration End

  // Reject Reason Declaration Begin
  const [rejectReason, setRejectReason] = useState(undefined)
  const [rejectReasonError, setRejectReasonError] = useState(undefined)
  // Reject Reason Declaration End

  const [salesOrderIDs, setSalesOrderIDs] = useState([])
  const [salesOrderList, setSalesOrderList] = useState([])
  const [salesOrderSearchString, setSalesOrderSearchString] = useState(null)

  const [variantCodeSearchString, setVariantCodeSearchString] = useState(null)

  const {
    loading: salesOrderLoad,
    error: salesOrderErr,
    data: salesOrderData,
  } = useQuery(SALES_ORDER_NAMES_LIST, {
    variables: { salesOrderIDs, searchString: salesOrderSearchString, brand_id: Number(brandID) },
  })
  useEffect(() => {
    if (
      !salesOrderLoad &&
      salesOrderData &&
      salesOrderData.salesOrderNames &&
      salesOrderData.salesOrderNames.length
    )
      setSalesOrderList(salesOrderData.salesOrderNames)
  }, [salesOrderData, salesOrderLoad])

  const [termsConditions, setTermsConditions] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' ||
      (action === 'update' &&
        permissions.includes('updatePurchaseOrder') &&
        (type === 'admin' || (type === 'vendor' && poStatus === 'Assigned'))),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const disabledForVendor = type === 'vendor'

  const [okText, setOkText] = useState(id ? 'Save' : 'Create')
  // Variant List Declaration Begin
  const [variantList, setVariantList] = useState([])

  const {
    loading: variantListLoad,
    error: variantListErr,
    data: variantListData,
  } = useQuery(VARIANTS_BY_BRAND_ID, {
    variables: { brand_id: brandID, searchString: variantCodeSearchString },
  })

  useEffect(() => {
    if (
      !variantListLoad &&
      variantListData &&
      variantListData.variantsByBrandID &&
      variantListData.variantsByBrandID.length
    )
      setVariantList(variantListData.variantsByBrandID)
  }, [variantListData, variantListLoad])
  // Variant List Declaration End

  // Calculate Due Date on change of either PO Date or Lead Time
  const calculateDueDate = (poDateVal, leadTimeVal) => {
    if (poDateVal && leadTimeVal) {
      setDueDate(momentBusinessDays(poDateVal, 'DD-MM-YYYY').businessAdd(leadTimeVal, 'days'))
    }
  }

  // Generate Variant Code List Begin
  const getVariantCodes = () => {
    return variantList.map(({ id: varID, code }) => (
      <Select.Option key={varID} value={varID}>
        {code}
      </Select.Option>
    ))
  }
  // Generate Variant Code End
  const debouncedVariantCodeSearch = _.debounce((value) => setVariantCodeSearchString(value), 500)

  // Get Variant Detail and set other details on code selection Begin
  const [
    getVariantDetail,
    { loading: variantDetailLoad, data: variantDetailData, error: variantDetailErr },
  ] = useLazyQuery(VARIANT)

  // Table data declaration begin
  const [tableData, setTableData] = useState([
    {
      key: 0 + moment().valueOf(),
      product_category_name: '',
      product_subcategory_name: '',
      image: '',
      product_name: '',
      variant_code: '',
      quantity: 0,
      unit_cost: 0,
      hsn_name: '',
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      comment: '',
    },
  ])

  useEffect(() => {
    if (!variantDetailLoad && variantDetailData && variantDetailData.variant) {
      const variantDetailRecord = variantDetailData.variant
      console.log('variantDetailRecord', variantDetailRecord)
      const intermediateTableData = _.cloneDeep(tableData)

      intermediateTableData.forEach((row) => {
        if (row.variant_id === variantDetailRecord.id) {
          row.product_category_name = variantDetailRecord.product_category_name
          row.product_subcategory_name = variantDetailRecord?.product_subcategory_name
          row.product_name = variantDetailRecord.product_name
          row.image = variantDetailRecord.image
          row.unit_cost = variantDetailRecord.cost_price
            ? variantDetailRecord.cost_price
            : row.unit_cost
          row.variant_code = variantDetailRecord.code
          if (variantDetailRecord.hsn_name) {
            row.hsn_name = variantDetailRecord.hsn_name
          }
          if (variantDetailRecord.cgst) {
            row.cgst = variantDetailRecord.cgst
          }
          if (variantDetailRecord.sgst) {
            row.sgst = variantDetailRecord.sgst
          }
          if (variantDetailRecord.igst) {
            row.igst = variantDetailRecord.igst
          }
        }
      })

      setTableData(intermediateTableData)
    }
  }, [variantDetailData, variantDetailLoad])
  // Get Variant Detail and set other details on code selection End

  const [tableDataError, setTableDataError] = useState(false)
  const columns = [
    {
      title: 'Category',
      dataIndex: 'product_category_name',
      key: 'product_category_name',
      // render(text, record) {
      //   return {
      //     props: {
      //       style:
      //         record.recordError && record.recordError.product_category_name
      //           ? {
      //               border: '1px solid red',
      //             }
      //           : {},
      //     },
      //     children: <span>{text}</span>,
      //   }
      // },
    },
    {
      title: 'Sub Category',
      dataIndex: 'product_subcategory_name',
      key: 'product_subcategory_name',
      // render(text, record) {
      //   return {
      //     props: {
      //       style:
      //         record.recordError && record.recordError.product_subcategory_name
      //           ? {
      //               border: '1px solid red',
      //             }
      //           : {},
      //     },
      //     children: <span>{text}</span>,
      //   }
      // },
    },
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
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      // render(text, record) {
      //   return {
      //     props: {
      //       style:
      //         record.recordError && record.recordError.product_subcategory_name
      //           ? {
      //               border: '1px solid red',
      //             }
      //           : {},
      //     },
      //     children: <span>{text}</span>,
      //   }
      // },
    },
    {
      title: 'BOM Code',
      dataIndex: 'variant_code',
      key: 'variant_code',
      render: (text, record) => ({
        props: {
          style:
            record.recordError && record.recordError.variant_id ? { border: '1px solid red' } : {},
        },
        children: (
          <Select
            onSearch={(value) => debouncedVariantCodeSearch(value)}
            onChange={(e) => {
              const intermediateTableData = _.cloneDeep(tableData)
              intermediateTableData.forEach((row) => {
                if (row.key === record.key) row.variant_id = e
              })
              setTableData(intermediateTableData)
              getVariantDetail({ variables: { id: e, vendor_id: vendorID } })
            }}
            value={record.variant_id}
            style={{ width: '100%' }}
            placeholder="Please select one"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            disabled={disabled || disabledForVendor}
          >
            {getVariantCodes()}
          </Select>
        ),
      }),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.quantity ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.quantity}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.quantity = value
                  }
                })
                if (type === 'vendor') setChangesMade(true)
                setTableData(intermediateTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled || disabledForVendor}
            />
          ),
        }
      },
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      render: (text, record) => (
        <InputNumber
          value={record.unit_cost}
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(tableData)

            intermediateTableData.forEach((row) => {
              if (row.key === record.key) {
                row.unit_cost = value
              }
            })
            if (type === 'vendor') setChangesMade(true)
            setTableData(intermediateTableData)
          }}
          style={{ width: '100%' }}
          disabled={disabled || disabledForVendor}
        />
      ),
    },
    {
      title: 'HSN Code',
      dataIndex: 'hsn_name',
      key: 'hsn_name',
      render(text, record) {
        return {
          props: {
            style:
              record.recordError && record.recordError.hsn_name ? { border: '1px solid red' } : {},
          },
          children: <span>{text}</span>,
        }
      },
    },
    {
      title: 'CGST',
      dataIndex: 'cgst',
      key: 'cgst',
      render: (text, record) => (
        <InputNumber
          value={record.cgst}
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(tableData)
            intermediateTableData.forEach((row) => {
              if (row.key === record.key) row.cgst = value
            })
            if (type === 'vendor') setChangesMade(true)
            setTableData(intermediateTableData)
          }}
          style={{ width: '100%' }}
          disabled={disabled || disabledForVendor}
        />
      ),
    },
    {
      title: 'SGST',
      dataIndex: 'sgst',
      key: 'sgst',
      render: (text, record) => (
        <InputNumber
          value={record.sgst}
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(tableData)

            intermediateTableData.forEach((row) => {
              if (row.key === record.key) {
                row.sgst = value
              }
            })
            if (type === 'vendor') setChangesMade(true)
            setTableData(intermediateTableData)
          }}
          style={{ width: '100%' }}
          disabled={disabled || disabledForVendor}
        />
      ),
    },
    {
      title: 'IGST',
      dataIndex: 'igst',
      key: 'igst',
      render: (text, record) => (
        <InputNumber
          value={record.igst}
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(tableData)

            intermediateTableData.forEach((row) => {
              if (row.key === record.key) {
                row.igst = value
              }
            })
            if (type === 'vendor') setChangesMade(true)
            setTableData(intermediateTableData)
          }}
          style={{ width: '120%' }}
          disabled={disabled || disabledForVendor}
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (text, record) => {
        let total = 0
        if (sameState && record.quantity && record.unit_cost) {
          total = record.quantity * record.unit_cost * (1 + record.cgst / 100 + record.sgst / 100)
        } else if (!sameState && record.quantity && record.unit_cost) {
          total = record.quantity * record.unit_cost * (1 + record.igst / 100)
        }
        return parseFloat(total).toFixed(2)
      },
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: (text, record) => (
        <Input
          value={record.comment}
          onChange={(e) => {
            const intermediateTableData = _.cloneDeep(tableData)
            intermediateTableData.forEach((row) => {
              if (row.key === record.key) row.comment = e.target.value
            })
            if (type === 'vendor') setChangesMade(true)
            setTableData(intermediateTableData)
          }}
          disabled={disabled}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      sort: false,
      filter: false,
      type: 'string',
      render: (text, record) => (
        <Popconfirm
          // disabled={!record.isNew}
          title="Sure to delete?"
          onConfirm={() => deleteRow(record.key)}
          disabled={disabled}
        >
          <Button type="danger" disabled={disabled}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  if (sameState) columns.splice(10, 1)
  else columns.splice(8, 2)
  // Table data declaration end
  // Function to add new row begin
  const addRow = () => {
    const count = tableData.length + 1
    const newRow = {
      key: count,
      product_category_name: '',
      product_subcategory_name: '',
      image: '',
      variant_code: '',
      quantity: 0,
      unit_cost: 0,
      hsn_name: '',
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      comment: '',
    }
    const newTableData = [...tableData, newRow]
    setTotalRows(newTableData.length)
    setTableData(newTableData)
  }
  // Function to add new row end

  // Function to delete row begin
  const deleteRow = (key) => {
    const newTableData = tableData.filter((item) => item.key !== key)
    setTotalRows(newTableData.length)
    setTableData(newTableData)
  }
  // Function to delete row end

  // Load and set purchase order data if edit begin

  const {
    loading: productPurchaseOrderLoad,
    error: productPurchaseOrderErr,
    data: productPurchaseOrderData,
  } = useQuery(PRODUCT_PURCHASE_ORDER, {
    variables: { id },
  })

  useEffect(() => {
    if (
      !productPurchaseOrderLoad &&
      productPurchaseOrderData &&
      productPurchaseOrderData.productPurchaseOrder
    ) {
      // prettier-ignore
      const { brand_id, vendor_id, lead_time_id, lead_time, po_date, due_date, status, same_state,
        detail, aql_main_id, pack, reject_reason, terms_conditions, sales_order_ids, proforma_invoice_id } = productPurchaseOrderData.productPurchaseOrder

      if (pack) {
        setMainType('Pack')
      } else {
        if (brand_id) {
          setBrandID(brand_id)
        }
        if (proforma_invoice_id) setPiID(proforma_invoice_id)
        if (vendor_id) setVendorID(vendor_id)
        if (lead_time_id) setLeadTimeID(lead_time_id)
        if (lead_time) setLeadTime(lead_time)
        if (po_date) setPODate(moment(Number(po_date)))
        if (due_date) setDueDate(moment(Number(due_date)))
        if (status) setPOStatus(status)
        if (reject_reason) setRejectReason(reject_reason)
        if (sales_order_ids) setSalesOrderIDs(sales_order_ids.map(String))
        if (terms_conditions) setTermsConditions(terms_conditions)
        if (aql_main_id) setAQLLevelID(String(aql_main_id))
        setMainType('Product')
        setSameState(same_state)

        const tempEditMode =
          action === 'create' ||
          (action === 'update' &&
            permissions.includes('updatePurchaseOrder') &&
            (type === 'admin' || (type === 'vendor' && status === 'Assigned')))
        setEditMode(tempEditMode)
        setDisabled(!tempEditMode)
      }

      const intermediateTableData = []
      if (detail && detail.length > 0) {
        detail.forEach((item, index) =>
          intermediateTableData.push({
            key: index,
            ...item,
          }),
        )
      }
      setTotalRows(intermediateTableData.length)
      setTableData(intermediateTableData)
    }
  }, [productPurchaseOrderData])

  // Load and set purchase order data if edit end

  // Handson Table & Data Capture Implementation Begins

  const [isModalVisible, setIsModalVisible] = useState(false)

  const handsonTableData = [{ variantCode: '', quantity: 0, unitCost: 0 }]

  const [handsonTableDataCopy, setHandsonTableDataCopy] = useState([])

  const handsonTableCol = [
    { data: 'variantCode', type: 'text' },
    { data: 'quantity', type: 'numeric' },
    { data: 'unitCost', type: 'numeric' },
  ]

  const showModal = () => setIsModalVisible(true)

  const handleOk = () => {
    if (handsonTableData.length > 0) {
      const intermediateHandsonTableData = _.cloneDeep(handsonTableData)
      const variantCodes = intermediateHandsonTableData.map((a) => a.variantCode)
      setHandsonTableDataCopy(intermediateHandsonTableData)
      getVariantByCodes({ variables: { codes: variantCodes } })
    }

    // setIsModalVisible(false)
  }

  const handleCancel = () => setIsModalVisible(false)

  const [
    getVariantByCodes,
    { loading: variantByCodesLoad, data: variantByCodesData, error: variantByCodesErr },
  ] = useLazyQuery(VARIANT_BY_CODES)

  useEffect(() => {
    if (!variantByCodesLoad && variantByCodesData && variantByCodesData.variantByCodes) {
      const { variantByCodes } = variantByCodesData

      const intermediateTableData = []

      handsonTableDataCopy.forEach((record, index) => {
        const existingRecord = _.filter(variantByCodes, (o) => o.code === record.variantCode)[0]

        intermediateTableData.push({
          key: index,
          variant_id: existingRecord ? existingRecord.id : undefined,
          product_category_name: existingRecord ? existingRecord.product_category_name : undefined,
          product_subcategory_name: existingRecord
            ? existingRecord.product_subcategory_name
            : undefined,
          product_name: existingRecord ? existingRecord.product_name : undefined,
          image: existingRecord ? existingRecord.image : undefined,
          variant_code: record && record.variantCode ? record.variantCode : undefined,
          quantity: record && record.quantity ? record.quantity : 0,
          unit_cost: record && record.unitCost ? record.unitCost : 0,
          hsn_name: existingRecord ? existingRecord.hsn_name : undefined,
          cgst: existingRecord ? existingRecord.cgst : 0,
          sgst: existingRecord ? existingRecord.sgst : 0,
          igst: existingRecord ? existingRecord.igst : 0,
          comment: '',
        })
      })

      setTableData(intermediateTableData)
      setIsModalVisible(false)
    }
  }, [variantByCodesData, variantByCodesLoad, handsonTableDataCopy])

  // Find Duplicates Begin
  const findDuplicates = (arr) => {
    const sorted_arr = arr.slice().sort()
    const results = []
    for (let i = 0; i < sorted_arr.length - 1; i += 1) {
      if (sorted_arr[i + 1] === sorted_arr[i]) results.push(sorted_arr[i])
    }
    return results
  }
  // Find Duplicates End

  // Handson Table & Data Capture Implementation Ends

  // On Submit Begin

  const [upsertProductPurchaseOrder] = useMutation(UPSERT_PRODUCT_PURCHASE_ORDER)

  const onSubmit = () => {
    setBrandIDError(undefined)
    setVendorIDError(undefined)
    setLeadTimeIDError(undefined)
    setPODateError(undefined)
    setDueDateError(undefined)
    setPOStatusError(undefined)
    setAQLLevelIDError(undefined)
    setRejectReasonError(undefined)

    let isError = false

    if (!brandID) {
      isError = true
      setBrandIDError('Please select a brand')
    }
    // if (!piID) {
    //   isError = true
    //   setPiIDError('Please select a PI')
    // }
    if (!vendorID) {
      isError = true
      setVendorIDError('Please select a vendor')
    }
    if (!leadTimeID) {
      isError = true
      setLeadTimeIDError('Please select the lead time')
    }
    if (!poDate) {
      isError = true
      setPODateError('Please select the PO Date')
    }
    if (!dueDate) {
      isError = true
      setDueDateError('Please select the Due Date')
    }
    if (!poStatus) {
      isError = true
      setPOStatusError('Please select the PO Status')
    }
    if (poStatus === 'Rejected by Vendor' && !rejectReason) {
      isError = true
      setRejectReasonError('Reason cannot be empty')
    }
    if (!aqlLevelID) {
      isError = true
      setAQLLevelIDError('Please select the AQL Level')
    }
    if (!tableData || tableData.length === 0) {
      isError = true
      setTableDataError('Please add at least add one record')
    }

    const detail = []

    const intermediateTableData = _.cloneDeep(tableData)

    intermediateTableData.forEach((record) => {
      record.recordError = {}

      // if (!record.product_category_name || record.product_category_name === '') {
      //   isError = true
      //   record.recordError.product_category_name = true
      // }
      // if (!record.product_subcategory_name || record.product_subcategory_name === '') {
      //   isError = true
      //   record.recordError.product_subcategory_name = true
      // }
      if (!record.variant_id || record.variant_id === '') {
        isError = true
        record.recordError.variant_id = true
      }
      if (!record.quantity || record.quantity === 0) {
        isError = true
        record.recordError.quantity = true
      }
      if (!record.hsn_name || record.hsn_name === '') {
        isError = true
        record.recordError.hsn_name = true
      }

      detail.push({
        id: record.id || undefined,
        variant_id: record.variant_id,
        quantity: record.quantity,
        hsn_name: record.hsn_name,
        unit_cost: record.unit_cost,
        cgst: sameState ? record.cgst : 0,
        sgst: sameState ? record.sgst : 0,
        igst: !sameState ? record.igst : 0,
        comment: record.comment,
      })
    })

    setTableData(intermediateTableData)

    // -- Search for duplicates begin: Get duplicate IDs
    const intermediateTableDataDuplicates = _.cloneDeep(tableData).map((a) => a.variant_id)
    const duplicateIDs = findDuplicates(intermediateTableDataDuplicates)
    // Get duplicated BOM-Code Names:
    // In the step above, the 1st map is done on "variant_id", because while editing PO, "variant_code" is not obtained unless Brand dropdown is altered.
    const duplicateNames = duplicateIDs
      .filter((obj) => !!obj)
      .map((dupID) => variantList.find((v) => Number(v.id) === Number(dupID)).code)
    // -- Search for duplicates end

    if (isError || (duplicateNames && duplicateNames.length)) {
      if (isError)
        notification.error({
          message: 'Incorrect Data',
          description:
            'Please make sure all the mandatory fields are filled and have valid entries.',
        })

      if (duplicateNames && duplicateNames.length) {
        isError = true
        notification.error({
          message: 'Duplicate BOMs found:',
          description: `${_.uniq(duplicateNames).join(', ')}`,
        })
      }
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertProductPurchaseOrder({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        brand_id: Number(brandID),
        proforma_invoice_id: Number(piID),
        vendor_id: Number(vendorID),
        lead_time_id: Number(leadTimeID),
        lead_time: Number(leadTime),
        po_date: String(poDate.valueOf()),
        due_date: String(dueDate.valueOf()),
        status: poStatus,
        changes_made: changesMade,
        same_state: sameState,
        aql_main_id: Number(aqlLevelID),
        pack: false,
        reject_reason: rejectReason,
        sales_order_ids: salesOrderIDs.map(Number),
        terms_conditions: termsConditions,
        detail,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/purchase-orders/product')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  // On Submit End

  const debouncedSalesOrderSearch = _.debounce((value) => setSalesOrderSearchString(value), 500)
  const debouncedVendorSearch = _.debounce((value) => setVendorSearchString(value), 500)

  if (!permissions.includes('readPurchaseOrder')) return <Error403 />
  if (action === 'create' && !permissions.includes('createPurchaseOrder')) return <Error403 />
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (piErr) return `Error occured while fetching data: ${piErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (aqlErr) return `Error occured while fetching data: ${aqlErr.message}`
  if (variantListErr) return `Error occured while fetching data: ${variantListErr.message}`
  if (variantDetailErr) return `Error occured while fetching data: ${variantDetailErr.message}`
  if (leadTimeErr) return `Error occured while fetching data: ${leadTimeErr.message}`
  if (variantByCodesErr) return `Error occured while fetching data: ${variantByCodesErr.message}`
  if (salesOrderErr) return `Error occured while fetching data: ${salesOrderErr.message}`

  if (productPurchaseOrderErr)
    return `Error occured while fetching data: ${productPurchaseOrderErr.message}`

  return (
    <div>
      <Helmet title="Product Purchase Order" />

      <Spin spinning={variantListLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className={action === 'create' ? 'col-4' : 'col-3'}>
            <h5 className="mb-2">
              <strong>
                {id ? 'Edit' : 'Create'} {mainType === 'Pack' ? 'Pack' : 'Product'} Purchase Order{' '}
                {id ? `#${id}` : ' '}
              </strong>
            </h5>
          </div>
          {action === 'create' ? (
            <div className="col-3">
              <Select
                value={mainType}
                disabled={disabled}
                style={{ width: '100%' }}
                onChange={(value) => {
                  setMainType(value)
                }}
                placeholder="Select Main Type"
              >
                <Option key="Product" value="Product">
                  Product
                </Option>
                <Option key="Pack" value="Pack">
                  Pack
                </Option>
              </Select>
            </div>
          ) : null}

          <div className="col-9 pull-right" style={{ textAlign: 'right' }}>
            &emsp;
            {action === 'update' &&
            permissions.includes('updatePurchaseOrder') &&
            type !== 'vendor' ? (
              <div>
                <Button
                  type="primary"
                  className="mr-3"
                  onClick={() =>
                    history.push(`/purchase-orders/printer/create/${poID}/${mainType}`)
                  }
                >
                  Create Printer PO
                </Button>
                <PDFBarcode id={id} type={mainType} />
                {mainType === 'Pack' ? <PDFDownloadPack id={id} /> : <PDFDownload id={id} />}
                {mainType === 'Pack' ? (
                  <PDFDownloadPack id={id} proformaInvoice />
                ) : (
                  <PDFDownload id={id} proformaInvoice />
                )}
                <Switch
                  checked={editMode}
                  onChange={(checked) => {
                    setEditMode(checked)
                    setDisabled(!checked)
                  }}
                  className="ml-3"
                />
                &ensp;Edit
              </div>
            ) : null}
          </div>
        </div>

        {mainType === 'Pack' ? (
          <PackForm
            id={id}
            action={action}
            disabled={disabled}
            permissions={permissions}
            history={history}
            okText={okText}
            brandList={brandList}
            vendorList={vendorList}
            leadTimeList={leadTimeList}
            aqlLevelList={aqlLevelList}
            type={type}
          />
        ) : (
          <div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-2">
                    <div className="mb-2">
                      Brand<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={brandID}
                      disabled={action === 'update' || disabled || disabledForVendor}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setBrandID(value)
                      }}
                      className={
                        brandIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select an brand"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {brandList && brandList.length
                        ? brandList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{brandIDError || ''}</div>
                  </div>
                  {/* select pi  */}
                  <div className="col-lg-2">
                    <div className="mb-2">
                      PI<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={piID}
                      disabled={action === 'update' || disabled || disabledForVendor}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setPiID(value)
                      }}
                      // className={
                      //   piIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      // }
                      placeholder="Select an PI"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {piList && piList.length
                        ? piList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.id}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    {/* <div className="custom-error-text mb-4">{piIDError || ''}</div> */}
                  </div>

                  <div className="col-lg-3">
                    <div className="mb-2">
                      Vendor<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      onSearch={(value) => debouncedVendorSearch(value)}
                      value={
                        _.filter(vendorList, (o) => o.id === vendorID)[0]
                          ? // eslint-disable-next-line prefer-template
                            _.filter(vendorList, (o) => o.id === vendorID)[0].id +
                            ',' +
                            _.filter(vendorList, (o) => o.id === vendorID)[0].state
                          : undefined
                      }
                      disabled={disabled || disabledForVendor}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        const csv = value.split(',')
                        setVendorID(csv[0])
                        setSameState(csv[1] === 'Maharashtra')
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
                            <Select.Option
                              key={String(obj.id)}
                              value={`${String(obj.id)},${String(obj.state)}`}
                            >
                              {`${obj.company} (${obj.name})`}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{vendorIDError || ''}</div>
                  </div>

                  <div className="col-lg-2">
                    <div className="mb-2">
                      Lead Time<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={
                        _.filter(leadTimeList, (o) => o.id === leadTimeID)[0]
                          ? // eslint-disable-next-line prefer-template
                            _.filter(leadTimeList, (o) => o.id === leadTimeID)[0].id +
                            ',' +
                            _.filter(leadTimeList, (o) => o.id === leadTimeID)[0].dueInDays
                          : undefined
                      }
                      className={
                        leadTimeIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      disabled={disabled || disabledForVendor}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        const csv = value.split(',')
                        setLeadTimeID(csv[0])
                        setLeadTime(csv[1])
                        calculateDueDate(poDate, csv[1])
                      }}
                      placeholder="Select lead time"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {leadTimeList && leadTimeList.length
                        ? leadTimeList.map((obj) => (
                            <Select.Option
                              key={String(obj.id)}
                              value={`${String(obj.id)},${String(obj.dueInDays)}`}
                            >
                              {obj.title}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{leadTimeIDError || ''}</div>
                  </div>

                  <div className="col-lg-2">
                    <div className="mb-2">
                      PO Date<span className="custom-error-text"> *</span>
                    </div>
                    <DatePicker
                      value={poDate}
                      style={{ width: '100%' }}
                      format="DD-MM-YYYY"
                      className={
                        poDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      onChange={(value) => {
                        setPODate(value)
                        calculateDueDate(value, leadTime)
                      }}
                      disabled={disabled || disabledForVendor}
                    />
                    <div className="custom-error-text mb-4">{poDateError || ''}</div>
                  </div>

                  <div className="col-lg-2">
                    <div className="mb-2">
                      Due Date<span className="custom-error-text"> *</span>
                    </div>
                    <DatePicker
                      style={{ width: '100%' }}
                      value={dueDate}
                      format="DD-MM-YYYY"
                      className={
                        dueDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      onChange={(value) => {
                        setDueDate(value)
                      }}
                      disabled={disabled || disabledForVendor}
                    />
                    <div className="custom-error-text mb-4">{dueDateError || ''}</div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-2">
                    <div className="mb-2">
                      AQL Level<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      value={aqlLevelID}
                      disabled={disabled || disabledForVendor}
                      style={{ width: '100%' }}
                      onChange={(value) => setAQLLevelID(value)}
                      className={
                        aqlLevelIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                      placeholder="Select an AQL level"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {aqlLevelList && aqlLevelList.length
                        ? aqlLevelList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {obj.level_name}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                    <div className="custom-error-text mb-4">{aqlLevelIDError || ''}</div>
                  </div>

                  <div className="col-lg-3">
                    <div className="mb-2">
                      Status<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      value={poStatus}
                      disabled={disabled || disabledForVendor}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setPOStatus(value)
                      }}
                      className={
                        poStatusError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    >
                      <Select.Option key="Draft" value="Draft">
                        Draft
                      </Select.Option>
                      <Select.Option key="Assigned" value="Assigned">
                        Assigned
                      </Select.Option>
                      <Select.Option key="In Progress" value="In Progress">
                        In Progress
                      </Select.Option>
                      <Select.Option key="Closed" value="Closed">
                        Closed
                      </Select.Option>
                      <Select.Option key="Force Closed" value="Force Closed">
                        Force Closed
                      </Select.Option>
                      <Select.Option key="Rejected by Vendor" value="Rejected by Vendor">
                        Rejected by Vendor
                      </Select.Option>
                    </Select>
                    <div className="custom-error-text mb-4">{poStatusError || ''}</div>
                  </div>
                  {action === 'update' && poStatus === 'Rejected by Vendor' && (
                    <div>
                      <div className="col-lg-3">
                        <div className="mb-2">
                          Reject Reason<span className="custom-error-text"> *</span>
                        </div>

                        <Input
                          value={rejectReason}
                          disabled={disabled || disabledForVendor}
                          placeholder="Reject Reason"
                          onChange={({ target: { value } }) => setRejectReason(value)}
                        />
                        <div className="custom-error-text mb-4">{rejectReasonError || ''}</div>
                      </div>
                    </div>
                  )}
                  <div className="col-lg-4">
                    <div className="mb-2">Link Sales Orders (optional)</div>
                    <Select
                      mode="multiple"
                      showSearch
                      value={salesOrderIDs}
                      onSearch={(value) => debouncedSalesOrderSearch(value)}
                      onChange={(value) => setSalesOrderIDs(value)}
                      placeholder="Select Sales Orders to associate with this P.O."
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      className="custom-pad-r1 mb-2 w-100"
                    >
                      {salesOrderList && salesOrderList.length
                        ? salesOrderList.map((obj) => (
                            <Select.Option key={String(obj.id)} value={String(obj.id)}>
                              {`#${obj.id} (${obj.name}) (${obj.buyer_name})
                              `}
                            </Select.Option>
                          ))
                        : null}
                    </Select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-6 mb-4">
                    <div className="mb-2">Terms and Conditions (to be displayed in the PDFs)</div>
                    <Input.TextArea
                      rows={3}
                      value={termsConditions}
                      onChange={({ target: { value } }) => setTermsConditions(value)}
                      disabled={disabled}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <Table
                      dataSource={tableData}
                      columns={columns}
                      pagination={false}
                      className={tableDataError ? 'custom-error-border' : ''}
                      onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                    />
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-4 pull-right ">
                    <Button onClick={showModal} type="primary" disabled={disabled}>
                      Copy From Excel
                    </Button>
                  </div>
                  <div className="col-4 pull-right ">
                    <span>Total Quantity : </span>
                    {tableData.reduce((accumulator, currentValue) => {
                      return Number((accumulator + currentValue.quantity).toFixed(2))
                    }, 0)}
                  </div>
                  <div className="col-4 pull-right" style={{ textAlign: 'right' }}>
                    <span className="mr-3">Total {totalRow}</span>
                    <Button
                      onClick={addRow}
                      type="default"
                      // style={{ background: 'blue', color: 'white' }}
                      disabled={disabled}
                    >
                      Add Row
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Modal
              title="Copy From Excel"
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
              bodyStyle={{ height: '430px' }}
            >
              <HotTable
                data={handsonTableData}
                columns={handsonTableCol}
                colHeaders={['BOM Code', 'Quantity', 'Cost']}
                stretchH="all"
                rowHeaders
                width="400"
                height="400"
              />
            </Modal>

            <div className="row mb-4 ml-2 mr-2 pull-right">
              <div className="col-12">
                {(action === 'create' && permissions.includes('createPurchaseOrder')) ||
                (action === 'update' && permissions.includes('updatePurchaseOrder')) ? (
                  <Button type="primary" onClick={onSubmit} disabled={disabledForVendor}>
                    {okText}
                  </Button>
                ) : null}
                &emsp;
                <Button danger onClick={() => history.goBack()}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(ProductPurchaseOrderForm))
