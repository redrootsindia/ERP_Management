import React, { useState, useEffect } from 'react'

import { Table, InputNumber } from 'antd'

const FormRowExpand = ({ record, parentCallback, action, disabled }) => {
  const { id, material_code, number_of_rolls, material_id, batches } = record
  const [rollsDataSource, setRollsDataSource] = useState([])
  // const [firstRender, setFirstRender] = useState(false)

  useEffect(() => {
    const tempRollsData = []
    let i = 1
    while (i <= number_of_rolls) {
      tempRollsData.push({ key: i, material_code, material_id })
      i += 1
    }
    setRollsDataSource(tempRollsData)
    // setFirstRender(true)
  }, [number_of_rolls])

  useEffect(() => {
    if (action !== 'create' && batches) {
      const tempRollsData = []
      batches.forEach((element, i) => {
        tempRollsData.push({ ...element, key: i, material_code, material_id })
      })

      setRollsDataSource(tempRollsData)
    }
  }, [action, batches])

  const addRolls = (rolls, recordID) => {
    const tempRolls = JSON.parse(JSON.stringify(rollsDataSource))
    const foundIndex = tempRolls.findIndex((e) => Number(e.key) === Number(recordID))
    if (foundIndex > -1) tempRolls[foundIndex].quantity = Number(rolls)

    setRollsDataSource(tempRolls)
    if (parentCallback) parentCallback(id, tempRolls)
  }

  const insideColumns = [
    {
      title: 'Material Code',
      dataIndex: 'material_code',
      key: 'material_code',
    },
    {
      title: 'Batch Number',
      dataIndex: 'id',
      key: 'id',
      render: (text) => (text ? `# ${text}` : '-'),
    },
    {
      title: 'Actual Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, row) => (
        <InputNumber
          min={0}
          disabled={disabled}
          value={row.quantity}
          onChange={(e) => {
            addRolls(e, row.key)
          }}
        />
      ),
    },
  ]

  return (
    <div key={id}>
      <div className="kit__utils__table">
        <Table
          columns={insideColumns}
          dataSource={rollsDataSource}
          pagination={false}
          onHeaderRow={() => ({ className: 'custom-header-small-font' })}
          rowKey={(row) => String(row.key)}
        />
      </div>
    </div>
  )
}
export default FormRowExpand
