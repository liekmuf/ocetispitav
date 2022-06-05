const util = require('util')
const connection = require('../config/database')
const { titles, queries } = require('../model/queries')

const getObject = async (sql) => {
  const query = util.promisify(connection.query).bind(connection)
  const object = JSON.parse(JSON.stringify(await query(sql)))
  return object
}

const getAllQueries = async (req, res) => {
  const query = util.promisify(connection.query).bind(connection)
  const response = queries.map(async (sql) => {
    const result = await getObject(sql)
    const title = titles[queries.indexOf(sql)]
    return { title: title, result: result }
  })
  const array = await Promise.all(response.map((obj) => obj))
  res.json(array)
}

module.exports = {
  getAllQueries,
}
