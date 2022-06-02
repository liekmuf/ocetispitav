const express = require('express')
const router = express.Router()
const journalController = require('../../controllers/journalController.js')

router
  .route('/')
  .get(journalController.getAllJournals)
  .post(journalController.createNewJournal)

router
  .route('/:id')
  .get(journalController.getJournal)
  .put(journalController.updateJournal)
  .delete(journalController.deleteJournal)

module.exports = router
