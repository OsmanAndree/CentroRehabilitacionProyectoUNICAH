import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Prestamo } from '../Prestamos';

interface PrestamosReportProps {
    prestamos: Prestamo[];
    tipo?: 'general' | 'individual';
}

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
        backgroundColor: '#ffffff',
    },
    headerContainer: {
        marginBottom: 15,
        padding: 12,
        backgroundColor: '#2E8B57',
        borderRadius: 8,
        textAlign: 'center',
        color: 'white',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    headerSubtitle: {
        fontSize: 10,
        opacity: 0.9,
    },
    formContainer: {
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#fafafa',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2E8B57',
        marginTop: 10,
        marginBottom: 8,
        borderBottom: '2px solid #2E8B57',
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    label: {
        width: '35%',
        fontSize: 9,
        fontWeight: 'bold',
        color: '#333',
    },
    value: {
        width: '65%',
        fontSize: 9,
        color: '#555',
        borderBottom: '1px solid #ccc',
        paddingBottom: 2,
        minHeight: 12,
    },
    fullRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    fullLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    fullValue: {
        fontSize: 9,
        color: '#555',
        borderBottom: '1px solid #ccc',
        paddingBottom: 2,
        minHeight: 12,
        width: '100%',
    },
    referenceSection: {
        marginTop: 8,
        marginBottom: 8,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        border: '1px solid #ddd',
    },
    signatureSection: {
        marginTop: 10,
        paddingTop: 10,
        borderTop: '2px solid #2E8B57',
        minHeight: 60,
    },
    signatureLine: {
        borderTop: '1px solid #333',
        width: '45%',
        marginTop: 25,
        paddingTop: 4,
    },
    signatureLabel: {
        fontSize: 8,
        textAlign: 'center',
        color: '#666',
    },
    pageBreak: {
        marginBottom: 30,
    },
    // Estilos para tabla general
    table: {
        width: '100%',
        marginTop: 15,
    },
    tableHeader: {
        backgroundColor: '#2E8B57',
        flexDirection: 'row',
        color: 'white',
        fontWeight: 'bold',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#dcdcdc',
        padding: 6,
    },
    tableRowAlternate: {
        backgroundColor: '#f8f9fa',
    },
    tableCell: {
        padding: 5,
        fontSize: 9,
    },
    colNum: { width: '5%', textAlign: 'center' },
    colPaciente: { width: '20%', textAlign: 'left' },
    colProducto: { width: '20%', textAlign: 'left' },
    colFechaP: { width: '12%', textAlign: 'center' },
    colFechaD: { width: '12%', textAlign: 'center' },
    colTipo: { width: '10%', textAlign: 'center' },
    colEstado: { width: '10%', textAlign: 'center' },
    colPeriodo: { width: '11%', textAlign: 'center' },
});

const formatDate = (dateString: string) => {
    if (!dateString) return 'Pendiente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatDateShort = (dateString: string) => {
    if (!dateString) return 'Pendiente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
};

// Componente para tabla general
const TablaGeneral = ({ prestamos }: { prestamos: Prestamo[] }) => (
    <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Reporte General de Préstamos</Text>
            <Text style={styles.headerSubtitle}>Centro de Rehabilitación</Text>
        </View>

        <View style={styles.table}>
            <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.colNum]}>#</Text>
                <Text style={[styles.tableCell, styles.colPaciente]}>Paciente</Text>
                <Text style={[styles.tableCell, styles.colProducto]}>Producto</Text>
                <Text style={[styles.tableCell, styles.colFechaP]}>F. Préstamo</Text>
                <Text style={[styles.tableCell, styles.colFechaD]}>F. Devolución</Text>
                <Text style={[styles.tableCell, styles.colTipo]}>Tipo</Text>
                <Text style={[styles.tableCell, styles.colPeriodo]}>Periodo</Text>
                <Text style={[styles.tableCell, styles.colEstado]}>Estado</Text>
            </View>

            {prestamos.map((prestamo, index) => (
                <View
                    key={prestamo.id_prestamo}
                    style={[
                        styles.tableRow,
                        index % 2 !== 0 ? styles.tableRowAlternate : {},
                    ]}
                >
                    <Text style={[styles.tableCell, styles.colNum]}>{index + 1}</Text>
                    <Text style={[styles.tableCell, styles.colPaciente]}>
                        {prestamo.paciente ? `${prestamo.paciente.nombre} ${prestamo.paciente.apellido}` : 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colProducto]}>
                        {prestamo.producto ? prestamo.producto.nombre : 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colFechaP]}>
                        {formatDateShort(prestamo.fecha_prestamo)}
                    </Text>
                    <Text style={[styles.tableCell, styles.colFechaD]}>
                        {formatDateShort(prestamo.fecha_devolucion)}
                    </Text>
                    <Text style={[styles.tableCell, styles.colTipo]}>
                        {prestamo.tipo === 'Donacion' ? 'Donación' : 'Préstamo'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colPeriodo]}>
                        {prestamo.periodo_prestamo || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colEstado]}>
                        {prestamo.estado}
                    </Text>
                </View>
            ))}
        </View>
    </Page>
);

