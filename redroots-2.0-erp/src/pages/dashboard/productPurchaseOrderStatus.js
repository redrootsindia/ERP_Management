import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Spin } from 'antd'
import { useQuery } from '@apollo/client'
import { PRODUCT_PURCHASE_ORDER_STATUS_COUNT } from '../purchase-orders/product/queries'

const ProductPurchaseOrderStatus = ({ status }) => {
  const history = useHistory()

  const [productPOStatusCount, setProductPOStatusCount] = useState(0)

  const {
    loading: productPOStatusLoad,
    error: productPOStatusErr,
    data: productPOStatusData,
  } = useQuery(PRODUCT_PURCHASE_ORDER_STATUS_COUNT, {
    variables: { status },
  })

  useEffect(() => {
    if (
      !productPOStatusLoad &&
      productPOStatusData &&
      productPOStatusData.statusWisePurchaseOrderCount
    )
      setProductPOStatusCount(productPOStatusData.statusWisePurchaseOrderCount.count)
  }, [productPOStatusData, productPOStatusLoad])

  if (productPOStatusErr) return `Error occured while fetching data: ${productPOStatusErr.message}`

  return (
    <div>
      <div className="col-md-12">
        <div className="card">
          <Spin spinning={productPOStatusLoad} tip="Loading...">
            <div
              className="card-body overflow-hidden position-relative"
              role="button"
              aria-hidden="true"
              onClick={() => history.push(`/purchase-orders/product?status=${status}`)}
            >
              <div className="font-size-36 font-weight-bold text-dark line-height-1 mt-2">
                {productPOStatusCount}
              </div>
              <div className="mb-1">{`${status} Product P.O.s`}</div>
            </div>
          </Spin>
        </div>
      </div>
    </div>
  )
}

export default ProductPurchaseOrderStatus
