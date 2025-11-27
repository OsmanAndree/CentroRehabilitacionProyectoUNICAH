#!/usr/bin/env node
'use strict';

/**
 * Script de Sincronización de Permisos
 * =====================================
 * Similar a `php artisan permission:sync` de Spatie en Laravel
 * 
 * Genera automáticamente los permisos CRUD para cada modelo/módulo del sistema.
 * 
 * Uso:
 *   node api/app/scripts/syncPermissions.js
 *   
 * O agregar en package.json:
 *   "scripts": {
 *     "permissions:sync": "node app/scripts/syncPermissions.js"
 *   }
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db = require('../config/db');
const bcrypt = require('bcrypt');

// Definir los módulos del sistema con sus nombres legibles
// Estos corresponden a los modelos/controladores del sistema
const MODULES = [
    { slug: 'pacientes', nombre: 'Pacientes', descripcion: 'Gestión de pacientes del centro' },
    { slug: 'encargados', nombre: 'Encargados', descripcion: 'Gestión de encargados de pacientes' },
    { slug: 'terapeutas', nombre: 'Terapeutas', descripcion: 'Gestión de terapeutas' },
    { slug: 'citas', nombre: 'Citas', descripcion: 'Gestión de citas médicas' },
    { slug: 'diagnosticos', nombre: 'Diagnósticos', descripcion: 'Gestión de diagnósticos' },
    { slug: 'servicios', nombre: 'Servicios', descripcion: 'Gestión de servicios' },
    { slug: 'recibos', nombre: 'Recibos', descripcion: 'Gestión de recibos' },
    { slug: 'cierres', nombre: 'Cierres', descripcion: 'Gestión de cierres de caja' },
    { slug: 'productos', nombre: 'Productos', descripcion: 'Gestión de productos' },
    { slug: 'compras', nombre: 'Compras', descripcion: 'Gestión de compras' },
    { slug: 'bodega', nombre: 'Bodega', descripcion: 'Gestión de bodega e inventario' },
    { slug: 'prestamos', nombre: 'Préstamos', descripcion: 'Gestión de préstamos' },
    { slug: 'usuarios', nombre: 'Usuarios', descripcion: 'Gestión de usuarios del sistema' },
    { slug: 'roles', nombre: 'Roles', descripcion: 'Gestión de roles y permisos' },
];

// Acciones CRUD estándar
const ACTIONS = [
    { action: 'view', nombre: 'Ver', descripcion: 'Ver listado y detalles' },
    { action: 'create', nombre: 'Crear', descripcion: 'Crear nuevos registros' },
    { action: 'update', nombre: 'Actualizar', descripcion: 'Editar registros existentes' },
    { action: 'delete', nombre: 'Eliminar', descripcion: 'Eliminar registros' },
];

// Permisos especiales adicionales (no CRUD)
const SPECIAL_PERMISSIONS = [
    // Permisos de recibos
    { slug: 'recibos.cobrar', nombre: 'Cobrar Citas', descripcion: 'Generar recibos al cobrar citas', modulo: 'recibos' },
    { slug: 'recibos.imprimir', nombre: 'Imprimir Recibos', descripcion: 'Imprimir recibos generados', modulo: 'recibos' },
    { slug: 'recibos.anular', nombre: 'Anular Recibos', descripcion: 'Marcar recibos como anulados', modulo: 'recibos' },
    // Permisos de pacientes
    { slug: 'pacientes.alta', nombre: 'Dar Alta Médica', descripcion: 'Dar de alta médica a pacientes', modulo: 'pacientes' },
    // Permisos de cierres
    { slug: 'cierres.reabrir', nombre: 'Reabrir Cierre', descripcion: 'Reabrir un cierre de caja para permitir operaciones', modulo: 'cierres' },
];

async function syncPermissions() {
    console.log('\n🔄 Iniciando sincronización de permisos...\n');
    
    try {
        // Sincronizar tablas (crear si no existen)
        await db.sequelizeInstance.sync({ alter: false });
        console.log('✅ Tablas sincronizadas\n');

        let created = 0;
        let existing = 0;

        // Generar permisos para cada módulo
        for (const module of MODULES) {
            console.log(`📦 Procesando módulo: ${module.nombre}`);
            
            for (const action of ACTIONS) {
                const slug = `${module.slug}.${action.action}`;
                const nombre = `${action.nombre} ${module.nombre}`;
                const descripcion = `${action.descripcion} de ${module.nombre.toLowerCase()}`;

                // Verificar si ya existe el permiso
                const [permission, wasCreated] = await db.permissions.findOrCreate({
                    where: { slug },
                    defaults: {
                        nombre,
                        slug,
                        modulo: module.slug,
                        descripcion
                    }
                });

                if (wasCreated) {
                    console.log(`   ➕ Creado: ${slug}`);
                    created++;
                } else {
                    // Actualizar nombre y descripción si cambiaron
                    await permission.update({ nombre, descripcion });
                    existing++;
                }
            }
        }

        // Sincronizar permisos especiales
        console.log('\n📦 Procesando permisos especiales...');
        let specialCreated = 0;
        for (const perm of SPECIAL_PERMISSIONS) {
            const [permission, wasCreated] = await db.permissions.findOrCreate({
                where: { slug: perm.slug },
                defaults: {
                    nombre: perm.nombre,
                    slug: perm.slug,
                    modulo: perm.modulo,
                    descripcion: perm.descripcion
                }
            });

            if (wasCreated) {
                console.log(`   ➕ Creado: ${perm.slug}`);
                specialCreated++;
            } else {
                await permission.update({ nombre: perm.nombre, descripcion: perm.descripcion });
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`✨ Sincronización completada!`);
        console.log(`   📊 Permisos CRUD creados: ${created}`);
        console.log(`   🔧 Permisos especiales creados: ${specialCreated}`);
        console.log(`   📋 Permisos existentes: ${existing}`);
        console.log(`   📁 Total módulos: ${MODULES.length}`);
        console.log(`   🔐 Total permisos CRUD: ${MODULES.length * ACTIONS.length}`);
        console.log(`   🎯 Total permisos especiales: ${SPECIAL_PERMISSIONS.length}`);
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('❌ Error durante la sincronización:', error.message);
        process.exit(1);
    }
}

async function createDefaultRoles() {
    console.log('\n🎭 Creando roles por defecto...\n');
    
    try {
        // Rol de Administrador (con gate - acceso total)
        const [adminRole, adminCreated] = await db.roles.findOrCreate({
            where: { nombre: 'Administrador' },
            defaults: {
                nombre: 'Administrador',
                descripcion: 'Acceso total al sistema (Super Admin)',
                is_admin: true
            }
        });

        if (adminCreated) {
            console.log('   ➕ Rol creado: Administrador (Gate Admin)');
        } else {
            console.log('   ✓ Rol existente: Administrador');
            // Asegurar que is_admin esté en true
            await adminRole.update({ is_admin: true });
        }

        // Rol de Terapeuta
        const [terapeutaRole, terapeutaCreated] = await db.roles.findOrCreate({
            where: { nombre: 'Terapeuta' },
            defaults: {
                nombre: 'Terapeuta',
                descripcion: 'Terapeuta del centro de rehabilitación',
                is_admin: false
            }
        });

        if (terapeutaCreated) {
            console.log('   ➕ Rol creado: Terapeuta');
        } else {
            console.log('   ✓ Rol existente: Terapeuta');
        }
        
        // SIEMPRE sincronizar permisos del terapeuta (crear o existente)
        const terapeutaPermisos = [
            'pacientes.view', 'pacientes.create', 'pacientes.update', 'pacientes.alta',
            'encargados.view', 'encargados.create', 'encargados.update',
            'citas.view', 'citas.create', 'citas.update',
            'diagnosticos.view', 'diagnosticos.create', 'diagnosticos.update',
            'terapeutas.view',
            'servicios.view',
            'recibos.view', 'recibos.cobrar', 'recibos.imprimir', 'recibos.anular',
            'cierres.view',
        ];
        
        let terapeutaPermisosAsignados = 0;
        for (const slug of terapeutaPermisos) {
            const permission = await db.permissions.findOne({ where: { slug } });
            if (permission) {
                const [, created] = await db.rolePermissions.findOrCreate({
                    where: { id_role: terapeutaRole.id_role, id_permission: permission.id_permission }
                });
                if (created) terapeutaPermisosAsignados++;
            }
        }
        if (terapeutaPermisosAsignados > 0) {
            console.log(`   📋 ${terapeutaPermisosAsignados} permisos nuevos asignados al rol Terapeuta`);
        } else {
            console.log('   ✓ Permisos del Terapeuta ya configurados');
        }

        // Rol de Encargado
        const [encargadoRole, encargadoCreated] = await db.roles.findOrCreate({
            where: { nombre: 'Encargado' },
            defaults: {
                nombre: 'Encargado',
                descripcion: 'Encargado/Recepcionista del centro',
                is_admin: false
            }
        });

        if (encargadoCreated) {
            console.log('   ➕ Rol creado: Encargado');
        } else {
            console.log('   ✓ Rol existente: Encargado');
        }

        // SIEMPRE sincronizar permisos del encargado (crear o existente)
        const encargadoPermisos = [
            'pacientes.view',
            'encargados.view',
            'citas.view',
        ];
        
        let encargadoPermisosAsignados = 0;
        for (const slug of encargadoPermisos) {
            const permission = await db.permissions.findOne({ where: { slug } });
            if (permission) {
                const [, created] = await db.rolePermissions.findOrCreate({
                    where: { id_role: encargadoRole.id_role, id_permission: permission.id_permission }
                });
                if (created) encargadoPermisosAsignados++;
            }
        }
        if (encargadoPermisosAsignados > 0) {
            console.log(`   📋 ${encargadoPermisosAsignados} permisos nuevos asignados al rol Encargado`);
        } else {
            console.log('   ✓ Permisos del Encargado ya configurados');
        }

        console.log('\n✨ Roles por defecto configurados!\n');

    } catch (error) {
        console.error('❌ Error creando roles:', error.message);
    }
}

async function createDefaultAdminUser() {
    console.log('\n👤 Verificando usuario administrador...\n');
    
    try {
        // Buscar el rol de Administrador
        const adminRole = await db.roles.findOne({ 
            where: { nombre: 'Administrador', is_admin: true } 
        });

        if (!adminRole) {
            console.log('   ⚠️ No se encontró el rol de Administrador. Ejecuta primero createDefaultRoles()');
            return;
        }

        // Verificar si ya existe algún usuario con rol de administrador
        const existingAdminUser = await db.usuarios.findOne({
            include: [{
                model: db.roles,
                as: 'roles',
                where: { is_admin: true },
                required: true
            }]
        });

        if (existingAdminUser) {
            console.log(`   ✓ Usuario administrador existente: ${existingAdminUser.email}`);
            return;
        }

        // Credenciales por defecto del administrador
        const DEFAULT_ADMIN = {
            nombre: 'Administrador',
            email: 'admin@centroton.com',
            password: 'password',  // Cambiar después del primer login
            estado: 'Activo'
        };

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

        // Crear el usuario administrador
        const [adminUser, userCreated] = await db.usuarios.findOrCreate({
            where: { email: DEFAULT_ADMIN.email },
            defaults: {
                nombre: DEFAULT_ADMIN.nombre,
                email: DEFAULT_ADMIN.email,
                password: hashedPassword,
                estado: DEFAULT_ADMIN.estado
            }
        });

        if (userCreated) {
            // Asignar el rol de Administrador al usuario
            await db.userRoles.findOrCreate({
                where: { 
                    id_usuario: adminUser.id_usuario, 
                    id_role: adminRole.id_role 
                }
            });

            console.log('   ➕ Usuario administrador creado:');
            console.log('   ┌─────────────────────────────────────────┐');
            console.log(`   │  📧 Email: ${DEFAULT_ADMIN.email.padEnd(27)}│`);
            console.log(`   │  🔑 Password: ${DEFAULT_ADMIN.password.padEnd(24)}│`);
            console.log('   └─────────────────────────────────────────┘');
            console.log('   ⚠️  IMPORTANTE: Cambia la contraseña después del primer login!\n');
        } else {
            // Si el usuario existía pero no tenía rol de admin, asignárselo
            const hasAdminRole = await db.userRoles.findOne({
                where: { id_usuario: adminUser.id_usuario, id_role: adminRole.id_role }
            });

            if (!hasAdminRole) {
                await db.userRoles.create({
                    id_usuario: adminUser.id_usuario,
                    id_role: adminRole.id_role
                });
                console.log(`   ✓ Rol de Administrador asignado a: ${adminUser.email}`);
            } else {
                console.log(`   ✓ Usuario administrador existente: ${adminUser.email}`);
            }
        }

    } catch (error) {
        console.error('❌ Error creando usuario administrador:', error.message);
        console.error(error);
    }
}

async function main() {
    console.log('\n' + '═'.repeat(50));
    console.log('  🔐 SISTEMA DE PERMISOS - SINCRONIZACIÓN');
    console.log('  📦 Similar a Spatie Permission (Laravel)');
    console.log('═'.repeat(50));

    await syncPermissions();
    await createDefaultRoles();
    await createDefaultAdminUser();

    console.log('🏁 Proceso finalizado.\n');
    process.exit(0);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main().catch(err => {
        console.error('Error fatal:', err);
        process.exit(1);
    });
}

module.exports = { syncPermissions, createDefaultRoles, createDefaultAdminUser, MODULES, ACTIONS };

