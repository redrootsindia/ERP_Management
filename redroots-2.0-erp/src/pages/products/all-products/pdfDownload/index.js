import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FilePdfTwoTone, LoadingOutlined } from '@ant-design/icons'
import PDFExportHook from 'components/ExportPDFHook'
import PDFDocument from './pdfDocument'
import { PRODUCT } from '../queries'

const PDF = ({ id }) => {
  const [pdfData, setPDFData] = useState(null)
  const [buttonClicked, setButtonClicked] = useState(false)
  const [productName, setProductName] = useState(undefined)

  const [getPDFData, { loading, data, error }] = useLazyQuery(PRODUCT, {
    variables: { id },
  })

  useEffect(() => {
    if (data && data.product) {
      const { name, variants } = data.product
      setProductName(name)

      const tempVariants = []

      if (variants && variants.length) {
        variants.forEach((e) => {
          if (e.ean) {
            tempVariants.push({ code: e.code, ean: e.ean })
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
        name,
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
        className="pull-right"
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
          fileName={`${productName} Barcodes`}
        />
      ) : null}
    </>
  )
}

export default PDF
