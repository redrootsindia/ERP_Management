import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'

const PlaceholderContainer = forwardRef(({ url, loading, onLoadingFinished }, ref) => {
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    if (!clicked && !loading && url) {
      onLoadingFinished()
      setClicked(true)
    }
  }, [loading, url, clicked])

  return <span style={{ visibility: 'hidden' }} ref={ref} href={url} />
})

const PDFExportHook = ({ PDFDocument, fileName, data, changeClickState }) => {
  const pdfLinkRef = useRef(null)

  const onLoadingFinished = useCallback(() => {
    const elem = pdfLinkRef?.current
    if (elem) {
      elem.click()
      if (changeClickState) changeClickState()
    }
  }, [])

  return (
    <PDFDownloadLink
      document={<PDFDocument data={data} />}
      fileName={fileName ? `${fileName}.pdf` : `redroots-${new Date().getTime()}`}
    >
      {({ url, loading }) => (
        // Cannot set-state here, so a separate component is used to keep track of whether the document has finished rendering
        <PlaceholderContainer
          ref={pdfLinkRef}
          loading={loading}
          url={url}
          onLoadingFinished={onLoadingFinished}
        />
      )}
    </PDFDownloadLink>
  )
}

export default PDFExportHook
