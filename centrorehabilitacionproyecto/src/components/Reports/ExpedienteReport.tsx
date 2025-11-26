import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Paciente } from '../../features/pacientes/pacientesSlice';
import { Diagnostico } from '../Diagnosticos';
import { Cita } from '../Citas';

Font.register({
  family: 'Poppins',
  fonts: [
    { src: '/fonts/Poppins-Regular.ttf' },
    { src: '/fonts/Poppins-Bold.ttf', fontWeight: 'bold' },
  ],
});

const calculateAge = (birthDateStr: string): number | null => {
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) 
    ? "N/A" 
    : date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

const getGeneroTexto = (g: number | null | undefined): string => {
  switch (g) {
    case 0: return "Masculino";
    case 1: return "Femenino";
    case 2: return "Indefinido";
    default: return "No registrado";
  }
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Poppins',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#2E8B57',
    borderRadius: 8,
    textAlign: 'center',
    color: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 10,
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#2E8B57',
    paddingBottom: 5,
    color: '#2E8B57',
  },
  patientInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  patientLabel: {
    fontWeight: 'bold',
    width: '40%',
  },
  patientValue: {
    width: '60%',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2E8B57',
    color: 'white',
    fontWeight: 'bold',
    padding: 8,
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    padding: 6,
    fontSize: 8,
  },
  tableRowAlternate: {
    backgroundColor: '#f5f5f5',
  },
  colFecha: { width: '20%' },
  colTerapeuta: { width: '25%' },
  colDescripcion: { width: '30%' },
  colTratamiento: { width: '25%' },
  colHora: { width: '15%' },
  colTipo: { width: '20%' },
  colDuracion: { width: '15%' },
  colEstado: { width: '15%' },
  textCell: {
    padding: 2,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
});

interface ExpedienteReportProps {
  paciente: Paciente;
  diagnosticos: Diagnostico[];
  citas: Cita[];
}

const ExpedienteReport = ({ paciente, diagnosticos, citas }: ExpedienteReportProps) => {
  const edad = calculateAge(paciente.fecha_nacimiento);
  const fechaReporte = formatDate(new Date().toISOString());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Expediente Médico</Text>
          <Text style={styles.headerSubtitle}>
            Centro de Rehabilitación Gabriela Alvarado
          </Text>
          <Text style={styles.headerSubtitle}>
            Generado el {fechaReporte}
          </Text>
        </View>

        {/* Información del Paciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Paciente</Text>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Nombre Completo:</Text>
            <Text style={styles.patientValue}>{paciente.nombre} {paciente.apellido}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Número de Identidad:</Text>
            <Text style={styles.patientValue}>{paciente.numero_identidad || 'N/A'}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Fecha de Nacimiento:</Text>
            <Text style={styles.patientValue}>{formatDate(paciente.fecha_nacimiento)}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Edad:</Text>
            <Text style={styles.patientValue}>{edad !== null ? `${edad} años` : 'N/A'}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Género:</Text>
            <Text style={styles.patientValue}>{getGeneroTexto(paciente.genero)}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Teléfono:</Text>
            <Text style={styles.patientValue}>{paciente.telefono}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Dirección:</Text>
            <Text style={styles.patientValue}>{paciente.direccion || 'N/A'}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Lugar de Procedencia:</Text>
            <Text style={styles.patientValue}>{paciente.lugar_procedencia || 'N/A'}</Text>
          </View>
        </View>

        {/* Historial de Diagnósticos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Historial de Diagnósticos ({diagnosticos.length})
          </Text>
          {diagnosticos.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.textCell, styles.colFecha]}>Fecha</Text>
                <Text style={[styles.textCell, styles.colTerapeuta]}>Terapeuta</Text>
                <Text style={[styles.textCell, styles.colDescripcion]}>Descripción</Text>
                <Text style={[styles.textCell, styles.colTratamiento]}>Tratamiento</Text>
              </View>
              {diagnosticos.map((diagnostico, index) => (
                <View
                  key={diagnostico.id_diagnostico}
                  style={[
                    styles.tableRow,
                    index % 2 !== 0 ? styles.tableRowAlternate : {}
                  ]}
                >
                  <Text style={[styles.textCell, styles.colFecha]}>
                    {formatDate(diagnostico.fecha)}
                  </Text>
                  <Text style={[styles.textCell, styles.colTerapeuta]}>
                    {diagnostico.terapeuta?.nombre} {diagnostico.terapeuta?.apellido}
                  </Text>
                  <Text style={[styles.textCell, styles.colDescripcion]}>
                    {diagnostico.descripcion || 'N/A'}
                  </Text>
                  <Text style={[styles.textCell, styles.colTratamiento]}>
                    {diagnostico.tratamiento.substring(0, 50)}
                    {diagnostico.tratamiento.length > 50 ? '...' : ''}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyMessage}>
              No se registran diagnósticos para este paciente.
            </Text>
          )}
        </View>

        {/* Historial de Citas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Historial de Citas ({citas.length})
          </Text>
          {citas.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.textCell, styles.colFecha]}>Fecha</Text>
                <Text style={[styles.textCell, styles.colHora]}>Hora</Text>
                <Text style={[styles.textCell, styles.colTerapeuta]}>Terapeuta</Text>
                <Text style={[styles.textCell, styles.colTipo]}>Tipo</Text>
                <Text style={[styles.textCell, styles.colDuracion]}>Duración</Text>
                <Text style={[styles.textCell, styles.colEstado]}>Estado</Text>
              </View>
              {citas.map((cita, index) => (
                <View
                  key={cita.id_cita}
                  style={[
                    styles.tableRow,
                    index % 2 !== 0 ? styles.tableRowAlternate : {}
                  ]}
                >
                  <Text style={[styles.textCell, styles.colFecha]}>
                    {formatDate(cita.fecha)}
                  </Text>
                  <Text style={[styles.textCell, styles.colHora]}>
                    {cita.hora_inicio} - {cita.hora_fin}
                  </Text>
                  <Text style={[styles.textCell, styles.colTerapeuta]}>
                    {cita.terapeuta?.nombre} {cita.terapeuta?.apellido}
                  </Text>
                  <Text style={[styles.textCell, styles.colTipo]}>
                    {cita.tipo_terapia}
                  </Text>
                  <Text style={[styles.textCell, styles.colDuracion]}>
                    {cita.duracion_min} min
                  </Text>
                  <Text style={[styles.textCell, styles.colEstado]}>
                    {cita.estado}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyMessage}>
              No se registran citas para este paciente.
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Este documento fue generado automáticamente el {fechaReporte}
          </Text>
          <Text style={{ marginTop: 5 }}>
            Centro de Rehabilitación Gabriela Alvarado
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ExpedienteReport;

