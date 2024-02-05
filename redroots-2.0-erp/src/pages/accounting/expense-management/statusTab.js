import React from 'react'
import { Table } from 'antd'
import { useHistory } from 'react-router-dom'

const StatusTab = ({ tableData, tableColumns }) => {
  const history = useHistory()
  return (
    <div className="kit__utils__table">
      <Table
        onRow={(record) => {
          return {
            onClick: () => {
              history.push(`/accounting/expense-management/update/${record.id}`)
            },
          }
        }}
        columns={tableColumns}
        dataSource={tableData}
        pagination={false}
        rowKey={(record) => String(record.id)}
        locale={{
          emptyText: (
            <div className="custom-empty-text-parent">
              <div className="custom-empty-text-child">
                <i className="fe fe-search" />
                <h5>No Expenses Found</h5>
              </div>
            </div>
          ),
        }}
      />
    </div>
  )
}

export default StatusTab
