import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FileExcelTwoTone, LoadingOutlined } from '@ant-design/icons'
import ExportCSVHook from 'components/ExportCSVHook'
import { MARGIN_REPORT } from './queries'

const CSVDownload = (props) => {
  const { productIDs, categoryIDs, subcategoryIDs } = props

  const [csvData, setCSVData] = useState([])
  const [buttonClicked, setButtonClicked] = useState(false)

  const [generateData, { loading, data, error }] = useLazyQuery(MARGIN_REPORT, {
    variables: { productIDs, categoryIDs, subcategoryIDs, csvFilter: true },
  })

  useEffect(() => {
    if (
      data &&
      data.marginReport &&
      data.marginReport.product &&
      data.marginReport.product.length
    ) {
      const { product, buyer_margin, vendor_margin } = data.marginReport
      const tempMarginReport = []
      product.forEach((productObj) => {
        const tempBuyerMargin = buyer_margin.filter(
          (element) => Number(element.product_id) === Number(productObj.id),
        )
        const tempVendorMargin = vendor_margin.filter(
          (element) => Number(element.product_id) === Number(productObj.id),
        )
        tempBuyerMargin.forEach((buyerObj) =>
          tempVendorMargin.forEach((vendorObj) => {
            const price_before_gst =
              buyerObj.target_selling_price / (Number(productObj.igst) / 100 + 1)
            const totalCP = Number(vendorObj.cost_price) + Number(vendorObj.transport_cost)
            const currentMarginVendor = totalCP * (Number(vendorObj.margin_percent) / 100)
            const transferPrice = totalCP + currentMarginVendor
            const estimatedTargetPrice =
              price_before_gst - price_before_gst * (Number(buyerObj.margin_percent) / 100)
            const excessShortfall =
              estimatedTargetPrice - Number(vendorObj.transfer_price_marketing)
            const tempMarginRow = {
              name: productObj.name,
              image: productObj.image,
              product_category: productObj.product_category,
              product_subcategory: productObj.product_subcategory,
              buyer_name: buyerObj.buyer_name,
              vendor_name: vendorObj.vendor_name,
              mrp: buyerObj.mrp,
              discount_value: buyerObj.discount_value.toFixed(2),
              discount_percent: (
                ((Number(buyerObj.mrp) - Number(buyerObj.discount_value)) / Number(buyerObj.mrp)) *
                100
              ).toFixed(2),
              selling_price: Number(buyerObj.mrp) - Number(buyerObj.discount_value),
              target_selling_price: buyerObj.target_selling_price,
              price_before_gst: price_before_gst.toFixed(2),
              buyer_margin_percent: buyerObj.margin_percent,
              estimated_target_price: estimatedTargetPrice.toFixed(2),
              cost_price: vendorObj.cost_price,
              transport_cost: vendorObj.transport_cost,
              total_cp: totalCP,
              vendor_margin_percent: vendorObj.margin_percent,
              transfer_price: transferPrice,
              transfer_price_marketing: vendorObj.transfer_price_marketing,
              marketing_value: Number(vendorObj.transfer_price_marketing) - transferPrice,
              multiple: (Number(buyerObj.target_selling_price) / transferPrice).toFixed(2),
              current_margin: currentMarginVendor,
              excess_shortfall: excessShortfall.toFixed(2),
            }
            tempMarginReport.push(tempMarginRow)
          }),
        )
      })
      setCSVData(tempMarginReport)
    } else if (
      buttonClicked &&
      data &&
      data.marginReport &&
      data.marginReport.product &&
      !data.marginReport.product.length
    ) {
      message.warning('Nothing to export !')
      setButtonClicked(false)
    }
  }, [data])

  useEffect(() => {
    if (buttonClicked && error) {
      message.warning(`Error occured while fetching data: ${error.message}`)
      setButtonClicked(false)
    }
  }, [buttonClicked, error])

  const changeClickState = () => {
    setButtonClicked(false)
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
        className="custom-excel pull-right"
        onClick={() => {
          setButtonClicked(true)
          generateData()
        }}
      >
        {loading ? (
          <LoadingOutlined twoToneColor="#52c41a" />
        ) : (
          <FileExcelTwoTone twoToneColor="#52c41a" />
        )}
        Export
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

export default CSVDownload
