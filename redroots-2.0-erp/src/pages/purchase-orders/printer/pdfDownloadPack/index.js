import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FilePdfTwoTone, LoadingOutlined } from '@ant-design/icons'
import PDFExportHook from 'components/ExportPDFHook'
import PDFDocument from './pdfDocument'
import { PRINTER_PACK_PURCHASE_ORDER_PDF } from '../queries'

const PDF = ({ id }) => {
  const [pdfData, setPDFData] = useState(null)
  const [buttonClicked, setButtonClicked] = useState(false)

  const [getPDFData, { loading, data, error }] = useLazyQuery(PRINTER_PACK_PURCHASE_ORDER_PDF, {
    variables: { id },
  })

  useEffect(() => {
    if (data && data.printerPackPOPDFData) {
      const { terms_conditions } = data.printerPackPOPDFData

      const tempData = {
        ...data.printerPackPOPDFData,
        termsConditions:
          terms_conditions ||
          'Dispatch within 7-10 working days from the date of order issued.\nTransportation to be borne by supplier\nAll specs, tolerance +/- 2%',
      }
      console.log('tempData', tempData)
      setPDFData(tempData)
    } else if (buttonClicked && data && !data.printerPackPOPDFData) {
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
        Print Printer PO
      </Button>

      {buttonClicked && pdfData ? (
        <PDFExportHook
          PDFDocument={PDFDocument}
          data={pdfData}
          changeClickState={changeClickState}
          fileName={`Printer PO #${id}`}
        />
      ) : null}
    </>
  )
}

export default PDF
