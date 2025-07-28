import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Terapeuta } from '../Terapeuta';

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
    textAlign: 'center',
  },
  colNum: { width: '5%' },
  colName: { width: '30%', textAlign: 'left' },
  colSpec: { width: '30%', textAlign: 'left' },
  colPhone: { width: '20%' },
  colState: { width: '15%' },
  statusActive: { color: '#2E8B57', fontWeight: 'bold' },
  statusInactive: { color: '#dc3545', fontWeight: 'bold' },
});

const TerapeutasReport = ({ terapeutas }: { terapeutas: Terapeuta[] }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reporte de Terapeutas</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.colNum]}>#</Text>
          <Text style={[styles.tableCell, styles.colName]}>Nombre Completo</Text>
          <Text style={[styles.tableCell, styles.colSpec]}>Especialidad</Text>
          <Text style={[styles.tableCell, styles.colPhone]}>Teléfono</Text>
          <Text style={[styles.tableCell, styles.colState]}>Estado</Text>
        </View>

        {terapeutas.map((terapeuta, index) => (
          <View
            style={[styles.tableRow, index % 2 !== 0 ? styles.tableRowAlternate : {}]}
            key={terapeuta.id_terapeuta}
          >
            <Text style={[styles.tableCell, styles.colNum]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.colName]}>{`${terapeuta.nombre} ${terapeuta.apellido}`}</Text>
            <Text style={[styles.tableCell, styles.colSpec]}>{terapeuta.especialidad}</Text>
            <Text style={[styles.tableCell, styles.colPhone]}>{terapeuta.telefono}</Text>
            <Text style={[styles.tableCell, styles.colState, terapeuta.estado ? styles.statusActive : styles.statusInactive]}>
              {terapeuta.estado ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default TerapeutasReport;