import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import { useQuery, useLazyQuery, useMutation } from '@apollo/client'
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
} from 'antd'
import _ from 'lodash'
import { LoadingOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'

import Error403 from 'components/Errors/403'
import {
  PACK_VARIANTS_BY_PO_ID,
  UPSERT_PRINTER_PACK_PURCHASE_ORDER,
  PRINTER_PACK_PURCHASE_ORDER,
} from './queries'
import { PACK_VARIANT } from '../product/queries'

const PrinterPOPackForm = ({
  id,
  poID,
  action,
  permissions,
  history,
  okText,
  vendorList,
  disabled: disabledProp,
}) => {
  console.log('poID', poID)
  const [poName, setPOName] = useState(undefined)
  const [poNameError, setPONameError] = useState(undefined)

  const [vendorID, setVendorID] = useState(undefined)
  const [vendorIDError, setVendorIDError] = useState(undefined)

  const [poDate, setPODate] = useState(moment())
  const [poDateError, setPODateError] = useState(undefined)

  const [dueDate, setDueDate] = useState(undefined)
  const [dueDateError, setDueDateError] = useState(undefined)

  const [poStatus, setPOStatus] = useState('Draft')
  const [poStatusError, setPOStatusError] = useState(undefined)

  const [termsConditions, setTermsConditions] = useState(undefined)

  const [okTextPack, setOkTextPack] = useState(okText)
  const [disabled, setDisabled] = useState(undefined)

  const [packVariantList, setPackVariantList] = useState([])
  const {
    loading: packVariantListLoad,
    error: packVariantListErr,
    data: packVariantListData,
  } = useQuery(PACK_VARIANTS_BY_PO_ID, { variables: { purchase_order_id: poID } })

  useEffect(() => {
    if (
      !packVariantListLoad &&
      packVariantListData &&
      packVariantListData.packVariantsByPOID &&
      packVariantListData.packVariantsByPOID.length
    )
      setPackVariantList(packVariantListData.packVariantsByPOID)
  }, [packVariantListData, packVariantListLoad])

  useEffect(() => setDisabled(disabledProp), [disabledProp])

  const getVariantCodes = () => {
    return packVariantList.map(({ id: varID, code }) => (
      <Select.Option key={varID} value={varID}>
        {code}
      </Select.Option>
    ))
  }

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
        }
      })

      setTableData(intermediateTableData)
    }
  }, [packVariantDetailData, packVariantDetailLoad])

  const [tableData, setTableData] = useState([
    {
      key: 0,
      product_category_name: '',
      product_subcategory_name: '',
      image: '',
      variant_code: '',
      quantity: 0,
      unit_cost: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      comment: '',
      fulfilled_quantity: 0,
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
        if (record.quantity && record.unit_cost) {
          total =
            record.quantity *
            record.unit_cost *
            (1 + record.cgst / 100 + record.sgst / 100 + record.igst / 100)
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
      title: 'Fullfilled Quantity',
      dataIndex: 'fulfilled_quantity',
      key: 'fulfilled_quantity',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.fulfilled_quantity
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <InputNumber
              value={record.fulfilled_quantity}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.fulfilled_quantity = value
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
      title: '',
      key: 'action',
      sort: false,
      filter: false,
      type: 'string',
      render: (text, record) => (
        <Popconfirm
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
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      comment: '',
    }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)
  }

  const deleteRow = (key) => {
    const newTableData = tableData.filter((item) => item.key !== key)
    setTableData(newTableData)
  }

  const {
    loading: productPurchaseOrderLoad,
    error: productPurchaseOrderErr,
    data: productPurchaseOrderData,
  } = useQuery(PRINTER_PACK_PURCHASE_ORDER, {
    variables: { id },
  })

  useEffect(() => {
    if (
      !productPurchaseOrderLoad &&
      productPurchaseOrderData &&
      productPurchaseOrderData.printerPackPO
    ) {
      const {
        vendor_id,
        purchase_order_name,
        po_date,
        due_date,
        status,
        terms_conditions,
        pack_detail,
      } = productPurchaseOrderData.printerPackPO

      if (purchase_order_name) setPOName(purchase_order_name)

      if (vendor_id) setVendorID(vendor_id)
      if (po_date) setPODate(moment(Number(po_date)))
      if (due_date) setDueDate(moment(Number(due_date)))
      if (status) setPOStatus(status)

      if (terms_conditions) setTermsConditions(terms_conditions)

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
  }, [productPurchaseOrderData, productPurchaseOrderLoad])

  const findDuplicates = (arr) => {
    const sorted_arr = arr.slice().sort()
    const results = []
    for (let i = 0; i < sorted_arr.length - 1; i += 1) {
      if (sorted_arr[i + 1] === sorted_arr[i]) results.push(sorted_arr[i])
    }
    return results
  }

  const [upsertPackPurchaseOrder] = useMutation(UPSERT_PRINTER_PACK_PURCHASE_ORDER)

  const onSubmit = () => {
    setPONameError(undefined)
    setVendorIDError(undefined)
    setPODateError(undefined)
    setDueDateError(undefined)
    setPOStatusError(undefined)

    let isError = false

    if (!poName) {
      isError = true
      setPONameError('Please type a name')
    }
    if (!vendorID) {
      isError = true
      setVendorIDError('Please select a vendor')
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
      if (!record.fulfilled_quantity || record.fulfilled_quantity === 0) {
        isError = true
        record.recordError.fulfilled_quantity = true
      }

      detail.push({
        id: record.id || undefined,
        pack_id: record.pack_id,
        quantity: record.quantity,
        unit_cost: record.unit_cost,
        cgst: record.cgst || 0,
        sgst: record.sgst || 0,
        igst: record.igst || 0,
        comment: record.comment,
        fulfilled_quantity: record.fulfilled_quantity,
      })
    })

    setTableData(intermediateTableData)

    const intermediateTableDataDuplicates = _.cloneDeep(tableData).map((a) => a.pack_id)
    const duplicateIDs = findDuplicates(intermediateTableDataDuplicates)

    const duplicateNames = duplicateIDs
      .filter((obj) => !!obj)
      .map((dupID) => packVariantList.find((v) => Number(v.id) === Number(dupID)).code)

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

    setOkTextPack(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertPackPurchaseOrder({
      variables: {
        upsertType: id ? 'update' : 'create',
        parent_purchase_order_id: poID,
        id,
        purchase_order_name: poName,
        vendor_id: Number(vendorID),

        po_date: String(poDate.valueOf()),
        due_date: String(dueDate.valueOf()),
        status: poStatus,

        pack: true,
        terms_conditions: termsConditions,
        detail,
      },
    })
      .then(() => {
        setOkTextPack(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/purchase-orders/printer')
      })
      .catch((err) => {
        setOkTextPack(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readPurchaseOrder')) return <Error403 />
  if (action === 'create' && !permissions.includes('createPurchaseOrder')) return <Error403 />

  if (packVariantDetailErr)
    return `Error occured while fetching data: ${packVariantDetailErr.message}`

  if (packVariantListErr) return `Error occured while fetching data: ${packVariantListErr.message}`
  if (productPurchaseOrderErr)
    return `Error occured while fetching data: ${productPurchaseOrderErr.message}`

  return (
    <div>
      <Helmet title="Printer POs" />

      <Spin spinning={packVariantListLoad} tip="Loading..." size="large">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-lg-2">
                <div className="mb-2">
                  Printer P.O. Name<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={poName}
                  onChange={({ target: { value } }) => setPOName(value)}
                  disabled={disabled}
                  className={poNameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                />
                <div className="custom-error-text mb-4">{poNameError || ''}</div>
              </div>

              <div className="col-lg-3">
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
                  }}
                  disabled={disabled}
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
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{dueDateError || ''}</div>
              </div>
              <div className="col-lg-3">
                <div className="mb-2">
                  Status<span className="custom-error-text"> *</span>
                </div>
                <Select
                  value={poStatus}
                  disabled={disabled}
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
                </Select>
                <div className="custom-error-text mb-4">{poStatusError || ''}</div>
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

            <div className="row ml-2 mb-4 mt-4">
              <Button onClick={addRow} type="primary" disabled={disabled}>
                Add Row
              </Button>
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
          </div>
        </div>

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

export default PrinterPOPackForm
