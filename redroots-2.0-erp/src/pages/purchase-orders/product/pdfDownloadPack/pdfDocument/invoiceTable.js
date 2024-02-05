import React from 'react'
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import Footer from './footer'

const styles = StyleSheet.create({
  table: { display: 'table', width: 'auto', marginBottom: 10 },
  rows: { flexDirection: 'row' },

  // header
  firstColHeader: { borderWidth: 0, backgroundColor: '#bdbdbd' },
  restColHeaders: { borderWidth: 0, backgroundColor: '#bdbdbd', paddingLeft: 2 },
  cellInHeader: { textAlign: 'left', margin: 3, fontSize: 10, fontWeight: 'bold' },

  // column
  firstColumn: { marginTop: 3, borderWidth: 0, borderTopWidth: 0 },
  column: { borderWidth: 0, marginLeft: 4 },
  restCells: { textAlign: 'left', fontSize: 9, marginLeft: 3 },

  logoArea: { maxWidth: 30, maxHeight: 30, marginLeft: 10 },
})

const InvoiceTable = ({ data }) => {
  const grandTotal = data.pack_detail.reduce(
    (acc, obj) =>
      acc + obj.quantity * obj.unit_cost * (1 + obj.cgst / 100 + obj.sgst / 100 + obj.igst / 100),
    0,
  )

  const createTableHeader = () => {
    return (
      <View style={styles.rows} fixed>
        <View style={styles.firstColHeader}>
          <Text style={{ ...styles.cellInHeader, width: 70, marginLeft: 10 }}>Image</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 220.8 }}>Code</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>HSN</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Qty</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Rate/Pc</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>SGST</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>CGST</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>IGST</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Total</Text>
        </View>
      </View>
    )
  }

  const createTableFooter = () => {
    return (
      <View style={styles.rows}>
        <View style={styles.firstColHeader}>
          <Text style={{ ...styles.cellInHeader, width: 260.2, textAlign: 'center' }}>Total</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 265.8, textAlign: 'left' }}>
            {data.pack_detail.reduce((acc, obj) => acc + obj.quantity, 0)}
          </Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 90, textAlign: 'center' }}>
            {data.pack_detail
              .reduce(
                (acc, obj) =>
                  acc +
                  obj.quantity *
                    obj.unit_cost *
                    (1 + obj.cgst / 100 + obj.sgst / 100 + obj.igst / 100),
                0,
              )
              .toFixed(2)}
          </Text>
        </View>
      </View>
    )
  }

  const rows = data.pack_detail.map((item) => (
    <View key={`main-row-${item.id}`}>
      <View style={{ ...styles.rows, padding: 2 }} key={item.id}>
        <View style={styles.firstColumn}>
          <View style={{ ...styles.restCells, width: 70, height: 25 }}>
            <Image
              style={{
                ...styles.logoArea,
                width: item.image ? '100%' : 15,
                paddingLeft: item.image ? 0 : 3,
              }}
              src={
                item.image
                  ? process.env.REACT_APP_IMAGE_URL + process.env.REACT_APP_PRODUCT_URL + item.image
                  : 'resources/images/placeholder/general.png'
              }
            />
          </View>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 220.8, height: 17, padding: 2 }}>
            {item.pack_code}
          </Text>
          <Text style={{ ...styles.restCells, width: 220.8, height: 17, padding: 2 }}>
            {item.product_name}
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>{item.hsn_name}</Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>{item.quantity}</Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>{item.unit_cost}</Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>{item.sgst}</Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>{item.cgst}</Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>{item.igst}</Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>
            {(
              item.unit_cost *
              item.quantity *
              (1 + item.cgst / 100 + item.sgst / 100 + item.igst / 100)
            ).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  ))

  return (
    <>
      <View style={styles.table} wrap>
        {createTableHeader()}
        {rows}
        {createTableFooter()}
      </View>
      <Footer data={data} grandTotal={grandTotal} />
    </>
  )
}

export default InvoiceTable
