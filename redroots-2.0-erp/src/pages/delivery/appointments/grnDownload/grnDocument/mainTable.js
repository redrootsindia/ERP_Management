import React from 'react'
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer'

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

const MainTable = ({ data }) => {
  const createTableHeader = () => {
    return (
      <View style={styles.rows} fixed>
        <View style={styles.firstColHeader}>
          <Text style={{ ...styles.cellInHeader, width: 50, marginLeft: 10 }}>Image</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 140.8 }}>Code</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Po.Qty</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Rec.Qty</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Rate/Pc</Text>
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
          <Text style={{ ...styles.cellInHeader, width: 203.5, textAlign: 'center' }}>Total</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 80, textAlign: 'left' }}>
            {data.grnDetail.reduce((acc, obj) => acc + obj.purachse_order_quantity, 0)}
          </Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 170, textAlign: 'left' }}>
            {data.grnDetail.reduce((acc, obj) => acc + obj.received_quantity, 0)}
          </Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4, textAlign: 'left' }}>
            {data.grnDetail
              .reduce((acc, obj) => acc + obj.received_quantity * obj.unit_cost, 0)
              .toFixed(2)}
          </Text>
        </View>
      </View>
    )
  }

  const rows = data.grnDetail.map((item) => (
    <View key={`main-row-${item.id}`}>
      <View style={{ ...styles.rows, padding: 2 }} key={item.id}>
        <View style={styles.firstColumn}>
          <View style={{ ...styles.restCells, width: 50, height: 25 }}>
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
          <Text style={{ ...styles.restCells, width: 145, height: 17, padding: 2 }}>
            {item.variant_code}
          </Text>
          <Text style={{ ...styles.restCells, width: 145, height: 17, padding: 2 }}>
            {item.product_name}
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>
            {item.purachse_order_quantity}
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>
            {item.received_quantity}
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>{item.unit_cost}</Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>
            {(item.unit_cost * item.received_quantity).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  ))

  return (
    <View style={styles.table} wrap>
      {createTableHeader()}
      {rows}
      {createTableFooter()}
    </View>
  )
}

export default MainTable