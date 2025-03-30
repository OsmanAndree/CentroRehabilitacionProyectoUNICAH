import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

export interface Cita {
  id_cita: number;
  fecha: string;
  tipo_terapia: 'Fisica' | 'Neurologica';
  hora_inicio: string;
  hora_fin: string;
  estado: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';
  duracion_min: number;
  paciente: {
    nombre: string;
    apellido: string;
  };
  terapeuta: {
    nombre: string;
    apellido: string;
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
  columnDate: {
    flex: 1.5,
  },
  columnTerapia: {
    flex: 1,
  },
  columnHoraInicio: {
    flex: 1,
  },
  columnHoraFin: {
    flex: 1,
  },
  columnDuracion: {
    flex: 0.8,
  },
  columnEstado: {
    flex: 1,
  },
  columnPaciente: {
    flex: 2,
  },
  columnTerapeuta: {
    flex: 2,
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#6c757d',
  },
});

const CitasReport = ({ citas }: { citas: Cita[] }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      {/* Encabezado del reporte */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reporte de Citas</Text>
        <Text style={styles.headerSubtitle}>
          Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Tabla de citas */}
      <View style={styles.table}>
        {/* Encabezados de la tabla */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, styles.columnNumber]}>#</Text>
          <Text style={[styles.tableCellHeader, styles.columnDate]}>Fecha</Text>
          <Text style={[styles.tableCellHeader, styles.columnTerapia]}>Terapia</Text>
          <Text style={[styles.tableCellHeader, styles.columnHoraInicio]}>Hora Inicio</Text>
          <Text style={[styles.tableCellHeader, styles.columnHoraFin]}>Hora Fin</Text>
          <Text style={[styles.tableCellHeader, styles.columnDuracion]}>Duración</Text>
          <Text style={[styles.tableCellHeader, styles.columnEstado]}>Estado</Text>
          <Text style={[styles.tableCellHeader, styles.columnPaciente]}>Paciente</Text>
          <Text style={[styles.tableCellHeader, styles.columnTerapeuta]}>Terapeuta</Text>
        </View>

        {/* Filas de la tabla */}
        {citas.map((cita, index) => (
          <View
            style={[
              styles.tableRow,
              index % 2 !== 0 ? styles.tableRowAlternate : {},
            ]}
            key={cita.id_cita}
          >
            <Text style={[styles.tableCell, styles.columnNumber]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.columnDate]}>
              {new Date(cita.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Text style={[styles.tableCell, styles.columnTerapia]}>
              {cita.tipo_terapia}
            </Text>
            <Text style={[styles.tableCell, styles.columnHoraInicio]}>
              {cita.hora_inicio}
            </Text>
            <Text style={[styles.tableCell, styles.columnHoraFin]}>
              {cita.hora_fin}
            </Text>
            <Text style={[styles.tableCell, styles.columnDuracion]}>
              {cita.duracion_min} min
            </Text>
            <Text style={[styles.tableCell, styles.columnEstado]}>
              {cita.estado}
            </Text>
            <Text style={[styles.tableCell, styles.columnPaciente]}>
              {`${cita.paciente.nombre} ${cita.paciente.apellido}`}
            </Text>
            <Text style={[styles.tableCell, styles.columnTerapeuta]}>
              {`${cita.terapeuta.nombre} ${cita.terapeuta.apellido}`}
            </Text>
          </View>
        ))}
      </View>

      {/* Pie de página */}
      <Text style={styles.footer}>
        Generado por el Sistema de Gestión de Citas - {new Date().toLocaleDateString('es-ES')}
      </Text>
    </Page>
  </Document>
);

export default CitasReport;