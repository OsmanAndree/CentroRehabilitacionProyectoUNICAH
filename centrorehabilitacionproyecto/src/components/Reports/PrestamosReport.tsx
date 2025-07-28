import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Prestamo } from '../Prestamos';

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
        padding: 6,
        textAlign: 'center',
    },
    colNum: { width: '5%' },
    colPaciente: { width: '25%', textAlign: 'left' },
    colProducto: { width: '25%', textAlign: 'left' },
    colFechaP: { width: '15%' },
    colFechaD: { width: '15%' },
    colEstado: { width: '15%' },
    estadoPrestado: { color: '#28a745', fontWeight: 'bold' },
    estadoDevuelto: { color: '#007bff', fontWeight: 'bold' },
});

const formatDate = (dateString: string) => {
    if (!dateString) return 'Pendiente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
};

const PrestamosReport = ({ prestamos }: { prestamos: Prestamo[] }) => (
    <Document>
        <Page size="A4" style={styles.page} orientation="landscape">
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Reporte de Préstamos</Text>
            </View>

            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.colNum]}>#</Text>
                    <Text style={[styles.tableCell, styles.colPaciente]}>Paciente</Text>
                    <Text style={[styles.tableCell, styles.colProducto]}>Producto</Text>
                    <Text style={[styles.tableCell, styles.colFechaP]}>F. Préstamo</Text>
                    <Text style={[styles.tableCell, styles.colFechaD]}>F. Devolución</Text>
                    <Text style={[styles.tableCell, styles.colEstado]}>Estado</Text>
                </View>

                {prestamos.map((prestamo, index) => (
                    <View
                        style={[
                            styles.tableRow,
                            index % 2 !== 0 ? styles.tableRowAlternate : {},
                        ]}
                        key={prestamo.id_prestamo}
                    >
                        <Text style={[styles.tableCell, styles.colNum]}>{index + 1}</Text>
                        <Text style={[styles.tableCell, styles.colPaciente]}>
                            {prestamo.paciente ? `${prestamo.paciente.nombre} ${prestamo.paciente.apellido}` : 'N/A'}
                        </Text>
                        <Text style={[styles.tableCell, styles.colProducto]}>
                            {prestamo.producto ? prestamo.producto.nombre : 'N/A'}
                        </Text>
                        <Text style={[styles.tableCell, styles.colFechaP]}>
                            {formatDate(prestamo.fecha_prestamo)}
                        </Text>
                        <Text style={[styles.tableCell, styles.colFechaD]}>
                            {formatDate(prestamo.fecha_devolucion)}
                        </Text>
                        <Text style={[
                            styles.tableCell,
                            styles.colEstado,
                            prestamo.estado === 'Prestado' ? styles.estadoPrestado : styles.estadoDevuelto
                        ]}>
                            {prestamo.estado}
                        </Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

export default PrestamosReport;