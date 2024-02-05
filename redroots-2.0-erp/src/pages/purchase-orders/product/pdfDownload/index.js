import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FilePdfTwoTone, LoadingOutlined } from '@ant-design/icons'
import PDFExportHook from 'components/ExportPDFHook'
import PDFDocument from './pdfDocument'
import { PRODUCT_PURCHASE_ORDER_PDF } from '../queries'

const PDF = ({ id, proformaInvoice }) => {
  const [pdfData, setPDFData] = useState(null)
  const [buttonClicked, setButtonClicked] = useState(false)

  const [getPDFData, { loading, data, error }] = useLazyQuery(PRODUCT_PURCHASE_ORDER_PDF, {
    variables: { id },
  })

  useEffect(() => {
    if (data && data.productPurchaseOrderPDFData) {
      const { detail, same_state, terms_conditions } = data.productPurchaseOrderPDFData

      const hsn_data = []

      if (detail && detail.length) {
        detail.forEach(({ hsn_name, cgst, sgst, igst, quantity, unit_cost }, i) => {
          const hsnIndex = hsn_data.findIndex((hsnObj) => hsnObj.name === hsn_name)
          if (hsnIndex > -1)
            hsn_data[hsnIndex].amount += same_state
              ? ((cgst + sgst) / 100) * quantity * unit_cost
              : igst
              ? (igst / 100) * quantity * unit_cost
              : 0
          else
            hsn_data.push({
              id: i,
              name: hsn_name,
              igst,
              sgst,
              cgst,
              amount: same_state
                ? ((cgst + sgst) / 100) * quantity * unit_cost
                : igst
                ? (igst / 100) * quantity * unit_cost
                : 0,
            })
        })
      }

      const tempData = {
        ...data.productPurchaseOrderPDFData,
        hsn_data,
        proformaInvoice,
        title: proformaInvoice ? 'PROFORMA INVOICE' : 'PURCHASE ORDER',
        termsConditions:
          terms_conditions ||
          'Dispatch within 7-10 working days from the date of order issued.\nTransportation to be borne by supplier\nAll specs, tolerance +/- 2%',
      }
      setPDFData(tempData)
    } else if (buttonClicked && data && !data.productPurchaseOrderPDFData) {
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
        className="mr-3"
      >
        {loading ? (
          <LoadingOutlined twoToneColor="#ff4d4f" />
        ) : (
          <FilePdfTwoTone twoToneColor="#ff4d4f" />
        )}
        {proformaInvoice ? 'Print Proforma Invoice' : 'Print Purchase Order'}
      </Button>

      {buttonClicked && pdfData ? (
        <PDFExportHook
          PDFDocument={PDFDocument}
          data={pdfData}
          changeClickState={changeClickState}
          fileName={`${proformaInvoice ? `Proforma Invoice #${id}` : `PO #${id}`}`}
        />
      ) : null}
    </>
  )
}

export default PDF
