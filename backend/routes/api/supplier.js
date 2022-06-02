const express = require('express')
const router = express.Router()
const supplierController = require('../../controllers/supplierController.js')

router
  .route('/')
  .get(supplierController.getAllSuppliers)
  .post(supplierController.createNewSupplier)

router
  .route('/:id')
  .get(supplierController.getSupplier)
  .put(supplierController.updateSupplier)
  .delete(supplierController.deleteSupplier)

module.exports = router
