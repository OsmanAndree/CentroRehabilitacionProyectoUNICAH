import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Encargado } from '../Encargados';

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

const EncargadosReport = ({ encargados }: { encargados: Encargado[] }) => (
    <Document>
        <Page size="A4" style={styles.page} orientation="landscape">
            {/* Encabezado del reporte */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Reporte de Encargados</Text>
                <Text style={styles.headerSubtitle}>
                    Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
            </View>

            {/* Tabla de encargados */}
            <View style={styles.table}>
                {/* Encabezados de la tabla */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableCellHeader, styles.columnNumber]}>#</Text>
                    <Text style={[styles.tableCellHeader, styles.columnName]}>Nombre Completo</Text>
                    <Text style={[styles.tableCellHeader, styles.columnDate]}>Teléfono</Text>
                    <Text style={[styles.tableCellHeader, styles.columnAddress]}>Direccion</Text>
                </View>

                {/* Filas de la tabla */}
                {encargados.map((encargado, index) => (
                    <View
                        style={[
                            styles.tableRow,
                            index % 2 !== 0 ? styles.tableRowAlternate : {}, 
                        ]}
                        key={encargado.id_encargado}
                    >
                        <Text style={[styles.tableCell, styles.columnNumber]}>{index + 1}</Text>
                        <Text style={[styles.tableCell, styles.columnName]}>{`${encargado.nombre} ${encargado.apellido}`}</Text>
                        <Text style={[styles.tableCell, styles.columnDate]}>{encargado.telefono}</Text>
                        <Text style={[styles.tableCell, styles.columnAddress]}>{encargado.direccion}</Text>
                    </View>
                ))}
            </View>

            {/* Pie de página */}
            <Text style={styles.footer}>
                Generado por el Sistema de Gestión de Encargados - {new Date().toLocaleDateString('es-ES')}
            </Text>
        </Page>
    </Document>
);

export default EncargadosReport;