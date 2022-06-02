const mysql = require('mysql')
const util = require('util')
const connection = require('../config/database')

const getAllWorkers = (req, res) => {
  const sql = 'SELECT * FROM worker'
  connection.query(sql, (err, result) => {
    if (err) return res.sendStatus(500)
    res.json(JSON.parse(JSON.stringify(result)))
  })
}

const createNewWorker = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection)
  const sql = 'INSERT INTO worker VALUES(?, ?, ?, ?)'
  const { worker_name, worker_pn, worker_address } = req.body

  let result = async () => {
    let id = null
    const workers = await query('SELECT * FROM worker')
    id = workers[workers.length - 1].worker_id
    return id
  }

  const id = (await result()) + 1

  const values = [id, worker_name, worker_pn, worker_address]

  if (!id || !worker_name || !worker_pn || !worker_address) {
    return res.status(400).json({
      message:
        'Request must contain worker_name, worker_pn, worker_address fields',
    })
  }

  connection.query(sql, values, (err, result) => {
    if (err?.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Duplicate entry!' })

    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    const worker = {
      worker_id: id,
      worker_name: worker_name,
      worker_pn: worker_pn,
      worker_address: worker_address,
    }
    return res.json(worker)
  })
}

const getWorker = (req, res) => {
  const sql = 'SELECT * FROM worker WHERE worker_id = ?'
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

const updateWorker = async (req, res) => {
  const sql =
    'UPDATE worker SET worker_id = ?, worker_name = ?, worker_pn = ?, worker_address = ? WHERE worker_id = ?'
  const { worker_name, worker_pn, worker_address } = req.body
  const worker_id = req.body.worker_id || req.params.id

  if (!worker_id || !worker_name || !worker_pn || !worker_address) {
    return res.status(400).json({
      message:
        'Request must contain worker_name, worker_pn, worker_address fields',
    })
  }

  const values = [worker_id, worker_name, worker_pn, worker_address, worker_id]

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }

    const worker = {
      worker_id: Number(worker_id),
      worker_name: worker_name,
      worker_pn: worker_pn,
      worker_address: worker_address,
    }
    return res.json(worker)
  })
}

const deleteWorker = (req, res) => {
  const sql = 'DELETE FROM worker WHERE worker_id = ?'
  const value = req.params.id || req.body.worker_id
  connection.query(sql, value, (err, result) => {
    if (err) return res.sendStatus(500)
    res.sendStatus(200)
  })
}

module.exports = {
  getAllWorkers,
  createNewWorker,
  getWorker,
  updateWorker,
  deleteWorker,
}
