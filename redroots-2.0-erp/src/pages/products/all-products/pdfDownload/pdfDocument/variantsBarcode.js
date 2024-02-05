/* eslint no-unused-vars:"off" */
import React from 'react'
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import JsBarcode from 'jsbarcode'

const styles = StyleSheet.create({
  table: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginVertical: 12,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
  cell: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
    flexWrap: 'wrap',
    flexDirection: 'column',
  },
})

const VariantsBarcode = ({ data }) => (
  <>
    <View style={{ textAlign: 'center' }} fixed>
      <Text>{`${data.name} - Barcodes for all BOMs`}</Text>
    </View>
    <View style={styles.table}>
      {data.variants.map((row, ind) => (
        <View key={ind} style={[styles.tableRow]}>
          {row.map((cell, j) => {
            const canvas = document.createElement('canvas')
            JsBarcode(canvas, cell.ean, { width: 1, height: 40, displayValue: false })
            const barcode = canvas.toDataURL()
            return (
              <View style={{ ...styles.box, marginHorizontal: 30, marginVertical: 20 }}>
                <View key={j} style={[styles.cell, { width: 125, height: 100 }]}>
                  <Image src={barcode} alt="barcode" />
                </View>
                <Text style={{ width: 125, fontSize: 10 }}>{`BOM Code : ${cell.code}`}</Text>
                <Text style={{ width: 125, fontSize: 10, marginVertical: 4 }}>
                  {`Product : ${data.name}`}
                </Text>
              </View>
            )
          })}
        </View>
      ))}
    </View>
  </>
)

export default VariantsBarcode
