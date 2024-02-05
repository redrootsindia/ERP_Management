import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
// prettier-ignore
import { Input, InputNumber, Button, Spin,Select, Switch, notification, Table, Popconfirm, DatePicker,
         Tooltip, Space } from 'antd'
import _ from 'lodash'
import { LoadingOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import ImageUpload from 'components/ImageUpload'
import Error403 from 'components/Errors/403'
import moment from 'moment'
import { EXPENSE, UPSERT_EXPENSE, EXPENSE_SUBCATS, BRANDS } from './queries'

const { TextArea } = Input

const mapStateToProps = ({ user }) => ({ user })
const ExpenseManagementDetails = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()
  const [changesMade, setChangesMade] = useState(false)
  const [expenseDate, setExpenseDate] = useState(moment())
  const [expenseDateError, setExpenseDateError] = useState(undefined)

  const [expenseDueDate, setExpenseDueDate] = useState(moment(expenseDate).add(7, 'days'))
  const [expenseDueDateError, setExpenseDueDateError] = useState(undefined)

  const [expenseSubcategory, setExpenseSubcategory] = useState([])
  const [brands, setBrand] = useState([])
  const [totalExpenses, setTotalExpenses] = useState(
    Number(0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
  )

  const [approvedExpenses, setApprovedExpenses] = useState(
    Number(0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
  )

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateExpenseManagement')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [upsertExpense] = useMutation(UPSERT_EXPENSE)

  const {
    loading: expenseSubcategoryLoad,
    error: expenseSubcategoryErr,
    data: expenseSubcategoryData,
  } = useQuery(EXPENSE_SUBCATS)

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)

  const {
    loading: expenseManagementDetailLoad,
    error: expenseManagementDetailErr,
    data: expenseManagementDetailData,
  } = useQuery(EXPENSE, { variables: { id } })

  const [tableData, setTableData] = useState([
    {
      key: 0,
      description: '',
      start_date: '',
      end_date: '',
      company_name: '',
      voucher_date: '',
      amount: 0,
      bill_number: '',
      brand_id: '',
      expense_image: null,
      status: 'In Review',
      is_expense_image_changed: false,
    },
  ])
  const [tableDataError, setTableDataError] = useState(false)
  const getExpenseSubcategories = () => {
    return expenseSubcategory.map((subCategory) => (
      <Select.Option key={subCategory.id} value={subCategory.id}>
        {subCategory.name}
      </Select.Option>
    ))
  }

  const getBrands = () => {
    return brands.map((brand) => (
      <Select.Option key={brand.id} value={brand.id}>
        {brand.name}
      </Select.Option>
    ))
  }

  const calculateTotalExpenseInRupee = (totalAmount) => {
    const curr = totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
    setTotalExpenses(`${curr.slice(0, 1)} ${curr.slice(1)}`)
  }

  const calculateApprovedExpenseInRupee = (ApprovedExpenses) => {
    const curr = ApprovedExpenses.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
    setApprovedExpenses(`${curr.slice(0, 1)} ${curr.slice(1)}`)
  }

  const columns = [
    {
      title: 'Brand',
      dataIndex: 'brand_id',
      key: 'brand_id',
      width: '7%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.brand_id ? { border: '1px solid red' } : {},
          },
          children: (
            <Select
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.brand_id = value
                })
                setChangesMade(true)
                setTableData(intermediateTableData)
              }}
              value={record.brand_id}
              style={{ width: '100%' }}
              placeholder="Please select one"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={disabled}
            >
              {getBrands()}
            </Select>
          ),
        }
      },
    },
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
      width: '7%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.company_name
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <Select
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.company_name = value
                })
                setChangesMade(true)
                setTableData(intermediateTableData)
              }}
              value={record.company_name}
              style={{ width: '100%' }}
              disabled={disabled}
            >
              <option value="redroots">redroots</option>
              <option value="redturk">redturks</option>
              <option value="threearrows">threearrows</option>
            </Select>
          ),
        }
      },
    },
    {
      title: 'Voucher Date',
      dataIndex: 'voucher_date',
      key: 'voucher_date',
      width: '7%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.voucher_date
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <DatePicker
              value={!record.voucher_date ? '' : record.voucher_date}
              format="Do MMM YYYY"
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.voucher_date = value
                })
                setChangesMade(true)
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '7%',
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
              row={2}
              value={record.description}
              onChange={(e) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.description = e.target.value
                })
                setChangesMade(true)
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
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      width: '7%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.start_date
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <DatePicker
              value={record.start_date}
              format="Do MMM YYYY"
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.start_date = value
                })
                setChangesMade(true)
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
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      width: '7%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.end_date ? { border: '1px solid red' } : {},
          },
          children: (
            <DatePicker
              value={record.end_date}
              format="Do MMM YYYY"
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.end_date = value
                })
                setChangesMade(true)
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
      title: 'Subcategory',
      dataIndex: 'expense_subcategory_id',
      key: 'expense_subcategory_id',
      width: '7%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.expense_subcategory_id
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <Select
              onChange={(e) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.expense_subcategory_id = e
                })
                setChangesMade(true)
                setTableData(intermediateTableData)
              }}
              value={record.expense_subcategory_id}
              style={{ width: '100%' }}
              placeholder="Please select one"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={disabled}
            >
              {getExpenseSubcategories()}
            </Select>
          ),
        }
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: '7%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.amount ? { border: '1px solid red' } : {},
          },
          children: (
            <InputNumber
              value={record.amount}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                let intermediateTotalAmount = 0
                let intermediateApprovedExpense = 0
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.amount = value
                  if (row.status === 'Approved') intermediateApprovedExpense += row.amount
                  intermediateTotalAmount += row.amount
                })
                setChangesMade(true)
                setTableData(intermediateTableData)
                calculateTotalExpenseInRupee(intermediateTotalAmount)
                calculateApprovedExpenseInRupee(intermediateApprovedExpense)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },
    {
      title: 'Bill Number',
      dataIndex: 'bill_number',
      key: 'bill_number',
      width: '7%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.bill_number
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <Input
              value={record.bill_number}
              onChange={(e) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) row.bill_number = e.target.value
                })
                setChangesMade(true)
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
      title: 'Image',
      dataIndex: 'expense_image',
      key: 'expense_image',
      width: '7%',
      render: (text, record) => {
        return {
          props: {
            style:
              record.recordError && record.recordError.expense_image
                ? { border: '1px solid red' }
                : {},
          },
          children: (
            <ImageUpload
              existingImages={record.expense_image} // Always pass an array. If not empty, it should have fully-formed URLs of images
              placeholderType="general" // Accepted values: 'general' or 'general'
              onUploadCallback={(imgFile) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.expense_image = imgFile
                    row.is_expense_image_changed = true
                  }
                })
                setChangesMade(true)
                setTableData(intermediateTableData)
              }}
              onRemoveCallback={() => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((row) => {
                  if (row.key === record.key) {
                    row.expense_image = null
                    row.is_expense_image_changed = true
                  }
                })
                setChangesMade(true)
                setTableData(intermediateTableData)
              }}
              maxImages={1}
              editMode={!disabled}
            />
          ),
        }
      },
    },
    // {
    //   {
    //     title: 'Reject Reason',
    //     dataIndex: 'reject_reason',
    //     key: 'reject_reason',
    //     // width: '12%',
    //     render: (text, record) => {
    //       return {
    //         props: {
    //           style:
    //             record.recordError && record.recordError.description
    //               ? { border: '1px solid red' }
    //               : {},
    //         },
    //         children: (
    //           <TextArea
    //             row={2}
    //             value={record.description}
    //             onChange={(e) => {
    //               const intermediateTableData = _.cloneDeep(tableData)
    //               intermediateTableData.forEach((row) => {
    //                 if (row.key === record.key) row.description = e.target.value
    //               })
    //               setChangesMade(true)
    //               setTableData(intermediateTableData)
    //             }}
    //             style={{ width: '100%' }}
    //             disabled={disabled}
    //           />
    //         ),
    //       }
    //     },
    //   },
    // }
    {
      title: '',
      key: 'action',
      sort: false,
      filter: false,
      type: 'string',
      width: '7%',
      render: (text, record) => (
        <Popconfirm
          disabled={disabled}
          title="Sure to delete?"
          onConfirm={() => {
            deleteRow(record.key)
            setChangesMade(true)
          }}
        >
          <Button type="danger" disabled={disabled}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
    {
      title: 'Approve / Reject',
      key: 'action',
      sort: false,
      filter: false,
      type: 'string',
      fixed: 'right',
      width: '7%',
      render: (text, record) => {
        let primaryPropAccept = {}
        let primaryPropReject = {}
        if (record.status === 'Approved') primaryPropAccept = { type: 'primary' }
        if (record.status === 'Rejected') primaryPropReject = { type: 'primary' }
        return (
          <Space size="small">
            <Tooltip title={record.status === 'Approved' ? 'Approved' : 'Approve'}>
              <Button
                danger
                {...primaryPropAccept}
                onClick={async () => {
                  const intermediateTableData = _.cloneDeep(tableData)
                  let intermediateApprovedExpense = 0
                  intermediateTableData.forEach((row) => {
                    if (row.key === record.key) row.status = 'Approved'
                    if (row.status === 'Approved') intermediateApprovedExpense += row.amount
                  })
                  // const intermediateStatus = _.every(intermediateTableData, {
                  //   status: 'Approved',
                  // })
                  // if (intermediateStatus) {
                  //   setStatus('Approved')
                  // } else {
                  //   setStatus('In Review')
                  // }
                  calculateApprovedExpenseInRupee(intermediateApprovedExpense)
                  setChangesMade(true)
                  setTableData(intermediateTableData)
                }}
                shape="circle"
                icon={<CheckOutlined />}
                disabled={disabled}
              />
            </Tooltip>
            <Tooltip title={record.status === 'Rejected' ? 'Rejected' : 'Reject'}>
              <Button
                danger
                {...primaryPropReject}
                onClick={() => {
                  const intermediateTableData = _.cloneDeep(tableData)
                  let intermediateApprovedExpense = 0
                  intermediateTableData.forEach((row) => {
                    if (row.key === record.key) row.status = 'Rejected'
                    if (row.status === 'Approved') intermediateApprovedExpense += row.amount
                  })
                  // const intermediateStatus =  _.every(intermediateTableData, {
                  //   status: 'Rejected',
                  // })
                  // if (intermediateStatus) {
                  //   setStatus('Rejected')
                  // } else {
                  //   setStatus('In Review')
                  // }
                  calculateApprovedExpenseInRupee(intermediateApprovedExpense)
                  setChangesMade(true)
                  setTableData(intermediateTableData)
                }}
                shape="circle"
                icon={<CloseOutlined />}
                disabled={disabled}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ]

  if (!permissions.includes('approveExpenseManagement')) columns.splice(11, 1)

  const addRow = () => {
    const count = tableData.length + 1
    const newRow = {
      key: count,
      description: '',
      start_date: '',
      end_date: '',
      amount: 0,
      bill_number: '',
      expense_image: null,
      status: 'In Review',
      is_expense_image_changed: false,
    }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)
  }

  const deleteRow = async (key) => {
    let intermediateApprovedExpense = 0
    const newTableData = tableData.filter((item) => {
      if (item.status === 'Approved' && item.key !== key) {
        intermediateApprovedExpense += item.amount
      }
      return item.key !== key
    })
    // if (newTableData.length >= 0) {
    //   const intermediateStatusAccept = _.every(newTableData, { status: 'Approved' })
    //   const intermediateStatusReject = _.every(newTableData, { status: 'Rejected' })
    //   if (intermediateStatusAccept) {
    //     setStatus('Approved')
    //   } else if (intermediateStatusReject) {
    //     setStatus('Rejected')
    //   } else {
    //     setStatus('In Review')
    //   }
    // } else {
    //   setStatus('In Review')
    // }
    calculateTotalExpenseInRupee(_.sumBy(newTableData, 'amount'))
    calculateApprovedExpenseInRupee(intermediateApprovedExpense)
    setTableData(newTableData)
  }

  useEffect(() => {
    if (
      expenseSubcategoryData &&
      expenseSubcategoryData.expenseSubcategories &&
      expenseSubcategoryData.expenseSubcategories.length
    ) {
      setExpenseSubcategory(expenseSubcategoryData.expenseSubcategories)
    }
  }, [expenseSubcategoryData])

  useEffect(() => {
    if (brandData && brandData.brands && brandData.brands.length) setBrand(brandData.brands)
  }, [brandData])

  useEffect(() => {
    if (
      !expenseSubcategoryLoad &&
      !brandLoad &&
      expenseManagementDetailData &&
      expenseManagementDetailData.expense
    ) {
      // prettier-ignore
      const {expense_date, expense_due_date, detail } = expenseManagementDetailData.expense

      if (expense_date) setExpenseDate(moment(Number(expense_date)))
      if (expense_due_date) setExpenseDueDate(moment(Number(expense_due_date)))

      // if (expenseManagementDetailData.expense.status) {
      //   if (expenseManagementDetailData.expense.status === 'Approved') {
      //     if (!permissions.includes('approveExpenseManagement')) {
      //       setEditMode(false)
      //       setDisabled(true)
      //     }
      //   } else if (expenseManagementDetailData.expense.status === 'Rejected') {
      //     if (!permissions.includes('approveExpenseManagement')) {
      //       setEditMode(false)
      //       setDisabled(true)
      //     }
      //   }
      // }

      const intermediateTableData = []
      let intermediateTotalAmount = 0
      let intermediateApprovedExpense = 0
      if (detail && detail.length > 0) {
        detail.forEach((item, index) => {
          intermediateTableData.push({
            id: item.id,
            key: index,
            description: item.description,
            company_name: item.company_name ? item.company_name : '',
            voucher_date: item.voucher_date ? moment(Number(item.voucher_date)) : '',
            start_date: moment(Number(item.start_date)),
            end_date: moment(Number(item.end_date)),
            expense_subcategory_id: item.expense_subcategory_id,
            amount: item.amount,
            bill_number: item.bill_number,
            expense_image: item.expense_image
              ? [
                  `${process.env.REACT_APP_IMAGE_URL}${process.env.REACT_APP_EXPENSE_URL}${item.expense_image}`,
                ]
              : [],
            brand_id: item.brand_id,
            status: item.status,
          })
          intermediateTotalAmount += item.amount
          if (item.status === 'Approved') {
            intermediateApprovedExpense += item.amount
          }
        })
      }
      setTableData(intermediateTableData)
      calculateTotalExpenseInRupee(intermediateTotalAmount)
      calculateApprovedExpenseInRupee(intermediateApprovedExpense)
    }
  }, [expenseManagementDetailData])

  const onSubmit = () => {
    let isError = false
    if (!expenseDate) {
      isError = true
      setExpenseDateError('Expense Date cannot be empty')
    }
    if (!expenseDueDate) {
      isError = true
      setExpenseDueDateError('Expense Due Date cannot be empty')
    }
    if (isError) {
      notification.error({
        message: 'Incorrect / Incomplete Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }

    if (!tableData || tableData.length === 0) {
      isError = true
      setTableDataError('Please add at least add one record')
    }

    const detail = []

    const intermediateTableData = _.cloneDeep(tableData)

    const { approvedAmount, totalAmount } = intermediateTableData.reduce(
      (acc, obj) => {
        acc.totalAmount += obj.amount
        if (obj.status === 'Approved') acc.approvedAmount += obj.amount
        return acc
      },
      { approvedAmount: 0, totalAmount: 0 },
    )

    const status =
      action === 'create'
        ? 'In Preview'
        : totalAmount === approvedAmount
        ? 'Approved'
        : approvedAmount > 0
        ? 'In Partial'
        : 'Rejected'

    intermediateTableData.forEach((record) => {
      record.recordError = {}
      if (!record.amount || record.amount < 0) {
        isError = true
        record.recordError.amount = true
      }

      if (!record.description) {
        isError = true
        record.recordError.description = true
      }

      if (!record.start_date) {
        isError = true
        record.recordError.start_date = true
      }

      if (!record.end_date) {
        isError = true
        record.recordError.end_date = true
      }

      if (!record.bill_number) {
        isError = true
        record.recordError.bill_number = true
      }

      if (!record.expense_subcategory_id) {
        isError = true
        record.recordError.expense_subcategory_id = true
      }

      if (!record.brand_id) {
        isError = true
        record.recordError.brand_id = true
      }

      // if (!record.expense_image) {
      //   isError = true
      //   record.recordError.expense_image = true
      // }

      detail.push({
        id: record.id || undefined,
        amount: record.amount,
        description: record.description,
        company_name: record.company_name,
        voucher_date: record.voucher_date ? String(record.voucher_date.valueOf()) : '',
        start_date: record.start_date ? String(record.start_date.valueOf()) : '',
        end_date: record.end_date ? String(record.end_date.valueOf()) : '',
        bill_number: record.bill_number,
        expense_subcategory_id: record.expense_subcategory_id,
        brand_id: record.brand_id,
        expense_image: record.expense_image ? record.expense_image : null,
        is_expense_image_changed: record.is_expense_image_changed,
        status: record.status,
      })
    })
    setTableData(intermediateTableData)

    if (isError) {
      if (isError)
        notification.error({
          message: 'Incorrect Data',
          description:
            'Please make sure all the mandatory fields are filled and have valid entries.',
        })
      return
    }

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )
    upsertExpense({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        expense_date: String(expenseDate.unix() * 1000),
        expense_due_date: String(expenseDueDate.unix() * 1000),
        status,
        changes_made: changesMade,
        detail,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/accounting/expense-management')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving AQL Levels.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readExpenseManagement')) return <Error403 />
  if (action === 'create' && !permissions.includes('createExpenseManagement')) return <Error403 />
  if (expenseManagementDetailErr)
    return `Error occured while fetching data: ${expenseManagementDetailErr.message}`
  if (expenseSubcategoryErr)
    return `Error occured while fetching data: ${expenseSubcategoryErr.message}`
  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`

  return (
    <div>
      <Helmet title="Expense Management Detail" />

      <Spin spinning={expenseManagementDetailLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Expense Management</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateExpenseManagement') ? (
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
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-9">
                    <div className="row">
                      <div className="col-lg-4">
                        <div className="mb-2">
                          Expense Date<span className="custom-error-text"> *</span>
                        </div>
                        <DatePicker
                          style={{ width: '100%' }}
                          value={expenseDate}
                          format="Do MMM YYYY"
                          className={
                            expenseDateError
                              ? 'custom-error-border'
                              : disabled
                              ? 'disabledStyle'
                              : ''
                          }
                          onChange={(value) => {
                            setExpenseDate(value)
                          }}
                          disabled={disabled || permissions.includes('createExpenseManagement')}
                        />
                        <div className="custom-error-text mb-4">{expenseDateError || ''}</div>
                      </div>

                      <div className="col-lg-4">
                        <div className="mb-2">
                          Expense Due Date<span className="custom-error-text"> *</span>
                        </div>
                        <DatePicker
                          style={{ width: '100%' }}
                          value={expenseDueDate}
                          format="Do MMM YYYY"
                          className={
                            expenseDateError
                              ? 'custom-error-border'
                              : disabled
                              ? 'disabledStyle'
                              : ''
                          }
                          onChange={(value) => setExpenseDueDate(value)}
                          disabled={disabled || permissions.includes('createExpenseManagement')}
                        />
                        <div className="custom-error-text mb-4">{expenseDueDateError || ''}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3">
                    <div className="pull-right">
                      <h5>Total Expense : {totalExpenses}</h5>
                      <h5>Approved Expense : {approvedExpenses}</h5>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 mb-4" style={{ textAlign: 'left' }}>
                    <Button onClick={addRow} danger disabled={disabled}>
                      Add Record
                    </Button>
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
                      scroll={{ x: '180%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createExpenseManagement')) ||
          (action === 'update' && permissions.includes('updateExpenseManagement')) ? (
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

export default withRouter(connect(mapStateToProps)(ExpenseManagementDetails))
