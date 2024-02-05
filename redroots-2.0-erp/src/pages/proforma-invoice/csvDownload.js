import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FileExcelTwoTone, LoadingOutlined } from '@ant-design/icons'
import ExportCSVHook from 'components/ExportCSVHook'
import { PROFORMA_INVOICE } from './queries'

const CSVDownload = ({ id }) => {
  const [csvData, setCSVData] = useState([])
  const [buttonClicked, setButtonClicked] = useState(false)

  const [generatePI, { loading, data, error }] = useLazyQuery(PROFORMA_INVOICE)

  useEffect(() => {
    if (
      !loading &&
      data &&
      data.proformaInvoice &&
      data.proformaInvoice.detail &&
      data.proformaInvoice.detail.length
    )
      setCSVData(data.proformaInvoice.detail)
    else setCSVData([])
  }, [data, loading])

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
      key: 'variant_code',
      label: 'BOM-CODE',
    },
    {
      key: 'asin',
      label: 'Asin',
    },
    {
      key: 'product_subcategory_name',
      label: 'Sub-Category',
    },
    {
      key: 'hsn_name',
      label: 'HSN-CODE',
    },
    {
      key: 'quantity',
      label: 'Quantity',
    },
    {
      key: 'mrp',
      label: 'MRP',
    },
    {
      key: 'unit_cost',
      label: 'UNIT-COST',
    },
  ]

  return (
    <>
      <Button
        className="custom-excel"
        onClick={() => {
          setButtonClicked(true)
          generatePI({
            variables: {
              id,
            },
          })
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
          csvFilename="Proforma Invoice"
          csvHeaders={csvHeaders}
          csvData={csvData}
          changeClickState={changeClickState}
        />
      ) : null}
    </>
  )
}

export default CSVDownload
