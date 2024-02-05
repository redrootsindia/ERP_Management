import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FilePdfTwoTone, LoadingOutlined } from '@ant-design/icons'
import PDFExportHook from 'components/ExportPDFHook'
import PDFDocument from './pdfDocument'
import { PRODUCT_PURCHASE_ORDER_BARCODE } from '../queries'

const PDF = ({ id, type }) => {
  const [pdfData, setPDFData] = useState(null)
  const [buttonClicked, setButtonClicked] = useState(false)

  const [getPDFData, { loading, data, error }] = useLazyQuery(PRODUCT_PURCHASE_ORDER_BARCODE, {
    variables: { id, type },
  })

  useEffect(() => {
    if (data && data.barcodesForProductPO) {
      const tempVariants = []

      if (data.barcodesForProductPO && data.barcodesForProductPO.length) {
        data.barcodesForProductPO.forEach((e) => {
          if (e.ean) {
            tempVariants.push({ name: e.name, code: e.code, ean: e.ean })
          }
        })
      }

      const setOf3 = []

      const chunk = tempVariants.length > 3 ? 3 : tempVariants.length
      for (let i = 0, j = tempVariants.length; i < j; i += chunk) {
        setOf3.push(tempVariants.slice(i, i + chunk))
      }

      const tempData = {
        variants: setOf3,
        type,
        id,
      }

      setPDFData(tempData)
    } else if (buttonClicked && data && !data.warehouse) {
      message.warning('Nothing to download !')

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
    setPDFData(null)
  }

  return (
    <>
      <Button
        danger
        ghost
        className="mr-3"
        onClick={() => {
          setButtonClicked(true)
          getPDFData()
        }}
      >
        {loading ? (
          <LoadingOutlined twoToneColor="#ff4d4f" />
        ) : (
          <FilePdfTwoTone twoToneColor="#ff4d4f" />
        )}
        Print Barcodes
      </Button>

      {buttonClicked && pdfData ? (
        <PDFExportHook
          PDFDocument={PDFDocument}
          data={pdfData}
          changeClickState={changeClickState}
          fileName={`${type === 'Product' ? 'BOM' : 'Pack'} Barcodes for PO #${id}`}
        />
      ) : null}
    </>
  )
}

export default PDF
