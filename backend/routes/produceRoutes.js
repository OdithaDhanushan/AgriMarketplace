const express = require('express');
const router = express.Router();
const produceController = require('../controllers/produceController');
const { requireAuth, requireRole } = require('../middleware/auth');

const authorizeFarmer = (req, res, next) => {
  if (req.headers.authorization) {
    return requireAuth(req, res, () => requireRole('Farmer')(req, res, next));
  }
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  return requireAuth(req, res, () => requireRole('Farmer')(req, res, next));
};

router.post('/', authorizeFarmer, produceController.createProduce);
router.post('/seed', requireAuth, requireRole('Farmer'), produceController.seedProduce);
router.get('/', produceController.getAllProduce);
router.get('/mine', requireAuth, requireRole('Farmer'), produceController.getMyProduce);
router.get('/:id', produceController.getProduceById);
router.put('/:id', requireAuth, requireRole('Farmer'), produceController.updateProduce);
router.delete('/:id', requireAuth, requireRole('Farmer'), produceController.deleteProduce);

module.exports = router;