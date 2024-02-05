/* eslint no-unused-vars: off, no-undef:off */

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useParams, useHistory } from 'react-router-dom'
import { notification, Button, Steps } from 'antd'
import FirstStep from './steps/firstStep'
import Transfer from './steps/transfer'
import Existing from './steps/existing'
import LastStep from './steps/lastStep'
import { SUBCATEGORIES_BY_PLAN_ID, ADD_PRODUCT_PLAN_STYLES } from '../../queries'

const { Step } = Steps

const StepsForm = () => {
  const history = useHistory()

  const { id } = useParams()

  const [current, setCurrent] = useState(0)
  const [transferPlanID, setTransferPlanID] = useState(undefined)

  // First Step start
  const [firstStepDisabled, setFirstStepDisabled] = useState(false)
  const disabledNextCallback = () => setFirstStepDisabled(true)

  const [secondStepContent, setSecondStepContent] = useState(undefined)
  const secondStepCallBack = (value) => setSecondStepContent(value)
  // First Step End

  // Second Step Start
  const [productsList, setProductsList] = useState([])

  const productsListCallback = (list) => setProductsList(list)

  const transferPlanIDCallBack = (transferId) => setTransferPlanID(transferId)

  const [budgetList, setBudgetList] = useState([])

  const [productsWithBudget, setProductsWithBudget] = useState([])

  const {
    loading: productPlanLoad,
    error: productPlanErr,
    data: productPlanData,
  } = useQuery(SUBCATEGORIES_BY_PLAN_ID, {
    variables: { product_plan_id: transferPlanID || id },
  })

  useEffect(() => {
    if (!productPlanLoad && productPlanData && productPlanData.subCategoriesByPlanID)
      setBudgetList(productPlanData.subCategoriesByPlanID)
  }, [productPlanData, productPlanLoad])

  useEffect(() => {
    const tempProductsBudget = []
    if (productsList && productsList.length) {
      productsList.forEach((product) => {
        const budget = budgetList.find(
          (budgets) => Number(product.product_subcategory_id) === Number(budgets.subcategory_id),
        )
        tempProductsBudget.push({
          ...product,
          key: product.id,
          alloted_budget: budget
            ? product.type === 'New'
              ? budget.new_product_budget
              : product.type === 'Repeat' && budget.repeat_product_budget
            : 0,
        })
      })
    }
    setProductsWithBudget(tempProductsBudget)
  }, [productsList])

  // Second Step End

  // Last Step Start

  const [productPlanStyles, setProductPlanStyles] = useState([])

  const lastStepProductsCallback = (list) => setProductPlanStyles(list)

  // Last Step End

  const [addStyles] = useMutation(ADD_PRODUCT_PLAN_STYLES)

  const next = () => {
    setCurrent(current + 1)
  }

  const prev = () => {
    setProductsWithBudget([])
    setCurrent(current - 1)
  }

  const steps = [
    {
      title: 'First',
      content: (
        <FirstStep
          disabledNextCallback={disabledNextCallback}
          secondStepCallBack={secondStepCallBack}
        />
      ),
    },
    {
      title: 'Second',
      content:
        secondStepContent === 'Transfer' ? (
          <Transfer
            productsListCallback={productsListCallback}
            transferPlanIDCallBack={transferPlanIDCallBack}
          />
        ) : (
          secondStepContent === 'Existing' && (
            <Existing productsListCallback={productsListCallback} />
          )
        ),
    },
    {
      title: 'Last',
      content: (
        <LastStep
          productsWithBudget={productsWithBudget}
          lastStepProductsCallback={lastStepProductsCallback}
          transferPlanID={transferPlanID}
        />
      ),
    },
  ]

  const onSubmit = () => {
    if (!productPlanStyles || !productPlanStyles.length) {
      notification.error({
        message: 'Incomplete Table',
        description: 'Select atleast one Product ',
      })
      return
    }
    const stylesdata = productPlanStyles.map((e) => ({
      product_id: e.id,
      quantity: e.planned_quantity,
      type: e.type,
    }))

    addStyles({
      variables: {
        product_plan_id: id,
        transfer_plan_id: transferPlanID,
        styles: stylesdata,
      },
    })
      .then(() => {
        notification.success({ description: 'Saved Successfully.' })
        history.push('/product-plan')
      })
      .catch((err) => {
        notification.error({
          message: 'Error occured while adding styles.',
          description: err.message || 'Please contact system administrator.',
        })
      })
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h5 className="mb-2">
            <strong>Product</strong>
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-lg-1" />
            <div className="col-lg-10">
              <Steps current={current}>
                {steps.map((item) => (
                  <Step key={item.title} title={item.title} />
                ))}
              </Steps>
            </div>
            <div className="col-lg-1" />
          </div>

          <div className="steps-content mt-4 mb-4">{steps[current].content}</div>
          <div className="steps-action">
            {current < steps.length - 1 && (
              <Button type="primary" onClick={() => next()} disabled={!firstStepDisabled}>
                Next
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" onClick={onSubmit}>
                Done
              </Button>
            )}
            {current > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                Previous
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default StepsForm
