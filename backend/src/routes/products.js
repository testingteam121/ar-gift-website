const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  removeProductImage,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { productImageUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, productImageUpload.array('images', 10), createProduct);
router.put('/:id', protect, adminOnly, productImageUpload.array('images', 10), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/:id/images/:publicId', protect, adminOnly, removeProductImage);

module.exports = router;
