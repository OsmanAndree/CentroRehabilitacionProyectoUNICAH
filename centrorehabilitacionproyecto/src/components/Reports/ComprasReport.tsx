import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Interfaces
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

// Registro de fuentes
Font.register({
  family: 'Poppins',
  fonts: [
    { src: '../../src/assets/fonts/Poppins-Regular.ttf' },
    { src: '../../src/assets/fonts/Poppins-Bold.ttf', fontWeight: 'bold' },
  ],
});

// Estilos para el reporte
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
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
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
    display: 'flex',
    width: '100%',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    padding: 5,
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    padding: 3,
  },
});

// Función auxiliar para formatear fechas
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return isNaN(date.getTime())
    ? 'N/A'
    : date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

// ComprasReport: Recibe una compra y la lista de productos para buscar el nombre del producto.
const ComprasReport = ({ compra, productos }: { compra: Compra; productos: Producto[] }) => {
  const calculateSubtotal = (cantidad: number, costo: number): number => cantidad * costo;

  // Función para obtener el nombre del producto usando su id
  const getNombreProducto = (id: number): string => {
    const prod = productos.find(p => p.id_producto === id);
    return prod ? prod.nombre : String(id);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="portrait">
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Image style={styles.logo} src="../../../public/logo.png" />
            <View style={styles.headerText}>
              <Text style={styles.institution}>CENTRO DE REHABILITACIÓN GABRIELA ALVARADO</Text>
              <Text style={styles.invoiceInfo}>Factura de Compra</Text>
            </View>
          </View>
          <View>
            <Text style={styles.bold}>Folio: {String(compra.id_compra).padStart(3, '0')}</Text>
            <Text style={styles.invoiceInfo}>Fecha: {formatDate(compra.fecha)}</Text>
          </View>
        </View>

        {/* Información de la compra */}
        <View style={styles.section}>
          <Text style={styles.bold}>Donante:</Text>
          <Text>{compra.donante}</Text>
        </View>
        <View style={[styles.section, { flexDirection: 'row', alignItems: 'center' }]}>
          <Text style={styles.bold}>Total: </Text>
          <Text style={{ marginLeft: 5 }}>{Number(compra.total).toFixed(2)}</Text>
        </View>

        {/* Detalles de la compra */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.cell, { flex: 1 }]}>Producto</Text>
            <Text style={[styles.cell, { flex: 0.8 }]}>Cantidad</Text>
            <Text style={[styles.cell, { flex: 1 }]}>Costo Unitario</Text>
            <Text style={[styles.cell, { flex: 1 }]}>Subtotal</Text>
          </View>
          {compra.detalle.map((det, index) => (
            <View key={det.id_detalle} style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{getNombreProducto(det.id_producto)}</Text>
              <Text style={[styles.cell, { flex: 0.8 }]}>{det.cantidad}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{det.costo_unitario.toFixed(2)}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>
                {calculateSubtotal(det.cantidad, det.costo_unitario).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default ComprasReport;