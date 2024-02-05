import React, { useState, useEffect } from 'react'

import { Table, Select, Button, InputNumber, Popconfirm, Input } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import BarcodeModal from './barcodeModal'

const PackagingComponent = (props) => {
  // prettier-ignore
  const { uniqueKey, boxDbID, productsToPack, boxPartialData, getBoxData, deleteBox, disabled } = props
  console.log(' PackagingComponent PROPS -- ', props)

  const [deletedRows, setDeletedRows] = useState([])
  const [tableData, setTableData] = useState([])
  const [boxCode, setBoxCode] = useState()
  const [count, setCount] = useState(1)
  const columns = [
    {
      title: 'Product',
      key: 'productVariantID',
      dataIndex: 'productVariantID',
      render: (text, record) => (
        <Select
          disabled={disabled}
          onChange={(e) => onChangeProduct(e, record.key)}
          id="product"
          value={text}
          style={{ width: '100%' }}
          placeholder="Please select one"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {productsToPack.map(({ productVariantID, productVariantCode }) => (
            <Select.Option key={productVariantID} value={productVariantID}>
              {productVariantCode}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      dataIndex: 'quantity',
      width: '30%',
      render: (text, record) => (
        <InputNumber
          min={0}
          value={text}
          onChange={(e) => onChange(e, record.key)}
          disabled={disabled}
        />
      ),
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: 70,
      sort: false,
      filter: false,
      type: 'string',
      render: (text, record) => (
        <Popconfirm title="Sure to delete?" onConfirm={() => deleteRow(record.key)}>
          <Button type="danger" disabled={disabled}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const emptyRow = { id: null, productVariantID: undefined, quantity: null, key: 1, isNew: true }

  useEffect(() => {
    if (boxPartialData && Object.keys(boxPartialData).length) {
      setBoxCode(boxPartialData.boxCode)
      setTableData(boxPartialData.tableData || [emptyRow])
      setCount(boxPartialData.tableData.length || 1)
    } else {
      setTableData([emptyRow])
      setCount(1)
    }
  }, [])

  const onChangeProduct = (e, key) => {
    const newTableData = tableData.map((row) => {
      if (row.key === key) return { ...row, productVariantID: e }
      return row
    })
    setTableData(newTableData)
    getBoxData(boxCode, newTableData, uniqueKey)
  }

  const onChange = (e, key) => {
    const newTableData = tableData.map((row) => {
      if (row.key === key) return { ...row, quantity: Number(e) }
      return row
    })
    setTableData(newTableData)
    getBoxData(boxCode, newTableData, uniqueKey)
  }

  const onChangeBoxCode = ({ target: { value } }) => {
    setBoxCode(value)
    getBoxData(value, tableData, uniqueKey)
  }

  const addRow = () => {
    const newRow = { ...emptyRow, key: count + 1 }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)
    setCount(count + 1)
    getBoxData(boxCode, newTableData, uniqueKey)
  }

  const deleteRow = (key) => {
    const tempDeletedRows = JSON.parse(JSON.stringify(deletedRows))
    const newTableData = []

    tableData.forEach((row) => {
      if (row.key !== key) newTableData.push(row)
      else if (!row.isNew) tempDeletedRows.push(row.id)
    })

    setTableData(newTableData)
    setDeletedRows(tempDeletedRows)
    getBoxData(boxCode, newTableData, uniqueKey, tempDeletedRows)
  }

  const deleteDiv = () => deleteBox(uniqueKey)

  return (
    <div className="mb-3">
      <div className="row" style={{ paddingBottom: '4px', paddingLeft: '16px' }}>
        <div className="col-6 custom-pad-0">
          <strong>Box #</strong>&emsp;
          <Input
            size="small"
            value={boxCode}
            placeholder="Enter Box Code"
            onChange={onChangeBoxCode}
            style={{ width: '70%' }}
            disabled={disabled}
          />
        </div>
        ​
        <div className="col-3 custom-pad-r0">
          <Button
            className="pull-right"
            size="small"
            type="primary"
            onClick={addRow}
            disabled={disabled}
          >
            Add row
          </Button>
        </div>
        ​
        <div className="col-1 custom-pad-r0">
          <Popconfirm title="Sure to delete the box?" onConfirm={deleteDiv}>
            <Button className="pull-right" size="small" type="danger" disabled={disabled}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
        ​
        <div className="col-1 custom-pad-r0">
          <BarcodeModal boxDbID={boxDbID} boxName={boxCode} disabled={disabled} />
        </div>
      </div>

      <div className="kit__utils__table">
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          rowKey={(record) => String(record.id)}
          locale={{ emptyText: <h5>No items in this box !</h5> }}
        />
      </div>
    </div>
  )
}

export default PackagingComponent
