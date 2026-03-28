const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Public
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const order = await Order.findOne({ orderId: orderId.toUpperCase() });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Order is already paid.' });
    }

    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.payment.amount * 100), // amount in paise
      currency: order.payment.currency || 'INR',
      receipt: order.orderId,
      notes: {
        orderId: order.orderId,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
      },
    });

    // Save razorpay order ID
    await Order.findByIdAndUpdate(order._id, {
      'payment.razorpayOrderId': razorpayOrder.id,
    });

    res.status(200).json({
      success: true,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      order: {
        orderId: order.orderId,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
        amount: order.payment.amount,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Public
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing payment verification parameters.' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Order.findOneAndUpdate(
        { orderId: orderId.toUpperCase() },
        { 'payment.status': 'failed' }
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update order payment status
    const order = await Order.findOneAndUpdate(
      { orderId: orderId.toUpperCase() },
      {
        'payment.status': 'paid',
        'payment.razorpayOrderId': razorpay_order_id,
        'payment.razorpayPaymentId': razorpay_payment_id,
        'payment.razorpaySignature': razorpay_signature,
        'payment.paidAt': new Date(),
        orderStatus: 'processing',
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      orderId: order.orderId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Cash on Delivery payment
// @route   POST /api/payments/cod
// @access  Public
const handleCOD = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: orderId.toUpperCase(), 'payment.method': 'cod' },
      {
        'payment.status': 'pending',
        orderStatus: 'processing',
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'COD order not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'COD order confirmed. Payment will be collected on delivery.',
      orderId: order.orderId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment details for an order
// @route   GET /api/payments/:orderId
// @access  Admin
const getPaymentDetails = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() })
      .select('payment orderId customer.name customer.email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({ success: true, payment: order.payment, orderId: order.orderId });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark order as paid (admin only)
// @route   POST /api/payments/:orderId/mark-paid
// @access  Admin
const markAsPaid = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId.toUpperCase(), 'payment.status': { $ne: 'paid' } },
      { 'payment.status': 'paid', 'payment.paidAt': new Date(), orderStatus: 'processing' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or already paid.' });
    }

    res.status(200).json({ success: true, message: 'Order marked as paid.', order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRazorpayOrder, verifyPayment, handleCOD, getPaymentDetails, markAsPaid };
