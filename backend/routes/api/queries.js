const express = require('express')
const router = express.Router()
const queriesController = require('../../controllers/queriesController.js')

router.route('/').get(queriesController.getAllQueries)

module.exports = router
