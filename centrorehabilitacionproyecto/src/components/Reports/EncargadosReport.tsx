import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Encargado } from '../Encargados';

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
        padding: 8,
        fontSize: 9,
    },
    colNum: { width: '5%', textAlign: 'center' },
    colName: { width: '30%', textAlign: 'left' },
    colPhone: { width: '25%', textAlign: 'center' },
    colAddress: { width: '40%', textAlign: 'left' },
});

const EncargadosReport = ({ encargados }: { encargados: Encargado[] }) => (
    <Document>
        <Page size="A4" style={styles.page} orientation="landscape">
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Reporte de Encargados</Text>
            </View>

            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.colNum]}>#</Text>
                    <Text style={[styles.tableCell, styles.colName]}>Nombre Completo</Text>
                    <Text style={[styles.tableCell, styles.colPhone]}>Teléfono</Text>
                    <Text style={[styles.tableCell, styles.colAddress]}>Dirección</Text>
                </View>

                {encargados.map((encargado, index) => (
                    <View
                        style={[
                            styles.tableRow,
                            index % 2 !== 0 ? styles.tableRowAlternate : {}, 
                        ]}
                        key={encargado.id_encargado}
                    >
                        <Text style={[styles.tableCell, styles.colNum]}>{index + 1}</Text>
                        <Text style={[styles.tableCell, styles.colName]}>{`${encargado.nombre} ${encargado.apellido}`}</Text>
                        <Text style={[styles.tableCell, styles.colPhone]}>{encargado.telefono}</Text>
                        <Text style={[styles.tableCell, styles.colAddress]}>{encargado.direccion}</Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

export default EncargadosReport;