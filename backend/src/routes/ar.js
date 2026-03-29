const express = require('express');
const {
  getARTarget,
  createARTarget,
  updateMindFile,
  deactivateARTarget,
  getAllARData,
  uploadCompiledMindFile,
} = require('../controllers/arController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');

const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const router = express.Router();

router.get('/data.json', getAllARData);
router.get('/target/:orderId', getARTarget);
router.post('/target', protect, adminOnly, createARTarget);
router.post('/target/:orderId/upload-mind', memoryUpload.single('mindFile'), uploadCompiledMindFile);
router.put('/target/:orderId/mind-file', protect, adminOnly, updateMindFile);
router.delete('/target/:orderId', protect, adminOnly, deactivateARTarget);

module.exports = router;
