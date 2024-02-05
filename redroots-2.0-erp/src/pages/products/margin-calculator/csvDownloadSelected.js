import React, { useState } from 'react'
import { Button } from 'antd'
import { FileExcelTwoTone, LoadingOutlined } from '@ant-design/icons'
import ExportCSVHook from 'components/ExportCSVHook'

const CSVDownloadSelected = ({ selectedRows }) => {
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
      title: 'Name',
      label: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      label: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
    },
    {
      title: 'Subcategory',
      label: 'Subcategory',
      dataIndex: 'product_subcategory',
      key: 'product_subcategory',
    },
    {
      title: 'Buyer',
      label: 'Buyer',
      dataIndex: 'buyer_name',
      key: 'buyer_name',
    },
    {
      title: 'Vendor',
      label: 'Vendor',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
    },
    {
      title: 'MRP (₹)',
      label: 'MRP (₹)',
      dataIndex: 'mrp',
      key: 'mrp',
    },
    {
      title: 'Discount (₹)',
      label: 'Discount (₹)',
      dataIndex: 'discount_value',
      key: 'discount_value',
    },
    {
      title: 'Discount (%)',
      label: 'Discount (%)',
      dataIndex: 'discount_percent',
      key: 'discount_percent',
    },
    {
      title: 'SP (₹)',
      label: 'SP (₹)',
      dataIndex: 'selling_price',
      key: 'selling_price',
    },
    {
      title: 'Target SP (₹)',
      label: 'Target SP (₹)',
      dataIndex: 'target_selling_price',
      key: 'target_selling_price',
    },
    {
      title: 'Price before GST (₹)',
      label: 'Price before GST (₹)',
      dataIndex: 'price_before_gst',
      key: 'price_before_gst',
    },
    {
      title: 'Margin (%)',
      label: 'Margin (%)',
      dataIndex: 'buyer_margin_percent',
      key: 'buyer_margin_percent',
    },
    {
      title: 'Estimated TP (₹)',
      label: 'Estimated TP (₹)',
      dataIndex: 'estimated_target_price',
      key: 'estimated_target_price',
    },
    {
      title: 'Vendor CP (₹)',
      label: 'Vendor CP (₹)',
      dataIndex: 'cost_price',
      key: 'cost_price',
    },
    {
      title: 'Transport (₹)',
      label: 'Transport (₹)',
      dataIndex: 'transport_cost',
      key: 'transport_cost',
    },
    {
      title: 'Total CP (₹)',
      label: 'Total CP (₹)',
      dataIndex: 'total_cp',
      key: 'total_cp',
    },
    {
      title: 'Std Margin (%)',
      label: 'Std Margin (%)',
      dataIndex: 'vendor_margin_percent',
      key: 'vendor_margin_percent',
    },
    {
      title: 'Vendor TP (₹)',
      label: 'Vendor TP (₹)',
      dataIndex: 'transfer_price',
      key: 'transfer_price',
    },
    {
      title: 'TP (With Marketing) (₹)',
      label: 'TP (With Marketing) (₹)',
      dataIndex: 'transfer_price_marketing',
      key: 'transfer_price_marketing',
    },
    {
      title: 'Marketing (₹)',
      label: 'Marketing (₹)',
      dataIndex: 'marketing_value',
      key: 'marketing_value',
    },
    {
      title: 'Multiple',
      label: 'Multiple',
      dataIndex: 'multiple',
      key: 'multiple',
    },
    {
      title: 'Current Margin (₹)',
      label: 'Current Margin (₹)',
      dataIndex: 'current_margin',
      key: 'current_margin',
    },
    {
      title: 'Excess / Short (₹)',
      label: 'Excess / Short (₹)',
      dataIndex: 'excess_shortfall',
      key: 'excess_shortfall',
    },
  ]

  return (
    <>
      <Button
        className="custom-excel "
        onClick={() => {
          setButtonClicked(true)
          setCSVData(selectedRows)
          setLoading(true)
        }}
      >
        {loading ? (
          <LoadingOutlined twoToneColor="#52c41a" />
        ) : (
          <FileExcelTwoTone twoToneColor="#52c41a" />
        )}
        Export Selected
      </Button>

      {buttonClicked && csvData && csvData.length ? (
        <ExportCSVHook
          csvFilename="Margin Report"
          csvHeaders={csvHeaders}
          csvData={csvData}
          changeClickState={changeClickState}
        />
      ) : null}
    </>
  )
}

export default CSVDownloadSelected
