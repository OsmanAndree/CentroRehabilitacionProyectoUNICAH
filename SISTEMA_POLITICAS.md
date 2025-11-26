# Sistema de Políticas y Permisos

## Resumen

Se ha implementado un sistema completo de políticas y permisos que controla el acceso a recursos tanto en el backend como en el frontend, evitando peticiones innecesarias y mejorando la seguridad.

## Backend

### 1. Sistema de Políticas (`api/app/policies/policies.js`)

Define los permisos por rol y recurso:
- **Administrador (idRol: 1)**: Acceso completo a todos los recursos
- **Terapeuta (idRol: 0)**: Acceso limitado (puede ver/crear/editar pacientes, citas, diagnósticos, etc., pero no eliminar)
- **Encargado (idRol: 2)**: Acceso de solo lectura a pacientes, citas y encargados

### 2. Middleware de Autenticación (`api/app/middlewares/auth.js`)

- Verifica el token JWT en el header `Authorization`
- Extrae información del usuario (userId, nombre, rol) del token
- Guarda la información en `req.user` para uso posterior

### 3. Middleware de Autorización (`api/app/middlewares/authorization.js`)

- Verifica permisos usando las políticas definidas
- Función `authorize(resource, action)`: Verifica un permiso específico
- Función `authorizeAny(permissions)`: Verifica múltiples permisos (OR lógico)

### 4. Rutas Protegidas

Todas las rutas (excepto login) ahora requieren:
1. Autenticación (`isAuth`)
2. Autorización (`authorize(resource, action)`)

Ejemplo:
```javascript
router.get('/getpacientes', isAuth, authorize('pacientes', 'view'), pacienteController.getpacientes);
```

## Frontend

### 1. Utilidad de API (`centrorehabilitacionproyecto/src/utils/api.ts`)

- Instancia de axios configurada con interceptor
- Agrega automáticamente el token JWT a todas las peticiones
- Maneja errores de autenticación (403) redirigiendo al login

### 2. Hook de Permisos (`centrorehabilitacionproyecto/src/hooks/usePermissions.ts`)

Hook React que proporciona:
- `canView(resource)`: Verifica permiso de lectura
- `canCreate(resource)`: Verifica permiso de creación
- `canUpdate(resource)`: Verifica permiso de actualización
- `canDelete(resource)`: Verifica permiso de eliminación
- `hasPermission(resource, action)`: Verificación genérica

### 3. Login Actualizado

- Guarda el token JWT en `localStorage` después del login exitoso
- El token se envía automáticamente en todas las peticiones

### 4. Componentes Actualizados

Los componentes ahora:
- Verifican permisos antes de hacer peticiones al backend
- Muestran mensajes de error si no tienen permisos
- Ocultos botones/acciones según los permisos del usuario

Ejemplo en `Pacientes.tsx`:
```typescript
const { canView, canCreate, canUpdate, canDelete } = usePermissions();

useEffect(() => {
  if (canView('pacientes')) {
    dispatch(fetchPacientes({ page: currentPage, limit: itemsPerPage, search }));
  } else {
    toast.error("No tienes permiso para ver pacientes");
  }
}, [canView, ...]);
```

## Beneficios

1. **Seguridad**: El backend valida todos los permisos, no solo el frontend
2. **Performance**: Evita peticiones innecesarias al backend
3. **UX**: Mensajes claros cuando el usuario no tiene permisos
4. **Mantenibilidad**: Políticas centralizadas, fáciles de modificar
5. **Escalabilidad**: Fácil agregar nuevos roles y permisos

## Cómo Agregar Nuevos Permisos

1. **Backend**: Editar `api/app/policies/policies.js` y agregar el recurso con sus permisos
2. **Frontend**: Actualizar `centrorehabilitacionproyecto/src/hooks/usePermissions.ts` con los mismos permisos
3. **Rutas**: Aplicar `authorize(resource, action)` a las rutas correspondientes
4. **Componentes**: Usar `usePermissions()` para verificar permisos antes de acciones

## Notas Importantes

- El token JWT expira después de 14 días
- Si el token expira o es inválido, el usuario es redirigido al login
- Los permisos se verifican tanto en frontend (UX) como en backend (seguridad)
- El sistema soporta múltiples roles con diferentes niveles de acceso

