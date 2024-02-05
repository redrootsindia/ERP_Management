import React, { useState, useEffect } from 'react'
import { Modal, Table, Spin, Button, Select } from 'antd'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'

import { INCOMPLETE_VENDORS } from './queries'

const { Option } = Select

const IncompleteVendorsModal = () => {
  const [vendorsCount, setVendorsCount] = useState(0)
  const [vendorsList, setVendorsList] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => setIsModalVisible(true)

  const handleOk = () => {
    console.log('selectedRowKeys =', selectedRowKeys)
    setSelectedRowKeys([])
    setIsModalVisible(false)
  }

  const handleCancel = () => setIsModalVisible(false)

  const {
    loading: vendorsLoad,
    error: vendorsErr,
    data: vendorsData,
  } = useQuery(INCOMPLETE_VENDORS)

  useEffect(() => {
    if (
      !vendorsLoad &&
      vendorsData &&
      vendorsData.incompleteVendors &&
      vendorsData.incompleteVendors.length
    ) {
      setVendorsList(vendorsData.incompleteVendors)
      setVendorsCount(vendorsData.incompleteVendors.length)
    }
  }, [vendorsData, vendorsLoad])

  if (vendorsErr) return `Error occured while fetching data: ${vendorsErr.message}`

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    onSelectAll: (selected, selectedRows) => {
      console.log('selectedRows =', selectedRows)
      setSelectedRowKeys(selectedRows)
    },
  }
  const start = () => {
    setSelectedRowKeys([])
  }
  // assigned to employee
  const onChange = (value) => {
    console.log(`selected ${value}`)
  }

  const hasSelected = selectedRowKeys.length > 0
  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/accounts/vendors/update/${record.id}`}>{text}</Link>,
    },

    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (text, record) => <Link to={`/accounts/vendors/update/${record.id}`}>{text}</Link>,
    },
  ]

  return (
    <div>
      <div className="col-lg-3 col-md-12">
        <div className="card">
          <Spin spinning={vendorsLoad} tip="Loading...">
            <div
              className="card-body overflow-hidden position-relative"
              role="button"
              aria-hidden="true"
              onClick={() => showModal()}
            >
              <div className="font-size-36 font-weight-bold text-dark line-height-1 mt-2">
                {vendorsCount}
              </div>
              <div className="mb-1">Incomplete Vendors</div>
            </div>
          </Spin>
        </div>
      </div>

      <Modal
        title="Incomplete Vendors"
        visible={isModalVisible}
        onOk={handleOk}
        centered
        onCancel={handleCancel}
      >
        <div className="row">
          <div className="col-6">
            <Button type="primary" className="mb-2" onClick={start} disabled={!hasSelected}>
              Reload
            </Button>
            <span
              style={{
                marginLeft: 8,
              }}
            >
              {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
            </span>
          </div>
          <div className="col-6">
            <Select
              showSearch
              className="ml-auto custom-pad-r1 w-100"
              placeholder="Assign To.."
              onChange={onChange}
            >
              <Option value="Ashish Kharwa">Ashish Kharwa</Option>
              <Option value="Munira Sadriwala">Munira Sadriwala</Option>
              <Option value="Tejas">Tejas</Option>
              <Option value="Pooja Yadav">Pooja Yadav</Option>
              <Option value="Milan Mam">Milan Mam</Option>
              <Option value="Shweta">Shweta</Option>
              <Option value="Shurvi">Shurvi</Option>
            </Select>
          </div>
        </div>
        <Table
          columns={tableColumns}
          dataSource={vendorsList}
          rowSelection={rowSelection}
          rowKey={(record) => String(record.id)}
          pagination={{
            defaultPageSize: 10,
          }}
        />
      </Modal>
    </div>
  )
}

export default IncompleteVendorsModal
