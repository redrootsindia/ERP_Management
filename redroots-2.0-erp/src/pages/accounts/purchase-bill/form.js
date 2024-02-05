import React, { useEffect, useState } from 'react'
import { Switch, useParams, withRouter, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import Error403 from 'components/Errors/403'
import {
  Spin,
  Select,
  Button,
  Table,
  DatePicker,
  notification,
  Input,
  InputNumber,
  Popconfirm,
} from 'antd'
import moment from 'moment'
import TextArea from 'antd/lib/input/TextArea'
import _ from 'lodash'
import { useMutation, useQuery } from '@apollo/client'
import { DeleteOutlined } from '@ant-design/icons'
import {
  BRANDS,
  PRODUCT_VENDOR_NAMES_LIST,
  ORGANIZATION,
  UPSERT_PURCHASE_BILL,
  PURCHASE_BILL,
  PURCHASE_ORDERS_ID,
} from './query'
import { PRODUCT_PURCHASE_ORDER } from '../../purchase-orders/product/queries'

const mapStateToProps = ({ user }) => ({ user })
const PurchaseBillForm = ({ user: { permissions, type } }) => {
  const { action, id } = useParams()
  const history = useHistory()
  const [invoiceDate, setInvoiceDate] = useState(moment())
  const [invoiceDateError, seInvoiceDateError] = useState(undefined)

  const [dueData, setDueDate] = useState(undefined)
  const [dueDateError, setDueDateError] = useState(undefined)

  const [brandIDError, setBrandIDError] = useState(undefined)
  const [brandID, setBrandID] = useState(undefined)
  const [brandList, setBrandList] = useState([])

  const [vendorList, setvendorList] = useState([])
  const [vendorID, setVendorID] = useState(undefined)
  const [vendorIDError, setVendorIDError] = useState(undefined)

  const [companyList, setCompanyList] = useState([])
  const [companyID, setCompanyID] = useState(undefined)
  const [companyIDError, setCompanyIDError] = useState(undefined)

  const [invoiceNumber, setInvoiceNumber] = useState()
  const [invoiceNumberError, setInvoiceNumberError] = useState(undefined)

  const [POnumber, setPONumber] = useState()
  const [PONumberError, setPONumberError] = useState(undefined)

  const [POIDsList, setPOIDsList] = useState([])

  const [okText, setOkText] = useState(id ? 'Save' : 'Create')
  const [totalRows, setTotalRows] = useState(1)

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)

  const [upsertPurchaseBill] = useMutation(UPSERT_PURCHASE_BILL)

  const { loading: POIDsLoad, data: POIDsData, error: POIDsError } = useQuery(PURCHASE_ORDERS_ID)

  const {
    loading: productPurchaseOrderLoad,
    error: productPurchaseOrderErr,
    data: productPurchaseOrderData,
  } = useQuery(PRODUCT_PURCHASE_ORDER, {
    variables: { id: Number(POnumber) },
  })
  const {
    loading: purchaseBillLoad,
    error: purchaseBillError,
    data: purchaseBillData,
  } = useQuery(PURCHASE_BILL, {
    variables: { id },
  })
  useEffect(() => {
    if (action === 'create') {
      if (
        !productPurchaseOrderLoad &&
        productPurchaseOrderData &&
        productPurchaseOrderData.productPurchaseOrder
      ) {
        // prettier-ignore
        const { detail, brand_id, vendor_id, due_date } = productPurchaseOrderData.productPurchaseOrder

        if (brand_id) setBrandID(brand_id)
        if (vendor_id) setVendorID(vendor_id)
        if (due_date) setDueDate(moment(Number(due_date)))
        const intermediateTableData = []
        if (detail && detail.length > 0) {
          detail.forEach((item, index) =>
            intermediateTableData.push({
              key: index,
              description: '',
              quantity: item.quantity,
              bill_quantity: 0,
              amount: 0,
              rate: item.unit_cost,
              cgst: item.cgst,
              sgst: item.sgst,
              igst: item.igst,
            }),
          )
        }
        setTableData(intermediateTableData)
      }
    }
    if (action === 'update') {
      if (!purchaseBillLoad && purchaseBillData && purchaseBillData.purchaseBill) {
        const {
          brand_id,
          detail,
          company_id,
          vendor_id,
          invoice_date,
          invoice_due_date,
          invoice_number,
          purchase_order_id,
        } = purchaseBillData.purchaseBill
        if (brand_id) setBrandID(brand_id)
        if (company_id) setCompanyID(company_id)
        if (vendor_id) setVendorID(vendor_id)
        if (invoice_date) setInvoiceDate(moment(Number(invoice_date)))
        if (invoice_due_date) setDueDate(moment(Number(invoice_due_date)))
        if (invoice_number) setInvoiceNumber(invoice_number)
        if (purchase_order_id) setPONumber(purchase_order_id)

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
    }
  }, [productPurchaseOrderData, POnumber, purchaseBillData, purchaseBillLoad])

  useEffect(() => {
    if (
      !POIDsLoad &&
      POIDsData &&
      POIDsData.purchaseOrderIDsList &&
      // POIDsData.purchaseOrderIDsList.rows &&
      POIDsData.purchaseOrderIDsList.length
    ) {
      setPOIDsList(POIDsData.purchaseOrderIDsList)
    } else {
      setPOIDsList([])
    }
  }, [POIDsLoad, POIDsData])

  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length)
      setBrandList(brandData.brands)
  }, [brandData, brandLoad])

  // const { loading: buyerLoad, error: buyerErr, data: buyerData } = useQuery(BUYER_NAME_LIST)

  // useEffect(() => {
  //   if (!buyerLoad && buyerData && buyerData.buyerNames && buyerData.buyerNames.length)
  //     setBuyerList(buyerData.buyerNames)
  // }, [buyerData, buyerLoad])

  const {
    loading: vendorLoad,
    error: vendorErr,
    data: vendorData,
  } = useQuery(PRODUCT_VENDOR_NAMES_LIST)

  useEffect(() => {
    if (!vendorLoad && vendorData && vendorData.vendorNames && vendorData.vendorNames.length) {
      setvendorList(vendorData.vendorNames)
    }
  }, [vendorData, vendorLoad])

  const { loading: companyLoad, error: companyErr, data: companyData } = useQuery(ORGANIZATION)

  useEffect(() => {
    if (
      !companyLoad &&
      companyData &&
      companyData.organizations &&
      companyData.organizations.length
    ) {
      setCompanyList(companyData.organizations)
    }
  }, [vendorData, companyLoad])

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updatePurchaseBill')),
  )

  const [disabled, setDisabled] = useState(!editMode)

  const [tableData, setTableData] = useState([
    {
      key: 0,
      description: '',
      quantity: 0,
      bill_quantity: 0,
      amount: 0,
      rate: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
    },
  ])
  const gstOptions = [
    {
      id: 0,
      value: 5,
    },
    {
      id: 1,
      value: 6,
    },
    {
      id: 2,
      value: 9,
    },
    {
      id: 3,
      value: 12,
    },
    {
      id: 4,
      value: 18,
    },
  ]
  // Function to add new row begin
  const addRow = () => {
    const count = tableData.length + 1
    const newRow = {
      key: count,
      description: '',
      quantity: 0,
      bill_quantity: 0,
      amount: 0,
      rate: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
    }

    const newTableData = [...tableData, newRow]
    setTotalRows(newTableData.length)
    setTableData(newTableData)
  }

  // Function to delete row begin
  const deleteRow = (key) => {
    const newTableData = tableData.filter((item) => item.key !== key)
    setTotalRows(newTableData.length)
    setTableData(newTableData)
  }

  // details column
  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.description
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <TextArea
              value={record.description}
              placeholder="description"
              onChange={(e) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.description = e.target.value
                })
                setTableData(intermediateTableData)
              }}
              disabled={disabled}
            />
          ),
        }
      },
    },

    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Bill Quantity',
      dataIndex: 'bill_quantity',
      key: 'bill_quantity',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.quantity ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.bill_quantity}
              min={0}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.bill_quantity = value
                  }
                  row.amount =
                    row.cgst && row.sgst
                      ? row.bill_quantity * row.rate +
                        (row.bill_quantity * row.rate * (row.cgst + row.sgst)) / 100
                      : row.bill_quantity * row.rate +
                        (row.bill_quantity * row.rate * row.igst) / 100
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
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (text, record) => {
        return {
          props: {
            style: record.recordError && record.recordError.rate ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.rate}
              min={0}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.rate = value
                  }
                  if (row.cgst && row.sgst) {
                    row.amount =
                      row.quantity * row.rate +
                      (row.quantity * row.rate * (row.cgst + row.sgst)) / 100
                  } else {
                    row.amount =
                      row.quantity * row.rate + (row.quantity * row.rate * row.igst) / 100
                  }
                })
                setTableData(intermediateTableData)
              }}
              style={{ width: '100%' }}
              disabled={action === 'create' || type === 'vendor' || disabled}
            />
          ),
        }
      },
    },
    {
      title: 'CGST %',
      dataIndex: 'cgst',
      key: 'cgst',
      render: (text, record) => {
        return {
          props: {
            style: record.recordError && record.recordError.cgst ? { border: '1px solid red' } : {},
          },
          children: (
            <Select
              showSearch
              value={record.cgst}
              disabled={action === 'create' || type === 'vendor' || disabled}
              style={{ width: 150 }}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.cgst = value
                  if (row.cgst && row.sgst) {
                    row.amount =
                      row.quantity * row.rate +
                      (row.quantity * row.rate * row.cgst) / 100 +
                      (row.quantity * row.rate * row.sgst) / 100
                  } else {
                    row.amount =
                      row.quantity * row.rate + (row.quantity * row.rate * row.igst) / 100
                  }
                })
                // setChangesMade(true)

                setTableData(intermediateTableData)
              }}
              // className={brandIDError ? 'custom-error-border' : ''}
              placeholder="Select an cgst"
            >
              {gstOptions && gstOptions.length
                ? gstOptions.map((obj) => (
                    <Select.Option key={String(obj.id)} value={String(obj.value)}>
                      {obj.value}
                    </Select.Option>
                  ))
                : null}
            </Select>
          ),
        }
      },
    },
    {
      title: 'SGST %',
      dataIndex: 'sgst',
      key: 'sgst',
      render: (text, record) => {
        return {
          props: {
            style: record.recordError && record.recordError.sgst ? { border: '1px solid red' } : {},
          },
          children: (
            <Select
              showSearch
              value={record.sgst}
              disabled={action === 'create' || type === 'vendor' || disabled}
              style={{ width: 150 }}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.sgst = value
                  if (row.cgst && row.sgst) {
                    row.amount =
                      row.quantity * row.rate +
                      (row.quantity * row.rate * row.cgst) / 100 +
                      (row.quantity * row.rate * row.sgst) / 100
                  } else {
                    row.amount =
                      row.quantity * row.rate + (row.quantity * row.rate * row.igst) / 100
                  }
                })

                // setChangesMade(true)
                setTableData(intermediateTableData)
              }}
              // }}
              className={brandIDError ? 'custom-error-border' : ''}
              placeholder="Select an sgst"
            >
              {gstOptions && gstOptions.length
                ? gstOptions.map((obj) => (
                    <Select.Option key={String(obj.id)} value={String(obj.value)}>
                      {obj.value}
                    </Select.Option>
                  ))
                : null}
            </Select>
          ),
        }
      },
    },
    {
      title: 'IGST %',
      dataIndex: 'igst',
      key: 'igst',
      render: (text, record) => {
        return {
          props: {
            style: record.recordError && record.recordError.igst ? { border: '1px solid red' } : {},
          },
          children: (
            <Select
              showSearch
              value={record.igst}
              disabled={action === 'create' || type === 'vendor' || disabled}
              style={{ width: 150 }}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.igst = value
                  if (row.cgst && row.sgst) {
                    row.amount =
                      row.quantity * row.rate +
                      (row.quantity * row.rate * row.cgst) / 100 +
                      (row.quantity * row.rate * row.sgst) / 100
                  } else {
                    row.amount =
                      row.quantity * row.rate + (row.quantity * row.rate * row.igst) / 100
                  }
                })
                // setChangesMade(true)
                setTableData(intermediateTableData)
              }}
              className={brandIDError ? 'custom-error-border' : ''}
              placeholder="Select an igst"
            >
              {gstOptions && gstOptions.length
                ? gstOptions.map((obj) => (
                    <Select.Option key={String(obj.id)} value={String(obj.value)}>
                      {obj.value}
                    </Select.Option>
                  ))
                : null}
            </Select>
          ),
        }
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => <span>{record.amount > 0 ? record.amount.toFixed(2) : 0}</span>,
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
          onConfirm={() => {
            deleteRow(record.key)
          }}
          disabled={disabled}
        >
          <Button type="danger" disabled={disabled}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]
  const onSubmit = () => {
    let isError = false

    if (!invoiceDate) {
      isError = true
      seInvoiceDateError('Please select a date')
    }
    if (!dueData) {
      isError = true
      setDueDateError('Please select a due date')
    }
    if (!brandID) {
      isError = true
      setBrandIDError('Please select a brand')
    }
    if (!vendorID) {
      isError = true
      setVendorIDError('Please select a vendor')
    }
    if (!companyID) {
      isError = true
      setCompanyIDError('Please select a company')
    }
    if (!invoiceNumber) {
      isError = true
      setInvoiceNumberError('Invoice Number can not be enpty')
    }

    if (!POnumber) {
      isError = true
      setPONumberError('please select P.O')
    }

    const intermediateTableData = _.cloneDeep(tableData)
    const detail = []
    intermediateTableData.forEach((record) => {
      record.recordError = {}

      if (!record.description || record.description === '') {
        isError = true
        record.recordError.description = true
      }
      if (!record.quantity || record.quantity === 0) {
        isError = true
        record.recordError.quantity = true
      }
      if (!record.rate || record.rate === 0) {
        isError = true
        record.recordError.rate = true
      }

      detail.push({
        id: record.id || undefined,
        description: record.description,
        quantity: record.quantity,
        bill_quantity: record.bill_quantity,
        rate: record.rate,
        cgst: Number(record.cgst),
        sgst: Number(record.sgst),
        igst: Number(record.igst),
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
    upsertPurchaseBill({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        invoice_date: String(invoiceDate.valueOf()),
        invoice_due_date: String(dueData.valueOf()),
        company_id: Number(companyID),
        brand_id: Number(brandID),
        vendor_id: Number(vendorID),
        invoice_number: String(invoiceNumber),
        purchase_order_id: Number(POnumber),
        detail,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/accounts/purchase-bill')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }
  if (!permissions.includes('readPurchaseBill')) return <Error403 />
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (companyErr) return `Error occured while fetching data: ${companyErr.message}`
  if (purchaseBillError) return `Error occured while fetching data: ${purchaseBillError.message}`
  // if (buyerErr) return `Error occured while fetching data: ${buyerErr.message}`
  if (POIDsError) return `Error occured while fetching data: ${POIDsError.message}`
  if (productPurchaseOrderErr)
    return `Error occured while fetching data: ${productPurchaseOrderErr.message}`
  if (action === 'create' && !permissions.includes('createPurchaseBill')) return <Error403 />
  return (
    <div>
      <Helmet title=" Purchase Bill" />
      <Spin spinning={purchaseBillLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className={action === 'create' ? 'col-4' : 'col-3'}>
            <h5 className="mb-2">
              <strong>
                {id ? 'Edit' : 'Create'} Purchase Bill {id ? `#${id}` : ' '}
              </strong>
            </h5>
          </div>
          <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
            {action === 'update' && permissions.includes('updatePurchaseBill') && (
              <Switch
                checked={editMode}
                onChange={(checked) => {
                  setEditMode(checked)
                  setDisabled(!checked)
                }}
                className="ml-3"
              >
                Edit
              </Switch>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row mb-5">
              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  P.O No.<span className="custom-error-text"> *</span>
                </div>
                <Select
                  value={POnumber}
                  onChange={(value) => {
                    setPONumber(value)
                  }}
                  className={
                    PONumberError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select P.O"
                  style={{
                    width: '100%',
                  }}
                  disabled={action === 'update' || disabled}
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {POIDsList && POIDsList.length
                    ? POIDsList.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.id}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{PONumberError || ''}</div>
              </div>

              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Invoice Date<span className="custom-error-text"> *</span>
                </div>
                <DatePicker
                  style={{ width: '100%' }}
                  value={invoiceDate}
                  format="DD-MM-YYYY"
                  className={
                    invoiceDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  onChange={(value) => {
                    setInvoiceDate(value)
                  }}
                  disabled={type === 'vendor' || disabled}
                />
                <div className="custom-error-text mb-4">{invoiceDateError || ''}</div>
              </div>

              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Due Date<span className="custom-error-text"> *</span>
                </div>
                <DatePicker
                  style={{ width: '100%' }}
                  value={dueData}
                  format="DD-MM-YYYY"
                  className={dueDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                  onChange={(value) => {
                    setDueDate(value)
                  }}
                  disabled={type === 'vendor' || disabled}
                />
                <div className="custom-error-text mb-4">{dueDateError || ''}</div>
              </div>

              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Brand<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={brandID}
                  disabled={action === 'update' || type === 'vendor' || disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setBrandID(value)
                  }}
                  className={brandIDError ? 'custom-error-border' : ''}
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

              <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Vendor<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={vendorID}
                  disabled={action === 'update' || type === 'vendor' || disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setVendorID(value)
                  }}
                  className={brandIDError ? 'custom-error-border' : ''}
                  placeholder="Select an brand"
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

              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Company<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={companyID}
                  disabled={action === 'update' || disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setCompanyID(value)
                  }}
                  className={companyIDError ? 'custom-error-border' : ''}
                  placeholder="Select an brand"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {companyList && companyList.length
                    ? companyList.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{companyIDError || ''}</div>
              </div>

              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Invoice Number<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={invoiceNumber}
                  placeholder="Invoice"
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{invoiceNumberError || ''}</div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <Table
                  dataSource={tableData}
                  columns={columns}
                  pagination={false}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                  footer={() => {
                    return (
                      <tr
                        style={{ width: '100%' }}
                        className="ant-table-row  ant-table-row-level-0"
                      >
                        <td className="text-center" style={{ width: 450 }}>
                          Total
                        </td>
                        <td className="text-left" style={{ width: 300 }}>
                          {tableData.reduce((accumulator, currentValue) => {
                            return Number((accumulator + currentValue.quantity).toFixed(2))
                          }, 0)}
                        </td>
                        <td className="text-left" style={{ width: 550 }}>
                          {tableData.reduce((accumulator, currentValue) => {
                            return Number((accumulator + currentValue.bill_quantity).toFixed(2))
                          }, 0)}
                        </td>
                        <td className="text-center" style={{ width: 550 }}>
                          -
                        </td>
                        <td className="text-center" style={{ width: 550 }}>
                          -
                        </td>
                        <td className="text-center" style={{ width: 550 }}>
                          -
                        </td>
                        <td className="text-center" style={{ width: 550 }}>
                          -
                        </td>
                        <td className="text-center text-blue" style={{ width: 550 }}>
                          Sub Total :
                          {tableData.reduce((accumulator, currentValue) => {
                            return Number((accumulator + currentValue.amount).toFixed(2))
                          }, 0)}
                        </td>
                      </tr>
                    )
                  }}
                />
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
                <span className="mr-3">Total {totalRows} Rows</span>
                <Button onClick={addRow} type="default" disabled={disabled}>
                  Add Row
                </Button>
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
      </Spin>
    </div>
  )
}

export default withRouter(connect(mapStateToProps)(PurchaseBillForm))
