const express = require('express')
const router = express.Router()
const pinController = require('../../controllers/pinController.js')

router.route('/').get(pinController.getAllPins).post(pinController.createNewPin)

router
  .route('/:id')
  .get(pinController.getPin)
  .put(pinController.updatePin)
  .delete(pinController.deletePin)

module.exports = router
