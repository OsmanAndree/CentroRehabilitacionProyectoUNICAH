import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  cantidad_disponible: number;
}

Font.register({
  family: 'Poppins',
  fonts: [
    { src: '../../src/assets/fonts/Poppins-Regular.ttf' },
    { src: '../../src/assets/fonts/Poppins-Bold.ttf', fontWeight: 'bold' },
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
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableHeader: {
    backgroundColor: '#2E8B57',
    flexDirection: 'row',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    borderBottomStyle: 'solid',
  },
  tableRowAlternate: {
    backgroundColor: '#f1f1f1',
  },
  tableCellHeader: {
    padding: 5,
    fontSize: 8,
    textAlign: 'center',
  },
  tableCell: {
    padding: 5,
    fontSize: 8,
    textAlign: 'center',
  },
  columnNumber: {
    flex: 0.5,
  },
  columnNombre: {
    flex: 2,
  },
  columnDescripcion: {
    flex: 3,
  },
  columnCategoria: {
    flex: 1.5,
  },
  columnCantidad: {
    flex: 1,
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#6c757d',
  },
  cantidadHigh: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  cantidadMedium: {
    color: '#ffc107',
    fontWeight: 'bold',
  },
  cantidadLow: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  categoriaBadge: {
    color: '#2E8B57',
    padding: '2px 5px',
    borderRadius: 3,
    fontWeight: 'bold',
  },
});

const ProductosReport = ({ productos }: { productos: Producto[] }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      {/* Encabezado del reporte */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reporte de Productos</Text>
        <Text style={styles.headerSubtitle}>
          Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Tabla de productos */}
      <View style={styles.table}>
        {/* Encabezados de la tabla */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, styles.columnNumber]}>#</Text>
          <Text style={[styles.tableCellHeader, styles.columnNombre]}>Nombre</Text>
          <Text style={[styles.tableCellHeader, styles.columnDescripcion]}>Descripción</Text>
          <Text style={[styles.tableCellHeader, styles.columnCategoria]}>Categoría</Text>
          <Text style={[styles.tableCellHeader, styles.columnCantidad]}>Cantidad</Text>
        </View>

        {/* Filas de la tabla */}
        {productos.map((producto, index) => (
          <View
            style={[
              styles.tableRow,
              index % 2 !== 0 ? styles.tableRowAlternate : {},
            ]}
            key={producto.id_producto}
          >
            <Text style={[styles.tableCell, styles.columnNumber]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.columnNombre]}>
              {producto.nombre}
            </Text>
            <Text style={[styles.tableCell, styles.columnDescripcion]}>
              {producto.descripcion}
            </Text>
            <Text style={[styles.tableCell, styles.columnCategoria]}>
              <Text style={styles.categoriaBadge}>
                {producto.categoria}
              </Text>
            </Text>
            <Text style={[
              styles.tableCell, 
              styles.columnCantidad,
              producto.cantidad_disponible > 10 ? styles.cantidadHigh :
              producto.cantidad_disponible > 5 ? styles.cantidadMedium :
              styles.cantidadLow
            ]}>
              {producto.cantidad_disponible}
            </Text>
          </View>
        ))}
      </View>

      {/* Pie de página */}
      <Text style={styles.footer}>
        Generado por el Sistema de Gestión de Productos - {new Date().toLocaleDateString('es-ES')}
      </Text>
    </Page>
  </Document>
);

export default ProductosReport;