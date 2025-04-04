'use strict'

const db = require('../config/db');
const  producto= db.productos;

async function getProductos(req, res){
producto.findAll({
    where: { estado: true }
})
.then(result=>{
res.status(200).send({result})
}).catch(error=> {
    res.status(500).send({message:error.message || "Sucedió un errror inesperado"})
});
}

const insertProductos = async (req, res) => {
    try {
        const productoData = { ... req.body, estado: true }
        const newproducto = await producto.create(productoData); 
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
            await productoToDelete.update({ estado: false })
            res.status(200).json({ message: 'Producto eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateProductoStock = async (req, res) => {
    const { producto_id } = req.query;
    const { cantidad_a_sumar } = req.body; 

    try {
    if (cantidad_a_sumar <= 0) {
        return res.status(400).json({ success: false, message: "Cantidad inválida" });
    }

    await db.productos.increment('cantidad_disponible', {
        by: cantidad_a_sumar,
        where: { id_producto: producto_id }
    });

    res.json({ success: true });
    } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    }
};

module.exports={
    getProductos,
    insertProductos,
    updateProductos,
    deleteProductos,
    updateProductoStock
} 