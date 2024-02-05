import React from 'react'
import { Page, Document, View, StyleSheet } from '@react-pdf/renderer'
import VariantsBarcode from './variantsBarcode'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  section: { flexGrow: 1 },
})

const PdfDocument = ({ data }) => (
  <Document>
    <Page size="A4" orientation="portrait" style={styles.page} wrap>
      <View style={styles.section} wrap>
        <VariantsBarcode data={data} />
      </View>
    </Page>
  </Document>
)

export default PdfDocument
