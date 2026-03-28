const express = require('express');
const {
  createRazorpayOrder,
  verifyPayment,
  handleCOD,
  getPaymentDetails,
  markAsPaid,
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.post('/cod', handleCOD);
router.get('/:orderId', protect, adminOnly, getPaymentDetails);
router.post('/:orderId/mark-paid', protect, adminOnly, markAsPaid);

module.exports = router;
