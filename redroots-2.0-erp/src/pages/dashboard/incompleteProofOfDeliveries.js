import React, { useState, useEffect } from 'react'
import { Spin } from 'antd'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { INCOMPLETE_POD } from './queries'

const IncompleteProofOfDeliveries = () => {
  const history = useHistory()
  const [pickListIDs, setPickListIDs] = useState([])

  const {
    loading: proofOfDeliveryLoad,
    error: proofOfDeliveryErr,
    data: proofOfDeliveryData,
  } = useQuery(INCOMPLETE_POD)

  useEffect(() => {
    if (
      !proofOfDeliveryLoad &&
      proofOfDeliveryData &&
      proofOfDeliveryData.incompleteProofOfDeliveries
    ) {
      setPickListIDs(proofOfDeliveryData.incompleteProofOfDeliveries)
    }
  }, [proofOfDeliveryLoad, proofOfDeliveryData])

  if (proofOfDeliveryErr) return `Error occured while fetching data: ${proofOfDeliveryErr.message}`

  return (
    <div>
      <div className="col-md-12">
        <div className="card">
          <Spin spinning={proofOfDeliveryLoad} tip="Loading...">
            <div
              className="card-body overflow-hidden position-relative"
              role="button"
              aria-hidden="true"
              onClick={() =>
                pickListIDs.length > 0
                  ? history.push(
                      `/sales-orders/pick-lists?pickListIDs=${pickListIDs.map(
                        (pickListID) => pickListID.id,
                      )}`,
                    )
                  : null
              }
            >
              <div className="font-size-36 font-weight-bold text-dark line-height-1 mt-2">
                {pickListIDs.length || 0}
              </div>
              <div className="mb-1">Incomplete Proof of Deliveries</div>
            </div>
          </Spin>
        </div>
      </div>
    </div>
  )
}

export default IncompleteProofOfDeliveries
