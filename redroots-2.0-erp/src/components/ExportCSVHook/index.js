import React, { useState, useEffect, useRef } from 'react'
import { CSVLink } from 'react-csv'

const ExportCSVHook = ({ csvFilename, csvHeaders, csvData, changeClickState }) => {
  const csvLinkRef = useRef(null)
  const [firstLoadOver, setFirstLoadOver] = useState(false)

  useEffect(() => setFirstLoadOver(true), [])

  useEffect(() => {
    if (firstLoadOver && csvLinkRef && csvLinkRef.current) {
      csvLinkRef.current.link.click()
      if (changeClickState) changeClickState()
    }
  }, [firstLoadOver])

  return (
    <CSVLink
      filename={csvFilename ? `${csvFilename}.csv` : `redroots-${new Date().getTime()}.csv`}
      headers={csvHeaders}
      data={csvData}
      ref={csvLinkRef}
      target="_blank"
    />
  )
}

export default ExportCSVHook
