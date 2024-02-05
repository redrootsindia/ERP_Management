import React from 'react'
import { Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import moment from 'moment'

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.11.0/font/roboto/Roboto-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
})

const styles = StyleSheet.create({
  headerTitle: { textAlign: 'center', fontSize: 14, margin: 5 },
  header: { padding: 10, paddingBottom: 5, paddingTop: 6, border: '1 solid black' },
  noBorderLeftWidth: { borderLeftWidth: 0 },
  noBorderTopWidth: { borderTopWidth: 0 },
  verticalDivide: { display: 'flex', alignContent: 'flex-start', flexDirection: 'column' },
  horizontalDivide: { display: 'flex', alignContent: 'flex-start', flexDirection: 'row' },
  invoiceTo: { fontSize: 10, fontFamily: 'Roboto', fontWeight: 900, paddingBottom: 5 },
  companyName: { fontSize: 10, fontFamily: 'Roboto', fontWeight: 900, paddingBottom: 5 },
  companyAddress: { fontSize: 9, flexDirection: 'row', paddingBottom: 5 },
  companyState: { fontSize: 9, paddingBottom: 5 },
  companyGst: { fontSize: 9, paddingBottom: 5 },
  companyEmail: { fontSize: 9, paddingBottom: 5 },
  voucher: { fontSize: 9, paddingBottom: 5 },
  voucherBelow: { fontSize: 9 },
  bold: { fontFamily: 'Roboto', fontWeight: 900 },
})

const InvoiceHeader = ({ data }) => (
  <View style={{ marginTop: 20 }} fixed>
    <View>
      <Text style={styles.headerTitle}>INVOICE</Text>
    </View>
    <View style={styles.verticalDivide}>
      <View style={styles.horizontalDivide}>
        <View style={{ ...styles.header, height: 120, width: 287 }}>
          <Text style={styles.invoiceTo}>Invoice To :</Text>
          <Text style={styles.companyName}>{data.organization_data.name}</Text>
          <Text style={styles.companyAddress}>{data.organization_data.address}</Text>
          <Text style={styles.companyState}>{data.organization_data.state}</Text>
          <Text style={styles.companyGst}>
            <div style={{ display: 'inline-block', ...styles.bold }}>GSTIN:</div>&nbsp;
            {data.organization_data.gst ? data.organization_data.gst.toUpperCase() : ''}
          </Text>
          <Text style={styles.companyEmail}>
            <div style={{ display: 'inline-block', ...styles.bold }}>e-mail:</div>&nbsp;
            {data.organization_data.email}
          </Text>
        </View>

        <View style={styles.verticalDivide}>
          <View style={styles.horizontalDivide}>
            <View style={{ ...styles.header, height: 40, width: 143, ...styles.noBorderLeftWidth }}>
              <Text style={styles.voucher}>Voucher No:</Text>
              <Text style={styles.voucherBelow}>{data.id}</Text>
            </View>
            <View
              style={{
                ...styles.header,
                ...styles.noBorderLeftWidth,
                height: 40,
                width: 143.5,
              }}
            >
              <Text style={styles.voucher}>Dated On:</Text>
              <Text style={styles.voucherBelow}>
                {moment(Number(data.po_date)).format('Do MMM YYYY')}
              </Text>
            </View>
          </View>
          <View style={styles.horizontalDivide}>
            <View
              style={{
                ...styles.header,
                ...styles.noBorderLeftWidth,
                ...styles.noBorderTopWidth,
                height: 40,
                width: 143.5,
              }}
            >
              <Text style={styles.voucher}>Dispatched through:</Text>
              <Text style={styles.voucherBelow}>-</Text>
            </View>
            <View
              style={{
                ...styles.header,
                ...styles.noBorderLeftWidth,
                ...styles.noBorderTopWidth,
                height: 40,
                width: 143.5,
              }}
            >
              <Text style={styles.voucher}>Supplier Ref/Order No:</Text>
              <Text style={styles.voucherBelow}>-</Text>
            </View>
          </View>
          <View style={styles.horizontalDivide}>
            <View
              style={{
                ...styles.header,
                ...styles.noBorderLeftWidth,
                ...styles.noBorderTopWidth,
                height: 40,
                width: 143.5,
              }}
            >
              <Text style={styles.voucher}>Other Reference(s):</Text>
              <Text style={styles.voucherBelow}>-</Text>
            </View>
            <View
              style={{
                ...styles.header,
                ...styles.noBorderLeftWidth,
                ...styles.noBorderTopWidth,
                height: 40,
                width: 143.5,
              }}
            />
          </View>
        </View>
      </View>
      <View style={styles.horizontalDivide}>
        <View style={{ ...styles.header, ...styles.noBorderTopWidth, height: 120, width: 287 }}>
          <Text style={styles.invoiceTo}>Dispatch To :</Text>
          <Text style={styles.companyName}>{data.organization_data.name}</Text>
          <Text style={styles.companyAddress}>{data.organization_data.address}</Text>
          <Text style={styles.companyState}>{data.organization_data.state}</Text>
          <Text style={styles.companyGst}>
            <div style={{ display: 'inline-block', ...styles.bold }}>GSTIN:</div>
            &nbsp;{data.organization_data.gst ? data.organization_data.gst.toUpperCase() : ''}
          </Text>
          <Text style={styles.companyEmail}>
            <div style={{ display: 'inline-block', ...styles.bold }}>e-mail:</div>
            &nbsp;{data.organization_data.email}
          </Text>
        </View>
        <View
          style={{
            ...styles.header,
            ...styles.noBorderLeftWidth,
            ...styles.noBorderTopWidth,
            height: 120,
            width: 287,
          }}
        >
          <Text style={styles.invoiceTo}>Supplier :</Text>
          <Text style={styles.companyName}>{data.vendor_data.company}</Text>
          <Text style={styles.companyGst}>
            <div style={{ display: 'inline-block', ...styles.bold }}>GSTIN:</div>
            &nbsp;{data.vendor_data.gst ? data.vendor_data.gst.toUpperCase() : ''}
          </Text>
          <Text style={styles.companyAddress}>{data.vendor_data.address}</Text>
        </View>
      </View>
    </View>
  </View>
)

export default InvoiceHeader
