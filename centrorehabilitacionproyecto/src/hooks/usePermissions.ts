import { useMemo, useCallback, useState, useEffect } from 'react';

/**
 * Interfaz para los datos de permisos del usuario
 */
interface UserPermissions {
  permissions: string[];
  permissionsByModule: Record<string, string[]>;
  roles: Array<{ id: number; nombre: string; is_admin: boolean }>;
  isAdmin: boolean;
}

/**
 * Permisos estáticos de respaldo (fallback)
 * Se usan solo si no hay permisos dinámicos en localStorage
 * 
 * Roles legacy:
 *   '1' = Administrador
 *   '0' = Terapeuta
 *   '2' = Encargado
 */
const FALLBACK_PERMISSIONS: Record<string, Record<string, string[]>> = {
  pacientes: {
    view: ['1', '0', '2'],
    create: ['1', '0'],
    update: ['1', '0'],
    delete: ['1'],
    alta: ['1', '0']  // Permiso especial para dar de alta
  },
  terapeutas: {
    view: ['1', '0'],
    create: ['1'],
    update: ['1'],
    delete: ['1']
  },
  citas: {
    view: ['1', '0', '2'],
    create: ['1', '0'],
    update: ['1', '0'],
    delete: ['1']
  },
  encargados: {
    view: ['1', '0', '2'],
    create: ['1', '0'],
    update: ['1', '0'],
    delete: ['1']
  },
  diagnosticos: {
    view: ['1', '0'],
    create: ['1', '0'],
    update: ['1', '0'],
    delete: ['1']
  },
  productos: {
    view: ['1'],
    create: ['1'],
    update: ['1'],
    delete: ['1']
  },
  compras: {
    view: ['1'],
    create: ['1'],
    update: ['1'],
    delete: ['1']
  },
  bodega: {
    view: ['1'],
    create: ['1'],
    update: ['1'],
    delete: ['1']
  },
  prestamos: {
    view: ['1'],
    create: ['1'],
    update: ['1'],
    delete: ['1']
  },
  usuarios: {
    view: ['1'],
    create: ['1'],
    update: ['1'],
    delete: ['1']
  },
  roles: {
    view: ['1'],
    create: ['1'],
    update: ['1'],
    delete: ['1']
  },
  // Permisos adicionales para terapeuta
  servicios: {
    view: ['1', '0'],
    create: ['1'],
    update: ['1'],
    delete: ['1']
  },
  recibos: {
    view: ['1', '0'],
    create: ['1'],
    update: ['1'],
    delete: ['1'],
    // Permisos especiales de recibos
    cobrar: ['1', '0'],
    imprimir: ['1', '0'],
    anular: ['1', '0']
  },
  cierres: {
    view: ['1', '0'],
    create: ['1'],
    update: ['1'],
    delete: ['1'],
    reabrir: ['1'] // Solo admin puede reabrir cierres
  }
};

/**
 * Obtiene los permisos del usuario desde localStorage
 */
function getUserPermissionsFromStorage(): UserPermissions | null {
  try {
    const permissionsStr = localStorage.getItem('permissions');
    const permissionsByModuleStr = localStorage.getItem('permissionsByModule');
    const rolesStr = localStorage.getItem('roles');
    const isAdminStr = localStorage.getItem('isAdmin');

    if (permissionsStr && permissionsByModuleStr) {
      return {
        permissions: JSON.parse(permissionsStr),
        permissionsByModule: JSON.parse(permissionsByModuleStr),
        roles: rolesStr ? JSON.parse(rolesStr) : [],
        isAdmin: isAdminStr === 'true'
      };
    }
  } catch (error) {
    console.error('Error parsing permissions from localStorage:', error);
  }
  return null;
}

/**
 * Hook para verificar permisos del usuario actual
 * Soporta tanto el sistema legacy (idRol) como el nuevo sistema dinámico
 * @returns Objeto con funciones para verificar permisos
 */
