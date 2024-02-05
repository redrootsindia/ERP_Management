import React, { useState, useEffect } from 'react'
import { Spin } from 'antd'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import TICKET_COUNT from './queries'

const TicketsCount = ({ status, un_assigned, type, raised_by }) => {
  const history = useHistory()
  const [ticketIDs, setTicketIDs] = useState([])

  const {
    loading: ticketCountLoad,
    error: ticketCountErr,
    data: ticketCountData,
  } = useQuery(TICKET_COUNT, {
    variables: { status, un_assigned, type, raised_by },
  })

  useEffect(() => {
    if (
      !ticketCountLoad &&
      ticketCountData &&
      ticketCountData.ticketsCount &&
      ticketCountData.ticketsCount.length
    )
      setTicketIDs(ticketCountData.ticketsCount)
  }, [ticketCountData, ticketCountLoad])

  const text = status
    ? `${status} Tickets`
    : un_assigned
    ? 'Unassigned Tickets'
    : raised_by
    ? 'Raised by Vendors'
    : type
    ? 'Tickets for P.O.s'
    : null
  if (ticketCountErr) return `Error occured while fetching data: ${ticketCountErr.message}`

  return (
    <>
      <div className="col-lg-3 col-md-12">
        <div className="card">
          <Spin spinning={ticketCountLoad} tip="Loading...">
            <div
              className="card-body overflow-hidden position-relative"
              role="button"
              aria-hidden="true"
              onClick={() =>
                ticketIDs.length > 0
                  ? history.push(`/tickets?ticketIDs=${ticketIDs.map((ticketID) => ticketID.id)}`)
                  : null
              }
            >
              <div className="font-size-36 font-weight-bold text-dark line-height-1 mt-2">
                {ticketIDs.length || 0}
              </div>
              <div className="mb-1">{text}</div>
            </div>
          </Spin>
        </div>
      </div>
    </>
  )
}

export default TicketsCount
