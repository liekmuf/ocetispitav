const mysql = require('mysql')
const util = require('util')
const connection = require('../config/database')

const getAllSuppliers = (req, res) => {
  const sql = 'SELECT * FROM supplier'
  connection.query(sql, (err, result) => {
    if (err) return res.sendStatus(500)
    res.json(JSON.parse(JSON.stringify(result)))
  })
}

const createNewSupplier = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection)
  const sql = 'INSERT INTO supplier VALUES(?, ?, ?, ?)'
  const { supplier_name, supplier_pn, email } = req.body

  let result = async () => {
    let id = null
    const suppliers = await query('SELECT * FROM supplier')
    id = suppliers[suppliers.length - 1].supplier_id
    return id
  }

  const id = (await result()) + 1

  const values = [id, supplier_name, supplier_pn, email]

  if (!id || !supplier_name || !supplier_pn || !email) {
    return res.status(400).json({
      message: 'Request must contain supplier_name, supplier_pn, email fields',
    })
  }

  connection.query(sql, values, (err, result) => {
    if (err?.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Duplicate entry!' })

    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    const supplier = {
      supplier_id: id,
      supplier_name: supplier_name,
      supplier_pn: supplier_pn,
      email: email,
    }
    return res.json(supplier)
  })
}

const getSupplier = (req, res) => {
  const sql = 'SELECT * FROM supplier WHERE supplier_id = ?'
  const value = req.params.id
  connection.query(sql, value, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    if (!result.length) return res.sendStatus(404)
    res.json(JSON.parse(JSON.stringify(result)))
  })
}

const updateSupplier = async (req, res) => {
  const sql =
    'UPDATE supplier SET supplier_id = ?, supplier_name = ?, supplier_pn = ?, email = ? WHERE supplier_id = ?'
  const { supplier_name, supplier_pn, email } = req.body
  const supplier_id = req.body.supplier_id || req.params.id

  if (!supplier_id || !supplier_name || !supplier_pn || !email) {
    return res.status(400).json({
      message: 'Request must contain supplier_name, supplier_pn, email fields',
    })
  }

  const values = [supplier_id, supplier_name, supplier_pn, email, supplier_id]

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }

    const supplier = {
      supplier_id: Number(supplier_id),
      supplier_name: supplier_name,
      supplier_pn: supplier_pn,
      email: email,
    }
    return res.json(supplier)
  })
}

const deleteSupplier = (req, res) => {
  const sql = 'DELETE FROM supplier WHERE supplier_id = ?'
  const value = req.params.id || req.body.supplier_id
  connection.query(sql, value, (err, result) => {
    if (err) return res.sendStatus(500)
    res.sendStatus(200)
  })
}

module.exports = {
  getAllSuppliers,
  createNewSupplier,
  getSupplier,
  updateSupplier,
  deleteSupplier,
}
