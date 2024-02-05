import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FilePdfTwoTone, LoadingOutlined } from '@ant-design/icons'
import PDFExportHook from 'components/ExportPDFHook'
import GRNDocument from './grnDocument'
import { MATERIAL_INWARD_GRN_PDF_DATA } from '../queries'

const PDF = ({ inward_id }) => {
  const [pdfData, setPDFData] = useState(null)
  const [buttonClicked, setButtonClicked] = useState(false)

  const [getPDFData, { loading, data, error }] = useLazyQuery(MATERIAL_INWARD_GRN_PDF_DATA, {
    variables: { inward_id },
  })

  useEffect(() => {
    if (data && data.materialInwardPDFData) {
      const { material_data, same_state } = data.materialInwardPDFData
      const hsn_data = []

      if (material_data && material_data.length) {
        material_data.forEach(({ hsn_name, cgst, sgst, igst, quantity, unit_cost }, i) => {
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
        ...data.materialInwardPDFData,
        hsn_data,
      }
      setPDFData(tempData)
    } else if (buttonClicked && data && !data.materialInwardPDFData) {
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
          fileName={`Material Inward #${inward_id}`}
        />
      ) : null}
    </>
  )
}

export default PDF
