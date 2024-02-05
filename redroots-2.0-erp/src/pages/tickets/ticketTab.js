import React from 'react'
import { Table } from 'antd'
// import { useHistory } from 'react-router-dom'

const TicketTab = ({ tabType, tableData, tableColumns }) => {
  const columns = [...tableColumns]
  // const history = useHistory()
  if (tabType === 'created') columns.splice(4, 1)
  else if (tabType === 'assigned') columns.splice(5, 1)

  return (
    <div className="kit__utils__table">
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        rowKey={(record) => String(record.id)}
        onRow={(record) => ({
          onClick: () => {
            window.open(`${window.location.href}/update/${record.id}`)
          },
        })}
        locale={{
          emptyText: (
            <div className="custom-empty-text-parent">
              <div className="custom-empty-text-child">
                <i className="fe fe-search" />
                <h5>No Tickets Found</h5>
              </div>
            </div>
          ),
        }}
      />
    </div>
  )
}

export default TicketTab
