import React, { useState } from 'react'
import { Button } from 'antd'
import { FileExcelTwoTone, LoadingOutlined } from '@ant-design/icons'
import ExportCSVHook from '../../components/ExportCSVHook'

const CSVDownload = ({ data }) => {
  const [csvData, setCSVData] = useState([])
  const [buttonClicked, setButtonClicked] = useState(false)
  const [loading, setLoading] = useState(false)

  const changeClickState = () => {
    setButtonClicked(false)
    setLoading(false)
    setCSVData([])
  }

  const csvHeaders = [
    {
      title: 'PRODUCT COSTING ID',
      label: 'PRODUCT COSTING ID',
      dataIndex: 'product_costing_subcategory_id',
      key: 'product_costing_subcategory_id',
    },
    {
      title: 'Quantity',
      label: 'Quantity',
      dataIndex: 'ele.quantity',
      key: 'ele.quantity',
    },
    {
      title: 'Rate',
      label: 'Rate',
      dataIndex: 'ele.rate',
      key: 'ele.rate',
    },

    {
      title: 'Length',
      label: 'Length',
      dataIndex: 'length',
      key: 'length',
    },
    {
      title: 'Width',
      label: 'Width',
      dataIndex: 'width',
      key: 'width',
    },
    {
      title: 'Part',
      label: 'Part',
      dataIndex: 'part',
      key: 'part',
    },
    {
      title: 'Panel',
      label: 'Panel',
      dataIndex: 'panel',
      key: 'panel',
    },

    {
      title: 'Wastage Percent',
      label: 'Wastage Percent',
      dataIndex: 'wastage_percent',
      key: 'wastage_percent',
    },
    {
      title: 'Total',
      label: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'PO Class',
      label: 'PO Class',
      dataIndex: 'po_class',
      key: 'po_class',
    },
    {
      title: 'Product Category Name',
      label: 'Product Category Name',
      dataIndex: 'product_category_name',
      key: 'product_category_name',
    },
    {
      title: 'Product Name',
      label: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Product Sub Category Name',
      label: 'Product Sub Category Name',
      dataIndex: 'product_subcategory_name',
      key: 'product_subcategory_name',
    },
    {
      title: 'Purchase Order ID',
      label: 'Purchase Order ID',
      dataIndex: 'purchase_order_id',
      key: 'purchase_order_id',
    },
    {
      title: 'Purchase Order Type',
      label: 'Purchase Order Type',
      dataIndex: 'purchase_order_type',
      key: 'purchase_order_type',
    },
    {
      title: 'Quantity',
      label: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Received Quantity',
      label: 'Received Quantity',
      dataIndex: 'received_quantity',
      key: 'received_quantity',
    },
    {
      title: 'Same State',
      label: 'Same State',
      dataIndex: 'same_state',
      key: 'same_state',
    },
    {
      title: 'SGST',
      label: 'SGST',
      dataIndex: 'sgst',
      key: 'sgst',
    },
    {
      title: 'Status',
      label: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Unit Cost',
      label: 'Unit Cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
    },
    {
      title: 'User Name',
      label: 'User Name',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: 'Vendor Company',
      label: 'Vendor Company',
      dataIndex: 'vendor_company',
      key: 'vendor_company',
    },
    {
      title: 'Vendor Name',
      label: 'Vendor Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
    },
  ]

  return (
    <>
      <Button
        className="custom-excel "
        onClick={() => {
          setButtonClicked(true)
          setCSVData(data)
          setLoading(true)
        }}
      >
        {loading && csvData && csvData.length ? (
          <LoadingOutlined twoToneColor="#52c41a" />
        ) : (
          <FileExcelTwoTone twoToneColor="#52c41a" />
        )}
        Export Product CostingCSV
      </Button>
      {buttonClicked ? (
        <ExportCSVHook
          csvFilename="Product Costing"
          csvHeaders={csvHeaders}
          csvData={csvData}
          changeClickState={changeClickState}
        />
      ) : null}
    </>
  )
}

export default CSVDownload
