import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Bodega } from '../Bodegas';

Font.register({
  family: 'Poppins',
  fonts: [
    { src: '/fonts/Poppins-Regular.ttf' },
    { src: '/fonts/Poppins-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Poppins',
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#2E8B57',
    borderRadius: 8,
    textAlign: 'center',
    color: 'white',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 5,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    backgroundColor: '#2E8B57',
    flexDirection: 'row',
    color: 'white',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    alignItems: 'center',
    paddingVertical: 4,
  },
  tableRowAlternate: {
    backgroundColor: '#f1f1f1',
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
    textAlign: 'center',
  },
  colNum: { width: '10%' },
  colProd: { width: '40%', textAlign: 'left' },
  colQty: { width: '20%' },
  colUb: { width: '30%', textAlign: 'left' },
  cantidadHigh: { color: '#28a745', fontWeight: 'bold' },
  cantidadMedium: { color: '#ffc107', fontWeight: 'bold' },
  cantidadLow: { color: '#dc3545', fontWeight: 'bold' },
});

const BodegaReport = ({ bodegas }: { bodegas: Bodega[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reporte de Bodega</Text>
        <Text style={styles.headerSubtitle}>
          Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.colNum]}>#</Text>
          <Text style={[styles.tableCell, styles.colProd]}>Producto</Text>
          <Text style={[styles.tableCell, styles.colQty]}>Cantidad</Text>
          <Text style={[styles.tableCell, styles.colUb]}>Ubicación</Text>
        </View>

        {bodegas.map((bodega, index) => (
          <View
            style={[styles.tableRow, index % 2 !== 0 ? styles.tableRowAlternate : {}]}
            key={bodega.id_bodega}
          >
            <Text style={[styles.tableCell, styles.colNum]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.colProd]}>
              {bodega.producto?.nombre || 'Sin producto'}
            </Text>
            <Text style={[
              styles.tableCell, 
              styles.colQty,
              bodega.cantidad > 10 ? styles.cantidadHigh :
              bodega.cantidad > 5 ? styles.cantidadMedium :
              styles.cantidadLow
            ]}>
              {bodega.cantidad}
            </Text>
            <Text style={[styles.tableCell, styles.colUb]}>
              {bodega.ubicacion}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default BodegaReport;