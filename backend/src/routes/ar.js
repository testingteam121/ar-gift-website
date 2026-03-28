const express = require('express');
const {
  getARTarget,
  createARTarget,
  updateMindFile,
  deactivateARTarget,
} = require('../controllers/arController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/target/:orderId', getARTarget);
router.post('/target', protect, adminOnly, createARTarget);
router.put('/target/:orderId/mind-file', protect, adminOnly, updateMindFile);
router.delete('/target/:orderId', protect, adminOnly, deactivateARTarget);

module.exports = router;
