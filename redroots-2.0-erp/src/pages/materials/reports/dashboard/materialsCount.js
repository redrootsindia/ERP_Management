import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import MATERIAL_DASHBOARD from './queries'

const MaterialsCount = ({ status, active }) => {
  const history = useHistory()
  const [count, setCount] = useState(0)
  const [materialIDs, setMaterialIDs] = useState([])

  const {
    loading: materialsCountLoad,
    error: materialsCountErr,
    data: materialsCountData,
  } = useQuery(MATERIAL_DASHBOARD, {
    variables: { status, active },
  })

  useEffect(() => {
    if (!materialsCountLoad && materialsCountData && materialsCountData.materialDashboard) {
      if (materialsCountData.materialDashboard.count)
        setCount(materialsCountData.materialDashboard.count)
      else setMaterialIDs(materialsCountData.materialDashboard.material_ids)
    }
  }, [materialsCountData, materialsCountLoad])

  if (materialsCountErr) return `Error occured while fetching data: ${materialsCountErr.message}`

  return (
    <>
      <div className="col-lg-3 col-md-12">
        <div className="card">
          <div className="card-body overflow-hidden position-relative">
            <div
              className="font-size-36 font-weight-bold text-dark line-height-1 mt-2"
              role="button"
              aria-hidden="true"
              onClick={() =>
                status
                  ? history.push(`/purchase-orders/material?status=${status}`)
                  : active
                  ? history.push(`/materials/all-materials?active=${active}`)
                  : materialIDs.length > 0
                  ? history.push(`/materials/all-materials?materialIDs=${materialIDs}`)
                  : null
              }
            >
              {count || materialIDs.length || 0}
            </div>
            <div className="mb-1">
              {status
                ? `In Progress Material  P.O.s`
                : active
                ? `Material with not active `
                : 'Pending to be ordered'}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MaterialsCount
