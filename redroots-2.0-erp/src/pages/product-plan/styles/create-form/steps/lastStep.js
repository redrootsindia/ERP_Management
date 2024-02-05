/* eslint no-unused-vars: off, no-undef:off */

import React, { useState, useEffect } from 'react'
import { Table, Image, InputNumber, notification } from 'antd'
import { useParams } from 'react-router-dom'
import { EyeOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import _ from 'lodash'
import { USED_BUDGET_BY_PLAN_ID } from '../../../queries'

const LastStep = ({ productsWithBudget, lastStepProductsCallback, transferPlanID }) => {
  const { id } = useParams()

  const [productsList, setProductsList] = useState([])
  console.log('productsList', productsList)

  const [usedBudgetList, setUsedBudgetList] = useState([])

  console.log('transferPlanID', transferPlanID)

  const {
    loading: usedBudgetLoad,
    error: usedBudgetErr,
    data: usedBudgetData,
  } = useQuery(USED_BUDGET_BY_PLAN_ID, { variables: { product_plan_id: transferPlanID || id } })

  useEffect(() => {
    if (
      !usedBudgetLoad &&
      usedBudgetData &&
      usedBudgetData.usedBudgetByPlanID &&
      usedBudgetData.usedBudgetByPlanID.length
    )
      setUsedBudgetList(usedBudgetData.usedBudgetByPlanID)
    else setUsedBudgetList([])
  }, [usedBudgetData, usedBudgetLoad])

  useEffect(() => {
    const tempProductsList = []
    if (productsWithBudget && productsWithBudget.length) {
      productsWithBudget.forEach((product) => {
        const usedBudget = usedBudgetList.find(
          (budget) =>
            Number(product.product_subcategory_id) === Number(budget.subcategory_id) &&
            String(product.type) === String(budget.type),
        )
        const remainingBudget = usedBudget
          ? product.alloted_budget - usedBudget.used_budget
          : product.alloted_budget

        tempProductsList.push({
          ...product,
          remaining_budget: remainingBudget,
          planned_budget: 0,
          planned_quantity: 0,
          remaining_budget_orig: remainingBudget,
        })
      })
    }
    setProductsList(tempProductsList)
  }, [usedBudgetList, productsWithBudget])

  const tableColumns = [
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
            alt="general"
            fallback="resources/images/placeholder/general.png"
            preview={{ mask: <EyeOutlined /> }}
          />
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
      // render: (text) => <Link to="/settings/product-settings/categories">{text}</Link>,
    },
    {
      title: 'Subcategory',
      dataIndex: 'product_subcategory',
      key: 'product_subcategory',
      // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
    },
    {
      title: 'Est SP',
      dataIndex: 'sp',
      key: 'sp',
      // render: (text) => <Link to="/settings/product-settings/subcategories">{text}</Link>,
    },
    {
      title: 'Alloted Budget',
      dataIndex: 'alloted_budget',
      key: 'alloted_budget',
    },
    {
      title: 'Remaining Budget',
      dataIndex: 'remaining_budget',
      key: 'remaining_budget',
    },
    {
      title: 'Planned Qty.',
      dataIndex: 'planned_quantity',
      key: 'planned_quantity',
      render: (text, record) => (
        <InputNumber
          value={record.planned_quantity}
          min={0}
          onChange={(value) => {
            const intermediateTableData = _.cloneDeep(productsList)
            const planned_budget = value * record.sp

            let totalPlannedQuantityChange = 0

            totalPlannedQuantityChange = intermediateTableData
              .filter(
                (row) =>
                  Number(row.product_subcategory_id) === Number(record.product_subcategory_id) &&
                  String(row.type) === String(record.type),
              )
              .reduce((acc, obj) => acc + obj.planned_budget, planned_budget)

            intermediateTableData.forEach((row) => {
              if (
                Number(row.product_subcategory_id) === Number(record.product_subcategory_id) &&
                String(row.type) === String(record.type)
              ) {
                if (row.key === record.key) {
                  if (planned_budget <= record.remaining_budget) {
                    row.planned_budget = planned_budget
                    row.planned_quantity = value
                    row.remaining_budget =
                      record.remaining_budget_orig -
                      totalPlannedQuantityChange +
                      record.planned_budget
                  } else {
                    row.planned_budget = 0
                    row.planned_quantity = 0
                    totalPlannedQuantityChange =
                      totalPlannedQuantityChange - record.planned_budget - record.sp
                    row.remaining_budget =
                      record.remaining_budget_orig -
                      totalPlannedQuantityChange +
                      record.planned_budget
                    notification.error({
                      message: 'Error',
                      description:
                        'Planned Quantity exceeds the budget remaining for this sub-category.',
                    })
                  }
                }
                if (row.key !== record.key) {
                  row.remaining_budget =
                    record.remaining_budget_orig -
                    totalPlannedQuantityChange +
                    record.planned_budget
                }
              }
            })

            setProductsList(intermediateTableData)
          }}
        />
      ),
    },

    {
      title: 'Planned Budget',
      dataIndex: 'planned_budget',
      key: 'planned_budget',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => {
        return {
          props: {
            style: {
              background: text === 'New' ? '#d3e68cb5' : '#ffe7bb',
              color: 'black',
            },
          },
          children: <b>{text}</b>,
        }
      },
    },
  ]

  if (lastStepProductsCallback) lastStepProductsCallback(productsList)

  return (
    <>
      <div className="kit__utils__table">
        <Table
          columns={tableColumns}
          dataSource={productsList}
          pagination={false}
          rowKey={(record) => String(record.id)}
        />
      </div>
    </>
  )
}

export default LastStep
