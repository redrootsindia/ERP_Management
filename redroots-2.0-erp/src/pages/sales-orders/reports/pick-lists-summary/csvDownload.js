import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import moment from 'moment'
import { Button, message } from 'antd'
import { FileExcelTwoTone, LoadingOutlined } from '@ant-design/icons'
import ExportCSVHook from 'components/ExportCSVHook'
import { PICK_LISTS_REPORT } from './queries'

const CSVDownload = (props) => {
  const { createdAtFilter, deliveryDateFilter, typeFilter } = props

  const [csvData, setCSVData] = useState([])
  const [buttonClicked, setButtonClicked] = useState(false)

  const [generateData, { loading, data, error }] = useLazyQuery(PICK_LISTS_REPORT, {
    variables: { createdAtFilter, deliveryDateFilter, typeFilter, limit: 10000, offset: 0 },
  })

  useEffect(() => {
    if (data && data.salesOrdersSummaryForPickLists && data.salesOrdersSummaryForPickLists.length) {
      const tempData = data.salesOrdersSummaryForPickLists.map((e) => {
        return {
          createdAt: moment(Number(e.created_at)).format('Do MMM YYYY'),
          sales_order_id: e.sales_order_id,
          type: e.type,
          buyer_group: e.buyer_group,
          buyer: e.buyer,
          buyer_warehouse: e.buyer_warehouse,
          sales_order_quantity: e.sales_order_quantity,
          available_stock: e.available_stock,
          picked_quantity: e.picked_quantity,
          pending_quantity:
            e.total_scheduled_to_pick === 0 || e.total_scheduled_to_pick <= e.picked_quantity
              ? 0
              : e.total_scheduled_to_pick - e.picked_quantity,
          expected_delivery_date:
            !e.expected_delivery_date || e.expected_delivery_date === '-'
              ? null
              : moment(Number(e.expected_delivery_date)).format('Do MMM YYYY'),
        }
      })
      setCSVData(tempData)
    } else if (
      buttonClicked &&
      data &&
      data.salesOrdersSummaryForPickLists &&
      !data.salesOrdersSummaryForPickLists.length
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
      key: 'createdAt',
      label: 'Created On',
    },
    {
      key: 'sales_order_id',
      label: 'Sales Order Id',
    },
    {
      key: 'type',
      label: 'Type',
    },
    {
      key: 'buyer_group',
      label: 'Buyer Group',
    },
    {
      key: 'buyer',
      label: 'Buyer Name',
    },
    {
      key: 'buyer_warehouse',
      label: 'Buyer Warehouse',
    },
    {
      key: 'sales_order_quantity',
      label: 'Sales Order Qty',
    },
    {
      key: 'available_stock',
      label: 'Available Stock',
    },
    {
      key: 'picked_quantity',
      label: 'Picked Qty',
    },
    {
      key: "pending_quantity'",
      label: 'Pending Qty',
    },
    {
      key: 'expected_delivery_date',
      label: 'Expected Delivery Date',
    },
  ]

  return (
    <>
      <Button
        className="custom-excel"
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
          csvFilename="Pick-Lists Report"
          csvHeaders={csvHeaders}
          csvData={csvData}
          changeClickState={changeClickState}
        />
      ) : null}
    </>
  )
}

export default CSVDownload
