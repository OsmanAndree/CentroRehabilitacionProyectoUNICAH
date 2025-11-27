'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id_role'
            }
        },
        id_permission: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'permissions',
                key: 'id_permission'
            }
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    };
    
    const options = {
        tableName: 'role_permissions',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['id_role', 'id_permission']
            }
        ]
    };
    
    return sequelize.define('role_permissions', attributes, options);
};

