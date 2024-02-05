import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FilePdfTwoTone, LoadingOutlined } from '@ant-design/icons'
import PDFExportHook from 'components/ExportPDFHook'
import GRNDocument from './grnDocument'
import { RTV } from '../queries'

const PDF = ({ id }) => {
  const [pdfData, setPDFData] = useState(null)
  const [buttonClicked, setButtonClicked] = useState(false)

  const [getPDFData, { loading, data, error }] = useLazyQuery(RTV, {
    variables: { id },
  })
  useEffect(() => {
    if (!loading && data && data.rtv) {
      // prettier-ignore
      setPDFData(data.rtv)
    }
  }, [loading, data])

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
          fileName={`Rtv #${id}`}
        />
      ) : null}
    </>
  )
}

export default PDF
