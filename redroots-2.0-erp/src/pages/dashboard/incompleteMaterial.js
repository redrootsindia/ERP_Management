import React, { useState, useEffect } from 'react'
import { Spin } from 'antd'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { INCOMPLETE_MATERIALS } from './queries'

const IncompleteMaterial = () => {
  const history = useHistory()
  const [materialIDs, setMaterialIDs] = useState([])
  console.log('materialIDs', materialIDs)

  const {
    loading: materialsLoad,
    error: materialsErr,
    data: materialsData,
  } = useQuery(INCOMPLETE_MATERIALS)

  useEffect(() => {
    if (
      !materialsLoad &&
      materialsData &&
      materialsData.incompleteMaterials &&
      materialsData.incompleteMaterials.length
    ) {
      setMaterialIDs(materialsData.incompleteMaterials)
    }
  }, [materialsLoad, materialsData])

  if (materialsErr) return `Error occured while fetching data: ${materialsErr.message}`

  return (
    <div>
      <div className="col-lg-3 col-md-12">
        <div className="card">
          <Spin spinning={materialsLoad} tip="Loading...">
            <div
              className="card-body overflow-hidden position-relative"
              role="button"
              aria-hidden="true"
              onClick={() =>
                materialIDs.length > 0
                  ? history.push(
                      `/materials/all-materials?materialIDs=${materialIDs.map(
                        (materialID) => materialID.id,
                      )}`,
                    )
                  : null
              }
            >
              <div className="font-size-36 font-weight-bold text-dark line-height-1 mt-2">
                {materialIDs.length || 0}
              </div>
              <div className="mb-1">Incomplete Materials</div>
            </div>
          </Spin>
        </div>
      </div>
    </div>
  )
}

export default IncompleteMaterial
