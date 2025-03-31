import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Paciente } from '../Pacientes';

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
    fontSize: 12,
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
    fontFamily: 'Poppins',
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
    padding: 10,
    fontSize: 10,
    textAlign: 'center',
  },
  tableCell: {
    padding: 10,
    fontSize: 10,
    textAlign: 'center',
  },
  columnNumber: {
    flex: 0.5,
  },
  columnName: {
    flex: 2,
  },
  columnDate: {
    flex: 1.5,
  },
  columnPhone: {
    flex: 1,
  },
  columnAddress: {
    flex: 2,
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 10,
    color: '#6c757d',
    fontFamily: 'Poppins',
  },
});

const PacientesReport = ({ pacientes }: { pacientes: Paciente[] }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      {/* Encabezado del reporte */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reporte de Pacientes</Text>
        <Text style={styles.headerSubtitle}>
          Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Tabla de pacientes */}
      <View style={styles.table}>
        {/* Encabezados de la tabla */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, styles.columnNumber]}>#</Text>
          <Text style={[styles.tableCellHeader, styles.columnName]}>Nombre Completo</Text>
          <Text style={[styles.tableCellHeader, styles.columnDate]}>Fecha de Nacimiento</Text>
          <Text style={[styles.tableCellHeader, styles.columnPhone]}>Teléfono</Text>
          <Text style={[styles.tableCellHeader, styles.columnAddress]}>Dirección</Text>
        </View>

        {/* Filas de la tabla */}
        {pacientes.map((paciente, index) => (
          <View
            style={[
              styles.tableRow,
              index % 2 !== 0 ? styles.tableRowAlternate : {}, // Alterna el color de las filas
            ]}
            key={paciente.id_paciente}
          >
            <Text style={[styles.tableCell, styles.columnNumber]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.columnName]}>{`${paciente.nombre} ${paciente.apellido}`}</Text>
            <Text style={[styles.tableCell, styles.columnDate]}>
              {new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Text style={[styles.tableCell, styles.columnPhone]}>{paciente.telefono}</Text>
            <Text style={[styles.tableCell, styles.columnAddress]}>{paciente.direccion}</Text>
          </View>
        ))}
      </View>

      {/* Pie de página */}
      <Text style={styles.footer}>
        Generado por el Sistema de Gestión de Pacientes - {new Date().toLocaleDateString('es-ES')}
      </Text>
    </Page>
  </Document>
);

export default PacientesReport;