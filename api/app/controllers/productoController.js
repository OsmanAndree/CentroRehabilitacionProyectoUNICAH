'use strict'

const db = require('../config/db');
const  producto= db.productos;

async function getProductos(req, res){
producto.findAll()
.then(result=>{
res.status(200).send({result})
}).catch(error=> {
    res.status(500).send({message:error.message || "Sucedió un errror inesperado"})
});
}

const insertProductos = async (req, res) => {
    try {
        const newproducto = await producto.create(req.body); 
        res.status(201).json({ message: 'Producto guardado exitosamente', data: newproducto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateProductos = async (req, res) => {
    try {
        const { producto_id } = req.query;
        const productoData = req.body;

        const productoToUpdate = await producto.findByPk(producto_id);
        if (productoToUpdate) {
            await productoToUpdate.update(productoData);
            res.status(200).json({ message: 'Producto actualizado exitosamente', data: productoToUpdate });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteProductos = async (req, res) => {
    try {
        const { producto_id } = req.query;

        const productoToDelete = await producto.findByPk(producto_id);
        if (productoToDelete) {
            await productoToDelete.destroy({ where: { producto_id } });

            await productoToDelete.destroy();
            res.status(200).json({ message: 'Producto eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports={
    getProductos,
    insertProductos,
    updateProductos,
    deleteProductos
} 