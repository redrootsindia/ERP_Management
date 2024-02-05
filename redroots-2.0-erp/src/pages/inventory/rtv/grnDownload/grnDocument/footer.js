/* eslint-disable no-array-constructor */

import React from 'react'
import { Text, View, StyleSheet, Font } from '@react-pdf/renderer'

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

  noBorderTopWidth: { borderTopWidth: 0 },

  normal: { fontSize: 9 },
  fontSize10: { fontSize: 10 },
  boldStyle: { fontFamily: 'Roboto', fontWeight: 'bold', paddingBottom: 3 },
  footer: { position: 'absolute', bottom: -40, left: 0, right: 0 },
  rightSide: { flexDirection: 'row', justifyContent: 'flex-end' },
})

// prettier-ignore
// const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
//     'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ',
//     'Eighteen ', 'Nineteen ']
// prettier-ignore
// const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

// const inWords = (num) => {
//   if (num.toString().length > 9) return null

//   const n = `000000000${num}`.substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
//   if (!n) return null

//   let str = ''
//   str += Number(n[1]) ? `${a[Number(n[1])] || `${b[n[1][0]]} ${a[n[1][1]]}`}Crore ` : ''
//   str += Number(n[2]) ? `${a[Number(n[2])] || `${b[n[2][0]]} ${a[n[2][1]]}`}Lakh ` : ''
//   str += Number(n[3]) ? `${a[Number(n[3])] || `${b[n[3][0]]} ${a[n[3][1]]}`}Thousand ` : ''
//   str += Number(n[4]) ? `${a[Number(n[4])] || `${b[n[4][0]]} ${a[n[4][1]]}`}Hundred ` : ''
//   str += Number(n[5])
//     ? `${str ? 'And ' : ''}${a[Number(n[5])] || `${b[n[5][0]]} ${a[n[5][1]]}`}`
//     : ''

//   return str ? `${str}Only` : null
// }

const Footer = ({data}) => {
  // const amountInWords = inWords(grandTotal ? Math.round(grandTotal) : 0)
  return (
    <View style={styles.footer} break>
      {/* <View>
        <Text style={{ ...styles.fontSize10, ...styles.boldStyle }}>Amount in Words:</Text>
        <Text style={{ ...styles.boldStyle, ...styles.normal }}>
          {amountInWords ? amountInWords.toUpperCase() : grandTotal || 0}
        </Text>
      </View> */}
      <View style={styles.rightSide}>
        <View
          style={{
            ...styles.header,
            height: 60,
            width: 200,
          }}
        >
          <View style={{ height: 40 }}>
            <Text style={{ ...styles.normal }}>
              For,
              <div style={{ display: 'inline-block', ...styles.boldStyle, ...styles.normal }}>
                &nbsp; {data.organization_data.name}
              </div>
            </Text>
          </View>
          <Text style={{ textAlign: 'right', ...styles.normal }}>Authorised Signature</Text>
        </View>
      </View>
    </View>
  )
}

export default Footer
