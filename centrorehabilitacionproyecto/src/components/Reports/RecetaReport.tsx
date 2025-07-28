import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Diagnostico } from '../Diagnosticos';

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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Poppins',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    paddingBottom: 10,
    alignItems: 'center',
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
    marginLeft: 15,
  },
  institution: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  doctorInfo: {
    fontSize: 10,
    marginTop: 5,
  },
  patientSection: {
    marginTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bold: {
    fontWeight: 'bold',
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    paddingBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
  },
  signatureLine: {
    width: '250px',
    borderTopWidth: 1,
    borderTopColor: '#000',
    margin: '60px auto 10px auto',
    paddingTop: 5,
  },
});

const RecetaReport = ({ diagnostico }: { diagnostico: Diagnostico }) => {
  const edad = calculateAge(diagnostico.paciente.fecha_nacimiento);
  const fechaReporte = formatDate(new Date().toISOString());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Image style={styles.logo} src="/logo.png" />
            <View style={styles.headerText}>
              <Text style={styles.institution}>CENTRO DE REHABILITACIÓN GABRIELA ALVARADO</Text>
              <Text style={styles.doctorInfo}>
                Terapeuta: {`${diagnostico.terapeuta.nombre} ${diagnostico.terapeuta.apellido}`}
              </Text>
            </View>
          </View>
          <Text>FOLIO: {String(diagnostico.id_diagnostico).padStart(3, '0')}</Text>
        </View>

        <View style={styles.patientSection}>
          <Text><Text style={styles.bold}>Paciente:</Text> {`${diagnostico.paciente.nombre} ${diagnostico.paciente.apellido}`}</Text>
          <Text><Text style={styles.bold}>Edad:</Text> {edad ?? 'N/A'} años</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnóstico</Text>
          <Text>{diagnostico.descripcion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tratamiento Recomendado</Text>
          <Text>{diagnostico.tratamiento}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Fecha de Emisión: {fechaReporte}</Text>
          <View style={styles.signatureLine}>
            <Text>Firma del Profesional</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default RecetaReport;