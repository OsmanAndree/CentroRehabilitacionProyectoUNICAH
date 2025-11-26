import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Recibo } from '../Recibos';

interface ReciboReportProps {
  recibo: Recibo;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2E8B57',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E8B57',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2E8B57',
    padding: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1 solid #ddd',
    backgroundColor: '#ffffff',
  },
  tableCol1: {
    width: '60%',
  },
  tableCol2: {
    width: '40%',
    textAlign: 'right',
  },
  total: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: '2 solid #2E8B57',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1 solid #ddd',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

const ReciboReport: React.FC<ReciboReportProps> = ({ recibo }) => {
  if (!recibo) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Error: No se pudo cargar la información del recibo</Text>
        </Page>
      </Document>
    );
  }

  const fechaCobro = recibo.fecha_cobro 
    ? new Date(recibo.fecha_cobro).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';
  
  const totalRecibo = recibo.total || recibo.Cita?.total || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>RECIBO DE PAGO</Text>
          <Text style={styles.subtitle}>Centro de Rehabilitación</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Recibo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Número de Recibo:</Text>
            <Text style={styles.value}>{recibo.numero_recibo || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Cobro:</Text>
            <Text style={styles.value}>{fechaCobro}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={styles.value}>{recibo.estado || 'N/A'}</Text>
          </View>
        </View>

        {recibo.Cita && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información de la Cita</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Paciente:</Text>
                <Text style={styles.value}>
                  {recibo.Cita.paciente 
                    ? `${recibo.Cita.paciente.nombre} ${recibo.Cita.paciente.apellido}`
                    : 'N/A'}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Terapeuta:</Text>
                <Text style={styles.value}>
                  {recibo.Cita.terapeuta 
                    ? `${recibo.Cita.terapeuta.nombre} ${recibo.Cita.terapeuta.apellido}`
                    : 'N/A'}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha de Cita:</Text>
                <Text style={styles.value}>
                  {new Date(recibo.Cita.fecha).toLocaleDateString('es-ES')} - {recibo.Cita.hora_inicio}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Tipo de Terapia:</Text>
                <Text style={styles.value}>{recibo.Cita.tipo_terapia || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Desglose de Servicios</Text>
              {recibo.Cita.servicios && recibo.Cita.servicios.length > 0 ? (
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableCol1}>Descripción del Servicio</Text>
                    <Text style={styles.tableCol2}>Costo Unitario</Text>
                  </View>
                  {recibo.Cita.servicios.map((servicio, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCol1}>{servicio.nombre || 'N/A'}</Text>
                      <Text style={styles.tableCol2}>
                        L. {parseFloat((servicio.costo || 0).toString()).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.tableRow}>
                  <Text style={styles.tableCol1}>No se registraron servicios para esta cita</Text>
                  <Text style={styles.tableCol2}>L. 0.00</Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.total}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalValue}>
            L. {parseFloat(totalRecibo.toString()).toFixed(2)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Este es un recibo generado automáticamente por el sistema.</Text>
          <Text>Gracias por su preferencia.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReciboReport;

