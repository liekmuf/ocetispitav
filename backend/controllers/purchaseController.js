const util = require('util')
const connection = require('../config/database')

const getAllPurchases = async (req, res) => {
  const sql = 'SELECT * FROM purchase'
  const query = util.promisify(connection.query).bind(connection)
  const findEquip = async (equip_id) => {
    const equipment = await query(`SELECT equip_id, equip_name FROM equipment`)
    return JSON.parse(JSON.stringify(equipment))
  }
  const findSupplier = async (supplier_id) => {
    const supplier = await query(
      `SELECT supplier_id, supplier_name FROM supplier`
    )
    return JSON.parse(JSON.stringify(supplier))
  }

  connection.query(sql, async (err, result) => {
    if (err) return res.sendStatus(500)
    const purchases = JSON.parse(JSON.stringify(result))
    const equip = await findEquip()
    const supplier = await findSupplier()
    const response = [
      ...equip,
      ...supplier,
      ...purchases.map(async (purchase) => {
        const object = {
          purchase_id: purchase.purchase_id,
          equip: equip.find((e) => e.equip_id === purchase.equip_id)
            ?.equip_name,
          cost: purchase.cost,
          purchase_date: purchase.purchase_date,
          supplier: supplier.find((s) => s.supplier_id === purchase.supplier_id)
            ?.supplier_name,
        }
        return object
      }),
    ]
    const array = await Promise.all(response.map((obj) => obj))
    res.json(array)
  })
}

const createNewPurchase = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection)
  const sql = 'INSERT INTO purchase VALUES(?, ?, ?, ?, ?)'
  const { equip, cost, purchase_date, supplier } = req.body

  const findPurchaseId = async () => {
    const purchases = await query('SELECT * FROM purchase')
    return purchases[purchases.length - 1].purchase_id
  }
  const findEquip = async (equip) => {
    const equipment = await query(
      `SELECT * FROM equipment WHERE equip_name = '${equip}'`
    )
    return equipment[0].equip_id
  }
  const findSupplier = async (sup) => {
    const supplier = await query(
      `SELECT * FROM supplier WHERE supplier_name = '${sup}'`
    )
    return supplier[0].supplier_id
  }

  const equip_id = await findEquip(equip)
  const supplier_id = await findSupplier(supplier)
  const purchase_id = (await findPurchaseId()) + 1

  const values = [purchase_id, equip_id, cost, purchase_date, supplier_id]
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    res.json({
      purchase_id: purchase_id,
      equip: equip,
      cost: cost,
      purchase_date: purchase_date,
      supplier: supplier,
    })
  })
}

const updatePurchase = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection)
  const sql =
    'UPDATE purchase SET purchase_id = ?, equip_id = ?, cost = ?, purchase_date = ?, supplier_id = ? WHERE purchase_id = ?'
  const { equip, cost, purchase_date, supplier } = req.body

  const findEquip = async (equip) => {
    const equipment = await query(
      `SELECT * FROM equipment WHERE equip_name = '${equip}'`
    )
    return equipment[0].equip_id
  }
  const findSupplier = async (sup) => {
    const supplier = await query(
      `SELECT * FROM supplier WHERE supplier_name = '${sup}'`
    )
    return supplier[0].supplier_id
  }

  const equip_id = await findEquip(equip)
  const supplier_id = await findSupplier(supplier)
  const purchase_id = req.params.id

  const values = [
    purchase_id,
    equip_id,
    cost,
    purchase_date,
    supplier_id,
    purchase_id,
  ]
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    res.json({
      purchase_id: Number(purchase_id),
      equip: equip,
      cost: cost,
      purchase_date: purchase_date,
      supplier: supplier,
    })
  })
}

const deletePurchase = (req, res) => {
  const sql = 'DELETE FROM purchase WHERE purchase_id = ?'
  const purchase_id = req.params.id
  connection.query(sql, purchase_id, (err, result) => {
    if (err) return res.sendStatus(500)
    res.sendStatus(200)
  })
}

module.exports = {
  getAllPurchases,
  createNewPurchase,
  updatePurchase,
  deletePurchase,
}
