import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Interfaces de datos
interface Paciente {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
}

interface Terapeuta {
  nombre: string;
  apellido: string;
}

interface Diagnostico {
  id_diagnostico: number;
  descripcion: string;
  tratamiento: string;
 
  paciente: Paciente;
  terapeuta: Terapeuta;
}

// Registro de fuentes
Font.register({
  family: 'Poppins',
  fonts: [
    { src: '../../src/assets/fonts/Poppins-Regular.ttf' },
    { src: '../../src/assets/fonts/Poppins-Bold.ttf', fontWeight: 'bold' },
  ],
});

// Funciones auxiliares
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
  headerText: {
    marginLeft: 10,
  },
  logo: {
    width: 70,
    height: 70,
    // marginBottom: 10, // elimina el marginBottom para que no empuje el logo hacia abajo
  },
  institution: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  doctorInfo: {
    fontSize: 9,
    marginTop: 4,
  },
  patientRow: {
    flexDirection: 'row',
    gap: 15,
    marginVertical: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  underlined: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginHorizontal: 3,
  },
  medicationList: {
    marginVertical: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 9,
  },
  signatureLine: {
    width: '60%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginTop: 80,
  },
});

const RecetaReport = ({ diagnostico }: { diagnostico: Diagnostico }) => {
  const edad = calculateAge(diagnostico.paciente.fecha_nacimiento);
  const fechaReporte = formatDate(new Date().toISOString());

  
  const medicalData = {
    folio: diagnostico.id_diagnostico.toString().padStart(3, '0'),
    indicaciones: diagnostico.tratamiento.split('. '),
    direccion: "Costado sur de la iglesia Católica, edificio de 2 plantas color beige con café.",
    telefono: "9599-4035"
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation='landscape'>
        {/* Encabezado */}
        <View style={styles.header}>
  <View style={styles.leftHeader}>
    <Image style={styles.logo} src="../../../public/logo.png" />
    <View style={styles.headerText}>
      <Text style={styles.institution}>
        CENTRO DE REHABILITACIÓN GABRIELA ALVARADO
      </Text>
      <Text style={styles.doctorInfo}>
      Terapeuta: {`${diagnostico.terapeuta.nombre}`}<br /> 
      </Text>
    </View>
  </View>
  <Text>FOLIO: {medicalData.folio}</Text>
</View>


        {/* Datos del Paciente */}
        <View style={styles.patientRow}>
          <Text style={styles.bold}>Nombre: </Text>
          <Text>{`${diagnostico.paciente.nombre} ${diagnostico.paciente.apellido}`}</Text>
          <Text style={styles.bold}>Edad: </Text>
          <Text style={styles.underlined}>{edad ?? 'N/A'}a</Text>         
        </View>

        {/* Sección Médica */}
        <View style={{ marginVertical: 10 }}>
          <Text style={styles.bold}>Diagnóstico:</Text>
          <Text>{diagnostico.descripcion}</Text>
        </View>

        {/* Tratamiento como medicamentos */}
        <View style={styles.medicationList}>
          <Text style={styles.bold}>Tratamiento:</Text>
          {medicalData.indicaciones.map((line, i) => (
            <Text key={i}>• {line.trim()}</Text>
          ))}
        </View>

        {/* Indicaciones */}
        <View style={{ marginTop: 15 }}>
          <Text style={styles.bold}>Indicaciones generales:</Text>
         
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text>{medicalData.direccion}</Text>
          <Text>Tel: {medicalData.telefono}</Text>
          <Text>Fecha: {fechaReporte}</Text>
          <View style={styles.signatureLine} />
          <Text>Firma del profesional</Text>
        </View>
      </Page>
    </Document>
  );
};

export default RecetaReport;