// Componente para reporte individual detallado
const ReporteIndividual = ({ prestamos }: { prestamos: Prestamo[] }) => (
    <>
        {prestamos.map((prestamo, index) => (
            <Page key={prestamo.id_prestamo} size="A4" style={styles.page}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>
                        {prestamo.tipo === 'Donacion' ? 'FORMATO DE DONACIÓN' : 'FORMATO DE PRÉSTAMO'}
                    </Text>
                    <Text style={styles.headerSubtitle}>Centro de Rehabilitación</Text>
                </View>

                <View style={styles.formContainer}>
                    {/* Información del Beneficiado */}
                    <Text style={styles.sectionTitle}>DATOS DEL BENEFICIADO</Text>
                    
                    <View style={styles.row}>
                        <Text style={styles.label}>Nombre Completo:</Text>
                        <Text style={styles.value}>
                            {prestamo.paciente ? `${prestamo.paciente.nombre} ${prestamo.paciente.apellido}` : 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Dirección:</Text>
                        <Text style={styles.value}>
                            {prestamo.paciente?.direccion || 'No especificada'}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Teléfono:</Text>
                        <Text style={styles.value}>
                            {prestamo.paciente?.telefono || 'No especificado'}
                        </Text>
                    </View>

                    {/* Información del Préstamo/Donación */}
                    <Text style={styles.sectionTitle}>INFORMACIÓN DEL {prestamo.tipo === 'Donacion' ? 'ARTÍCULO DONADO' : 'PRÉSTAMO'}</Text>
                    
                    <View style={styles.row}>
                        <Text style={styles.label}>Artículo/Producto:</Text>
                        <Text style={styles.value}>
                            {prestamo.producto ? prestamo.producto.nombre : 'N/A'}
                        </Text>
                    </View>

                    {prestamo.producto?.descripcion && (
                        <View style={styles.fullRow}>
                            <View>
                                <Text style={styles.fullLabel}>Descripción:</Text>
                                <Text style={styles.fullValue}>{prestamo.producto.descripcion}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.row}>
                        <Text style={styles.label}>Tipo:</Text>
                        <Text style={styles.value}>
                            {prestamo.tipo === 'Donacion' ? 'Donación' : 'Préstamo'}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha del {prestamo.tipo === 'Donacion' ? 'Registro' : 'Préstamo'}:</Text>
                        <Text style={styles.value}>{formatDate(prestamo.fecha_prestamo)}</Text>
                    </View>

                    {prestamo.periodo_prestamo && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Periodo del Préstamo:</Text>
                            <Text style={styles.value}>{prestamo.periodo_prestamo}</Text>
                        </View>
                    )}

                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha de Devolución:</Text>
                        <Text style={styles.value}>{formatDate(prestamo.fecha_devolucion)}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Estado:</Text>
                        <Text style={styles.value}>{prestamo.estado}</Text>
                    </View>

                    {/* Referencias y Firmas - Agrupadas para evitar cortes */}
                    <View break={false} wrap={false}>
                        {/* Referencias */}
                        {(prestamo.referencia1_nombre || prestamo.referencia2_nombre) && (
                            <>
                                <Text style={styles.sectionTitle}>REFERENCIAS</Text>
                                
                                {prestamo.referencia1_nombre && (
                                    <View style={styles.referenceSection}>
                                        <Text style={styles.fullLabel}>REFERENCIA 1:</Text>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>Nombre:</Text>
                                            <Text style={styles.value}>{prestamo.referencia1_nombre}</Text>
                                        </View>
                                        {prestamo.referencia1_direccion && (
                                            <View style={styles.row}>
                                                <Text style={styles.label}>Dirección:</Text>
                                                <Text style={styles.value}>{prestamo.referencia1_direccion}</Text>
                                            </View>
                                        )}
                                        {prestamo.referencia1_telefono && (
                                            <View style={styles.row}>
                                                <Text style={styles.label}>Teléfono:</Text>
                                                <Text style={styles.value}>{prestamo.referencia1_telefono}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {prestamo.referencia2_nombre && (
                                    <View style={styles.referenceSection}>
                                        <Text style={styles.fullLabel}>REFERENCIA 2:</Text>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>Nombre:</Text>
                                            <Text style={styles.value}>{prestamo.referencia2_nombre}</Text>
                                        </View>
                                        {prestamo.referencia2_direccion && (
                                            <View style={styles.row}>
                                                <Text style={styles.label}>Dirección:</Text>
                                                <Text style={styles.value}>{prestamo.referencia2_direccion}</Text>
                                            </View>
                                        )}
                                        {prestamo.referencia2_telefono && (
                                            <View style={styles.row}>
                                                <Text style={styles.label}>Teléfono:</Text>
                                                <Text style={styles.value}>{prestamo.referencia2_telefono}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </>
                        )}

                        {/* Sección de Firmas */}
                        <View style={styles.signatureSection} break={false}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={styles.signatureLine}>
                                    <Text style={styles.signatureLabel}>
                                        Firma del Beneficiado
                                    </Text>
                                </View>
                                <View style={styles.signatureLine}>
                                    <Text style={styles.signatureLabel}>
                                        Firma del Responsable
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        ))}
    </>
);

// Componente principal que decide qué mostrar
const PrestamosReport = ({ prestamos, tipo = 'individual' }: PrestamosReportProps) => (
    <Document>
        {tipo === 'general' ? (
            <TablaGeneral prestamos={prestamos} />
        ) : (
            <ReporteIndividual prestamos={prestamos} />
        )}
    </Document>
);

export default PrestamosReport;