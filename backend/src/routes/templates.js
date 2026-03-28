const express = require('express');
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/templateController');
const { protect, adminOnly } = require('../middleware/auth');
const { templateUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.post('/', protect, adminOnly, templateUpload.single('image'), createTemplate);
router.put('/:id', protect, adminOnly, templateUpload.single('image'), updateTemplate);
router.delete('/:id', protect, adminOnly, deleteTemplate);

module.exports = router;
