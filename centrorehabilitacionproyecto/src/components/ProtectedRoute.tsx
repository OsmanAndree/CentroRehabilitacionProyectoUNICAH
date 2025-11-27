import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Permiso requerido para acceder (ej: "productos.view") */
  requiredPermission?: string;
  /** Módulo requerido - verificará permiso de view (ej: "productos") */
  module?: string;
  /** Si true, solo administradores pueden acceder */
  adminOnly?: boolean;
  /** @deprecated - Usar requiredPermission o module en su lugar */
  allowedRoles?: string[];
}

/**
 * Componente de ruta protegida
 * Verifica permisos antes de renderizar el componente hijo
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  module,
  adminOnly = false,
  allowedRoles 
}) => {
  const { hasPermission, canView, isAdmin, userRole } = usePermissions();

  // Verificar si hay token (usuario autenticado)
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si se requiere ser admin
  if (adminOnly) {
    if (!isAdmin) {
      console.log('[ProtectedRoute] Acceso denegado: Se requiere ser administrador');
      return <Navigate to="/home" replace />;
    }
    return <>{children}</>;
  }

  // Verificar permiso específico
  if (requiredPermission) {
    const [resource, action] = requiredPermission.split('.');
    if (hasPermission(resource, action)) {
      return <>{children}</>;
    }
    console.log(`[ProtectedRoute] Acceso denegado: No tiene permiso ${requiredPermission}`);
    return <Navigate to="/home" replace />;
  }

  // Verificar acceso a módulo (permiso view)
  if (module) {
    if (canView(module)) {
      return <>{children}</>;
    }
    console.log(`[ProtectedRoute] Acceso denegado: No puede ver módulo ${module}`);
    return <Navigate to="/home" replace />;
  }

  // Sistema legacy (compatibilidad hacia atrás)
  if (allowedRoles && allowedRoles.length > 0) {
    // Si es admin, tiene acceso a todo
    if (isAdmin) {
      return <>{children}</>;
    }
    
    // Verificar si el rol actual está en los roles permitidos
    if (allowedRoles.includes(userRole)) {
      return <>{children}</>;
    }
    
    console.log(`[ProtectedRoute] Acceso denegado (legacy): Rol ${userRole} no está en ${allowedRoles.join(', ')}`);
    return <Navigate to="/home" replace />;
  }

  // Si no hay restricciones específicas, permitir acceso
  return <>{children}</>;
};

export default ProtectedRoute;
