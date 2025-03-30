import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

export interface Terapeuta {
  id_terapeuta: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string;
  estado: boolean;
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
  columnEspecialidad: {
    flex: 2,
  },
  columnTelefono: {
    flex: 1.5,
  },
  columnEstado: {
    flex: 1,
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#6c757d',
  },
  statusActive: {
    color: '#2E8B57',
    fontWeight: 'bold',
  },
  statusInactive: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
});

const TerapeutasReport = ({ terapeutas }: { terapeutas: Terapeuta[] }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      {/* Encabezado del reporte */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reporte de Terapeutas</Text>
        <Text style={styles.headerSubtitle}>
          Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Tabla de terapeutas */}
      <View style={styles.table}>
        {/* Encabezados de la tabla */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, styles.columnNumber]}>#</Text>
          <Text style={[styles.tableCellHeader, styles.columnNombre]}>Nombre Completo</Text>
          <Text style={[styles.tableCellHeader, styles.columnEspecialidad]}>Especialidad</Text>
          <Text style={[styles.tableCellHeader, styles.columnTelefono]}>Teléfono</Text>
        </View>

        {/* Filas de la tabla */}
        {terapeutas.map((terapeuta, index) => (
          <View
            style={[
              styles.tableRow,
              index % 2 !== 0 ? styles.tableRowAlternate : {},
            ]}
            key={terapeuta.id_terapeuta}
          >
            <Text style={[styles.tableCell, styles.columnNumber]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.columnNombre]}>
              {`${terapeuta.nombre} ${terapeuta.apellido}`}
            </Text>
            <Text style={[styles.tableCell, styles.columnEspecialidad]}>
              {terapeuta.especialidad}
            </Text>
            <Text style={[styles.tableCell, styles.columnTelefono]}>
              {terapeuta.telefono}
            </Text>
          </View>
        ))}
      </View>

      {/* Resumen estadístico */}
      <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 9 }}>
          Total de terapeutas: {terapeutas.length}
        </Text>
        <Text style={{ fontSize: 9 }}>
          Terapeutas activos: {terapeutas.filter(t => t.estado).length}
        </Text>
        <Text style={{ fontSize: 9 }}>
          Terapeutas inactivos: {terapeutas.filter(t => !t.estado).length}
        </Text>
      </View>

      {/* Pie de página */}
      <Text style={styles.footer}>
        Generado por el Sistema de Gestión de Terapeutas - {new Date().toLocaleDateString('es-ES')}
      </Text>
    </Page>
  </Document>
);

export default TerapeutasReport;