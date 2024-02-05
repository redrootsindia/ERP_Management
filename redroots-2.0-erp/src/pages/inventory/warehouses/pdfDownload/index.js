import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Button, message } from 'antd'
import { FilePdfTwoTone, LoadingOutlined } from '@ant-design/icons'
import PDFExportHook from 'components/ExportPDFHook'
import PDFDocument from './pdfDocument'
import { WAREHOUSE } from '../queries'

const PDF = ({ id }) => {
  const [pdfData, setPDFData] = useState(null)
  const [buttonClicked, setButtonClicked] = useState(false)
  const [warehouseName, setWarehouseName] = useState(undefined)

  const [getPDFData, { loading, data, error }] = useLazyQuery(WAREHOUSE, {
    variables: { id },
  })

  useEffect(() => {
    if (data && data.warehouse) {
      const { name, location, racks } = data.warehouse
      setWarehouseName(name)

      const tempShelves = []

      if (racks && racks.length) {
        racks.forEach((obj) => {
          tempShelves.push(
            ...obj.shelves.map((e) => ({
              id: e.id,
              rackName: obj.name,
              shelvesName: e.name,
            })),
          )
        })
      }

      const setOf3 = []

      const chunk = tempShelves.length > 3 ? 3 : tempShelves.length
      for (let i = 0, j = tempShelves.length; i < j; i += chunk) {
        setOf3.push(tempShelves.slice(i, i + chunk))
      }

      const tempData = {
        racks: setOf3,
        name,
        location,
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
        Print Shelf Barcodes
      </Button>

      {buttonClicked && pdfData ? (
        <PDFExportHook
          PDFDocument={PDFDocument}
          data={pdfData}
          changeClickState={changeClickState}
          fileName={`${warehouseName} Shelves`}
        />
      ) : null}
    </>
  )
}

export default PDF
