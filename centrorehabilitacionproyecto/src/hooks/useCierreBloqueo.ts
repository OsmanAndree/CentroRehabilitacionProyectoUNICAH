import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface CierreStatus {
    fecha: string;
    cierreBloqueado: boolean;
    cierreId: number | null;
    mensaje: string;
}

/**
 * Hook para verificar si el día actual está bloqueado por un cierre de caja.
 * 
 * Cuando existe un cierre activo para una fecha:
 * - No se pueden crear/editar citas de ese día
 * - No se pueden cobrar citas de ese día
 * - No se pueden crear/anular recibos de ese día
 * 
 * Al día siguiente, las operaciones vuelven a estar habilitadas.
 */
export const useCierreBloqueo = (fechaVerificar?: string) => {
    const [cierreStatus, setCierreStatus] = useState<CierreStatus | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getToken = () => localStorage.getItem('token');

    // Obtener fecha actual en formato YYYY-MM-DD
    const getFechaHoy = (): string => {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const verificarCierre = useCallback(async (fecha?: string) => {
        setLoading(true);
        setError(null);

        try {
            const fechaConsulta = fecha || fechaVerificar || getFechaHoy();
            const response = await axios.get(
                `http://localhost:3002/Api/cierres/verificarCierre?fecha=${fechaConsulta}`,
                {
                    headers: { Authorization: `Bearer ${getToken()}` }
                }
            );
            setCierreStatus(response.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al verificar cierre';
            setError(errorMessage);
            // En caso de error, asumir que NO está bloqueado para no impedir operaciones
            setCierreStatus({
                fecha: fechaVerificar || getFechaHoy(),
                cierreBloqueado: false,
                cierreId: null,
                mensaje: 'No se pudo verificar el estado del cierre'
            });
        } finally {
            setLoading(false);
        }
    }, [fechaVerificar]);

    useEffect(() => {
        verificarCierre();
    }, [verificarCierre]);

    /**
     * Verifica si una fecha específica está bloqueada
     * @param fecha Fecha en formato YYYY-MM-DD
     * @returns true si la fecha está bloqueada, false si no
     */
    const estaFechaBloqueada = useCallback(async (fecha: string): Promise<boolean> => {
        try {
            const response = await axios.get(
                `http://localhost:3002/Api/cierres/verificarCierre?fecha=${fecha}`,
                {
                    headers: { Authorization: `Bearer ${getToken()}` }
                }
            );
            return response.data.cierreBloqueado;
        } catch {
            return false; // En caso de error, permitir la operación
        }
    }, []);

    /**
     * Verifica si se puede realizar una operación para la fecha de hoy
     * @returns true si se puede operar, false si está bloqueado
     */
    const puedeOperarHoy = useCallback((): boolean => {
        if (!cierreStatus) return true; // Si no hay datos, permitir
        return !cierreStatus.cierreBloqueado;
    }, [cierreStatus]);

    /**
     * Verifica si se puede realizar una operación para una fecha específica
     * Usa el estado actual si la fecha coincide, sino hace una consulta
     */
    const puedeOperarFecha = useCallback((fecha: string): boolean => {
        if (!cierreStatus) return true;
        
        // Si la fecha consultada es la misma que tenemos en estado
        if (cierreStatus.fecha === fecha) {
            return !cierreStatus.cierreBloqueado;
        }
        
        // Para otras fechas, necesitamos verificar por separado
        // Por ahora retornamos true y el componente puede llamar a estaFechaBloqueada
        return true;
    }, [cierreStatus]);

    return {
        cierreStatus,
        loading,
        error,
        estaFechaBloqueada,
        puedeOperarHoy,
        puedeOperarFecha,
        verificarCierre,
        fechaHoy: getFechaHoy()
    };
};

export default useCierreBloqueo;

