import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import { useQuery, useLazyQuery, useMutation } from '@apollo/client'
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
} from 'antd'
import _ from 'lodash'
import { LoadingOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import Error403 from 'components/Errors/403'
import PackForm from './packForm'
import PDFDownload from './pdfDownload'
import PDFDownloadPack from './pdfDownloadPack'
import { PRODUCT_VENDOR_NAMES_LIST, VARIANT } from '../product/queries'
import {
  VARIANTS_BY_PO_ID,
  UPSERT_PRINTER_PRODUCT_PURCHASE_ORDER,
  PRINTER_PRODUCT_PURCHASE_ORDER,
} from './queries'

const mapStateToProps = ({ user }) => ({ user })

const PrinterPOProductForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id, type, poID } = useParams()

  const [mainType, setMainType] = useState(type)

  const [poName, setPOName] = useState(undefined)
  const [poNameError, setPONameError] = useState(undefined)

  const [vendorID, setVendorID] = useState(undefined)

  const [vendorIDError, setVendorIDError] = useState(undefined)
  const [vendorList, setVendorList] = useState([])
  const [vendorSearchString, setVendorSearchString] = useState(null)

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

  const [poDate, setPODate] = useState(moment())
  const [poDateError, setPODateError] = useState(undefined)

  const [dueDate, setDueDate] = useState(undefined)
  const [dueDateError, setDueDateError] = useState(undefined)

  const [poStatus, setPOStatus] = useState('Draft')
  const [poStatusError, setPOStatusError] = useState(undefined)

  const [termsConditions, setTermsConditions] = useState(undefined)

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updatePurchaseOrder')),
  )
  const [disabled, setDisabled] = useState(!editMode)

  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [variantList, setVariantList] = useState([])
  const {
    loading: variantListLoad,
    error: variantListErr,
    data: variantListData,
  } = useQuery(VARIANTS_BY_PO_ID, { variables: { purchase_order_id: poID } })

  useEffect(() => {
    if (
      !variantListLoad &&
      variantListData &&
      variantListData.variantsByPOID &&
      variantListData.variantsByPOID.length
    )
      setVariantList(variantListData.variantsByPOID)
  }, [variantListData, variantListLoad])

  const getVariantCodes = () => {
    return variantList.map(({ id: varID, code }) => (
      <Select.Option key={varID} value={varID}>
        {code}
      </Select.Option>
    ))
  }

  const [
    getVariantDetail,
    { loading: variantDetailLoad, data: variantDetailData, error: variantDetailErr },
  ] = useLazyQuery(VARIANT)

  useEffect(() => {
    if (!variantDetailLoad && variantDetailData && variantDetailData.variant) {
      const variantDetailRecord = variantDetailData.variant

      const intermediateTableData = _.cloneDeep(tableData)

      intermediateTableData.forEach((row) => {
        if (row.variant_id === variantDetailRecord.id) {
          row.product_category_name = variantDetailRecord.product_category_name
          row.product_subcategory_name = variantDetailRecord.product_subcategory_name
          row.image = variantDetailRecord.image
          row.variant_code = variantDetailRecord.code
        }
      })

      setTableData(intermediateTableData)
    }
  }, [variantDetailData, variantDetailLoad])

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
            onChange={(e) => {
              const intermediateTableData = _.cloneDeep(tableData)
              intermediateTableData.forEach((row) => {
                if (row.key === record.key) row.variant_id = e
              })
              setTableData(intermediateTableData)
              getVariantDetail({ variables: { id: e } })
            }}
            value={record.variant_id}
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
      fulfilled_quantity: 0,
    }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)
  }

  const deleteRow = (key) => {
    const newTableData = tableData.filter((item) => item.key !== key)
    setTableData(newTableData)
  }

  const findDuplicates = (arr) => {
    const sorted_arr = arr.slice().sort()
    const results = []
    for (let i = 0; i < sorted_arr.length - 1; i += 1) {
      if (sorted_arr[i + 1] === sorted_arr[i]) results.push(sorted_arr[i])
    }
    return results
  }

  const {
    loading: productPurchaseOrderLoad,
    error: productPurchaseOrderErr,
    data: productPurchaseOrderData,
  } = useQuery(PRINTER_PRODUCT_PURCHASE_ORDER, {
    variables: { id },
  })

  useEffect(() => {
    if (
      !productPurchaseOrderLoad &&
      productPurchaseOrderData &&
      productPurchaseOrderData.printerProductPO
    ) {
      const {
        vendor_id,
        purchase_order_name,
        po_date,
        due_date,
        status,
        pack,
        terms_conditions,
        detail,
      } = productPurchaseOrderData.printerProductPO

      if (pack) {
        setMainType('Pack')
      } else {
        setMainType('Product')
        if (purchase_order_name) setPOName(purchase_order_name)
        if (vendor_id) setVendorID(vendor_id)
        if (po_date) setPODate(moment(Number(po_date)))
        if (due_date) setDueDate(moment(Number(due_date)))
        if (status) setPOStatus(status)

        if (terms_conditions) setTermsConditions(terms_conditions)

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
    }
  }, [productPurchaseOrderData, productPurchaseOrderLoad])

  const [upsertPrinterProductPurchaseOrder] = useMutation(UPSERT_PRINTER_PRODUCT_PURCHASE_ORDER)

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
      if (!record.variant_id || record.variant_id === '') {
        isError = true
        record.recordError.variant_id = true
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
        variant_id: record.variant_id,
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

    const intermediateTableDataDuplicates = _.cloneDeep(tableData).map((a) => a.variant_id)
    const duplicateIDs = findDuplicates(intermediateTableDataDuplicates)

    const duplicateNames = duplicateIDs
      .filter((obj) => !!obj)
      .map((dupID) => variantList.find((v) => Number(v.id) === Number(dupID)).code)

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

    upsertPrinterProductPurchaseOrder({
      variables: {
        upsertType: id ? 'update' : 'create',
        parent_purchase_order_id: poID,
        id,
        purchase_order_name: poName,
        vendor_id: Number(vendorID),

        po_date: String(poDate.valueOf()),
        due_date: String(dueDate.valueOf()),
        status: poStatus,

        pack: false,
        terms_conditions: termsConditions,
        detail,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/purchase-orders/printer')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  const debouncedVendorSearch = _.debounce((value) => setVendorSearchString(value), 500)

  if (!permissions.includes('readPurchaseOrder')) return <Error403 />
  if (action === 'create' && !permissions.includes('createPurchaseOrder')) return <Error403 />

  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`

  if (variantListErr) return `Error occured while fetching data: ${variantListErr.message}`
  if (variantDetailErr) return `Error occured while fetching data: ${variantDetailErr.message}`
  if (productPurchaseOrderErr)
    return `Error occured while fetching data: ${productPurchaseOrderErr.message}`

  return (
    <div>
      <Helmet title="Printer POs" />

      <Spin spinning={vendorLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-8">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Create'} Printer Purchase Order </strong>
              <br />
              <strong>Against Main P.O. : #{poID} </strong>
            </h5>
          </div>

          <div className="col-4">
            {action === 'update' && permissions.includes('updatePurchaseOrder') ? (
              <>
                {mainType === 'Pack' ? <PDFDownloadPack id={id} /> : <PDFDownload id={id} />}
                <Switch
                  checked={editMode}
                  onChange={(checked) => {
                    setEditMode(checked)
                    setDisabled(!checked)
                  }}
                  className="ml-3"
                />
                &ensp;Edit
              </>
            ) : null}
          </div>
        </div>

        {mainType === 'Pack' ? (
          <PackForm
            id={id}
            poID={poID}
            action={action}
            disabled={disabled}
            permissions={permissions}
            history={history}
            okText={okText}
            vendorList={vendorList}
          />
        ) : (
          <>
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
                      className={
                        poNameError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
                    />
                    <div className="custom-error-text mb-4">{poNameError || ''}</div>
                  </div>

                  <div className="col-lg-3">
                    <div className="mb-2">
                      Vendor<span className="custom-error-text"> *</span>
                    </div>
                    <Select
                      showSearch
                      onSearch={(value) => debouncedVendorSearch(value)}
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
                      className={
                        poDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
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
                      className={
                        dueDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                      }
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
                    {okText}
                  </Button>
                ) : null}
                &emsp;
                <Button danger onClick={() => history.goBack()}>
                  Back
                </Button>
              </div>
            </div>
          </>
        )}
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(PrinterPOProductForm))
