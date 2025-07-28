import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Paciente } from '../Pacientes';

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
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        fontSize: 11,
        marginTop: 5,
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
    },
    tableRowAlternate: {
        backgroundColor: '#f1f1f1',
    },
    tableCell: {
        padding: 8,
        fontSize: 9,
        textAlign: 'center',
    },
    colNum: { width: '5%' },
    colName: { width: '25%', textAlign: 'left' },
    colDate: { width: '20%' },
    colPhone: { width: '20%' },
    colGuardian: { width: '30%', textAlign: 'left' },
});

const PacientesReport = ({ pacientes }: { pacientes: Paciente[] }) => (
    <Document>
        <Page size="A4" style={styles.page} orientation="landscape">
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Reporte de Pacientes</Text>
                <Text style={styles.headerSubtitle}>
                    Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
            </View>

            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.colNum]}>#</Text>
                    <Text style={[styles.tableCell, styles.colName]}>Nombre Completo</Text>
                    <Text style={[styles.tableCell, styles.colDate]}>Fecha de Nacimiento</Text>
                    <Text style={[styles.tableCell, styles.colPhone]}>Teléfono</Text>
                    <Text style={[styles.tableCell, styles.colGuardian]}>Encargado</Text>
                </View>

                {pacientes.map((paciente, index) => (
                    <View
                        style={[styles.tableRow, index % 2 !== 0 ? styles.tableRowAlternate : {}]}
                        key={paciente.id_paciente}
                    >
                        <Text style={[styles.tableCell, styles.colNum]}>{index + 1}</Text>
                        <Text style={[styles.tableCell, styles.colName]}>{`${paciente.nombre} ${paciente.apellido}`}</Text>
                        <Text style={[styles.tableCell, styles.colDate]}>{new Date(paciente.fecha_nacimiento).toLocaleDateString()}</Text>
                        <Text style={[styles.tableCell, styles.colPhone]}>{paciente.telefono}</Text>
                        <Text style={[styles.tableCell, styles.colGuardian]}>
                            {paciente.encargado ? `${paciente.encargado.nombre} ${paciente.encargado.apellido}` : "No asignado"}
                        </Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

export default PacientesReport;