export const usePermissions = () => {
  // Cargar permisos de forma SÍNCRONA al inicializar (evita race condition)
  const userRole = localStorage.getItem('idRol') || '';
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(() => {
    return getUserPermissionsFromStorage();
  });

  // Recargar permisos si cambia el userRole (después de un nuevo login)
  useEffect(() => {
    const perms = getUserPermissionsFromStorage();
    setUserPermissions(perms);
  }, [userRole]);

  /**
   * Verifica si el usuario tiene un permiso específico
   * Prioriza el sistema dinámico, solo usa fallback si NO hay permisos dinámicos
   */
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    const slug = `${resource}.${action}`;

    // Si es admin (gate), tiene todos los permisos
    if (userPermissions?.isAdmin) {
      return true;
    }

    // Verificar si hay permisos dinámicos configurados
    const hasDynamicPermissions = userPermissions?.permissions && userPermissions.permissions.length > 0;

    if (hasDynamicPermissions) {
      // Sistema dinámico: verificar slug de permiso
      if (userPermissions.permissions.includes(slug)) {
        return true;
      }

      // Sistema dinámico: verificar por módulo
      if (userPermissions?.permissionsByModule?.[resource]) {
        if (userPermissions.permissionsByModule[resource].includes(action)) {
          return true;
        }
      }

      // Si hay permisos dinámicos pero NO tiene este permiso específico, retornar false
      // NO usar fallback cuando hay sistema dinámico activo
      return false;
    }

    // Fallback al sistema legacy SOLO si NO hay permisos dinámicos
    if (FALLBACK_PERMISSIONS[resource] && FALLBACK_PERMISSIONS[resource][action]) {
      if (FALLBACK_PERMISSIONS[resource][action].includes(userRole)) {
        return true;
      }
    }

    return false;
  }, [userPermissions, userRole]);

  const canView = useMemo(() => {
    return (resource: string): boolean => hasPermission(resource, 'view');
  }, [hasPermission]);

  const canCreate = useMemo(() => {
    return (resource: string): boolean => hasPermission(resource, 'create');
  }, [hasPermission]);

  const canUpdate = useMemo(() => {
    return (resource: string): boolean => hasPermission(resource, 'update');
  }, [hasPermission]);

  const canDelete = useMemo(() => {
    return (resource: string): boolean => hasPermission(resource, 'delete');
  }, [hasPermission]);

  /**
   * Verifica si el usuario es administrador (tiene gate)
   */
  const isAdmin = useMemo(() => {
    return userPermissions?.isAdmin || userRole === '1';
  }, [userPermissions, userRole]);

  /**
   * Obtiene todos los módulos a los que el usuario tiene acceso (view)
   */
  const getAccessibleModules = useCallback((): string[] => {
    const modules: string[] = [];
    
    // Si es admin, tiene acceso a todos
    if (isAdmin) {
      return Object.keys(FALLBACK_PERMISSIONS);
    }

    // Verificar cada módulo
    Object.keys(FALLBACK_PERMISSIONS).forEach(module => {
      if (hasPermission(module, 'view')) {
        modules.push(module);
      }
    });

    return modules;
  }, [isAdmin, hasPermission]);

  /**
   * Obtiene los roles del usuario actual
   */
  const getRoles = useCallback(() => {
    return userPermissions?.roles || [];
  }, [userPermissions]);

  /**
   * Obtiene todos los permisos del usuario como array de slugs
   */
  const getAllPermissions = useCallback((): string[] => {
    return userPermissions?.permissions || [];
  }, [userPermissions]);

  /**
   * Refresca los permisos desde localStorage
   */
  const refreshPermissions = useCallback(() => {
    const perms = getUserPermissionsFromStorage();
    setUserPermissions(perms);
  }, []);

  return {
    hasPermission,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    isAdmin,
    userRole,
    getAccessibleModules,
    getRoles,
    getAllPermissions,
    refreshPermissions,
    // Datos crudos para debugging
    _userPermissions: userPermissions
  };
};

/**
 * Guarda los permisos del usuario en localStorage
 * Llamar después del login exitoso
 */
export const saveUserPermissions = (loginResponse: {
  permissions: string[];
  permissionsByModule: Record<string, string[]>;
  roles: Array<{ id: number; nombre: string; is_admin: boolean }>;
  isAdmin: boolean;
}) => {
  localStorage.setItem('permissions', JSON.stringify(loginResponse.permissions));
  localStorage.setItem('permissionsByModule', JSON.stringify(loginResponse.permissionsByModule));
  localStorage.setItem('roles', JSON.stringify(loginResponse.roles));
  localStorage.setItem('isAdmin', String(loginResponse.isAdmin));
};

/**
 * Limpia los permisos del usuario del localStorage
 * Llamar al hacer logout
 */
export const clearUserPermissions = () => {
  localStorage.removeItem('permissions');
  localStorage.removeItem('permissionsByModule');
  localStorage.removeItem('roles');
  localStorage.removeItem('isAdmin');
};
