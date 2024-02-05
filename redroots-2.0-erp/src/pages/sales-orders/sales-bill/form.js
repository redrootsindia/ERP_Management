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
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { DeleteOutlined } from '@ant-design/icons'
import { BRANDS, ORGANIZATION } from '../../accounts/purchase-bill/query'
import { BUYER_NAME_LIST, BUYER_GROUPS_LIST, SALES_ORDER } from '../all-sales-orders/queries'
import { UPSERT_SALES_BILL, SALES_BILL, SALES_ORDER_NUMBER, PI_NUMBER } from './query'

// import CSVDownload from './csvDownload'
// import { PROFORMA_INVOICE } from './queries'
const mapStateToProps = ({ user }) => ({ user })
const SalesBillForm = ({ user: { permissions } }) => {
  const { action, id } = useParams()
  const history = useHistory()
  const [invoiceDate, setInvoiceDate] = useState(undefined)
  const [invoiceDateError, seInvoiceDateError] = useState(undefined)

  const [dueData, setDueDate] = useState(undefined)
  const [dueDateError, setDueDateError] = useState(undefined)

  const [brandIDError, setBrandIDError] = useState(undefined)
  const [brandID, setBrandID] = useState(undefined)
  const [brandList, setBrandList] = useState([])

  const [companyList, setCompanyList] = useState([])
  const [companyID, setCompanyID] = useState(undefined)
  const [companyIDError, setCompanyIDError] = useState(undefined)

  const [invoiceNumber, setInvoiceNumber] = useState()
  const [invoiceNumberError, setInvoiceNumberError] = useState(undefined)

  const [okText, setOkText] = useState(id ? 'Save' : 'Create')
  const [totalRows, setTotalRows] = useState(1)

  const [salesOrderList, setSalesOrderList] = useState([])
  const [saleOrderID, setSalesOrderID] = useState(undefined)
  const [salesOrderIDError, setSaleOrderIDError] = useState(undefined)

  const [piID, setPiID] = useState()
  const [proformaInvoiceIDList, setProformaInvoiceIDList] = useState([])
  const [proformaInvoiceIDError, setProformaInvoiceIDError] = useState(undefined)

  const [buyerGroupsList, setBuyerGroupsList] = useState([])
  const [buyerGroupID, setBuyerGroupID] = useState(undefined)
  const [buyerGroupError, setBuyerGroupError] = useState(undefined)

  const [buyerNamesList, setBuyerNamesList] = useState([])
  const [buyerID, setBuyerID] = useState()
  const [buyerIDError, setBuyerIDError] = useState(undefined)
  // const [buyerError, setBuyerError] = useState(undefined)

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)

  const [upsertSaleBill] = useMutation(UPSERT_SALES_BILL)

  const { loading: pinumberLoad, data: piNumberData, error: piNumbererror } = useQuery(PI_NUMBER)

  useEffect(() => {
    if (
      !pinumberLoad &&
      piNumberData &&
      piNumberData.proformaInvoices &&
      piNumberData.proformaInvoices.rows &&
      piNumberData.proformaInvoices.rows.length
    ) {
      setProformaInvoiceIDList(piNumberData.proformaInvoices.rows)
    }
  }, [pinumberLoad, piNumberData])

  // sales order by ID
  const {
    loading: salesOrderByIDLoad,
    error: salesOrderByIDErr,
    data: salesOrderByIDData,
  } = useQuery(SALES_ORDER, { variables: { id: saleOrderID } })

  const {
    loading: salesOrderLoad,
    data: salesOrderData,
    error: salesOrderError,
  } = useQuery(SALES_ORDER_NUMBER)

  useEffect(() => {
    if (
      !salesOrderLoad &&
      salesOrderData &&
      salesOrderData.salesOrderNames &&
      salesOrderData.salesOrderNames.length
    ) {
      setSalesOrderList(salesOrderData.salesOrderNames)
    }
  }, [salesOrderLoad, salesOrderData])

  const {
    loading: salesBillLoad,
    error: salesBillError,
    data: salesBillData,
  } = useQuery(SALES_BILL, {
    variables: { id },
  })
  useEffect(() => {
    if (action === 'create') {
      if (!salesOrderByIDLoad && salesOrderByIDData && salesOrderByIDData.salesOrder) {
        const { brand_id, createdAt, expected_delivery_date, sales_order_data } =
          salesOrderByIDData.salesOrder
        if (brand_id) setBrandID(String(brand_id))
        if (createdAt) setInvoiceDate(moment(Number(createdAt)))
        if (expected_delivery_date) setDueDate(moment(Number(expected_delivery_date)))
        const intermediateTableData = []
        if (sales_order_data && sales_order_data.length > 0) {
          sales_order_data.forEach((item, index) => {
            intermediateTableData.push({
              key: index,
              description: '',
              quantity: item.quantity ? item.quantity : 0,
              sale_bill_quantity: item.sale_bill_quantity ? item.sale_bill_quantity : 0,
              rate: item.unit_cost ? item.unit_cost : 0,
              cgst: item.cgst ? item.cgst : 0,
              sgst: item.sgst ? item.sgst : 0,
              igst: item.igst ? item.igst : 0,
            })
          })
        }
        setTableData(intermediateTableData)
      }
    }
    if (action === 'update') {
      if (!salesBillLoad && salesBillData && salesBillData.saleBill) {
        const {
          brand_id,
          buyer_id,
          company_id,
          invoice_date,
          invoice_due_date,
          invoice_number,
          buyer_group_id,
          detail,
          proforma_invoice_id,
          sales_order_id,
        } = salesBillData.saleBill
        if (brand_id) setBrandID(brand_id)
        if (company_id) setCompanyID(company_id)
        if (invoice_date) setInvoiceDate(moment(Number(invoice_date)))
        if (invoice_due_date) setDueDate(moment(Number(invoice_due_date)))
        if (invoice_number) setInvoiceNumber(invoice_number)
        if (buyer_group_id) {
          setBuyerGroupID(buyer_group_id)
          getBuyerNames()
        }
        if (buyer_id) setBuyerID(buyer_id)
        if (proforma_invoice_id) setPiID(proforma_invoice_id)
        if (sales_order_id) setSalesOrderID(sales_order_id)

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
  }, [salesBillData, salesBillLoad, salesOrderByIDData, saleOrderID])

  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length)
      setBrandList(brandData.brands)
  }, [brandData, brandLoad])

  const {
    loading: buyerGroupLoad,
    error: buyerGroupErr,
    data: buyerGroupData,
  } = useQuery(BUYER_GROUPS_LIST)

  useEffect(() => {
    if (
      !buyerGroupLoad &&
      buyerGroupData &&
      buyerGroupData.buyerGroups &&
      buyerGroupData.buyerGroups.length
    )
      setBuyerGroupsList(buyerGroupData.buyerGroups)
  }, [buyerGroupData, buyerGroupLoad])

  const [
    getBuyerNames,
    { loading: buyerNamesLoading, data: buyerNamesData, error: buyerNamesErr },
  ] = useLazyQuery(BUYER_NAME_LIST, {
    variables: {
      buyerGroupIDs: buyerGroupID ? [buyerGroupID] : null,
      buyerIDs: buyerID ? [buyerID] : [],
    },
  })

  useEffect(() => {
    if (
      !buyerNamesLoading &&
      buyerNamesData &&
      buyerNamesData.buyerNames &&
      buyerNamesData.buyerNames.length
    )
      setBuyerNamesList(buyerNamesData.buyerNames)
    else setBuyerNamesList([])
  }, [buyerNamesData, buyerGroupID, buyerNamesLoading])

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
  }, [companyLoad, companyLoad])

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateSalesBill')),
  )

  const [disabled, setDisabled] = useState(!editMode)

  const [tableData, setTableData] = useState([
    {
      key: 0,
      description: '',
      quantity: 0,
      sale_bill_quantity: 0,
      // amount: 0,
      rate: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
    },
  ])

  // Function to add new row begin
  const addRow = () => {
    const count = tableData.length + 1
    const newRow = {
      key: count,
      description: '',
      quantity: 0,
      sale_bill_quantity: 0,
      //   amount: 0,
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
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.quantity ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.quantity}
              min={0}
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
              disabled={action === 'create' || action === 'update' || disabled}
            />
          ),
        }
      },
    },
    {
      title: 'Bill Quantity',
      dataIndex: 'sale_bill_quantity',
      key: 'sale_bill_quantity',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.sale_bill_quantity
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <InputNumber
              value={record.sale_bill_quantity}
              min={0}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.sale_bill_quantity = value
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
      title: 'CGST%',
      dataIndex: 'cgst',
      key: 'cgst',
      render: (text, record) => {
        return {
          props: {
            style: record.recordError && record.recordError.cgst ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.cgst}
              min={0}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.cgst = value
                  }
                  //   row.amount = row.quantity * row.rate + (row.quantity * row.rate * row.cgst) / 100
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
      title: 'SGST%',
      dataIndex: 'sgst',
      key: 'sgst',
      render: (text, record) => {
        return {
          props: {
            style: record.recordError && record.recordError.sgst ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.sgst}
              min={0}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.sgst = value
                  }
                  //   row.amount = row.quantity * row.rate + (row.quantity * row.rate * row.sgst) / 100
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
      title: 'IGST%',
      dataIndex: 'igst',
      key: 'igst',
      render: (text, record) => {
        return {
          props: {
            style: record.recordError && record.recordError.igst ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.igst}
              min={0}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.igst = value
                  }
                  //   row.amount = row.quantity * row.rate + (row.quantity * row.rate * row.igst) / 100
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
    // {
    //   title: 'Amount',
    //   dataIndex: 'amount',
    //   key: 'amount',
    // },
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
    // if (!vendorID) {
    //   isError = true
    //   setVendorIDError('Please select a vendor')
    // }
    if (!companyID) {
      isError = true
      setCompanyIDError('Please select a company')
    }
    if (!invoiceNumber) {
      isError = true
      setInvoiceNumberError('Invoice Number can not be enpty')
    }
    // if (!referenceNumber) {
    //   isError = true
    //   setReferenceNumberError('Enter Reference Number')
    // }
    // if (!gstNumber) {
    //   isError = true
    //   setgstNumberError('Enter tax Number')
    // }
    if (!buyerID) {
      isError = true
      setBuyerIDError('Please select a buyer')
    }
    if (!buyerGroupID) {
      isError = true
      setBuyerGroupError('please select Buyer group')
    }
    // if (!SBStatus) {
    //   isError = true
    //   setSBStatusError('Please select a buyer')
    // }
    if (!saleOrderID) {
      isError = true
      setSaleOrderIDError('Please select SO id')
    }
    if (!piID) {
      isError = true
      setProformaInvoiceIDError('please select PI Number')
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
      if (!record.sale_bill_quantity || record.sale_bill_quantity === 0) {
        isError = true
        record.recordError.sale_bill_quantity = true
      }

      detail.push({
        id: record.id || undefined,
        description: record.description,
        quantity: record.quantity,
        sale_bill_quantity: record.sale_bill_quantity,
        rate: record.rate,
        cgst: record.cgst,
        sgst: record.sgst,
        igst: record.igst,
      })
    })
    setTableData(intermediateTableData)
    // -- Search for duplicates begin: Get duplicate IDs
    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }
    upsertSaleBill({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        invoice_date: String(invoiceDate.valueOf()),
        invoice_due_date: String(dueData.valueOf()),
        company_id: Number(companyID),
        brand_id: Number(brandID),
        // vendor_id: Number(vendorID),
        buyer_id: Number(buyerID),
        buyer_group_id: Number(buyerGroupID),
        invoice_number: String(invoiceNumber),
        // gst_number: gstNumber,
        sales_order_id: Number(saleOrderID),
        proforma_invoice_id: Number(piID),
        // status: SBStatus,
        // same_state: sameState,
        detail,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/sales-bill')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }
  if (!permissions.includes('readSalesBill')) return <Error403 />
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  // if (vendorErr) return `Error occured while fetching data: ${vendorErr.message}`
  if (companyErr) return `Error occured while fetching data: ${companyErr.message}`
  if (salesBillError) return `Error occured while fetching data: ${salesBillError.message}`
  if (buyerGroupErr) return `Error occured while fetching data: ${buyerGroupErr.message}`
  if (salesOrderError) return `Error occured while fetching data: ${salesOrderError.message}`
  if (salesOrderByIDErr) return `Error occured while fetching data: ${salesOrderByIDErr.message}`
  if (piNumbererror) return `Error occured while fetching data: ${piNumbererror.message}`
  if (buyerNamesErr) return `Error occured while fetching data: ${buyerNamesErr.message}`
  if (action === 'create' && !permissions.includes('createSalesBill')) return <Error403 />
  //   if (variantDetailErr) return `Error occured while fetching data: ${variantDetailErr.message}`
  return (
    <div>
      <Helmet title=" Sales Bill" />
      <Spin spinning={salesBillLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className={action === 'create' ? 'col-4' : 'col-3'}>
            <h5 className="mb-2">
              <strong>
                {id ? 'Edit' : 'Create'} Sales Bill {id ? `#${id}` : ' '}
              </strong>
            </h5>
          </div>
          <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
            {action === 'update' && permissions.includes('updateSalesBill') && (
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
                  Sales Order<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={saleOrderID}
                  onChange={(value) => {
                    setSalesOrderID(value)
                  }}
                  className={
                    salesOrderIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select S.O"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  style={{
                    width: 120,
                  }}
                  disabled={disabled}
                >
                  {salesOrderList && salesOrderList.length
                    ? salesOrderList.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.id}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{salesOrderIDError || ''}</div>
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
                  disabled={disabled}
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
                  disabled={disabled}
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
                  disabled={action === 'update' || disabled}
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

              {/* <div className="col-lg-3 col-6">
                <div className="mb-2">
                  Vendor<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={vendorID}
                  disabled={action === 'update' || disabled}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    setVendorID(value)
                  }}
                  className={brandIDError ? 'custom-error-border' : ''}
                  placeholder="Select an vendor"
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
              </div> */}

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
                  placeholder="Select an company"
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
              {/* buyer group */}

              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Buyer Group<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={buyerGroupID}
                  onChange={(value) => {
                    setBuyerGroupID(value)
                    getBuyerNames()
                  }}
                  className={
                    buyerGroupError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select Buyer"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  style={{
                    width: 120,
                  }}
                  disabled={disabled}
                >
                  {buyerGroupsList && buyerGroupsList.length
                    ? buyerGroupsList.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{buyerGroupError || ''}</div>
              </div>

              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Buyer<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={buyerID}
                  onChange={(value) => {
                    setBuyerID(value)
                  }}
                  className={buyerIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                  placeholder="Select Buyer"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  style={{
                    width: 120,
                  }}
                  disabled={disabled}
                >
                  {buyerNamesList && buyerNamesList.length
                    ? buyerNamesList.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.name}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{buyerIDError || ''}</div>
              </div>

              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  PI Number<span className="custom-error-text"> *</span>
                </div>
                <Select
                  showSearch
                  value={piID}
                  onChange={(value) => {
                    setPiID(value)
                  }}
                  className={
                    proformaInvoiceIDError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select PI"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  style={{
                    width: 120,
                  }}
                  disabled={disabled}
                >
                  {proformaInvoiceIDList && proformaInvoiceIDList.length
                    ? proformaInvoiceIDList.map((obj) => (
                        <Select.Option key={String(obj.id)} value={String(obj.id)}>
                          {obj.id}
                        </Select.Option>
                      ))
                    : null}
                </Select>
                <div className="custom-error-text mb-4">{proformaInvoiceIDError || ''}</div>
              </div>

              {/* <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Status<span className="custom-error-text"> *</span>
                </div>
                <Select
                  value={SBStatus}
                  onChange={(value) => {
                    setSBStatus(value)
                  }}
                  className={
                    SBStatusError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select Status"
                  style={{
                    width: 120,
                  }}
                  disabled={disabled}
                >
                  <Select.Option key="Due" value="Due">
                    Due
                  </Select.Option>
                  <Select.Option key="Pending" value="Pending">
                    Pending
                  </Select.Option>
                  <Select.Option key="Completed" value="Completed">
                    Completed
                  </Select.Option>
                </Select>
                <div className="custom-error-text mb-4">{SBStatusError || ''}</div>
              </div> */}

              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Sales Invoice Number<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={invoiceNumber}
                  placeholder="Invoice"
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{invoiceNumberError || ''}</div>
              </div>

              {/* <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Reference Number<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={referenceNumber}
                  placeholder="reference number"
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{referenceNumberError || ''}</div>
              </div> */}

              {/* <div className="col-lg-2 col-6">
                <div className="mb-2">
                  GST Number<span className="custom-error-text"> *</span>
                </div>
                <Input
                  value={gstNumber}
                  placeholder="Gst number"
                  onChange={(e) => setGstNumber(e.target.value)}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{gstNumberError || ''}</div>
              </div> */}
            </div>

            <div className="row">
              <div className="col-lg-12">
                <Table
                  dataSource={tableData}
                  columns={columns}
                  pagination={false}
                  onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                />
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
                <span className="mr-3">Total {totalRows}</span>
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

export default withRouter(connect(mapStateToProps)(SalesBillForm))
