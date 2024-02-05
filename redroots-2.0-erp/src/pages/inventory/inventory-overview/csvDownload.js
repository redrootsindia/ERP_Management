import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FileExcelTwoTone, LoadingOutlined } from '@ant-design/icons'
import ExportCSVHook from 'components/ExportCSVHook'
import INVENTORY_OVERVIEW from './queries'

const CSVDownload = (props) => {
  const { brandIDs, categoryIDs, subcategoryIDs, productIDs, bomCodeIDs, inputCode } = props

  const [csvData, setCSVData] = useState([])
  const [buttonClicked, setButtonClicked] = useState(false)

  const [generateStock, { loading, data, error }] = useLazyQuery(INVENTORY_OVERVIEW)

  useEffect(() => {
    if (!loading && data && data.inventoryOverview && data.inventoryOverview.length)
      setCSVData(data.inventoryOverview)
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
      key: 'brand',
      label: 'Brand',
    },
    {
      key: 'product_name',
      label: 'Product',
    },
    {
      key: 'product_category',
      label: 'Category',
    },
    {
      key: 'product_subcategory',
      label: 'Sub-Category',
    },
    {
      key: 'code',
      label: 'BOM-Code',
    },
    {
      key: 'warehouse',
      label: 'Warehouse',
    },
    {
      key: 'rack',
      label: 'Rack',
    },
    {
      key: 'shelf',
      label: 'Shelf',
    },
    {
      key: 'salable_quantity',
      label: 'Salable Qty.',
    },
    {
      key: 'unsalable_quantity',
      label: 'Unsalable Qty.',
    },
    {
      key: 'total_quantity',
      label: 'Total Qty.',
    },
    {
      key: 'unit_cost',
      label: 'Unit Cost.',
    },
    {
      key: 'purchase_order_id',
      label: 'P.O.',
    },
  ]

  return (
    <>
      <Button
        className="custom-excel"
        onClick={() => {
          setButtonClicked(true)
          generateStock({
            variables: {
              brandIDs,
              categoryIDs,
              subcategoryIDs,
              productIDs,
              bomCodeIDs,
              getAll: !(
                (brandIDs && brandIDs.length) ||
                (categoryIDs && categoryIDs.length) ||
                (subcategoryIDs && subcategoryIDs.length) ||
                (productIDs && productIDs.length) ||
                (bomCodeIDs && bomCodeIDs.length) ||
                inputCode
              ),
              inputCode,
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
          csvFilename="Inventory Overview"
          csvHeaders={csvHeaders}
          csvData={csvData}
          changeClickState={changeClickState}
        />
      ) : null}
    </>
  )
}

export default CSVDownload
