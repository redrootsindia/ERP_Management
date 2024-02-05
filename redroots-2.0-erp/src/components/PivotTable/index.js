import React from 'react'

import * as WebDataRocksReact from './webdatarocksHook'

const PivotTable = ({ data, rows, measures, columns }) => {
  return (
    <div>
      <WebDataRocksReact.Pivot
        toolbar
        height="1000px"
        report={{
          dataSource: {
            dataSourceType: 'json',
            data,
          },
          options: {
            grid: {
              type: 'classic',
              showHeaders: false,
              showTotals: 'off',
            },
          },
          slice: {
            rows,
            columns,
            measures,
          },
        }}
      />
    </div>
  )
}

export default PivotTable
