const mysql = require('mysql')
const util = require('util')
const connection = require('../config/database')

const getAllRepairs = async (req, res) => {
  const sql = 'SELECT * FROM repairment;'
  connection.query(sql, async (err, result) => {
    if (err) return res.sendStatus(500)
    const repairsDB = JSON.parse(JSON.stringify(result))
    const repairs = []
    const response = []
    const query = util.promisify(connection.query).bind(connection)
    let findEquip = async () => {
      const equip = (
        await query('SELECT equip_id, equip_name FROM equipment')
      ).sort((a, b) => (a.equip_id > b.equip_id ? 1 : -1))
      return JSON.parse(JSON.stringify(equip))
    }
    const equipment = await findEquip()
    response.push(equipment)
    for (let i = 0; i < repairsDB.length; i++) {
      repairs.push({
        repair_id: repairsDB[i].repair_id,
        issue: repairsDB[i].issue,
        fact_start: repairsDB[i].fact_start,
        plan_end: repairsDB[i].plan_end,
        fact_end: repairsDB[i].fact_end,
        equip: equipment.find(
          (equip) => equip.equip_id === repairsDB[i].equip_id
        ).equip_name,
      })
    }
    response.push(repairs)
    res.json(response)
  })
}

const createNewRepair = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection)
  const sql = 'INSERT INTO repairment VALUES(?, ?, ?, ?, ?, ?)'
  const { issue, fact_start, plan_end, fact_end, equip } = req.body

  let result = async () => {
    let repairs = null
    try {
      const rows = await query('SELECT * FROM repairment')
      repairs = rows[rows.length - 1].repair_id
    } finally {
      return repairs
    }
  }

  let equipment = async (equip) => {
    let equip_name = null
    const rows = await query('SELECT * FROM equipment')
    equip_name = rows.find((eq) => eq.equip_name === equip)
    if (!equip_name?.equip_id)
      return res.status(400).json({ message: 'Please provide valid data!' })

    return equip_name.equip_id
  }

  const id = (await result()) + 1
  const equip_id = await equipment(equip)

  const values = [id, issue, fact_start, plan_end, fact_end, equip_id]

  if (!issue || !fact_start || !plan_end || !fact_end || !equip_id) {
    res.status(400).json({
      message:
        'Request must contain issue, fact_start, plan_end, fact_end and equip fields',
    })
  }

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    const repair = {
      repair_id: id,
      issue: issue,
      fact_start: fact_start,
      plan_end: plan_end,
      fact_end: fact_end,
      equip: equip,
    }
    return res.json(repair)
  })
}

const getRepair = (req, res) => {
  const sql = 'SELECT * FROM repairment WHERE repair_id = ?'
  const value = req.params.id
  connection.query(sql, value, async (err, result) => {
    if (err) return res.sendStatus(500)
    if (!result.length) return res.sendStatus(404)
    console.log(result)

    const query = util.promisify(connection.query).bind(connection)
    let findEquip = async (equip_id) => {
      const equip = await query(
        `SELECT equip_name FROM equipment WHERE equip_id = ${equip_id}`
      )
      return JSON.parse(JSON.stringify(equip))[0]
    }
    const equip = await findEquip(result[0].equip_id)
    const response = {
      repair_id: result[0].repair_id,
      issue: result[0].issue,
      fact_start: result[0].fact_start,
      plan_end: result[0].plan_end,
      fact_end: result[0].fact_end,
      equip: equip.equip_name,
    }
    res.json(response)
  })
}

const updateRepair = async (req, res) => {
  const sql =
    'UPDATE repairment SET repair_id = ?, issue = ?, fact_start = ?, plan_end = ?, fact_end = ?, equip_id = ? WHERE repair_id = ?'
  const { issue, fact_start, plan_end, fact_end, equip } = req.body

  const query = util.promisify(connection.query).bind(connection)
  let result = async () => {
    let repairs = null
    try {
      const rows = await query('SELECT * FROM repairment')
      repairs = rows[rows.length - 1].repair_id
    } finally {
      return repairs
    }
  }

  let equipment = async (equip) => {
    let equip_name = null
    const rows = await query('SELECT * FROM equipment')
    equip_name = rows.find((eq) => eq.equip_name === equip)
    if (!equip_name?.equip_id) throw 'No equipment found!'

    return equip_name.equip_id
  }

  const id = req.params.id || (await result()) + 1
  let equip_id = null
  try {
    equip_id = await equipment(equip)
  } catch (err) {
    return res.status(400).json({ message: 'Please provide valid data!' })
  }

  if (!issue || !fact_start || !plan_end || !fact_end || !equip_id) {
    return res.status(400).JSON({
      message:
        'Request must contain issue, fact_start, plan_end, fact_end and equip fields',
    })
  }

  const values = [id, issue, fact_start, plan_end, fact_end, equip_id, id]

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    const repair = {
      repair_id: Number(id),
      issue: issue,
      fact_start: fact_start,
      plan_end: plan_end,
      fact_end: fact_end,
      equip: equip,
    }

    res.status(200).json(repair)
  })
}

const deleteRepair = (req, res) => {
  const sql = 'DELETE FROM repairment WHERE repair_id = ?'
  const value = req.params.id || req.body.repair_id
  connection.query(sql, value, (err, result) => {
    if (err) return res.sendStatus(500)
    res.sendStatus(200)
  })
}

module.exports = {
  getAllRepairs,
  createNewRepair,
  getRepair,
  updateRepair,
  deleteRepair,
}
