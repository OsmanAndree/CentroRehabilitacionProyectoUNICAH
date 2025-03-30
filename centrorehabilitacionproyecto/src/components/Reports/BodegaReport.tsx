import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

export interface Bodega {
  id_bodega: number;
  id_producto: number;
  cantidad: number;
  ubicacion: string;
  producto: {
    nombre: string;
  };
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
  columnProducto: {
    flex: 2,
  },
  columnCantidad: {
    flex: 1,
  },
  columnUbicacion: {
    flex: 1.5,
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
  ubicacionBadge: {
    color: '#2E8B57',
    padding: '2px 5px',
    borderRadius: 3,
    fontWeight: 'bold',
  },
});

const BodegaReport = ({ bodegas }: { bodegas: Bodega[] }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      {/* Encabezado del reporte */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reporte de Bodega</Text>
        <Text style={styles.headerSubtitle}>
          Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Tabla de bodega */}
      <View style={styles.table}>
        {/* Encabezados de la tabla */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, styles.columnNumber]}>#</Text>
          <Text style={[styles.tableCellHeader, styles.columnProducto]}>Producto</Text>
          <Text style={[styles.tableCellHeader, styles.columnCantidad]}>Cantidad</Text>
          <Text style={[styles.tableCellHeader, styles.columnUbicacion]}>Ubicación</Text>
        </View>

        {/* Filas de la tabla */}
        {bodegas.map((bodega, index) => (
          <View
            style={[
              styles.tableRow,
              index % 2 !== 0 ? styles.tableRowAlternate : {},
            ]}
            key={bodega.id_bodega}
          >
            <Text style={[styles.tableCell, styles.columnNumber]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.columnProducto]}>
              {bodega.producto?.nombre || 'Sin producto'}
            </Text>
            <Text style={[
              styles.tableCell, 
              styles.columnCantidad,
              bodega.cantidad > 10 ? styles.cantidadHigh :
              bodega.cantidad > 5 ? styles.cantidadMedium :
              styles.cantidadLow
            ]}>
              {bodega.cantidad}
            </Text>
            <Text style={[styles.tableCell, styles.columnUbicacion]}>
              <Text style={styles.ubicacionBadge}>
                {bodega.ubicacion}
              </Text>
            </Text>
          </View>
        ))}
      </View>

      {/* Pie de página */}
      <Text style={styles.footer}>
        Generado por el Sistema de Gestión de Bodega - {new Date().toLocaleDateString('es-ES')}
      </Text>
    </Page>
  </Document>
);

export default BodegaReport;