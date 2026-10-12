const express = require('express');
const router = express.Router();
const produceController = require('../controllers/produceController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/', requireAuth, requireRole('Farmer'), produceController.createProduce);
router.get('/', produceController.getAllProduce);
router.get('/mine', requireAuth, requireRole('Farmer'), produceController.getMyProduce);
router.get('/:id', produceController.getProduceById);
router.put('/:id', requireAuth, requireRole('Farmer'), produceController.updateProduce);
router.delete('/:id', requireAuth, requireRole('Farmer'), produceController.deleteProduce);

module.exports = router;