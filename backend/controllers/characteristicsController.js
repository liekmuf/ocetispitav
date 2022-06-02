const mysql = require('mysql')
const util = require('util')
const connection = require('../config/database')

const getAllCharacteristics = (req, res) => {
  const sql = 'SELECT * FROM characteristics'
  connection.query(sql, (err, result) => {
    if (err) return res.sendStatus(500)
    const characteristics = result.sort((a, b) =>
      a.charact_id > b.charact_id ? 1 : -1
    )
    res.json(JSON.parse(JSON.stringify(characteristics)))
  })
}

const createNewCharacteristics = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection)
  const sql = 'INSERT INTO characteristics VALUES(?, ?)'
  const { charact } = req.body

  let result = async () => {
    let id = null
    const rows = await query('SELECT * FROM characteristics')
    characteristics = rows.sort((a, b) =>
      a.charact_id > b.charact_id ? 1 : -1
    )
    id = characteristics[characteristics.length - 1].charact_id
    return id
  }

  const id = (await result()) + 1

  const values = [id, charact]

  if (!id || !charact) {
    return res.status(400).json({
      message: 'Request must contain charact field',
    })
  }

  connection.query(sql, values, (err, result) => {
    if (err?.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Duplicate entry!' })

    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    const characteristics = {
      charact_id: id,
      charact: charact,
    }
    return res.json(characteristics)
  })
}

const getCharacteristics = (req, res) => {
  const sql = 'SELECT * FROM characteristics WHERE charact_id = ?'
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

const updateCharacteristics = async (req, res) => {
  const sql =
    'UPDATE characteristics SET charact_id = ?, charact = ? WHERE charact_id = ?'
  const { charact } = req.body
  const charact_id = req.body.charact_id || req.params.id

  if (!charact_id || !charact) {
    return res.status(400).json({
      message: 'Request must contain charact field',
    })
  }

  const values = [charact_id, charact, charact_id]

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    const characteristics = {
      charact_id: Number(charact_id),
      charact: charact,
    }

    res.status(200).json(characteristics)
  })
}

const deleteCharacteristics = (req, res) => {
  const sql = 'DELETE FROM characteristics WHERE charact_id = ?'
  const value = req.params.id || req.body.charact_id
  connection.query(sql, value, (err, result) => {
    if (err) return res.sendStatus(500)
    res.sendStatus(200)
  })
}

module.exports = {
  getAllCharacteristics,
  createNewCharacteristics,
  getCharacteristics,
  updateCharacteristics,
  deleteCharacteristics,
}
