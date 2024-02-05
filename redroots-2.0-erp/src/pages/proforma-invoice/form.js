import React, { useEffect, useState } from 'react'
import { withRouter, useParams, useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import Error403 from 'components/Errors/403'
import {
  Spin,
  Button,
  Select,
  DatePicker,
  Table,
  Image,
  notification,
  InputNumber,
  Input,
  Popconfirm,
  Switch,
} from 'antd'
import _ from 'lodash'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import CSVDownload from './csvDownload'
import { UPSERT_PROFORMA_INVOICE, PROFORMA_INVOICE } from './queries'
import { BRANDS, VARIANT, VARIANTS_BY_BRAND_ID } from '../purchase-orders/product/queries'
import { BUYER_NAME_LIST, BUYER_GROUPS_LIST } from '../sales-orders/all-sales-orders/queries'

const mapStateToProps = ({ user }) => ({ user })
const ProformaInvoiceForm = ({ user: { permissions } }) => {
  const { action, id } = useParams()
  const history = useHistory()
  const [brandIDError, setBrandIDError] = useState(undefined)
  const [brandID, setBrandID] = useState(undefined)
  const [piStatus, setPiStatus] = useState('Open')
  const [piStatusError, setPIStatusError] = useState(undefined)
  const [sameState, setSameState] = useState(true)
  const [variantCodeSearchString, setVariantCodeSearchString] = useState(null)
  const [piDate, setPiDate] = useState(undefined)
  const [piDateError, setPiDateError] = useState(undefined)

  const [buyerID, setBuyerID] = useState(undefined)
  const [buyerList, setBuyerList] = useState([])
  const [buyerIDError, setBuyerIDError] = useState(undefined)
  const [buyerGroupsList, setBuyerGroupsList] = useState([])
  const [buyerGroupID, setBuyerGroupID] = useState(undefined)
  const [buyerGroupError, setBuyerGroupError] = useState(undefined)
  const [brandList, setBrandList] = useState([])
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')
  const [totalRows, setTotalRows] = useState(1)

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  const [upsertProformaInvoice] = useMutation(UPSERT_PROFORMA_INVOICE)
  const [getBuyerNames, { loading: buyerLoad, error: buyerErr, data: buyerData }] = useLazyQuery(
    BUYER_NAME_LIST,
    {
      variables: {
        buyerGroupIDs: buyerGroupID ? [buyerGroupID] : null,
        buyerIDs: buyerID ? [buyerID] : [],
      },
    },
  )

  useEffect(() => {
    if (!buyerLoad && buyerData && buyerData.buyerNames && buyerData.buyerNames.length)
      setBuyerList(buyerData.buyerNames)
  }, [buyerData, buyerGroupID, buyerLoad])

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

  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length)
      setBrandList(brandData.brands)
  }, [brandData, brandLoad])

  const debouncedVariantCodeSearch = _.debounce((value) => setVariantCodeSearchString(value), 500)

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

  // Variant List Declaration Begin
  const [variantList, setVariantList] = useState([])
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
          row.product_name = variantDetailRecord.product_name
          row.image = variantDetailRecord.image
          row.variant_code = variantDetailRecord.code
          row.asin = variantDetailRecord.asin
          if (variantDetailRecord.hsn_name) {
            row.hsn_name = variantDetailRecord.hsn_name
          }
          row.gst = sameState
            ? variantDetailRecord.cgst + variantDetailRecord.sgst
            : variantDetailRecord.igst
        }
      })
      setTableData(intermediateTableData)
    }
  }, [variantDetailData, variantDetailLoad])

  // Function to delete row begin
  const deleteRow = (key) => {
    const newTableData = tableData.filter((item) => item.key !== key)
    setTotalRows(newTableData.length)
    setTableData(newTableData)
  }

  const {
    loading: proformaInvoiceLoad,
    error: proformaInvoiceError,
    data: proformaInvoiceData,
  } = useQuery(PROFORMA_INVOICE, {
    variables: { id },
  })
  useEffect(() => {
    if (!proformaInvoiceLoad && proformaInvoiceData && proformaInvoiceData.proformaInvoice) {
      const {
        brand_id,
        brand_name,
        buyer_id,
        buyer_group_id,
        status,
        detail,
        expiry_date,
        same_state,
      } = proformaInvoiceData.proformaInvoice
      if (brand_id) setBrandID(brand_id)
      if (buyer_group_id) {
        setBuyerGroupID(buyer_group_id)
        getBuyerNames()
      }
      if (buyer_id) setBuyerID(buyer_id)
      if (status) setPiStatus(status)
      if (brand_name) setBrandID(brand_name)
      if (expiry_date) setPiDate(moment(Number(expiry_date)))
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
      setTotalRows(intermediateTableData.length)
      setTableData(intermediateTableData)
    }
  }, [proformaInvoiceData, proformaInvoiceLoad])
  // Generate Variant Code List Begin
  const getVariantCodes = () => {
    return variantList.map(({ id: varID, code }) => (
      <Select.Option key={varID} value={varID}>
        {code}
      </Select.Option>
    ))
  }
  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateProformaInvoice')),
  )

  const [disabled, setDisabled] = useState(!editMode)
  // const disabledForVendor = type === 'vendor'

  const [tableData, setTableData] = useState([
    {
      key: 0,
      product_category_name: '',
      product_subcategory_name: '',
      image: '',
      product_name: '',
      variant_code: '',
      asin: '',
      quantity: 0,
      mrp: 0,
      unit_cost: 0,
      hsn_name: '',
      gst: 0,
      total: 0,
      comment: '',
    },
  ])

  const columns = [
    {
      title: 'Category',
      dataIndex: 'product_category_name',
      key: 'product_category_name',
    },
    {
      title: 'Sub Category',
      dataIndex: 'product_subcategory_name',
      key: 'product_subcategory_name',
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
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
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
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.unit_cost ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.unit_cost}
              min={0}
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
        }
      },
    },
    {
      title: 'MRP',
      dataIndex: 'mrp',
      key: 'mrp',
      render: (text, record) => (
        <InputNumber
          value={record.mrp}
          min={0}
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(tableData)
            intermediateTableData.forEach((row) => {
              if (row.key === record.key) {
                row.mrp = value
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
      title: 'GST',
      dataIndex: 'gst',
      key: 'gst',
      render: (text, record) => (
        <InputNumber
          value={record.gst}
          min={0}
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(tableData)

            intermediateTableData.forEach((row) => {
              if (row.key === record.key) {
                row.gst = value
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
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (text, record) =>
        (record.quantity * record.unit_cost * (1 + record.gst / 100)).toFixed(2),
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

  // Function to add new row begin
  const addRow = () => {
    const count = tableData.length + 1
    const newRow = {
      key: count,
      product_category_name: '',
      product_subcategory_name: '',
      image: '',
      product_name: '',
      variant_code: '',
      asin: '',
      quantity: 0,
      mrp: 0,
      unit_cost: 0,
      hsn_name: '',
      gst: 0,
      total: 0,
      comment: '',
    }

    const newTableData = [...tableData, newRow]
    setTotalRows(newTableData.length)
    setTableData(newTableData)
  }
  // Find Duplicates Begin

  const findDuplicates = (arr) => {
    const sorted_arr = arr.slice().sort()
    const results = []
    for (let i = 0; i < sorted_arr.length - 1; i += 1) {
      if (sorted_arr[i + 1] === sorted_arr[i]) results.push(sorted_arr[i])
    }
    return results
  }

  const onSubmit = () => {
    setBrandIDError(undefined)
    setBuyerIDError(undefined)
    setPiDateError(undefined)
    setPIStatusError(undefined)
    let isError = false

    if (!brandID) {
      isError = true
      setBrandIDError('Please select a brand')
    }
    if (!buyerGroupID) {
      isError = true
      setBuyerGroupError('please select Buyer group')
    }
    if (!buyerID) {
      isError = true
      setBuyerIDError('Please select a buyer')
    }
    if (!piDate) {
      isError = true
      setPiDateError('Please select a date')
    }
    if (!piStatus) {
      isError = true
      setPIStatusError('Please select the PI Status')
    }
    const intermediateTableData = _.cloneDeep(tableData)
    const detail = []
    intermediateTableData.forEach((record) => {
      record.recordError = {}

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
      if (!record.unit_cost || record.unit_cost === '') {
        isError = true
        record.recordError.unit_cost = true
      }
      detail.push({
        id: record.id || undefined,
        variant_id: record.variant_id,
        quantity: record.quantity,
        hsn_name: record.hsn_name,
        unit_cost: record.unit_cost,
        gst: sameState ? record.gst : 0,
        mrp: record.mrp,
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
    upsertProformaInvoice({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        brand_id: Number(brandID),
        buyer_id: Number(buyerID),
        buyer_group_id: Number(buyerGroupID),
        expiry_date: String(piDate.valueOf()),
        status: piStatus,
        same_state: sameState,
        detail,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/proforma-invoice')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving product.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }
  if (!permissions.includes('readProformaInvoice')) return <Error403 />
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (buyerErr) return `Error occured while fetching data: ${buyerErr.message}`
  if (buyerGroupErr) return `Error occured while fetching data: ${buyerGroupErr.message}`
  if (proformaInvoiceError)
    return `Error occured while fetching data: ${proformaInvoiceError.message}`
  if (variantListErr) return `Error occured while fetching data: ${variantListErr.message}`
  if (action === 'create' && !permissions.includes('createProformaInvoice')) return <Error403 />
  if (variantDetailErr) return `Error occured while fetching data: ${variantDetailErr.message}`
  return (
    <div>
      <Helmet title=" Proforma Invoice" />
      <Spin spinning={brandLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className={action === 'create' ? 'col-4' : 'col-3'}>
            <h5 className="mb-2">
              <strong>
                {id ? 'Edit' : 'Create'} Proforma Invoice {id ? `#${id}` : ' '}
              </strong>
            </h5>
          </div>
          <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
            &emsp;
            {action === 'update' && permissions.includes('updateProformaInvoice') && (
              <>
                <CSVDownload id={id} />
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
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row mb-5">
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
                  placeholder="Select Buyer Group"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  style={{
                    width: '100%',
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
                    width: '100%',
                  }}
                  disabled={disabled}
                >
                  {buyerList && buyerList.length
                    ? buyerList.map((obj) => (
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
                  Expiry Date<span className="custom-error-text"> *</span>
                </div>
                <DatePicker
                  style={{ width: '100%' }}
                  value={piDate}
                  format="DD-MM-YYYY"
                  className={piDateError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''}
                  onChange={(value) => {
                    setPiDate(value)
                  }}
                  disabled={disabled}
                />
                <div className="custom-error-text mb-4">{piDateError || ''}</div>
              </div>
              <div className="col-lg-2 col-6">
                <div className="mb-2">
                  Status<span className="custom-error-text"> *</span>
                </div>
                <Select
                  value={piStatus}
                  onChange={(value) => {
                    setPiStatus(value)
                  }}
                  className={
                    piStatusError ? 'custom-error-border' : disabled ? 'disabledStyle' : ''
                  }
                  placeholder="Select Status"
                  style={{
                    width: 120,
                  }}
                  disabled={disabled}
                >
                  <Select.Option key="Open" value="Open">
                    Open
                  </Select.Option>
                  <Select.Option key="In Progress" value="In Progress">
                    In Progress
                  </Select.Option>
                  <Select.Option key="Completed" value="Completed">
                    Completed
                  </Select.Option>
                </Select>
                <div className="custom-error-text mb-4">{piStatusError || ''}</div>
              </div>
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

export default withRouter(connect(mapStateToProps)(ProformaInvoiceForm))
