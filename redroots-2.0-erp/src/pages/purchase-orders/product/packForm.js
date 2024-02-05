import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import momentBusinessDays from 'moment-business-days'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  Input,
  InputNumber,
  Button,
  Spin,
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
import Error403 from 'components/Errors/403'
import { HotTable } from '@handsontable/react'
import {
  PACK_VARIANTS_BY_BRAND_ID,
  PACK_VARIANT,
  PACK_VARIANT_BY_CODES,
  UPSERT_PACK_PURCHASE_ORDER,
  PACK_PURCHASE_ORDER,
} from './queries'
import { SALES_ORDER_NAMES_LIST } from '../../sales-orders/all-sales-orders/queries'

const PackPurchaseOrderForm = (props) => {
  const {
    id,
    action,
    permissions,
    history,
    okText,
    brandList,
    vendorList,
    leadTimeList,
    aqlLevelList,
    type,
    disabled: disabledProp,
  } = props
  const [okTextPack, setOkTextPack] = useState(okText)

  const [disabled, setDisabled] = useState(undefined)
  const disabledForVendor = type === 'vendor'

  // Brand ID and List Declaration & Definition Begin
  const [brandID, setBrandID] = useState(undefined)
  const [brandIDError, setBrandIDError] = useState(undefined)

  // Vendor ID and List Declaration & Definition Begin
  const [vendorID, setVendorID] = useState(undefined)
  const [vendorIDError, setVendorIDError] = useState(undefined)
  const [sameState, setSameState] = useState(true)
  // Vendor ID and List Declaration & Definition End

  // Lead Time Declaration & Definition Begin
  const [leadTimeID, setLeadTimeID] = useState(undefined)
  const [leadTimeIDError, setLeadTimeIDError] = useState(undefined)
  const [leadTime, setLeadTime] = useState(undefined)
  // Lead Time Declaration & Definition End

  // AQL-Level ID and List Declaration & Definition Begin
  const [aqlLevelID, setAQLLevelID] = useState('2')
  const [aqlLevelIDError, setAQLLevelIDError] = useState(undefined)
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
  const {
    loading: salesOrderLoad,
    error: salesOrderErr,
    data: salesOrderData,
  } = useQuery(SALES_ORDER_NAMES_LIST, { variables: { salesOrderIDs } })
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

  // Variant List Declaration Begin
  const [packVariantList, setPackVariantList] = useState([])
  const [
    getPackVariantList,
    { loading: packVariantListLoad, error: packVariantListErr, data: packVariantListData },
  ] = useLazyQuery(PACK_VARIANTS_BY_BRAND_ID)

  useEffect(() => {
    if (
      !packVariantListLoad &&
      packVariantListData &&
      packVariantListData.packVariantsByBrandID &&
      packVariantListData.packVariantsByBrandID.length
    )
      setPackVariantList(packVariantListData.packVariantsByBrandID)
  }, [packVariantListData, packVariantListLoad])
  // Variant List Declaration End

  useEffect(() => setDisabled(disabledProp), [disabledProp])

  // Calculate Due Date on change of either PO Date or Lead Time
  const calculateDueDate = (poDateVal, leadTimeVal) => {
    if (poDateVal && leadTimeVal) {
      setDueDate(momentBusinessDays(poDateVal, 'DD-MM-YYYY').businessAdd(leadTimeVal, 'days'))
    }
  }

  // Generate Variant Code List Begin
  const getVariantCodes = () => {
    return packVariantList.map(({ id: varID, code }) => (
      <Select.Option key={varID} value={varID}>
        {code}
      </Select.Option>
    ))
  }
  // Generate Variant Code End

  // Get Variant Detail and set other details on code selection Begin
  const [
    getPackVariantDetail,
    { loading: packVariantDetailLoad, data: packVariantDetailData, error: packVariantDetailErr },
  ] = useLazyQuery(PACK_VARIANT)

  useEffect(() => {
    if (!packVariantDetailLoad && packVariantDetailData && packVariantDetailData.packVariant) {
      const packVariantDetailRecord = packVariantDetailData.packVariant

      const intermediateTableData = _.cloneDeep(tableData)

      intermediateTableData.forEach((row) => {
        if (row.pack_id === packVariantDetailRecord.id) {
          row.product_category_name = packVariantDetailRecord.product_category_name
          row.product_subcategory_name = packVariantDetailRecord.product_subcategory_name
          row.image = packVariantDetailRecord.image
          row.pack_code = packVariantDetailRecord.code
          if (packVariantDetailRecord.hsn_name) {
            row.hsn_name = packVariantDetailRecord.hsn_name
          }
          if (packVariantDetailRecord.cgst) {
            row.cgst = packVariantDetailRecord.cgst
          }
          if (packVariantDetailRecord.sgst) {
            row.sgst = packVariantDetailRecord.sgst
          }
          if (packVariantDetailRecord.igst) {
            row.igst = packVariantDetailRecord.igst
          }
        }
      })

      setTableData(intermediateTableData)
    }
  }, [packVariantDetailData, packVariantDetailLoad])
  // Get Variant Detail and set other details on code selection End

  // Table data declaration begin
  const [tableData, setTableData] = useState([
    {
      key: 0,
      product_category_name: '',
      product_subcategory_name: '',
      image: '',
      pack_code: '',
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
  const [tableDataError, setTableDataError] = useState(false)

  const columns = [
    {
      title: 'Category',
      dataIndex: 'product_category_name',
      key: 'product_category_name',
      render(text, record) {
        return {
          props: {
            style:
              record.recordError && record.recordError.product_category_name
                ? {
                    border: '1px solid red',
                  }
                : {},
          },
          children: <span>{text}</span>,
        }
      },
    },
    {
      title: 'Sub Category',
      dataIndex: 'product_subcategory_name',
      key: 'product_subcategory_name',
      render(text, record) {
        return {
          props: {
            style:
              record.recordError && record.recordError.product_subcategory_name
                ? {
                    border: '1px solid red',
                  }
                : {},
          },
          children: <span>{text}</span>,
        }
      },
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
      title: 'Pack Code',
      dataIndex: 'code',
      key: 'code',
      render: (text, record) => ({
        props: {
          style:
            record.recordError && record.recordError.pack_id ? { border: '1px solid red' } : {},
        },
        children: (
          <Select
            onChange={(e) => {
              const intermediateTableData = _.cloneDeep(tableData)
              intermediateTableData.forEach((row) => {
                if (row.key === record.key) row.pack_id = e
              })
              setTableData(intermediateTableData)
              getPackVariantDetail({ variables: { id: e } })
            }}
            value={record.pack_id}
            style={{ width: '100%' }}
            placeholder="Please select one"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            disabled={disabled}
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
                setTableData(intermediateTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
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
            setTableData(intermediateTableData)
          }}
          style={{ width: '100%' }}
          disabled={disabled}
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
            setTableData(intermediateTableData)
          }}
          style={{ width: '100%' }}
          disabled={disabled}
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
            setTableData(intermediateTableData)
          }}
          style={{ width: '100%' }}
          disabled={disabled}
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
            setTableData(intermediateTableData)
          }}
          style={{ width: '120%' }}
          disabled={disabled}
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

  if (sameState) columns.splice(9, 1)
  else columns.splice(7, 2)
  // Table data declaration end

  // Function to add new row begin
  const addRow = () => {
    const count = tableData.length + 1
    const newRow = {
      key: count,
      product_category_name: '',
      product_subcategory_name: '',
      image: '',
      code: '',
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
    setTableData(newTableData)
  }
  // Function to add new row end

  // Function to delete row begin
  const deleteRow = (key) => {
    const newTableData = tableData.filter((item) => item.key !== key)
    setTableData(newTableData)
  }
  // Function to delete row end

  // Load and set purchase order data if edit begin

  const {
    loading: packPurchaseOrderLoad,
    error: packPurchaseOrderErr,
    data: packPurchaseOrderData,
  } = useQuery(PACK_PURCHASE_ORDER, {
    variables: { id },
  })

  useEffect(() => {
    if (
      !packPurchaseOrderLoad &&
      packPurchaseOrderData &&
      packPurchaseOrderData.packPurchaseOrder
    ) {
      // prettier-ignore
      const {
        brand_id,
        vendor_id,
        lead_time_id,
        lead_time,
        po_date,
        due_date,
        status,
        reject_reason,
        same_state,
        pack_detail,
        aql_main_id,
        terms_conditions,
        sales_order_ids
      } = packPurchaseOrderData.packPurchaseOrder

      if (brand_id) {
        setBrandID(brand_id)
        getPackVariantList({ variables: { brand_id } })
      }
      if (vendor_id) setVendorID(vendor_id)
      if (lead_time_id) setLeadTimeID(lead_time_id)
      if (lead_time) setLeadTime(lead_time)
      if (po_date) setPODate(moment(Number(po_date)))
      if (due_date) setDueDate(moment(Number(due_date)))
      if (status) setPOStatus(status)
      if (sales_order_ids) setSalesOrderIDs(sales_order_ids.map(String))
      if (reject_reason) setRejectReason(reject_reason)
      if (terms_conditions) setTermsConditions(terms_conditions)
      if (aql_main_id) setAQLLevelID(String(aql_main_id))
      setSameState(same_state)
      const tempEditMode =
        action === 'create' ||
        (action === 'update' &&
          permissions.includes('updatePurchaseOrder') &&
          (type === 'admin' || (type === 'vendor' && status === 'Assigned')))
      setDisabled(!tempEditMode)

      const intermediateTableData = []
      if (pack_detail && pack_detail.length > 0) {
        pack_detail.forEach((item, index) =>
          intermediateTableData.push({
            key: index,
            ...item,
          }),
        )
      }
      setTableData(intermediateTableData)
    }
  }, [packPurchaseOrderData])

  // Load and set purchase order data if edit end

  // Handson Table & Data Capture Implementation Begins

  const [isModalVisible, setIsModalVisible] = useState(false)

  const handsonTableData = [{ packCode: '', quantity: 0, unitCost: 0 }]

  const [handsonTableDataCopy, setHandsonTableDataCopy] = useState([])

  const handsonTableCol = [
    { data: 'packCode', type: 'text' },
    { data: 'quantity', type: 'numeric' },
    { data: 'unitCost', type: 'numeric' },
  ]

  const showModal = () => setIsModalVisible(true)

  const handleOk = () => {
    if (handsonTableData.length > 0) {
      const intermediateHandsonTableData = _.cloneDeep(handsonTableData)
      const packCodes = intermediateHandsonTableData.map((a) => a.packCode)
      setHandsonTableDataCopy(intermediateHandsonTableData)
      getPackVariantByCodes({ variables: { codes: packCodes } })
    }

    // setIsModalVisible(false)
  }

  const handleCancel = () => setIsModalVisible(false)

  const [
    getPackVariantByCodes,
    { loading: packVariantByCodesLoad, data: packVariantByCodesData, error: packVariantByCodesErr },
  ] = useLazyQuery(PACK_VARIANT_BY_CODES)

  useEffect(() => {
    if (
      !packVariantByCodesLoad &&
      packVariantByCodesData &&
      packVariantByCodesData.packVariantByCodes
    ) {
      const { packVariantByCodes } = packVariantByCodesData

      const intermediateTableData = []

      handsonTableDataCopy.forEach((record, index) => {
        const existingRecord = _.filter(packVariantByCodes, (o) => o.code === record.packCode)[0]

        intermediateTableData.push({
          key: index,
          pack_id: existingRecord ? existingRecord.id : undefined,
          product_category_name: existingRecord ? existingRecord.product_category_name : undefined,
          product_subcategory_name: existingRecord
            ? existingRecord.product_subcategory_name
            : undefined,
          image: existingRecord ? existingRecord.image : undefined,
          pack_code: record && record.packCode ? record.packCode : undefined,
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
  }, [packVariantByCodesData, packVariantByCodesLoad, handsonTableDataCopy])

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

  const [upsertPackPurchaseOrder] = useMutation(UPSERT_PACK_PURCHASE_ORDER)

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
    if (poStatus === 'Rejected by Vendor' && !rejectReason) {
      isError = true
      setRejectReasonError('Reason cannot be empty')
    }
    if (!dueDate) {
      isError = true
      setDueDateError('Please select the Due Date')
    }
    if (!poStatus) {
      isError = true
      setPOStatusError('Please select the PO Status')
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

      if (!record.product_category_name || record.product_category_name === '') {
        isError = true
        record.recordError.product_category_name = true
      }
      if (!record.product_subcategory_name || record.product_subcategory_name === '') {
        isError = true
        record.recordError.product_subcategory_name = true
      }
      if (!record.pack_id || record.pack_id === '') {
        isError = true
        record.recordError.pack_id = true
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
        pack_id: record.pack_id,
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
    const intermediateTableDataDuplicates = _.cloneDeep(tableData).map((a) => a.pack_id)
    const duplicateIDs = findDuplicates(intermediateTableDataDuplicates)
    // Get duplicated Pack-Code Names:
    // In the step above, the 1st map is done on "pack_id", because while editing PO, "pack_code" is not obtained unless Brand dropdown is altered.
    const duplicateNames = duplicateIDs
      .filter((obj) => !!obj)
      .map((dupID) => packVariantList.find((v) => Number(v.id) === Number(dupID)).code)
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
          message: 'Duplicate PACKs found:',
          description: `${_.uniq(duplicateNames).join(', ')}`,
        })
      }
      return
    }

    setOkTextPack(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertPackPurchaseOrder({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        brand_id: Number(brandID),
        vendor_id: Number(vendorID),
        lead_time_id: Number(leadTimeID),
        lead_time: Number(leadTime),
        po_date: String(poDate.valueOf()),
        due_date: String(dueDate.valueOf()),
        status: poStatus,
        same_state: sameState,
        aql_main_id: Number(aqlLevelID),
        pack: true,
        terms_conditions: termsConditions,
        sales_order_ids: salesOrderIDs.map(Number),
        detail,
      },
    })
      .then(() => {
        setOkTextPack(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/purchase-orders/product')
      })
      .catch((err) => {
        setOkTextPack(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  // On Submit End
  if (!permissions.includes('readPurchaseOrder')) return <Error403 />
  if (action === 'create' && !permissions.includes('createPurchaseOrder')) return <Error403 />
  if (packVariantListErr) return `Error occured while fetching data: ${packVariantListErr.message}`
  if (packVariantDetailErr)
    return `Error occured while fetching data: ${packVariantDetailErr.message}`
  if (packVariantByCodesErr)
    return `Error occured while fetching data: ${packVariantByCodesErr.message}`
  if (packPurchaseOrderErr)
    return `Error occured while fetching data: ${packPurchaseOrderErr.message}`
  if (salesOrderErr) return `Error occured while fetching data: ${salesOrderErr.message}`
  return (
    <div>
      <Helmet title="Product Purchase Order" />

      <Spin spinning={packVariantListLoad} tip="Loading..." size="large">
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
                  disabled={disabled || disabledForVendor}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setBrandID(value)
                    getPackVariantList({ variables: { brand_id: value } })
                  }}
                  className={brandIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
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

              <div className="col-lg-3">
                <div className="mb-2">
                  Vendor<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
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
                  className={poDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
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
                  className={dueDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
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
                    setRejectReason(null)
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
                <>
                  <div className="col-lg-3">
                    <div className="mb-2">
                      Reject Reason<span className="custom-error-text"> *</span>
                    </div>

                    <Input
                      value={rejectReason}
                      placeholder="Reject Reason"
                      onChange={({ target: { value } }) => setRejectReason(value)}
                    />
                    <div className="custom-error-text mb-4">{rejectReasonError || ''}</div>
                  </div>
                </>
              )}
              <div className="col-lg-4">
                <div className="mb-2">Sales Orders</div>
                <Select
                  mode="multiple"
                  showSearch
                  value={salesOrderIDs}
                  onChange={(value) => setSalesOrderIDs(value)}
                  placeholder="Vendors"
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
                <div className="mb-2">Terms and Conditions</div>
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
              <div className="col-6 pull-right ">
                <Button onClick={showModal} type="primary" disabled={disabled}>
                  Copy From Excel
                </Button>
              </div>
              <div className="col-6 pull-right" style={{ textAlign: 'right' }}>
                <Button onClick={addRow} type="default" disabled={disabled}>
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
            colHeaders={['Pack Code', 'Quantity', 'Cost']}
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
              <Button type="primary" onClick={onSubmit} disabled={disabled}>
                {okTextPack}
              </Button>
            ) : null}
            &emsp;
            <Button danger onClick={() => history.goBack()}>
              Back
            </Button>
          </div>
        </div>
      </Spin>
    </div>
  )
}

export default PackPurchaseOrderForm
