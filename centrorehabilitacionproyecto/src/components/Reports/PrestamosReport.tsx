import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

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
        padding: 8,
        fontSize: 10,
        textAlign: 'center',
        width: '100%',
    },
    tableCell: {
        padding: 8,
        fontSize: 10,
        textAlign: 'center',
        width: '100%',
    },
    columnNumber: {
        width: '5%',
    },
    columnPaciente: {
        width: '25%',
    },
    columnProducto: {
        width: '25%',
    },
    columnFechaPrestamo: {
        width: '15%',
    },
    columnFechaDevolucion: {
        width: '15%',
    },
    columnEstado: {
        width: '15%',
    },
    estadoPrestado: {
        color: '#28a745',
        fontWeight: 'bold',
    },
    estadoDevuelto: {
        color: '#007bff',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 10,
        color: '#6c757d',
        fontFamily: 'Poppins',
    },
    cellContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

interface Prestamo {
    id_prestamo: number;
    id_paciente: number;
    id_producto: number;
    fecha_prestamo: string;
    fecha_devolucion: string;
    estado: 'Prestado' | 'Devuelto';
    paciente?: {
        nombre: string;
        apellido: string;
    };
    producto?: {
        nombre: string;
        descripcion: string;
    };
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'Pendiente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const PrestamosReport = ({ prestamos }: { prestamos: Prestamo[] }) => (
    <Document>
        <Page size="A4" style={styles.page} orientation="landscape">
            {/* Encabezado del reporte */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Reporte de Préstamos</Text>
                <Text style={styles.headerSubtitle}>
                    Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
            </View>

            {/* Tabla de préstamos */}
            <View style={styles.table}>
                {/* Encabezados de la tabla */}
                <View style={styles.tableHeader}>
                    <View style={[styles.cellContainer, styles.columnNumber]}>
                        <Text style={styles.tableCellHeader}>#</Text>
                    </View>
                    <View style={[styles.cellContainer, styles.columnPaciente]}>
                        <Text style={styles.tableCellHeader}>Paciente</Text>
                    </View>
                    <View style={[styles.cellContainer, styles.columnProducto]}>
                        <Text style={styles.tableCellHeader}>Producto</Text>
                    </View>
                    <View style={[styles.cellContainer, styles.columnFechaPrestamo]}>
                        <Text style={styles.tableCellHeader}>Fecha Préstamo</Text>
                    </View>
                    <View style={[styles.cellContainer, styles.columnFechaDevolucion]}>
                        <Text style={styles.tableCellHeader}>Fecha Devolución</Text>
                    </View>
                    <View style={[styles.cellContainer, styles.columnEstado]}>
                        <Text style={styles.tableCellHeader}>Estado</Text>
                    </View>
                </View>

                {/* Filas de la tabla */}
                {prestamos.map((prestamo, index) => (
                    <View
                        style={[
                            styles.tableRow,
                            index % 2 !== 0 ? styles.tableRowAlternate : {}, 
                        ]}
                        key={prestamo.id_prestamo}
                    >
                        <View style={[styles.cellContainer, styles.columnNumber]}>
                            <Text style={styles.tableCell}>{index + 1}</Text>
                        </View>
                        <View style={[styles.cellContainer, styles.columnPaciente]}>
                            <Text style={styles.tableCell}>
                                {prestamo.paciente ? `${prestamo.paciente.nombre} ${prestamo.paciente.apellido}` : 'N/A'}
                            </Text>
                        </View>
                        <View style={[styles.cellContainer, styles.columnProducto]}>
                            <Text style={styles.tableCell}>
                                {prestamo.producto ? prestamo.producto.nombre : 'N/A'}
                            </Text>
                        </View>
                        <View style={[styles.cellContainer, styles.columnFechaPrestamo]}>
                            <Text style={styles.tableCell}>
                                {formatDate(prestamo.fecha_prestamo)}
                            </Text>
                        </View>
                        <View style={[styles.cellContainer, styles.columnFechaDevolucion]}>
                            <Text style={styles.tableCell}>
                                {formatDate(prestamo.fecha_devolucion)}
                            </Text>
                        </View>
                        <View style={[styles.cellContainer, styles.columnEstado]}>
                            <Text style={[
                                styles.tableCell, 
                                prestamo.estado === 'Prestado' ? styles.estadoPrestado : styles.estadoDevuelto
                            ]}>
                                {prestamo.estado}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Pie de página */}
            <Text style={styles.footer}>
                Generado por el Sistema de Gestión de Préstamos - {new Date().toLocaleDateString('es-ES')}
            </Text>
        </Page>
    </Document>
);

export default PrestamosReport;