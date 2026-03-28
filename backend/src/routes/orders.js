const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  downloadOrderFiles,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// Single storage that routes image/video to correct Cloudinary folder
const orderStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === 'video') {
      return {
        folder: 'uploads/videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'webm'],
      };
    }
    return {
      folder: 'uploads/images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

const orderUpload = multer({
  storage: orderStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

router.post('/', orderUpload, createOrder);
router.get('/stats', protect, adminOnly, getOrderStats);
router.get('/', protect, getOrders);
router.get('/:orderId', optionalAuth, getOrder);
router.put('/:orderId/status', protect, adminOnly, updateOrderStatus);
router.get('/:orderId/files', protect, adminOnly, downloadOrderFiles);

module.exports = router;
