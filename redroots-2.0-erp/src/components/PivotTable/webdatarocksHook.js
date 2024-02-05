import React, { useEffect, useRef } from 'react'

import * as Webdatarocks from 'webdatarocks'
import 'webdatarocks/webdatarocks.min.css'

export const Pivot = (props) => {
  const pivotRef = useRef(null)

  useEffect(() => {
    const webdatarocks = new Webdatarocks({
      ...props,

      container: pivotRef.current,
    })
    return () => {
      webdatarocks.dispose()
    }
  }, [])
  return <div ref={pivotRef}>Pivot</div>
}

export default Pivot
