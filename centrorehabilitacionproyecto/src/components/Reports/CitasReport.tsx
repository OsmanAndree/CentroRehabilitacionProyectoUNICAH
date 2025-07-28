import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Cita } from '../Citas';

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
    fontSize: 9,
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
    fontSize: 20,
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
    paddingVertical: 3,
  },
  tableRowAlternate: {
    backgroundColor: '#f1f1f1',
  },
  tableCell: {
    padding: 5,
    textAlign: 'center',
  },
  colNum: { width: '5%' },
  colPaciente: { width: '18%', textAlign: 'left' },
  colTerapeuta: { width: '18%', textAlign: 'left' },
  colFecha: { width: '12%' },
  colHora: { width: '12%' },
  colEstado: { width: '12%' },
  colTipo: { width: '13%' },
  colDuracion: { width: '10%' },
});

const CitasReport = ({ citas }: { citas: Cita[] }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reporte de Citas</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.colNum]}>#</Text>
          <Text style={[styles.tableCell, styles.colPaciente]}>Paciente</Text>
          <Text style={[styles.tableCell, styles.colTerapeuta]}>Terapeuta</Text>
          <Text style={[styles.tableCell, styles.colFecha]}>Fecha</Text>
          <Text style={[styles.tableCell, styles.colHora]}>Hora</Text>
          <Text style={[styles.tableCell, styles.colEstado]}>Estado</Text>
          <Text style={[styles.tableCell, styles.colTipo]}>Tipo</Text>
          <Text style={[styles.tableCell, styles.colDuracion]}>Duración</Text>
        </View>

        {citas.map((cita, index) => (
          <View
            style={[styles.tableRow, index % 2 !== 0 ? styles.tableRowAlternate : {}]}
            key={cita.id_cita}
          >
            <Text style={[styles.tableCell, styles.colNum]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.colPaciente]}>{`${cita.paciente.nombre} ${cita.paciente.apellido}`}</Text>
            <Text style={[styles.tableCell, styles.colTerapeuta]}>{`${cita.terapeuta.nombre} ${cita.terapeuta.apellido}`}</Text>
            <Text style={[styles.tableCell, styles.colFecha]}>{new Date(cita.fecha).toLocaleDateString('es-ES')}</Text>
            <Text style={[styles.tableCell, styles.colHora]}>{`${cita.hora_inicio} - ${cita.hora_fin}`}</Text>
            <Text style={[styles.tableCell, styles.colEstado]}>{cita.estado}</Text>
            <Text style={[styles.tableCell, styles.colTipo]}>{cita.tipo_terapia}</Text>
            <Text style={[styles.tableCell, styles.colDuracion]}>{cita.duracion_min} min</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default CitasReport;