import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Producto } from '../Productos';

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
  },
  colNum: { width: '5%', textAlign: 'center' },
  colName: { width: '25%', textAlign: 'left' },
  colDesc: { width: '35%', textAlign: 'left' },
  colCat: { width: '20%', textAlign: 'center' },
  colQty: { width: '15%', textAlign: 'center' },
  cantidadHigh: { color: '#28a745', fontWeight: 'bold' },
  cantidadMedium: { color: '#ffc107', fontWeight: 'bold' },
  cantidadLow: { color: '#dc3545', fontWeight: 'bold' },
});

const ProductosReport = ({ productos }: { productos: Producto[] }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reporte de Productos</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.colNum]}>#</Text>
          <Text style={[styles.tableCell, styles.colName]}>Nombre</Text>
          <Text style={[styles.tableCell, styles.colDesc]}>Descripción</Text>
          <Text style={[styles.tableCell, styles.colCat]}>Categoría</Text>
          <Text style={[styles.tableCell, styles.colQty]}>Cantidad</Text>
        </View>

        {productos.map((producto, index) => (
          <View
            style={[styles.tableRow, index % 2 !== 0 ? styles.tableRowAlternate : {}]}
            key={producto.id_producto}
          >
            <Text style={[styles.tableCell, styles.colNum]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.colName]}>{producto.nombre}</Text>
            <Text style={[styles.tableCell, styles.colDesc]}>{producto.descripcion}</Text>
            <Text style={[styles.tableCell, styles.colCat]}>{producto.categoria}</Text>
            <Text style={[
              styles.tableCell, 
              styles.colQty,
              producto.cantidad_disponible > 10 ? styles.cantidadHigh :
              producto.cantidad_disponible > 5 ? styles.cantidadMedium :
              styles.cantidadLow
            ]}>
              {producto.cantidad_disponible}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default ProductosReport;