import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FileExcelTwoTone, LoadingOutlined } from '@ant-design/icons'
import ExportCSVHook from 'components/ExportCSVHook'
import { AGEING_REPORT } from './queries'

const CSVDownload = (props) => {
  const { intervalLength, brandIDs, categoryIDs, subcategoryIDs, searchString } = props

  const [csvData, setCSVData] = useState([])
  const [buttonClicked, setButtonClicked] = useState(false)

  const [generateAgeingReport, { loading, data, error }] = useLazyQuery(AGEING_REPORT)

  useEffect(() => {
    if (
      !loading &&
      data &&
      data.ageingReport &&
      data.ageingReport.rows &&
      data.ageingReport.rows.length
    )
      setCSVData(
        data.ageingReport.rows.map(({ variant_image, ...rest }) => ({
          ...rest,
        })),
      )
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
      key: 'product_category',
      label: 'Category',
    },
    {
      key: 'product_subcategory',
      label: 'Sub-Category',
    },
    {
      key: 'variant_code',
      label: 'BOM-Code',
    },
  ]

  const csvHeaders30 = [
    {
      key: 'days30',
      label: '0-30 Days',
    },
    {
      key: 'days60',
      label: '31-60 Days',
    },
    {
      key: 'days90',
      label: '61-90 Days',
    },
    {
      key: 'days180',
      label: '91-180 Days',
    },
    {
      key: 'days360',
      label: '181-360 Days',
    },
    {
      key: 'days360plus',
      label: '>360 Days',
    },
  ]

  const csvHeaders60 = [
    {
      key: 'days60',
      label: '0-60 Days',
    },
    {
      key: 'days120',
      label: '61-120 Days',
    },
    {
      key: 'days180',
      label: '121-180 Days',
    },
    {
      key: 'days360',
      label: '181-360 Days',
    },
    {
      key: 'days360plus',
      label: '>360 Days',
    },
  ]

  const csvHeaders90 = [
    {
      key: 'days90',
      label: '0-90 Days',
    },
    {
      key: 'days180',
      label: '91-180 Days',
    },
    {
      key: 'days360',
      label: '181-360 Days',
    },
    {
      key: 'days360plus',
      label: '>360 Days',
    },
  ]

  return (
    <>
      <Button
        className="custom-excel"
        onClick={() => {
          setButtonClicked(true)
          generateAgeingReport({
            variables: {
              interval_length: intervalLength,
              brandIDs,
              categoryIDs,
              subcategoryIDs,
              searchString,
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
          csvFilename="Ageing Report "
          csvHeaders={[
            ...csvHeaders,
            ...(intervalLength === 30
              ? csvHeaders30
              : intervalLength === 60
              ? csvHeaders60
              : csvHeaders90),
          ]}
          csvData={csvData}
          changeClickState={changeClickState}
        />
      ) : null}
    </>
  )
}

export default CSVDownload
