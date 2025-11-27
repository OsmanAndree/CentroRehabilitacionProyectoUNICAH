# 🔐 Sistema de Roles y Permisos - Guía del Desarrollador

## 📋 Índice
1. [Arquitectura General](#arquitectura-general)
2. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
3. [Convención de Nombres (Slugs)](#convención-de-nombres-slugs)
4. [Cómo Agregar un Nuevo Módulo](#cómo-agregar-un-nuevo-módulo)
5. [Proteger Rutas en el Backend](#proteger-rutas-en-el-backend)
6. [Controlar UI en el Frontend](#controlar-ui-en-el-frontend)
7. [Permisos Especiales](#permisos-especiales)
8. [Comandos Útiles](#comandos-útiles)

---

## 🏗️ Arquitectura General

El sistema está basado en **RBAC (Role-Based Access Control)** similar a Spatie/Laravel:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuario   │────▶│    Roles    │────▶│  Permisos   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │                    │
       │            user_roles           role_permissions
       │           (pivot table)         (pivot table)
       │                  │                    │
       └──────────────────┴────────────────────┘
```

### Flujo de Verificación:
1. Usuario inicia sesión → Backend devuelve permisos
2. Frontend guarda permisos en `localStorage`
3. Hook `usePermissions()` lee permisos y expone funciones
4. Componentes usan `canView()`, `canCreate()`, etc.
5. Backend valida con middleware `checkPermission()`

---

## 🗃️ Estructura de la Base de Datos

### Tablas Principales:

```sql
-- Roles del sistema
roles (
    id_role INT PRIMARY KEY,
    nombre VARCHAR(50),        -- "Administrador", "Terapeuta"
    descripcion TEXT,
    is_admin BOOLEAN           -- TRUE = Gate (acceso total)
)

-- Permisos individuales
permissions (
    id_permission INT PRIMARY KEY,
    nombre VARCHAR(100),       -- "Ver Pacientes"
    slug VARCHAR(100) UNIQUE,  -- "pacientes.view" ← IMPORTANTE
    modulo VARCHAR(50),        -- "pacientes"
    descripcion TEXT
)

-- Relación Usuario ↔ Roles
user_roles (
    id_usuario INT,
    id_role INT,
    PRIMARY KEY (id_usuario, id_role)
)

-- Relación Rol ↔ Permisos
role_permissions (
    id_role INT,
    id_permission INT,
    PRIMARY KEY (id_role, id_permission)
)
```

---

## 🏷️ Convención de Nombres (Slugs)

### Formato Estándar:
```
{modulo}.{accion}
```

### Acciones CRUD Estándar:
| Acción | Slug | Descripción |
|--------|------|-------------|
| Ver | `modulo.view` | Ver listado y detalles |
| Crear | `modulo.create` | Crear nuevos registros |
| Actualizar | `modulo.update` | Editar registros |
| Eliminar | `modulo.delete` | Eliminar registros |

### Ejemplos:
```
pacientes.view      → Ver lista de pacientes
pacientes.create    → Crear nuevo paciente
pacientes.update    → Editar paciente
pacientes.delete    → Eliminar paciente
recibos.cobrar      → Acción especial: cobrar cita
recibos.imprimir    → Acción especial: imprimir recibo
recibos.anular      → Acción especial: anular recibo
cierres.reabrir     → Acción especial: reabrir un cierre de caja
```

### ⚠️ Regla de Oro:
> **El slug del módulo DEBE coincidir con el nombre usado en el frontend y backend**

---

## ➕ Cómo Agregar un Nuevo Módulo

### Ejemplo: Agregar módulo "reportes"

### Paso 1: Backend - Agregar al Script de Sincronización

**Archivo:** `api/app/scripts/syncPermissions.js`

```javascript
// 1. Agregar a la lista de MODULES
const MODULES = [
    // ... módulos existentes ...
    { slug: 'reportes', nombre: 'Reportes', descripcion: 'Gestión de reportes del sistema' },
];
```

### Paso 2: Backend - Crear el Controlador

**Archivo:** `api/app/controllers/reportesController.js`

```javascript
const db = require('../config/db');

const getReportes = async (req, res) => {
    // Lógica del controlador
};

module.exports = { getReportes, /* ... */ };
```

### Paso 3: Backend - Crear las Rutas con Middleware

**Archivo:** `api/app/routes/reportesRoute.js`

```javascript
const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

// Proteger cada ruta con el permiso correspondiente
router.get('/getReportes', 
    isAuth, 
    checkPermission('reportes.view'),     // ← Permiso requerido
    reportesController.getReportes
);

router.post('/createReporte', 
    isAuth, 
    checkPermission('reportes.create'),   // ← Permiso requerido
    reportesController.createReporte
);

module.exports = router;
```

### Paso 4: Backend - Registrar Ruta en app.js

**Archivo:** `api/app/app.js`

```javascript
const reportesRoutes = require('./routes/reportesRoute');
App.use('/Api/reportes', reportesRoutes);
```

### Paso 5: Frontend - Crear el Componente

**Archivo:** `src/components/Reportes.tsx`

```tsx
import { usePermissions } from '../hooks/usePermissions';

function ReportesTable() {
    const { canCreate, canUpdate, canDelete } = usePermissions();
    
    return (
        <Container>
            {/* Botón crear - solo si tiene permiso */}
            {canCreate('reportes') && (
                <Button onClick={crearReporte}>
                    Nuevo Reporte
                </Button>
            )}
            
            {/* Tabla con acciones controladas */}
            {reportes.map(reporte => (
                <tr key={reporte.id}>
                    <td>{reporte.nombre}</td>
                    <td>
                        {canUpdate('reportes') && (
                            <Button onClick={() => editar(reporte)}>Editar</Button>
                        )}
                        {canDelete('reportes') && (
                            <Button onClick={() => eliminar(reporte.id)}>Eliminar</Button>
                        )}
                    </td>
                </tr>
            ))}
        </Container>
    );
}
```

### Paso 6: Frontend - Agregar Ruta Protegida

**Archivo:** `src/App.tsx`

```tsx
import ReportesTable from './components/Reportes';

<Route 
    path="/reportes" 
    element={
        <ProtectedRoute module="reportes">  {/* ← Protección por módulo */}
            <ReportesTable />
        </ProtectedRoute>
    } 
/>
```

### Paso 7: Frontend - Agregar al Home y NavBar

**Archivo:** `src/components/Home.tsx`

```tsx
const cardsData = [
    // ... cards existentes ...
    { 
        path: "/reportes", 
        title: "Control de Reportes", 
        text: "Gestiona reportes del sistema.",
        icon: <FaFileAlt size={48} />,
        resource: "reportes"  // ← Debe coincidir con el slug
    },
];
```

### Paso 8: Ejecutar Sincronización

```bash
cd api
npm run permissions:sync
```

---

## 🛡️ Proteger Rutas en el Backend

### Middleware disponibles:

```javascript
const { checkPermission, isAdmin, checkAnyPermission } = require('../middlewares/checkPermission');

// 1. Verificar UN permiso específico
router.get('/ruta', isAuth, checkPermission('modulo.accion'), controller);

// 2. Verificar si es Admin (Gate)
router.get('/ruta', isAuth, isAdmin(), controller);

// 3. Verificar CUALQUIERA de varios permisos
router.get('/ruta', isAuth, checkAnyPermission(['modulo.view', 'otro.view']), controller);
```

### Ejemplo completo de rutas:

```javascript
// Solo lectura
router.get('/get', isAuth, checkPermission('modulo.view'), controller.get);

// CRUD completo
router.post('/create', isAuth, checkPermission('modulo.create'), controller.create);
router.put('/update', isAuth, checkPermission('modulo.update'), controller.update);
router.delete('/delete', isAuth, checkPermission('modulo.delete'), controller.delete);

// Acción especial
router.post('/accionEspecial', isAuth, checkPermission('modulo.accionEspecial'), controller.accion);
```

---

## 🎨 Controlar UI en el Frontend

### Hook `usePermissions()`

```tsx
import { usePermissions } from '../hooks/usePermissions';

function MiComponente() {
    const { 
        canView,        // (resource) => boolean
        canCreate,      // (resource) => boolean
        canUpdate,      // (resource) => boolean
        canDelete,      // (resource) => boolean
        hasPermission,  // (resource, action) => boolean
        isAdmin,        // boolean - true si tiene Gate
        userRole        // string - rol legacy ('0', '1', '2')
    } = usePermissions();
    
    return (
        <div>
            {/* Verificación CRUD estándar */}
            {canView('pacientes') && <ListaPacientes />}
            {canCreate('pacientes') && <BotonCrear />}
            {canUpdate('pacientes') && <BotonEditar />}
            {canDelete('pacientes') && <BotonEliminar />}
            
            {/* Verificación de permiso especial */}
            {hasPermission('recibos', 'cobrar') && <BotonCobrar />}
            {hasPermission('recibos', 'imprimir') && <BotonImprimir />}
        </div>
    );
}
```

### Proteger Rutas con `ProtectedRoute`

```tsx
// Por módulo (verifica permiso .view)
<ProtectedRoute module="pacientes">
    <PacientesTable />
</ProtectedRoute>

// Por permiso específico
<ProtectedRoute requiredPermission="reportes.export">
    <ExportarReportes />
</ProtectedRoute>

// Solo administradores
<ProtectedRoute adminOnly>
    <ConfiguracionSistema />
</ProtectedRoute>
```

---

## ⚡ Permisos Especiales

Para acciones que no son CRUD estándar:

### Paso 1: Agregar al Script

```javascript
// En syncPermissions.js
const SPECIAL_PERMISSIONS = [
    { 
        slug: 'reportes.exportar', 
        nombre: 'Exportar Reportes', 
        descripcion: 'Exportar reportes a PDF/Excel', 
        modulo: 'reportes' 
    },
];
```

### Paso 2: Usar en Frontend

```tsx
{hasPermission('reportes', 'exportar') && (
    <Button onClick={exportar}>Exportar</Button>
)}
```

### Paso 3: Proteger en Backend

```javascript
router.post('/exportar', isAuth, checkPermission('reportes.exportar'), controller.exportar);
```

---

## 🔧 Comandos Útiles

### Sincronizar permisos (crear/actualizar):
```bash
cd api
npm run permissions:sync
```

### Verificar permisos de un rol en MySQL:
```sql
SELECT p.slug, p.nombre 
FROM role_permissions rp 
JOIN permissions p ON rp.id_permission = p.id_permission 
JOIN roles r ON rp.id_role = r.id_role 
WHERE r.nombre = 'Terapeuta';
```

### Verificar roles de un usuario:
```sql
SELECT u.email, r.nombre as rol, r.is_admin 
FROM usuarios u 
JOIN user_roles ur ON u.id_usuario = ur.id_usuario 
JOIN roles r ON ur.id_role = r.id_role 
WHERE u.email = 'usuario@email.com';
```

### Asignar rol a usuario manualmente:
```sql
INSERT INTO user_roles (id_usuario, id_role) 
SELECT u.id_usuario, r.id_role 
FROM usuarios u, roles r 
WHERE u.email = 'usuario@email.com' 
AND r.nombre = 'Terapeuta';
```

---

## 📁 Estructura de Archivos Relevantes

```
api/
├── app/
│   ├── middlewares/
│   │   └── checkPermission.js    # Middleware de verificación
│   ├── models/
│   │   ├── roleModel.js          # Modelo de roles
│   │   ├── permissionModel.js    # Modelo de permisos
│   │   ├── userRoleModel.js      # Tabla pivot usuario-rol
│   │   └── rolePermissionModel.js # Tabla pivot rol-permiso
│   ├── controllers/
│   │   ├── roleController.js     # CRUD de roles
│   │   └── permissionController.js # Consulta de permisos
│   ├── routes/
│   │   ├── roleRoute.js          # Rutas de roles
│   │   └── permissionRoute.js    # Rutas de permisos
│   └── scripts/
│       └── syncPermissions.js    # Script de sincronización

centrorehabilitacionproyecto/
└── src/
    ├── hooks/
    │   └── usePermissions.ts     # Hook de permisos
    ├── components/
    │   └── ProtectedRoute.tsx    # Componente de ruta protegida
    └── App.tsx                   # Definición de rutas
```

---

## 🔄 Flujo Completo de Autenticación

```
1. Login
   └─▶ POST /api/usuarios/login
       └─▶ Backend consulta usuario + roles + permisos
           └─▶ Devuelve: { token, permissions, permissionsByModule, isAdmin, roles }

2. Frontend guarda en localStorage:
   - token
   - permissions (array de slugs)
   - permissionsByModule (objeto agrupado)
   - isAdmin (boolean)
   - roles (array de roles)

3. usePermissions() lee de localStorage:
   └─▶ canView('pacientes') → busca 'pacientes.view' en permissions
   └─▶ isAdmin → si es true, retorna true para todo (Gate)

4. ProtectedRoute verifica acceso:
   └─▶ Si no tiene permiso → Redirect a /home
   └─▶ Si tiene permiso → Renderiza children

5. Backend verifica en cada request:
   └─▶ checkPermission('pacientes.view')
       └─▶ Busca usuario → roles → permisos
       └─▶ Si es admin (Gate) → next()
       └─▶ Si tiene permiso → next()
       └─▶ Si no → 403 Forbidden
```

---

## ⚠️ Notas Importantes

1. **El slug es la clave**: Debe ser consistente entre backend y frontend
2. **Gate Admin**: Usuarios con `is_admin: true` tienen acceso total automático
3. **Sincronizar siempre**: Después de agregar módulos, ejecutar `npm run permissions:sync`
4. **Re-login**: Los usuarios deben cerrar sesión e iniciar de nuevo para obtener nuevos permisos
5. **Fallback Legacy**: Si no hay permisos dinámicos, el sistema usa `idRol` como fallback

---

## 👥 Roles Predefinidos

| Rol | is_admin | Descripción |
|-----|----------|-------------|
| Administrador | ✅ true | Acceso total (Gate) |
| Terapeuta | ❌ false | Permisos de atención al paciente |
| Encargado | ❌ false | Permisos de recepción básicos |

---

## 🔒 Sistema de Bloqueo por Cierre de Caja

### Comportamiento

Cuando se realiza un **cierre de caja** para un día:
1. ❌ No se pueden **crear citas** para ese día
2. ❌ No se pueden **editar citas** de ese día
3. ❌ No se pueden **cobrar citas** (generar recibos) de ese día
4. ❌ No se pueden **anular recibos** de ese día

### Al día siguiente
✅ Las operaciones se habilitan automáticamente para el nuevo día.

### Reabrir un cierre
Si es necesario realizar operaciones en un día cerrado:
1. Un usuario con permiso `cierres.reabrir` puede **reabrir el cierre**
2. Se requiere ingresar un **motivo** (queda registrado para auditoría)
3. El cierre pasa a estado **"Reabierto"** y se habilitan las operaciones

### Hook `useCierreBloqueo`

```tsx
import { useCierreBloqueo } from '../hooks/useCierreBloqueo';

function MiComponente() {
    const { 
        cierreStatus,      // Estado actual del cierre
        puedeOperarHoy,    // () => boolean - ¿Puede operar hoy?
        estaFechaBloqueada // (fecha) => Promise<boolean> - ¿Está bloqueada una fecha?
    } = useCierreBloqueo();

    const handleCobrar = async (idCita: number, fechaCita: string) => {
        const bloqueado = await estaFechaBloqueada(fechaCita);
        if (bloqueado) {
            toast.error('El día está cerrado');
            return;
        }
        // Proceder con el cobro...
    };
}
```

### Permisos relacionados

| Permiso | Descripción |
|---------|-------------|
| `cierres.view` | Ver cierres y datos del día |
| `cierres.create` | Crear cierre de caja |
| `cierres.delete` | Eliminar cierre |
| `cierres.reabrir` | Reabrir un cierre bloqueado |

---

*Documentación generada para el proyecto Centro de Rehabilitación - Sistema RBAC*

