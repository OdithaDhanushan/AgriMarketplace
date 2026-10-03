const express = require('express');
const router = express.Router();
const produceController = require('../controllers/produceController');

router.post('/', produceController.createProduce);
router.get('/', produceController.getAllProduce);
router.get('/:id', produceController.getProduceById);
router.put('/:id', produceController.updateProduce);
router.delete('/:id', produceController.deleteProduce);

module.exports = router;