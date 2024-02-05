import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import Footer from './footer'

const rightSide = { flexDirection: 'row', justifyContent: 'flex-end' }
const tableStyle = { display: 'table', width: 'auto', marginBottom: 30 }
const tableRowStyle = { flexDirection: 'row' }
const firstTableColHeaderStyle = { borderWidth: 0, backgroundColor: '#bdbdbd' }
const tableColHeaderStyle = { borderWidth: 0, backgroundColor: '#bdbdbd' }
const firstTableColStyle = { borderWidth: 0, borderTopWidth: 0 }
const tableColStyle = { borderWidth: 0 }
const tableCellHeaderStyle = { textAlign: 'left', margin: 4, fontSize: 10, fontWeight: 'bold' }
const tableCellStyle = { textAlign: 'left', margin: 5, fontSize: 9 }

const HSNTable = ({ data }) => {
  const createTableHeader = () => (
    <View style={tableRowStyle} fixed>
      <View style={firstTableColHeaderStyle}>
        <Text style={{ ...tableCellHeaderStyle, width: 112 }}>HSN</Text>
      </View>

      <View style={tableColHeaderStyle}>
        <Text style={{ ...tableCellHeaderStyle, width: 40 }}>IGST</Text>
      </View>

      <View style={tableColHeaderStyle}>
        <Text style={{ ...tableCellHeaderStyle, width: 40 }}>SGST</Text>
      </View>

      <View style={tableColHeaderStyle}>
        <Text style={{ ...tableCellHeaderStyle, width: 40 }}>CGST</Text>
      </View>

      <View style={tableColHeaderStyle}>
        <Text style={{ ...tableCellHeaderStyle, width: 80 }}>Amount</Text>
      </View>
    </View>
  )

  const subTotal = data.detail.reduce((acc, obj) => acc + obj.quantity * obj.unit_cost, 0)
  const gstTotal = data.hsn_data.reduce((acc, obj) => acc + obj.amount, 0)
  const grandTotal = gstTotal + subTotal

  const createTableFooter = () => (
    <View style={tableRowStyle}>
      <View style={firstTableColStyle}>
        <Text style={{ ...tableCellStyle, width: 264 }}>Grand Total</Text>
      </View>

      <View style={tableColStyle}>
        <Text style={{ ...tableCellStyle, width: 48 }}>{grandTotal.toFixed(2)}</Text>
      </View>
    </View>
  )

  const subTotalRow = () => (
    <View style={tableRowStyle}>
      <View style={firstTableColStyle}>
        <Text style={{ ...tableCellStyle, width: 264 }}>Sub Total</Text>
      </View>

      <View style={tableColStyle}>
        <Text style={{ ...tableCellStyle, width: 48 }}>{subTotal.toFixed(2)}</Text>
      </View>
    </View>
  )

  const rows = data.hsn_data.map((item) => (
    <View key={`main-row-${item.id}`}>
      <View style={{ ...tableRowStyle, padding: 2 }} key={item.id}>
        <View style={firstTableColStyle}>
          <Text style={{ ...tableCellStyle, width: 112 }}>{item.name}</Text>
        </View>

        <View style={tableColStyle}>
          <Text style={{ ...tableCellStyle, width: 40 }}>{item.igst}</Text>
        </View>

        <View style={tableColStyle}>
          <Text style={{ ...tableCellStyle, width: 40 }}>{item.sgst}</Text>
        </View>

        <View style={tableColStyle}>
          <Text style={{ ...tableCellStyle, width: 40 }}>{item.cgst}</Text>
        </View>
        <View style={tableColStyle}>
          <Text style={{ ...tableCellStyle, width: 48 }}>{item.amount.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  ))

  return (
    <>
      <View style={rightSide} wrap>
        <View style={tableStyle} wrap>
          {createTableHeader()}
          {subTotalRow()}
          {rows}
          {createTableFooter()}
        </View>
      </View>
      <Footer data={data} grandTotal={grandTotal} />
    </>
  )
}

export default HSNTable
