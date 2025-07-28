import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

interface Detail {
  id_detalle: number;
  id_producto: number;
  cantidad: number;
  costo_unitario: number;
}

export interface Producto {
  id_producto: number;
  nombre: string;
}

export interface Compra {
  id_compra: number;
  fecha: string;
  donante: string;
  total: number;
  detalle: Detail[];
}

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
    fontFamily: 'Poppins',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 8,
    alignItems: 'center',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerText: {
    marginLeft: 10,
  },
  institution: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  invoiceInfo: {
    fontSize: 9,
    marginTop: 4,
  },
  section: {
    marginVertical: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    paddingVertical: 4,
    alignItems: 'center',
  },
  cell: {
    textAlign: 'center',
    padding: 4,
  },
  colNum: { width: '10%' },
  colProd: { width: '35%', textAlign: 'left' },
  colQty: { width: '15%' },
  colCost: { width: '20%' },
  colSub: { width: '20%' },
});

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES');
};

const ComprasReport = ({ compra, productos }: { compra: Compra; productos: Producto[] }) => {
  const calculateSubtotal = (cantidad: number, costo: number): number => cantidad * costo;
  const getNombreProducto = (id: number): string => {
    const prod = productos.find(p => p.id_producto === id);
    return prod ? prod.nombre : `ID ${id}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Image style={styles.logo} src="/logo.png" />
            <View style={styles.headerText}>
              <Text style={styles.institution}>CENTRO DE REHABILITACIÓN</Text>
              <Text style={styles.invoiceInfo}>Factura de Compra / Donación</Text>
            </View>
          </View>
          <View>
            <Text style={styles.bold}>Folio: {String(compra.id_compra).padStart(3, '0')}</Text>
            <Text style={styles.invoiceInfo}>Fecha: {formatDate(compra.fecha)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text><Text style={styles.bold}>Donante/Proveedor:</Text> {compra.donante}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.colNum]}>#</Text>
            <Text style={[styles.cell, styles.colProd]}>Producto</Text>
            <Text style={[styles.cell, styles.colQty]}>Cantidad</Text>
            <Text style={[styles.cell, styles.colCost]}>Costo Unitario</Text>
            <Text style={[styles.cell, styles.colSub]}>Subtotal</Text>
          </View>
          {compra.detalle.map((det, index) => (
            <View key={det.id_detalle} style={styles.tableRow}>
              <Text style={[styles.cell, styles.colNum]}>{index + 1}</Text>
              <Text style={[styles.cell, styles.colProd]}>{getNombreProducto(det.id_producto)}</Text>
              <Text style={[styles.cell, styles.colQty]}>{det.cantidad}</Text>
              <Text style={[styles.cell, styles.colCost]}>{Number(det.costo_unitario).toFixed(2)}</Text>
              <Text style={[styles.cell, styles.colSub]}>
                {calculateSubtotal(det.cantidad, det.costo_unitario).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 20, textAlign: 'right' }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
                Total: {Number(compra.total).toFixed(2)}
            </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ComprasReport;