require('dotenv').config()
const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  database: 'Equipment',
  password: process.env.DB_PASSWORD,
})

module.exports = connection
