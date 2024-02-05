import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import moment from 'moment'
import { capitalize } from 'lodash'
import { Button, message } from 'antd'
import { FileExcelTwoTone, LoadingOutlined } from '@ant-design/icons'
import ExportCSVHook from 'components/ExportCSVHook'
import { PICK_LISTS_REPORT } from './queries'

const CSVDownload = (props) => {
  const { createdAtFilter, searchString } = props

  const [csvData, setCSVData] = useState([])
  const [buttonClicked, setButtonClicked] = useState(false)

  const [generateData, { loading, data, error }] = useLazyQuery(PICK_LISTS_REPORT, {
    variables: { createdAtFilter, searchString },
  })

  useEffect(() => {
    if (data && data.pickListReport && data.pickListReport.length) {
      const tempData = data.pickListReport.map((e) => {
        return {
          sales_order_id: e.sales_order_id,
          sales_order_name: e.sales_order_name,
          type: e.type === 'ecommerce' ? 'e-Commerce' : capitalize(e.type),
          buyer_group_name: e.buyer_group_name,
          buyer_name: e.buyer_name,
          total_quantity: e.total_quantity,
          total_quantity_to_pick: e.total_quantity_to_pick,
          total_picked_quantity:
            e.total_quantity_to_pick === 0 || e.total_quantity_to_pick <= e.total_picked_quantity
              ? 0
              : e.total_quantity_to_pick - e.total_picked_quantity,
          expected_delivery_date:
            !e.expected_delivery_date || e.expected_delivery_date === '-'
              ? null
              : moment(Number(e.expected_delivery_date)).format('Do MMM YYYY'),
        }
      })
      setCSVData(tempData)
    } else if (buttonClicked && data && data.pickListReport && !data.pickListReport.length) {
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
      key: 'sales_order_name',
      label: 'Sales Order ID',
    },
    {
      key: 'type',
      label: 'Sales Order Type',
    },
    {
      key: 'buyer_group_name',
      label: 'Buyer Group',
    },
    {
      key: 'buyer_name',
      label: 'Buyer Name',
    },
    {
      key: 'total_quantity',
      label: 'Total Quantity',
    },
    {
      key: 'total_quantity_to_pick',
      label: 'Qty. Scheduled in Pick Lists',
    },
    {
      key: 'total_picked_quantity',
      label: 'Total Qty. Picked',
    },
    {
      key: 'expected_delivery_date',
      label: 'Expected Delivery',
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
