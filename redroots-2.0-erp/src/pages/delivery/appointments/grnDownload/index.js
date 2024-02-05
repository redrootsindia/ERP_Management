import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FilePdfTwoTone, LoadingOutlined } from '@ant-design/icons'
import PDFExportHook from 'components/ExportPDFHook'
import GRNDocument from './grnDocument'
import { PRODUCT_DELIVERY_GRN_DATA } from '../queries'

const PDF = ({ id }) => {
  const [pdfData, setPDFData] = useState(null)
  const [buttonClicked, setButtonClicked] = useState(false)

  const [getPDFData, { loading, data, error }] = useLazyQuery(PRODUCT_DELIVERY_GRN_DATA, {
    variables: { id },
  })

  useEffect(() => {
    if (data && data.productDeliveryGRNData) {
      const { grnDetail, same_state } = data.productDeliveryGRNData

      const hsn_data = []

      if (grnDetail && grnDetail.length) {
        grnDetail.forEach(({ hsn_name, cgst, sgst, igst, received_quantity, unit_cost }, i) => {
          const hsnIndex = hsn_data.findIndex((hsnObj) => hsnObj.name === hsn_name)
          if (hsnIndex > -1)
            hsn_data[hsnIndex].amount += same_state
              ? ((cgst + sgst) / 100) * received_quantity * unit_cost
              : igst
              ? (igst / 100) * received_quantity * unit_cost
              : 0
          else
            hsn_data.push({
              id: i,
              name: hsn_name,
              igst,
              sgst,
              cgst,
              amount: same_state
                ? ((cgst + sgst) / 100) * received_quantity * unit_cost
                : igst
                ? (igst / 100) * received_quantity * unit_cost
                : 0,
            })
        })
      }
      console.log('hsdn', hsn_data)
      const tempData = {
        ...data.productDeliveryGRNData,
        hsn_data,
      }
      setPDFData(tempData)
    } else if (buttonClicked && data && !data.productDeliveryGRNData) {
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
        Print GRN
      </Button>

      {buttonClicked && pdfData ? (
        <PDFExportHook
          PDFDocument={GRNDocument}
          data={pdfData}
          changeClickState={changeClickState}
          fileName={`Delivery Invoice #${id}`}
        />
      ) : null}
    </>
  )
}

export default PDF
