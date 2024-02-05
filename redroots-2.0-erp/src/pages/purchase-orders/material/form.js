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
  ORGANIZATIONS,
  VENDOR_NAMES_LIST,
  LEAD_TIMES,
  MATERIALS,
  MATERIAL,
  MATERIAL_BY_CODES,
  UPSERT_MATERIAL_PURCHASE_ORDER,
  MATERIAL_PURCHASE_ORDER,
} from './queries'
import PDFDownload from './pdfDownload'

const mapStateToProps = ({ user }) => ({ user })

const MaterialPurchaseOrderForm = ({ user: { permissions, type } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updatePurchaseOrder')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const disabledForVendor = type === 'vendor'

  // Organization ID and List Declaration & Definition Begin
  const [organizationID, setOrganizationID] = useState(undefined)
  const [organizationIDError, setOrganizationIDError] = useState(undefined)
  const [organizationList, setOrganizationList] = useState([])
  const {
    loading: organizationLoad,
    error: organizationErr,
    data: organizationData,
  } = useQuery(ORGANIZATIONS)
  useEffect(() => {
    if (
      !organizationLoad &&
      organizationData &&
      organizationData.organizations &&
      organizationData.organizations.length
    )
      setOrganizationList(organizationData.organizations)
  }, [organizationData, organizationLoad])
  // Organization ID and List Declaration & Definition End

  // Vendor ID and List Declaration & Definition Begin
  const [vendorID, setVendorID] = useState(undefined)
  const [vendorIDError, setVendorIDError] = useState(undefined)
  const [vendorList, setVendorList] = useState([])
  const [sameState, setSameState] = useState(true)
  const [vendorSearchString, setVendorSearchString] = useState(null)

  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(VENDOR_NAMES_LIST, {
    variables: { vendorIDs: vendorID ? [vendorID] : [], searchString: vendorSearchString },
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

  // Material List Declaration Begin
  const [materialList, setMaterialList] = useState([])
  const [materialCodeSearchString, setMaterialCodeSearchString] = useState(null)

  const {
    loading: materialListLoad,
    error: materialListErr,
    data: materialListData,
  } = useQuery(MATERIALS, {
    variables: { searchString: materialCodeSearchString },
  })

  useEffect(() => {
    if (
      !materialListLoad &&
      materialListData &&
      materialListData.materials &&
      materialListData.materials.rows &&
      materialListData.materials.rows.length
    )
      setMaterialList(materialListData.materials.rows)
  }, [materialListData, materialListLoad])
  // Material List Declaration End

  // Calculate Due Date on change of either PO Date or Lead Time
  const calculateDueDate = (poDateVal, leadTimeVal) => {
    if (poDateVal && leadTimeVal) {
      setDueDate(momentBusinessDays(poDateVal, 'DD-MM-YYYY').businessAdd(leadTimeVal, 'days'))
    }
  }

  // Generate Material Code List Begin
  const getMaterialCodes = () => {
    // eslint-disable-next-line no-shadow
    return materialList.map(({ id, material_code }) => (
      <Select.Option key={id} value={id}>
        {material_code}
      </Select.Option>
    ))
  }
  // Generate Material Code End
  const debouncedMaterialCodeSearch = _.debounce((value) => setMaterialCodeSearchString(value), 500)

  // Get Material Detail and set other details on code selection Begin
  const [
    getMaterialDetail,
    { loading: materialDetailLoad, data: materialDetailData, error: materialDetailErr },
  ] = useLazyQuery(MATERIAL)

  useEffect(() => {
    if (!materialDetailLoad && materialDetailData && materialDetailData.material) {
      const materialDetailRecord = materialDetailData.material
      const intermediateTableData = _.cloneDeep(tableData)

      intermediateTableData.forEach((row) => {
        if (row.material_id === materialDetailRecord.id) {
          row.material_category_name = materialDetailRecord.material_category_name
          row.material_name = materialDetailRecord.name
          row.image = materialDetailRecord.image
          row.material_code = materialDetailRecord.material_code
          row.panna = materialDetailRecord.panna
          if (materialDetailRecord.hsn_name) row.hsn_name = materialDetailRecord.hsn_name
          if (materialDetailRecord.cgst) row.cgst = materialDetailRecord.cgst
          if (materialDetailRecord.sgst) row.sgst = materialDetailRecord.sgst
          if (materialDetailRecord.igst) row.igst = materialDetailRecord.igst
        }
      })
      setTableData(intermediateTableData)
    }
  }, [materialDetailData, materialDetailLoad])
  // Get Material Detail and set other details on code selection End

  // Table data declaration begin
  const [tableData, setTableData] = useState([
    {
      key: 0,
      material_category_name: '',
      image: '',
      material_code: '',
      material_name: '',
      panna: '',
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
      title: 'Material Category',
      dataIndex: 'material_category_name',
      key: 'material_category_name',
      render(text, record) {
        return {
          props: {
            style:
              record.recordError && record.recordError.material_category_name
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
            src={process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_MATERIAL_URL + image}
            height={image ? 35 : 20}
            width={image ? 35 : 20}
            alt="material-image"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Material Code',
      dataIndex: 'material_code',
      key: 'material_code',
      render(text, record) {
        return {
          props: {
            style:
              record.recordError && record.recordError.material_id
                ? {
                    border: '1px solid red',
                  }
                : {},
          },
          children: (
            <Select
              onSearch={(value) => debouncedMaterialCodeSearch(value)}
              onChange={(e) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.material_id = e
                  }
                })
                setTableData(intermediateTableData)
                getMaterialDetail({ variables: { id: e } })
              }}
              id="materialCode"
              value={record.material_id}
              style={{ width: '100%' }}
              placeholder="Please select one"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={disabled || disabledForVendor}
            >
              {getMaterialCodes()}
            </Select>
          ),
        }
      },
    },
    {
      title: 'Material Name',
      dataIndex: 'material_name',
      key: 'material_name',
      render: (text, record) => ({
        props: {
          style:
            record.recordError && record.recordError.material_name
              ? { border: '1px solid red' }
              : {},
        },
        children: <span>{text}</span>,
      }),
    },
    {
      title: 'Panna',
      dataIndex: 'panna',
      key: 'panna',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render(text, record) {
        return {
          props: {
            style:
              record.recordError && record.recordError.quantity ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.quantity}
              id="materialQuantity"
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.quantity = value
                })
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
          id="materialUnitCost"
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(tableData)
            intermediateTableData.forEach((row) => {
              if (row.key === record.key) row.unit_cost = value
            })
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
    },
    {
      title: 'CGST',
      dataIndex: 'cgst',
      key: 'cgst',
      render: (text, record) => (
        <InputNumber
          value={record.cgst}
          id="materialCGST"
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(tableData)
            intermediateTableData.forEach((row) => {
              if (row.key === record.key) row.cgst = value
            })
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
          id="materialSGST"
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(tableData)
            intermediateTableData.forEach((row) => {
              if (row.key === record.key) row.sgst = value
            })
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
          id="materialIGST"
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(tableData)
            intermediateTableData.forEach((row) => {
              if (row.key === record.key) row.igst = value
            })
            setTableData(intermediateTableData)
          }}
          style={{ width: '100%' }}
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
          id="materialComment"
          onChange={(e) => {
            const intermediateTableData = _.cloneDeep(tableData)

            intermediateTableData.forEach((row) => {
              if (row.key === record.key) {
                row.comment = e.target.value
              }
            })
            setTableData(intermediateTableData)
          }}
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
        >
          <Button type="danger">
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
      material_category_name: '',
      image: '',
      material_code: '',
      material_name: '',
      panna: 0,
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
    loading: materialPurchaseOrderLoad,
    error: materialPurchaseOrderErr,
    data: materialPurchaseOrderData,
  } = useQuery(MATERIAL_PURCHASE_ORDER, {
    variables: { id },
  })

  useEffect(() => {
    if (
      !materialPurchaseOrderLoad &&
      materialPurchaseOrderData &&
      materialPurchaseOrderData.materialPurchaseOrder
    ) {
      // prettier-ignore

      const {
        organization_id,
        vendor_id,
        lead_time_id,
        lead_time,
        po_date,
        due_date,
        status,
        same_state,
        detail,
      } = materialPurchaseOrderData.materialPurchaseOrder

      if (organization_id) setOrganizationID(organization_id)
      if (vendor_id) setVendorID(vendor_id)
      if (lead_time_id) setLeadTimeID(lead_time_id)
      if (lead_time) setLeadTime(lead_time)
      if (po_date) setPODate(moment(Number(po_date)))
      if (due_date) setDueDate(moment(Number(due_date)))
      if (status) setPOStatus(status)
      setSameState(same_state)

      const intermediateTableData = []
      if (detail && detail.length > 0) {
        detail.forEach((item, index) =>
          intermediateTableData.push({
            key: index,
            ...item,
          }),
        )
      }
      setTableData(intermediateTableData)
    }
  }, [materialPurchaseOrderData])

  // Load and set purchase order data if edit end

  // Handson Table & Data Capture Implementation Begins

  const [isModalVisible, setIsModalVisible] = useState(false)

  const handsonTableData = [
    {
      materialCode: '',
      quantity: 0,
      unitCost: 0,
    },
  ]

  const [handsonTableDataCopy, setHandsonTableDataCopy] = useState([])

  const handsonTableCol = [
    { data: 'materialCode', type: 'text' },
    { data: 'quantity', type: 'numeric' },
    { data: 'unitCost', type: 'numeric' },
  ]

  const showModal = () => setIsModalVisible(true)

  const handleOk = () => {
    if (handsonTableData.length > 0) {
      const intermediateHandsonTableData = _.cloneDeep(handsonTableData)
      const materialNames = intermediateHandsonTableData.map((a) => a.materialCode)
      setHandsonTableDataCopy(intermediateHandsonTableData)
      getMaterialByCodes({ variables: { codes: materialNames } })
    }

    // setIsModalVisible(false)
  }

  const handleCancel = () => setIsModalVisible(false)

  const [
    getMaterialByCodes,
    { loading: materialByCodesLoad, data: materialByCodesData, error: materialByCodesErr },
  ] = useLazyQuery(MATERIAL_BY_CODES)

  useEffect(() => {
    if (!materialByCodesLoad && materialByCodesData && materialByCodesData.materialByCodes) {
      const { materialByCodes } = materialByCodesData

      const intermediateTableData = []

      handsonTableDataCopy.forEach((record, index) => {
        const existingRecord = _.filter(
          materialByCodes,
          (o) => o.material_code === record.materialCode,
        )[0]

        intermediateTableData.push({
          key: index,
          material_id: existingRecord ? existingRecord.id : undefined,
          material_category_name: existingRecord
            ? existingRecord.material_category_name
            : undefined,
          image: existingRecord ? existingRecord.image : undefined,
          material_code: existingRecord ? existingRecord.material_code : undefined,
          material_name: existingRecord ? existingRecord.name : record.materialCode,
          panna: existingRecord ? existingRecord.panna : undefined,
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
  }, [materialByCodesData, materialByCodesLoad, handsonTableDataCopy])

  // Handson Table & Data Capture Implementation Ends

  // Find Duplicates Begin
  const findDuplicates = (arr) => {
    console.log('arr', arr)
    const sorted_arr = arr.slice().sort()
    console.log('sorted_arr', sorted_arr)

    const results = []
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < sorted_arr.length - 1; i++) {
      if (sorted_arr[i + 1] === sorted_arr[i]) {
        results.push(sorted_arr[i])
      }
    }
    console.log('result', results)
    return results
  }
  // Find Duplicates End

  // On Submit Begin

  const [upsertMaterialPurchaseOrder] = useMutation(UPSERT_MATERIAL_PURCHASE_ORDER)

  const onSubmit = () => {
    setOrganizationIDError(undefined)
    setVendorIDError(undefined)
    setLeadTimeIDError(undefined)
    setPODateError(undefined)
    setDueDateError(undefined)
    setPOStatusError(undefined)

    let isError = false

    if (!organizationID) {
      isError = true
      setOrganizationIDError('Please select a brand')
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
    if (!dueDate) {
      isError = true
      setDueDateError('Please select the Due Date')
    }
    if (!poStatus) {
      isError = true
      setPOStatusError('Please select the PO Status')
    }
    if (!tableData || tableData.length === 0) {
      isError = true
      setTableDataError('Please add at least add one record')
    }

    console.log('error', isError)
    const detail = []

    const intermediateTableData = _.cloneDeep(tableData)

    console.log('intermediateTableData', intermediateTableData)

    // Search for duplicates begin
    const intermediateTableDataDuplicates = _.cloneDeep(tableData).map((a) => a.material_id)
    const duplicateArray = findDuplicates(intermediateTableDataDuplicates)

    console.log('duplicateArray', duplicateArray)

    if (duplicateArray && duplicateArray.length > 0) {
      isError = true
      notification.error({
        message: 'Duplicate Data',
        description: `Duplicate material codes found : ${duplicateArray.join(', ')}`,
      })
      return
    }
    // Search for duplicates end

    intermediateTableData.forEach((record) => {
      record.recordError = {}

      if (!record.material_category_name || record.material_category_name === '') {
        isError = true
        record.recordError.material_category_name = true
      }
      if (!record.material_id || record.material_id === '') {
        isError = true
        record.recordError.material_id = true
      }
      if (!record.material_name || record.material_name === '') {
        isError = true
        record.recordError.material_name = true
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
        material_id: record.material_id,
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

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
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

    upsertMaterialPurchaseOrder({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        organization_id: Number(organizationID),
        vendor_id: Number(vendorID),
        lead_time_id: Number(leadTimeID),
        lead_time: Number(leadTime),
        po_date: String(poDate.valueOf()),
        due_date: String(dueDate.valueOf()),
        status: poStatus,
        same_state: sameState,
        detail,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/purchase-orders/material')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving material purchase-order.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  // On Submit End

  const debouncedVendorSearch = _.debounce((value) => setVendorSearchString(value), 500)

  if (!permissions.includes('readPurchaseOrder')) return <Error403 />
  if (action === 'create' && !permissions.includes('createPurchaseOrder')) return <Error403 />
  if (organizationErr) return `Error occured while fetching data: ${organizationErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (materialListErr) return `Error occured while fetching data: ${materialListErr.message}`
  if (materialDetailErr) return `Error occured while fetching data: ${materialDetailErr.message}`
  if (leadTimeErr) return `Error occured while fetching data: ${leadTimeErr.message}`
  if (materialByCodesErr) return `Error occured while fetching data: ${materialByCodesErr.message}`
  if (materialPurchaseOrderErr)
    return `Error occured while fetching data: ${materialPurchaseOrderErr.message}`

  return (
    <div>
      <Helmet title="Material Purchase Order" />

      <Spin spinning={materialListLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-8">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Create'} Material Purchase Order</strong>
            </h5>
          </div>

          <div className="col-4 pull-right" style={{ textAlign: 'right' }}>
            &emsp;
            {action === 'update' &&
            permissions.includes('updatePurchaseOrder') &&
            type !== 'vendor' ? (
              <div>
                <PDFDownload id={id} />
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

        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-lg-3">
                <div className="mb-2">
                  Organization<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={organizationID}
                  disabled={disabled || disabledForVendor}
                  style={{ width: '100%' }}
                  onChange={(value) => setOrganizationID(value)}
                  className={
                    organizationIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select an organization"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {organizationList && organizationList.length
                    ? organizationList.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{organizationIDError || ''}</div>
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
                  placeholder="Select an vendor"
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
                          {obj.name}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{vendorIDError || ''}</div>
              </div>

              <div className="col-lg-2">
                <div className="mb-2">Lead Time</div>
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
              </div>

              <div className="col-lg-2">
                <div className="mb-2">
                  PO Date<span className="custom-error-text"> *</span>
                </div>
                <DatePicker
                  value={poDate}
                  style={{ width: '100%' }}
                  format="DD-MM-YYYY"
                  disabled={disabled || disabledForVendor}
                  className={poDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                  onChange={(value) => {
                    setPODate(value)
                    calculateDueDate(value, leadTime)
                  }}
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
                  disabled={disabled || disabledForVendor}
                  className={dueDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                  onChange={(value) => {
                    setDueDate(value)
                  }}
                />
                <div className="custom-error-text mb-4">{dueDateError || ''}</div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3">
                <div className="mb-2">
                  Status<span className="custom-error-text"> *</span>
                </div>
                <Select
                  value={poStatus}
                  disabled={disabled || disabledForVendor}
                  style={{ width: '100%' }}
                  onChange={(value) => setPOStatus(value)}
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
                </Select>
                <div className="custom-error-text mb-4">{poStatusError || ''}</div>
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
                <Button onClick={showModal} type="primary">
                  Copy From Excel
                </Button>
              </div>
              <div className="col-6 pull-right" style={{ textAlign: 'right' }}>
                <Button onClick={addRow} type="default">
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
            colHeaders={['Material Code', 'Quantity', 'Cost']}
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
                {okText}
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

export default withRouter(connect(mapStateToProps)(MaterialPurchaseOrderForm))
