import React from 'react'
import { Page, View, Document, StyleSheet } from '@react-pdf/renderer'
import PageCounter from './pageCounter'
import InvoiceHeader from './header'
import MainTable from './mainTable'
// import HSNTable from './hsnTable'
import Footer from './footer'

const styles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', paddingBottom: 90 },
  section: { marginLeft: 20, marginRight: 20, flexGrow: 1 },
  header: { border: '1 solid black' },
})

const PdfDocument = ({ data }) => (
  <Document>
    <Page size="A4" orientation="portrait" style={styles.page} wrap>
      <View style={styles.section} wrap>
        <InvoiceHeader data={data} />
        <MainTable data={data} />
        {/* <HSNTable data={data} /> */}
        <Footer data={data} />
        <PageCounter />
      </View>
    </Page>
  </Document>
)

export default PdfDocument
