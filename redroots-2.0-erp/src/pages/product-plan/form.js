import React, { useState, useEffect } from 'react'
import { withRouter, useHistory, useParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useQuery, useMutation } from '@apollo/client'
import { Button, Spin, Switch, Popconfirm, Select, notification, InputNumber, Table } from 'antd'
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import _ from 'lodash'
import Error403 from 'components/Errors/403'
import { BRANDS } from '../purchase-orders/product/queries'
import { CATEGORIES_BY_BRAND_ID, UPSERT_PRODUCT_PLAN, PRODUCT_PLAN } from './queries'
import CategoryExpand from './subcategoryExpand'

const { Option } = Select

const mapStateToProps = ({ user }) => ({ user })

const ProductPlanForm = ({ user: { permissions } }) => {
  const history = useHistory()
  const { action, id } = useParams()

  const [quarter, setQuarter] = useState(undefined)
  const [quarterError, setQuarterError] = useState(undefined)

  const [year, setYear] = useState(undefined)
  const [yearError, setYearError] = useState(undefined)

  const [brandID, setBrandID] = useState(undefined)
  const [brandIDError, setbrandIDError] = useState(undefined)
  const [brandList, setBrandList] = useState([])

  const [newProductBudget, setNewProductBudget] = useState(0)
  const [newProductBudgetError, setNewProductBudgetError] = useState(undefined)

  const [repeatProductBudget, setRepeatProductBudget] = useState(0)
  const [repeatProductBudgetError, setRepeatProductBudgetError] = useState(undefined)

  const [categoriesList, setCategoriesList] = useState([])

  const [editMode, setEditMode] = useState(
    action === 'create' || (action === 'update' && permissions.includes('updateProductPlan')),
  )
  const [disabled, setDisabled] = useState(!editMode)
  const [okText, setOkText] = useState(id ? 'Save' : 'Create')

  const [categoriesTable, setCategoriesTable] = useState([])

  const subcategoryTableCallback = (key, table) => {
    const tempCategoryData = JSON.parse(JSON.stringify(categoriesTable))
    const foundIndex = tempCategoryData.findIndex((e) => e.key === key)
    if (foundIndex > -1) {
      tempCategoryData[foundIndex].subcategoryTable = table
    }

    setCategoriesTable(tempCategoryData)
  }

  const generateYears = () => {
    const rows = []
    for (let i = quarter === 'Q4' ? -1 : 0; i < 4; i += 1) {
      const date = new Date(new Date().setFullYear(new Date().getFullYear() + i))
      const yearValue = date.getFullYear()
      rows.push(
        <Option key={i} value={String(yearValue)}>
          {`${yearValue}-${(Number(yearValue) % 100) + 1}`}
        </Option>,
      )
    }
    return rows
  }

  const addRow = () => {
    const count = categoriesTable.length + 1
    const newRow = {
      key: count,
      category_id: null,
      new_product_budget: 0,
      repeat_product_budget: 0,
      isNew: true,
    }
    const newTableData = [...categoriesTable, newRow]
    setCategoriesTable(newTableData)
  }

  const deleteRow = (key) => {
    const newTableData = categoriesTable.filter((item) => item.key !== key)
    setCategoriesTable(newTableData)
  }

  const [upsertProductPlan] = useMutation(UPSERT_PRODUCT_PLAN)

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (text, record) => ({
        children: (
          <Select
            onChange={(e) => {
              const intermediateTableData = _.cloneDeep(categoriesTable)
              intermediateTableData.forEach((row) => {
                if (row.key === record.key) {
                  row.category_id = e
                }
              })
              setCategoriesTable(intermediateTableData)
            }}
            value={record.category_id}
            placeholder="Please select one"
            style={{ width: '100%' }}
            disabled={!record.isNew || disabled}
          >
            {categoriesList && categoriesList.length
              ? categoriesList.map((obj) => (
                  <Select.Option key={String(obj.category_id)} value={String(obj.category_id)}>
                    {obj.category_name}
                  </Select.Option>
                ))
              : null}
          </Select>
        ),
      }),
    },

    {
      title: 'New Product Budget',
      dataIndex: 'new_product_budget',
      key: 'new_product_budget',
      render: (text, record) => {
        let total = 0
        if (record.subcategoryTable && record.subcategoryTable.length > 0)
          total = record.subcategoryTable.reduce((arr, value) => arr + value.new_product_budget, 0)
        return parseFloat(total).toFixed(2)
      },
    },

    {
      title: 'Repeat Product Budget',
      dataIndex: 'repeat_product_budget',
      key: 'repeat_product_budget',
      render: (text, record) => {
        let total = 0
        if (record.subcategoryTable && record.subcategoryTable.length > 0)
          total = record.subcategoryTable.reduce(
            (arr, value) => arr + value.repeat_product_budget,
            0,
          )
        return parseFloat(total).toFixed(2)
      },
    },

    {
      title: '',
      key: 'action',
      sort: false,
      filter: false,
      type: 'string',
      render: (text, record) =>
        record.isNew && (
          <>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => deleteRow(record.key)}
              disabled={disabled}
            >
              <Button type="danger" disabled={disabled}>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </>
        ),
    },
  ]

  const { loading: brandLoad, error: brandErr, data: brandData } = useQuery(BRANDS)
  useEffect(() => {
    if (!brandLoad && brandData && brandData.brands && brandData.brands.length)
      setBrandList(brandData.brands)
  }, [brandData, brandLoad])

  const {
    loading: productPlanLoad,
    error: productPlanErr,
    data: productPlanData,
  } = useQuery(PRODUCT_PLAN, { variables: { id } })

  useEffect(() => {
    if (!productPlanLoad && productPlanData && productPlanData.productPlan) {
      if (productPlanData.productPlan.quarter) setQuarter(productPlanData.productPlan.quarter)
      if (productPlanData.productPlan.year) setYear(productPlanData.productPlan.year)
      if (productPlanData.productPlan.brand_id) setBrandID(productPlanData.productPlan.brand_id)
      if (productPlanData.productPlan.budget_new_product)
        setNewProductBudget(productPlanData.productPlan.budget_new_product)
      if (productPlanData.productPlan.budget_repeat_product)
        setRepeatProductBudget(productPlanData.productPlan.budget_repeat_product)

      const tempCategoryTable = []
      if (
        productPlanData.productPlan.product_plan_categories &&
        productPlanData.productPlan.product_plan_categories.length
      ) {
        productPlanData.productPlan.product_plan_categories.forEach((e, i) => {
          tempCategoryTable.push({
            key: i + 1,
            id: e.id,
            category_id: e.category_id,
            subcategoryTable: e.subcategories,
          })
        })
      }

      setCategoriesTable(tempCategoryTable)
    }
  }, [productPlanData, productPlanLoad])

  const {
    loading: categoryByBrandLoad,
    error: categoryByBrandErr,
    data: categoryByBrandData,
  } = useQuery(CATEGORIES_BY_BRAND_ID, { variables: { brand_id: brandID } })

  useEffect(() => {
    if (
      !categoryByBrandLoad &&
      categoryByBrandData &&
      categoryByBrandData.categoriesByBrandID &&
      categoryByBrandData.categoriesByBrandID.length
    )
      setCategoriesList(categoryByBrandData.categoriesByBrandID)
    else setCategoriesList([])
  }, [categoryByBrandData, categoryByBrandLoad])

  const findDuplicates = (arr) => {
    const sorted_arr = arr.slice().sort()
    const results = []
    for (let i = 0; i < sorted_arr.length - 1; i += 1) {
      if (sorted_arr[i + 1] === sorted_arr[i]) results.push(sorted_arr[i])
    }
    return results
  }

  const onSubmit = () => {
    setQuarterError(undefined)
    setYearError(undefined)
    setbrandIDError(undefined)
    setNewProductBudgetError(undefined)
    setRepeatProductBudgetError(undefined)

    let isError = false
    if (!quarter) {
      isError = true
      setQuarterError('Please select a quarter')
    }
    if (!year) {
      isError = true
      setYearError('Please select a year')
    }
    if (!brandID || Number(brandID) === 0) {
      isError = true
      setbrandIDError('Please select a brand')
    }

    if (Number(newProductBudget) < 0) {
      isError = true
      setNewProductBudgetError('Budget for New Product cannot be less than zero ')
    }
    if (Number(repeatProductBudget) < 0) {
      isError = true
      setRepeatProductBudgetError('Budget for Repeat Product cannot be less than zero')
    }

    if (isError) {
      notification.error({
        message: 'Incorrect Data',
        description: 'Please make sure all the mandatory fields are filled and have valid entries.',
      })
      return
    }
    if (!categoriesTable || !categoriesTable.length) {
      notification.error({
        message: 'Incomplete Table',
        description: 'Select atleast one category',
      })
      return
    }

    let categoriesFilled = true
    let subcategoriesFilled = true

    console.log('categoriesTable', categoriesTable)
    if (categoriesTable && categoriesTable.length) {
      categoriesTable.forEach((obj) => {
        if (obj.category_id === null) categoriesFilled = false
        if (obj.subcategoryTable && obj.subcategoryTable.length) {
          obj.subcategoryTable.forEach((subcategory) => {
            if (subcategory.subcategory_id === null) subcategoriesFilled = false
          })
        }
      })
    }
    if (!categoriesFilled || !subcategoriesFilled) {
      if (!categoriesFilled) {
        notification.error({
          message: 'Incorrect Data',
          description: 'Please make sure Category should not be empty.',
        })
      }
      if (!subcategoriesFilled) {
        notification.error({
          message: 'Incorrect Data',
          description: 'Please make sure Subcategory should not be empty.',
        })
      }
      return
    }

    const categoryTableDataDuplicates = _.cloneDeep(categoriesTable).map((a) => a.category_id)

    const duplicateCategoryIDs = findDuplicates(categoryTableDataDuplicates)

    const subcategoryTableDataDuplicates = []

    categoriesTable.forEach((obj) => {
      if (obj.subcategoryTable && obj.subcategoryTable.length) {
        obj.subcategoryTable.forEach((e) => {
          subcategoryTableDataDuplicates.push(e.subcategory_id)
        })
      }
    })

    const duplicateSubcategoryIDs = findDuplicates(subcategoryTableDataDuplicates)

    if (
      (duplicateCategoryIDs && duplicateCategoryIDs.length) ||
      (duplicateSubcategoryIDs && duplicateSubcategoryIDs.length)
    ) {
      if (duplicateCategoryIDs && duplicateCategoryIDs.length) {
        notification.error({
          message: 'Incorrect Data',
          description: 'Please make sure Category must not be same.',
        })
      }
      if (duplicateSubcategoryIDs && duplicateSubcategoryIDs.length) {
        notification.error({
          message: 'Incorrect Data',
          description: 'Please make sure Subcategory must not be same.',
        })
      }
      return
    }

    let totalNewBudget = 0
    let totalRepeatBudget = 0

    categoriesTable.forEach((obj) => {
      if (obj.subcategoryTable && obj.subcategoryTable.length) {
        totalNewBudget += obj.subcategoryTable.reduce(
          (arr, value) => arr + value.new_product_budget,
          0,
        )
        totalRepeatBudget += obj.subcategoryTable.reduce(
          (arr, value) => arr + value.repeat_product_budget,
          0,
        )
      }
    })

    if (Number(totalNewBudget) > Number(newProductBudget)) {
      notification.error({
        message: 'Incorrect Data',
        description:
          'Please make sure Category new budget should not be greater than product new budget.',
      })
      return
    }

    if (Number(totalRepeatBudget) > Number(repeatProductBudget)) {
      notification.error({
        message: 'Incorrect Data',
        description:
          'Please make sure Category repeat budget should not be greater than product repeat budget.',
      })
      return
    }

    const product_plan_categories = []

    categoriesTable.forEach((categoryObj) => {
      product_plan_categories.push({
        id: categoryObj.id || 0,
        category_id: categoryObj.category_id,
        product_plan_subcategories:
          categoryObj.subcategoryTable && categoryObj.subcategoryTable.length
            ? categoryObj.subcategoryTable.map((subCategoryObj) => ({
                id: subCategoryObj.id || 0,
                subcategory_id: subCategoryObj.subcategory_id,
                new_product_budget: subCategoryObj.new_product_budget,
                repeat_product_budget: subCategoryObj.repeat_product_budget,
              }))
            : [],
      })
    })

    setOkText(
      <span>
        <LoadingOutlined />
        &emsp;Saving ...
      </span>,
    )

    upsertProductPlan({
      variables: {
        upsertType: id ? 'update' : 'create',
        id,
        quarter,
        year,
        brand_id: brandID,
        budget_new_product: newProductBudget,
        budget_repeat_product: repeatProductBudget,
        product_plan_categories,
      },
    })
      .then(() => {
        setOkText(id ? 'Save' : 'Create')
        notification.success({ description: 'Saved Successfully.' })
        history.push('/product-plan')
      })
      .catch((err) => {
        setOkText(id ? 'Save' : 'Create')
        notification.error({
          message: 'Error occured while saving Product plan.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  if (!permissions.includes('readProductPlan')) return <Error403 />
  if (action === 'create' && !permissions.includes('createProductPlan')) return <Error403 />

  if (brandErr) return `Error occured while fetching data: ${brandErr.message}`
  if (productPlanErr) return `Error occured while fetching data: ${productPlanErr.message}`
  if (categoryByBrandErr) return `Error occured while fetching data: ${categoryByBrandErr.message}`

  return (
    <div>
      <Helmet title="Product Plan" />

      <Spin spinning={brandLoad} tip="Loading..." size="large">
        <div className="row mb-4 mr-2 ml-2">
          <div className="col-11">
            <h5 className="mb-2">
              <strong>{id ? 'Edit' : 'Add'} Product Plan</strong>
            </h5>
          </div>

          {action === 'update' && permissions.includes('updateProductPlan') ? (
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

        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-4">
                <div className="mb-2">
                  Quarter<span className="custom-error-text"> *</span>
                </div>
                <Select
                  key="Quarter"
                  value={quarter || null}
                  placeholder="Select a quarter"
                  onChange={(value) => setQuarter(value)}
                  className="custom-pad-r1"
                  disabled={action === 'update' || disabled}
                  style={{ width: '100%' }}
                >
                  <Option key="Q1" value="Q1">
                    Q1
                  </Option>
                  <Option key="Q2" value="Q2">
                    Q2
                  </Option>
                  <Option key="Q3" value="Q3">
                    Q3
                  </Option>
                  <Option key="Q4" value="Q4">
                    Q4
                  </Option>
                </Select>
                <div className="custom-error-text mb-4">{quarterError || ''}</div>
              </div>

              <div className="col-4">
                <div className="mb-2">
                  Year<span className="custom-error-text"> *</span>
                </div>
                <Select
                  key="Year"
                  value={year || null}
                  placeholder="Select a year"
                  onChange={(value) => setYear(value)}
                  className="custom-pad-r1"
                  style={{ width: '100%' }}
                  disabled={action === 'update' || disabled}
                >
                  {generateYears()}
                </Select>
                <div className="custom-error-text mb-4">{yearError || ''}</div>
              </div>

              <div className="col-lg-4">
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
            </div>
            <div className="row">
              <div className="col-4">
                <div className="mb-2">
                  Budget for New Product<span className="custom-error-text"> *</span>
                </div>
                <InputNumber
                  min={0}
                  value={newProductBudget}
                  onChange={(value) => {
                    setNewProductBudget(value)
                  }}
                  disabled={disabled}
                  style={{ width: '100%' }}
                />

                <div className="custom-error-text mb-4">{newProductBudgetError || ''}</div>
              </div>
              <div className="col-4">
                <div className="mb-2">
                  Budget for Repeat Product<span className="custom-error-text"> *</span>
                </div>
                <InputNumber
                  min={0}
                  value={repeatProductBudget}
                  onChange={(value) => {
                    setRepeatProductBudget(value)
                  }}
                  disabled={disabled}
                  style={{ width: '100%' }}
                />

                <div className="custom-error-text mb-4">{repeatProductBudgetError || ''}</div>
              </div>
            </div>
          </div>
        </div>
        {brandID ? (
          <>
            <div className="row mt-4 ml-2 mb-4">
              <Button type="primary" onClick={addRow} disabled={disabled}>
                Add Category
              </Button>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-12">
                    <Table
                      dataSource={categoriesTable}
                      columns={columns}
                      pagination={false}
                      expandable={{
                        expandedRowRender: (record) => (
                          <CategoryExpand
                            record={record}
                            action={action}
                            disabled={disabled}
                            subcategoryTableCallback={subcategoryTableCallback}
                          />
                        ),
                        defaultExpandAllRows: action !== 'create',
                      }}
                      onHeaderRow={() => ({ className: 'custom-header-small-font' })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
        <div className="row mb-4 ml-2">
          {(action === 'create' && permissions.includes('createProductPlan')) ||
          (action === 'update' && permissions.includes('updateProductPlan')) ? (
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

export default withRouter(connect(mapStateToProps)(ProductPlanForm))
