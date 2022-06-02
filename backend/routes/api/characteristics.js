const express = require('express')
const router = express.Router()
const characteristicsController = require('../../controllers/characteristicsController.js')

router
  .route('/')
  .get(characteristicsController.getAllCharacteristics)
  .post(characteristicsController.createNewCharacteristics)

router
  .route('/:id')
  .get(characteristicsController.getCharacteristics)
  .put(characteristicsController.updateCharacteristics)
  .delete(characteristicsController.deleteCharacteristics)

module.exports = router
