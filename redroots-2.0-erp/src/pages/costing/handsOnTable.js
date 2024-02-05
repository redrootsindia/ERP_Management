/* eslint-disable prefer-destructuring */
/* eslint "no-unused-vars": "off" */
import React, { useState, useRef } from 'react'
import { HotTable } from '@handsontable/react'
import { Button } from 'antd'

const HandsOnTable = ({ subCategory, readOnly, subcategoryTableCallback }) => {
  const hotTableComponent = useRef(null)

  const addRow = () => {
    const hot = hotTableComponent.current.hotInstance
    const col = hot.countRows() - 3
    hot.alter('insert_row', col, 1)
    hot.setDataAtCell(col, 0, ' ')
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= 4; i++) {
      hot.setDataAtCell(col, i, '0')
    }
  }

  const afterHandsonChange = (changes, index) => {
    if (
      index === 'edit' &&
      index !== 'total' &&
      index !== 'grandTotal' &&
      index !== 'wastage' &&
      index !== 'subTotal'
    ) {
      const currentRow = changes[0][0]
      const hot = hotTableComponent.current.hotInstance
      const l = hot.getDataAtCell(currentRow, 1)
      const w = hot.getDataAtCell(currentRow, 2)
      const p = hot.getDataAtCell(currentRow, 3)
      hot.setDataAtCell(currentRow, 4, (l * w * p).toFixed(2), 'total')
      let subTotal = 0
      for (let i = 0; i < hot.countRows() - 3; i += 1) {
        subTotal += hot.getDataAtCell(i, 1) * hot.getDataAtCell(i, 2) * hot.getDataAtCell(i, 3)
      }
      const wastagePercent = hot.getDataAtCell(hot.countRows() - 2, 3)

      const wastage = (subTotal / 100) * wastagePercent
      const grandTotal = subTotal + wastage
      hot.setDataAtCell(hot.countRows() - 3, 4, subTotal.toFixed(2), 'subTotal')
      hot.setDataAtCell(hot.countRows() - 2, 4, wastage.toFixed(2), 'wastage')
      hot.setDataAtCell(hot.countRows() - 1, 4, grandTotal.toFixed(2), 'grandTotal')
      if (subcategoryTableCallback) subcategoryTableCallback(grandTotal, subCategory.key)
    }
  }

  const handsonTableCol = [
    { data: 'part', type: 'text', readOnly: readOnly || false },
    { data: 'L', type: 'numeric', readOnly: readOnly || false },
    { data: 'W', type: 'numeric', readOnly: readOnly || false },
    { data: 'P', type: 'numeric', readOnly: readOnly || false },
    { data: 'Total', type: 'numeric', readOnly: readOnly || false },
  ]

  return (
    <div>
      <HotTable
        ref={hotTableComponent}
        data={subCategory.handsOnTableData}
        columns={handsonTableCol}
        colHeaders={['Part', 'L', 'W', 'P', 'Total']}
        stretchH="all"
        height={204}
        width="80%"
        rowHeights={21}
        fixedRowsBottom={3}
        afterChange={afterHandsonChange}
        contextMenu
        licenseKey="non-commercial-and-evaluation"
      />
      <div className="row mt-4">
        <div className="col-12 pull-right" style={{ textAlign: 'right' }}>
          <Button onClick={addRow} type="default" disabled={readOnly}>
            Add Row
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HandsOnTable
