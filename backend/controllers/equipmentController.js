const mysql = require('mysql')
const util = require('util')
const connection = require('../config/database')

const getAllEquipment = async (req, res) => {
  const sql = 'SELECT * FROM equipment;'
  const query = util.promisify(connection.query).bind(connection)
  let findCategory = async () => {
    const category = await query('SELECT * FROM category')
    return JSON.parse(JSON.stringify(category))
  }

  let findCharact = async () => {
    const charact = await query('SELECT * FROM characteristics')
    return JSON.parse(JSON.stringify(charact))
  }

  const categories = await findCategory()
  const characts = await findCharact()

  connection.query(sql, async (err, result) => {
    if (err) return res.sendStatus(500)
    const equipment = JSON.parse(JSON.stringify(result))

    const response = [
      [...categories],
      [...characts],
      equipment.map((equip) => {
        return {
          equip_id: equip.equip_id,
          equip_name: equip.equip_name,
          equip_diff: equip.equip_diff,
          category: categories.find(
            (category) => category.category_id === equip.category_id
          )?.category_name,
          charact: characts.find(
            (charact) => charact.charact_id === equip.charact_id
          )?.charact,
        }
      }),
    ]
    res.json(response)
  })
}

const createNewEquipment = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection)
  const sql = 'INSERT INTO equipment VALUES(?, ?, ?, ?, ?)'
  const { equip_name, equip_diff, category, charact } = req.body
  let result = async () => {
    let equipments = null
    try {
      const rows = await query('SELECT * FROM equipment')
      equipments = rows[rows.length - 1].equip_id
    } finally {
      return equipments
    }
  }

  let findCategory = async (category_name) => {
    let cat = null
    const rows = await query('SELECT * FROM category')
    cat = rows.find((c) => c.category_name === category_name)
    if (!cat?.category_id)
      return res.status(400).json({ message: 'Please provide valid data!' })

    return cat.category_id
  }

  let findСharact = async (characts) => {
    if (!characts) return null
    let charact = null
    const rows = await query('SELECT * FROM characteristics')
    charact = rows.find((c) => c.charact === characts)
    if (!charact?.charact_id)
      return res.status(400).json({ message: 'Please provide valid data!' })

    return charact.charact_id
  }

  const id = (await result()) + 1
  const category_id = await findCategory(category)
  const charact_id = await findСharact(charact)

  const values = [id, equip_name, equip_diff, category_id, charact_id]

  if (!equip_name || !category_id) {
    return res.status(400).JSON({
      message:
        'Request must contain equip_name, equip_diff, category, charact fields',
    })
  }

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    const equipment = {
      equip_id: id,
      equip_name: equip_name,
      equip_diff: equip_diff,
      category: category,
      charact: charact,
    }
    // console.log(equipment)
    res.json(equipment)
  })
}

const getEquipment = (req, res) => {
  const sql = 'SELECT * FROM equipment WHERE equipment_id = ?'
  const value = req.params.id
  connection.query(sql, value, (err, result) => {
    if (err) return res.sendStatus(500)
    if (!result.length) return res.sendStatus(404)
    res.json(JSON.parse(JSON.stringify(result)))
  })
}

const updateEquipment = async (req, res) => {
  const sql =
    'UPDATE equipment SET equip_id = ?, equip_name = ?, equip_diff = ?, category_id = ?, charact_id = ? WHERE equip_id = ?'
  const query = util.promisify(connection.query).bind(connection)
  const { equip_name, equip_diff, category, charact } = req.body

  let findCategory = async (category_name) => {
    let cat = null
    const rows = await query('SELECT * FROM category')
    cat = rows.find((c) => c.category_name === category_name)
    if (!cat?.category_id)
      return res.status(400).json({ message: 'Please provide valid data!' })

    return cat.category_id
  }

  let findСharact = async (characts) => {
    if (!characts) return null
    const rows = await query('SELECT * FROM characteristics')
    const charact = rows.find((c) => c.charact === characts)
    console.log(charact)
    if (!charact?.charact_id)
      return res.status(400).json({ message: 'Please provide valid data!' })

    return charact.charact_id
  }

  const id = req.params.id
  const category_id = await findCategory(category)
  const charact_id = await findСharact(charact)
  // console.log(charact_id)

  const values = [id, equip_name, equip_diff, category_id, charact_id, id]
  // console.log(values)

  if (!equip_name || !category_id) {
    res.status(400).JSON({
      message:
        'Request must contain equip_name, equip_diff, category_id, charact_id fields',
    })
  }

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    const equipment = {
      equip_id: Number(id),
      equip_name: equip_name,
      equip_diff: equip_diff,
      category: category,
      charact: charact,
    }
    res.status(200).json(equipment)
  })
}

const deleteEquipment = (req, res) => {
  const sql = 'DELETE FROM equipment WHERE equip_id = ?'
  const value = req.params.id || req.body.equip_id
  connection.query(sql, value, (err, result) => {
    if (err) return res.sendStatus(500)
    res.sendStatus(200)
  })
}

module.exports = {
  getAllEquipment,
  createNewEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
}
