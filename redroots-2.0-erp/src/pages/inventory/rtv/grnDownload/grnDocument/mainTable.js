import React from 'react'
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  table: { display: 'table', width: 'auto', marginBottom: 10 },
  rows: { flexDirection: 'row' },

  // header
  firstColHeader: { borderWidth: 0, backgroundColor: '#bdbdbd' },
  restColHeaders: { borderWidth: 0, backgroundColor: '#bdbdbd' },
  cellInHeader: { textAlign: 'left', margin: 3, fontSize: 10, fontWeight: 'bold' },

  // column
  firstColumn: { marginTop: 3, borderWidth: 0, borderTopWidth: 0 },
  column: { borderWidth: 0, marginLeft: 4 },
  restCells: { textAlign: 'left', fontSize: 9, marginLeft: 3 },

  logoArea: { maxWidth: 30, maxHeight: 30, marginLeft: 10 },
})

const MainTable = ({ data }) => {
  const newData = []
  if (data.items_list && data.items_list.length) {
    data.items_list.forEach((obj, i) => {
      newData.push({
        id: i,
        quanttity: obj.quantity || 0,
        code: obj.productVariantData.code,
      })
    })
  }
  const createTableHeader = () => {
    return (
      <View style={styles.rows} fixed>
        <View style={styles.firstColHeader}>
          <Text style={{ ...styles.cellInHeader, width: 180, marginLeft: 10 }}>Image</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 180 }}>Code</Text>
        </View>

        {/* <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Del.Qty</Text>
        </View> */}
        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 180 }}>Returned Qty.</Text>
        </View>
        {/* 
        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Rec.Qty</Text>
        </View>
        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Rejected</Text>
        </View>
        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Rate/Pc</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>Total</Text>
        </View> */}
      </View>
    )
  }

  const createTableFooter = () => {
    return (
      <View style={styles.rows}>
        <View style={styles.restColHeaders}>
          <Text
            style={{
              margin: 3,
              fontSize: 10,
              fontWeight: 'bold',
              width: 380,
              textAlign: 'center',
            }}
          >
            Total
          </Text>
        </View>

        {/* <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>
            {newData.reduce((acc, obj) => acc + obj.dispatched_quantity, 0)}
          </Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>
            {newData.reduce((acc, obj) => acc + obj.po_quantity, 0)}
          </Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>
            {newData.reduce((acc, obj) => acc + obj.accepted_quantity, 0)}
          </Text>
        </View> */}

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 180 }}>
            {newData.reduce((acc, obj) => acc + obj.quanttity, 0)}
          </Text>
        </View>

        {/* <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 82.4 }}>
            {newData
              .reduce((acc, obj) => acc + obj.accepted_quantity * obj.unit_cost, 0)
              .toFixed(2)}
          </Text>
        </View> */}
      </View>
    )
  }

  const rows = newData.map((item) => (
    <View key={`main-row-${item.id}`}>
      <View style={{ ...styles.rows, padding: 2 }} key={item.id}>
        <View style={styles.firstColumn}>
          <View style={{ ...styles.restCells, width: 180, height: 25 }}>
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
          <Text style={{ ...styles.restCells, width: 180, height: 17, padding: 2 }}>
            {item.code}
          </Text>
        </View>
        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 180, height: 17, padding: 2 }}>
            {item.quanttity}
          </Text>
        </View>
        {/* <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>
            {item.dispatched_quantity}
          </Text>
        </View>
        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>{item.po_quantity}</Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>
            {item.accepted_quantity}
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>
            {item.dispatched_quantity - item.accepted_quantity}
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>{item.unit_cost}</Text>
        </View>

        <View style={styles.column}>
          <Text style={{ ...styles.restCells, width: 82.4, height: 25 }}>
            {(item.unit_cost * item.accepted_quantity).toFixed(2)}
          </Text>
        </View> */}
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
