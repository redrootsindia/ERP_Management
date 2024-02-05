import React from 'react'
import { Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  footer: { position: 'absolute', bottom: -70, right: 10, fontSize: 10 },
})

const PageCounter = () => (
  <Text
    style={styles.footer}
    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
    fixed
  />
)

export default PageCounter
