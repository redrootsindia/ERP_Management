import React, { useState, useEffect } from 'react'
import { Table, Collapse } from 'antd'
import moment from 'moment'
import { useQuery } from '@apollo/client'
import { TICKET } from './queries'

const { Panel } = Collapse

const TicketHistory = ({ id }) => {
  const [assigneeHistory, setAssigneeHistory] = useState([])

  const {
    loading: ticketLoad,
    error: ticketErr,
    data: ticketData,
  } = useQuery(TICKET, {
    variables: { id },
  })

  useEffect(() => {
    if (
      !ticketLoad &&
      ticketData &&
      ticketData.ticket &&
      ticketData.ticket.asignedHistory &&
      ticketData.ticket.asignedHistory.length
    ) {
      setAssigneeHistory(ticketData.ticket.asignedHistory)
    } else setAssigneeHistory([])
  }, [ticketData, ticketLoad])

  const columns = [
    {
      title: 'Assigned Date ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (text ? moment(Number(text)).format('Do MMM YYYY, h:mm A') : '-'),
    },
    {
      title: 'Assigned By',
      dataIndex: 'assignee',
      key: 'assignee',
    },
    {
      title: 'Reassigned To',
      dataIndex: 'reassignee',
      key: 'reassignee',
    },
  ]

  if (ticketErr) return `Error occured while fetching data: ${ticketErr.message}`

  return (
    <>
      <Collapse bordered>
        <Panel header="Ticket Assignee History" key="1">
          <Table
            columns={columns}
            dataSource={assigneeHistory}
            pagination={false}
            rowKey={(record) => String(record.id)}
          />
        </Panel>
      </Collapse>
    </>
  )
}

export default TicketHistory
