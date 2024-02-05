import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { InputNumber, Button, Select, Popconfirm, Table } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import './style.scss'

const RackShelfTable = forwardRef((props, childRef) => {
  // prettier-ignore
  const { initialTableData, getRackShelfData, productVariantID, uniqueKey, editableHeader, pickListComponent } = props

  const [tableData, setTableData] = useState([])

  const [count, setCount] = useState(0)

  useEffect(() => {
    if (initialTableData && initialTableData.length) {
      setTableData(
        initialTableData.map((row) => {
          return {
            ...row,
            rackID: row.rackID ? String(row.rackID) : null,
            shelfID: row.shelfID ? String(row.shelfID) : null,
          }
        }),
      )
      setCount(initialTableData.length)
    }
  }, [initialTableData])
  console.log('tableData-->', tableData)

  const [callbackFlag, setCallbackFlag] = useState(0)
  useEffect(() => {
    if (callbackFlag > 0 && getRackShelfData)
      getRackShelfData(productVariantID, tableData, editableHeader ? uniqueKey : tableData)
  }, [callbackFlag])

  console.log('(2) --> Props in inner TABLE: ', props)
  // console.log("(2) --> State 'tableData' in inner TABLE: ", tableData);

  const columns = [
    {
      title: 'Rack',
      key: 'rackID',
      dataIndex: 'rackID',
      width: editableHeader ? '20%' : '30%',
      sort: false,
      filter: false,
      type: 'string',
      render: (text, record) => (
        <Select
          // disabled={!record.isNew}
          onChange={(e) => onChangeRack(e, record.key)}
          id="rack"
          value={text}
          style={{ width: '100%' }}
          placeholder="Please select one"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {getRacks(record.racksDrop || [])}
        </Select>
      ),
    },
    {
      title: 'Shelf',
      key: 'shelfID',
      dataIndex: 'shelfID',
      width: editableHeader ? '20%' : '30%',
      sort: false,
      filter: false,
      type: 'string',
      render: (text, record) => (
        <Select
          // disabled={!record.isNew}
          onChange={(e) => onChange(e, record.key, 'shelfID')}
          id="shelf"
          value={text}
          style={{ width: '100%' }}
          placeholder="Please select one"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {getShelves(record.shelvesDrop || [])}
        </Select>
      ),
    },
    {
      title: 'In Stock',
      key: 'stockQuantity',
      dataIndex: 'stockQuantity',
      width: editableHeader ? '20%' : '30%',
      sort: false,
      filter: false,
      type: 'number',
      render: (text, record) => (record.shelfID ? record.shelfQuantity[record.shelfID] : null),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      dataIndex: 'quantity',
      width: '30%',
      sort: false,
      filter: false,
      type: 'string',
      render: (text, record) => (
        <InputNumber min={0} value={text} onChange={(e) => onChange(e, record.key, 'quantity')} />
      ),
    },
    {
      title: '',
      key: 'action',
      sort: false,
      filter: false,
      type: 'string',
      render: (text, record) => (
        <Popconfirm
          // disabled={!record.isNew}
          title="Sure to delete?"
          onConfirm={() => deleteRow(record.key)}
        >
          <Button disabled={!record.isNew} type="danger">
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  if (!editableHeader && !pickListComponent) columns.splice(2, 1)

  const getRacks = (racks) =>
    racks.map(({ id, name }) => (
      <Select.Option key={id} value={id}>
        {name}
      </Select.Option>
    ))

  const getShelves = (shelves) =>
    shelves.map(({ id, name }) => (
      <Select.Option key={id} value={id}>
        {name}
      </Select.Option>
    ))

  const onChangeRack = (e, key) => {
    const newTableData = tableData.map((row) => {
      if (row.key === key)
        return {
          ...row,
          rackID: String(e),
          shelfID: null,
          shelvesDrop: row.racksDrop.filter((rack) => Number(rack.id) === Number(e))[0].shelves,
        }
      return row
    })
    setTableData(newTableData)
  }

  const onChange = (e, key, varName) => {
    const newTableData = tableData.map((row) => {
      if (row.key === key)
        return {
          ...row,
          [varName]: varName === 'quantity' ? Number(e) : String(e),
        }
      return row
    })
    setTableData(newTableData)
    setCallbackFlag(callbackFlag + 1)
  }

  const addRow = () => {
    const newRow = {
      ...initialTableData[0],
      key: count + 1,
      rackID: null,
      shelfID: null,
      quantity: 0,
    }
    const newTableData = [...tableData, newRow]
    setTableData(newTableData)
    setCount(count + 1)
    setCallbackFlag(callbackFlag + 1)
  }

  useImperativeHandle(childRef, () => ({
    addRowfunction() {
      addRow()
    },
  }))

  const deleteRow = (key) => {
    const newTableData = tableData.filter((item) => item.key !== key)
    setTableData(newTableData)
    setCallbackFlag(callbackFlag + 1)
  }

  console.log('tableData --> ', tableData)
  return <Table columns={columns} dataSource={tableData} pagination={false} scroll={false} />
})

export default RackShelfTable
