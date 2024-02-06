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
  const createTableHeader = () => {
    return (
      <View style={styles.rows} fixed>
        <View style={styles.firstColHeader}>
          <Text style={{ ...styles.cellInHeader, width: 100, marginLeft: 10 }}>Image</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 300 }}>Description</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 100 }}>PO Qty.</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 100 }}>Recieved Qty.</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 100 }}>Rate/Pc</Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 120 }}>Total</Text>
        </View>
      </View>
    )
  }

  const createTableFooter = () => {
    return (
      <View style={styles.rows}>
        <View style={styles.firstColHeader}>
          <Text
            style={{
              margin: 3,
              fontSize: 10,
              fontWeight: 'bold',
              width: 300.2,
              textAlign: 'center',
            }}
          >
            Total
          </Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 130, padding: 2 }}>
            {data.material_data.reduce((acc, obj) => acc + obj.po_quantity, 0)}
          </Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 260, padding: 2 }}>
            {data.material_data.reduce((acc, obj) => acc + obj.quantity, 0)}
          </Text>
        </View>

        <View style={styles.restColHeaders}>
          <Text style={{ ...styles.cellInHeader, width: 130, padding: 3 }}>
            {data.material_data
              .reduce((acc, obj) => acc + obj.quantity * obj.unit_cost, 0)
              .toFixed(2)}
          </Text>
        </View>
      </View>
    )
  }

  const rows = data.material_data
    .filter((el) => el.quantity !== 0)
    .map((item) => {
      return (
        <View key={`main-row-${item.id}`}>
          <View style={{ ...styles.rows, padding: 2 }} key={item.id}>
            <View style={styles.firstColumn}>
              <View style={{ ...styles.restCells, width: 100, height: 25 }}>
                <Image
                  style={{
                    ...styles.logoArea,
                    width: item.image ? '100%' : 15,
                    paddingLeft: item.image ? 0 : 3,
                  }}
                  src={
                    item.image
                      ? process.env.REACT_APP_IMAGE_URL +
                        process.env.REACT_APP_MATERIAL_URL +
                        item.image
                      : 'resources/images/placeholder/general.png'
                  }
                />
              </View>
            </View>

            <View style={styles.column}>
              <Text style={{ ...styles.restCells, width: 300, height: 17, padding: 2 }}>
                {item.material_code}
              </Text>
              <Text style={{ ...styles.restCells, width: 300, height: 17, padding: 2 }}>
                {item.material_name}
              </Text>
            </View>

            <View style={styles.column}>
              <Text style={{ ...styles.restCells, width: 100, height: 25, padding: 2 }}>
                {item.po_quantity}
              </Text>
            </View>

            <View style={styles.column}>
              <Text style={{ ...styles.restCells, width: 100, height: 25, padding: 2 }}>
                {item.quantity}
              </Text>
            </View>

            <View style={styles.column}>
              <Text style={{ ...styles.restCells, width: 100, height: 25, padding: 2 }}>
                {item.unit_cost}
              </Text>
            </View>

            <View style={styles.column}>
              <Text style={{ ...styles.restCells, width: 120, height: 25, padding: 2 }}>
                {(item.unit_cost * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )
    })

  return (
    <View style={styles.table} wrap>
      {createTableHeader()}
      {rows}
      {createTableFooter()}
    </View>
  )
}

export default MainTable
