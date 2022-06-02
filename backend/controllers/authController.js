const mysql = require('mysql')
const connection = require('../config/database')

const handleLogin = (req, res) => {
  const { user, pwd } = req.body
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: 'Username and password are required!' })

  connection.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.error(err)
      return res.sendStatus(500)
    } else {
      authorize(result)
    }
  })

  const authorize = (data) => {
    const foundUser = data.find((person) => person.name === user)
    if (!foundUser || foundUser.password !== pwd) return res.sendStatus(401)
    const role = foundUser.access
    return res.json({ role })
  }
}

module.exports = { handleLogin }
