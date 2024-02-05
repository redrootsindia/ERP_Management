import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { Table, Select, InputNumber, Popconfirm, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { PRODUCT_SUBCAT_BY_CAT_ID } from '../settings/product-settings/subcategories/queries'

const CategoryExpand = ({ record, action, subcategoryTableCallback, disabled }) => {
  const { category_id, subcategoryTable, key: table_id } = record

  const [subcategoriesList, setSubcategoriesList] = useState([])

  const [tableData, setTableData] = useState([])

  const addRow = () => {
    const count = tableData.length + 1
    const newRow = {
      key: count,
      subcategory_id: null,
      new_product_budget: 0,
      repeat_product_budget: 0,
      isNew: true,
    }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)
    if (subcategoryTableCallback) subcategoryTableCallback(table_id, newTableData)
  }

  const deleteRow = (key) => {
    const newTableData = tableData.filter((item) => item.key !== key)
    if (subcategoryTableCallback) subcategoryTableCallback(table_id, newTableData)
    setTableData(newTableData)
  }

  const {
    loading: subcatLoad,
    error: subcatErr,
    data: subcatData,
  } = useQuery(PRODUCT_SUBCAT_BY_CAT_ID, { variables: { product_category_id: category_id } })

  useEffect(() => {
    if (
      !subcatLoad &&
      subcatData &&
      subcatData.productSubcategoryByCategoryID &&
      subcatData.productSubcategoryByCategoryID.length
    )
      setSubcategoriesList(subcatData.productSubcategoryByCategoryID)
  }, [subcatData, subcatLoad])

  useEffect(() => {
    console.log('subcategoryTable', subcategoryTable)
    if (subcategoryTable && subcategoryTable.length) {
      const tempSubcategoryTable = []
      subcategoryTable.forEach((element, i) => {
        tempSubcategoryTable.push({
          key: i + 1,
          id: element.id,
          subcategory_id: element.subcategory_id,
          new_product_budget: element.new_product_budget,
          repeat_product_budget: element.repeat_product_budget,
          isNew: element.isNew || false,
        })
      })
      console.log('tempSubcategoryTable', tempSubcategoryTable)

      setTableData(tempSubcategoryTable)
      console.log('aniket')
    }
  }, [action, subcategoryTable])

  if (subcatErr) return `Error occured while fetching data: ${subcatErr.message}`

  const Columns = [
    {
      title: 'Subcategory',
      dataIndex: 'subcategory_id',
      key: 'subcategory_id',
      render: (text, row) => ({
        children: (
          <Select
            onChange={(value) => {
              const intermediateTableData = _.cloneDeep(tableData)
              intermediateTableData.forEach((e) => {
                if (row.key === e.key) {
                  e.subcategory_id = value
                }
              })

              setTableData(intermediateTableData)
              if (subcategoryTableCallback)
                subcategoryTableCallback(table_id, intermediateTableData)
            }}
            value={row.subcategory_id}
            placeholder="Please select one"
            style={{ width: '100%' }}
            disabled={disabled}
          >
            {subcategoriesList && subcategoriesList.length
              ? subcategoriesList.map((obj) => (
                  <Select.Option key={String(obj.id)} value={String(obj.id)}>
                    {obj.name}
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
      render: (text, row) => {
        return {
          children: (
            <InputNumber
              value={row.new_product_budget}
              min={0}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)

                intermediateTableData.forEach((e) => {
                  if (row.key === e.key) {
                    e.new_product_budget = value
                  }
                })
                setTableData(intermediateTableData)
                if (subcategoryTableCallback)
                  subcategoryTableCallback(table_id, intermediateTableData)
              }}
              style={{ width: '100%' }}
              disabled={disabled}
            />
          ),
        }
      },
    },

    {
      title: 'Repeat Product Budget',
      dataIndex: 'repeat_product_budget',
      key: 'repeat_product_budget',
      render: (text, row) => {
        return {
          children: (
            <InputNumber
              value={row.repeat_product_budget}
              min={0}
              onChange={(value) => {
                const intermediateTableData = _.cloneDeep(tableData)
                intermediateTableData.forEach((e) => {
                  if (row.key === e.key) {
                    e.repeat_product_budget = value
                  }
                })
                setTableData(intermediateTableData)
                if (subcategoryTableCallback)
                  subcategoryTableCallback(table_id, intermediateTableData)
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
      type: 'string',
      render: (text, row) =>
        row.isNew ? (
          <>
            <Popconfirm title="Sure to delete?" onConfirm={() => deleteRow(row.key)}>
              <Button type="danger">
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </>
        ) : null,
    },
  ]

  return (
    <>
      {subcategoriesList && subcategoriesList.length ? (
        <>
          <div className="row mt-4 ml-2 mb-4">
            <Button type="primary" onClick={addRow} disabled={disabled}>
              Add Subcategory
            </Button>
          </div>
          <div className="kit__utils__table ml-4">
            <Table
              columns={Columns}
              dataSource={tableData}
              pagination={false}
              onHeaderRow={() => ({ className: 'custom-header-small-font' })}
              rowKey={(row) => String(row.key)}
            />
          </div>
        </>
      ) : null}
    </>
  )
}
export default CategoryExpand
