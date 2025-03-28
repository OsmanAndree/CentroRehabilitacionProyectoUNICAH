'use strict';

const db = require('../config/db');
const Compra = db.compras;
const DetalleCompra = db.detallecompras;
const sequelize = db.sequelizeInstance;

const getCompras = async (req, res) => {
  try {
    const compras = await Compra.findAll({
      where: { estado: true },
      include: [{
        model: DetalleCompra,
        as: 'detalle'
      }]
    });
    res.status(200).json({ result: compras });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCompra = async (req, res) => {
  const { fecha, donante, total, detalle } = req.body;
  const t = await sequelize.transaction();
  try {
    const nuevaCompra = await Compra.create({ fecha, donante, total, estado: true }, { transaction: t });
    if (detalle && detalle.length > 0) {
      detalle.forEach(det => det.id_compra = nuevaCompra.id_compra);
      await DetalleCompra.bulkCreate(detalle, { transaction: t });
    }
    await t.commit();
    res.status(201).json({ result: nuevaCompra });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const updateCompra = async (req, res) => {
  const { id_compra } = req.params;
  const { fecha, donante, total, detalle } = req.body;
  const t = await sequelize.transaction();
  try {
    let compraFound = await Compra.findByPk(id_compra, { transaction: t });
    if (!compraFound) {
      await t.rollback();
      return res.status(404).json({ error: "Compra no encontrada" });
    }
    await compraFound.update({ fecha, donante, total }, { transaction: t });
    if (detalle && detalle.length > 0) {
      await DetalleCompra.destroy({ where: { id_compra }, transaction: t });
      detalle.forEach(det => det.id_compra = id_compra);
      await DetalleCompra.bulkCreate(detalle, { transaction: t });
    }
    await t.commit();
    res.status(200).json({ result: compraFound });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const deleteCompra = async (req, res) => {
  const { id_compra } = req.params;
  try {
    let compraFound = await Compra.findByPk(id_compra);
    if (!compraFound) return res.status(404).json({ error: "Compra no encontrada" });
    await compraFound.update({ estado: false });
    res.status(200).json({ result: "Compra inactivada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCompras, createCompra, updateCompra, deleteCompra };