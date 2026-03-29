const Order = require('../models/Order');
const Product = require('../models/Product');
const ARTarget = require('../models/ARTarget');
const Template = require('../models/Template');
const generateOrderId = require('../utils/generateOrderId');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../utils/email');
const cloudinary = require('../config/cloudinary');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      street,
      city,
      state,
      pincode,
      country,
      productId,
      quantity,
      paymentMethod,
      selectedVideoUrl,
      selectedVideoPublicId,
      selectedVideoType,
      selectedVideoPresetId,
      templateId,
      notes,
    } = req.body;

    // Validate product exists
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.stock < (Number(quantity) || 1)) {
      return res.status(400).json({ success: false, message: 'Insufficient stock.' });
    }

    // Handle uploaded files
    let uploadedImageData = {};
    let uploadedVideoData = {};

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        uploadedImageData = {
          url: req.files.image[0].path,
          publicId: req.files.image[0].filename,
        };
      }
      if (req.files.video && req.files.video[0]) {
        uploadedVideoData = {
          url: req.files.video[0].path,
          publicId: req.files.video[0].filename,
          type: 'upload',
        };
      }
    }

    // Determine video source
    const videoData = uploadedVideoData.url
      ? uploadedVideoData
      : {
          url: selectedVideoUrl || '',
          publicId: selectedVideoPublicId || '',
          type: selectedVideoType || 'preset',
          presetVideoId: selectedVideoPresetId || undefined,
        };

    const orderId = await generateOrderId();
    const totalAmount = product.price * (Number(quantity) || 1);

    // Decrement stock
    await Product.findByIdAndUpdate(product._id, { $inc: { stock: -(Number(quantity) || 1) } });

    const order = await Order.create({
      orderId,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: { street, city, state, pincode, country: country || 'India' },
      },
      product: {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: Number(quantity) || 1,
      },
      customization: {
        uploadedImage: uploadedImageData,
        selectedVideo: videoData,
        templateId: templateId || undefined,
      },
      payment: {
        method: paymentMethod || 'razorpay',
        status: 'pending',
        amount: totalAmount,
      },
      notes: notes || '',
    });

    // Create AR target record
    const imageUrl = uploadedImageData.url || '';
    const videoUrl = videoData.url || '';

    if (imageUrl && videoUrl) {
      await ARTarget.create({
        orderId: order._id,
        orderIdString: orderId,
        imageUrl,
        imagePublicId: uploadedImageData.publicId || '',
        videoUrl,
        videoPublicId: videoData.publicId || '',
      });
    }

    // Send confirmation email
    try {
      await sendOrderConfirmation(order);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: {
        id: order._id,
        orderId: order.orderId,
        amount: totalAmount,
        paymentMethod: order.payment.method,
        customization: {
          uploadedImage: order.customization.uploadedImage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders
// @route   GET /api/orders
// @access  Private (admin gets all, customer gets own)
const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, search } = req.query;
    const query = {};

    if (req.user.role !== 'admin') {
      query['customer.email'] = req.user.email;
    }

    if (status && status !== 'all') query.orderStatus = status;
    if (paymentStatus && paymentStatus !== 'all') query['payment.status'] = paymentStatus;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('product.productId', 'name images')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by orderId
// @route   GET /api/orders/:orderId
// @access  Public (with email verification for non-admin)
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() })
      .populate('product.productId', 'name images category')
      .populate('customization.templateId', 'name imageUrl category')
      .populate('customization.selectedVideo.presetVideoId', 'name videoUrl thumbnailUrl');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // If not admin, verify email matches
    if (!req.user || req.user.role !== 'admin') {
      const { email } = req.query;
      if (!email || email.toLowerCase() !== order.customer.email.toLowerCase()) {
        return res.status(403).json({ success: false, message: 'Access denied. Email verification required.' });
      }
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
// @access  Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const previousStatus = order.orderStatus;
    const updateData = { orderStatus };

    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

    const updatedOrder = await Order.findByIdAndUpdate(order._id, updateData, { new: true });

    // Send status update email if status changed
    if (previousStatus !== orderStatus) {
      try {
        await sendOrderStatusUpdate(updatedOrder);
      } catch (emailError) {
        console.error('Status email failed:', emailError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get download links for order files (admin only)
// @route   GET /api/orders/:orderId/files
// @access  Admin
const downloadOrderFiles = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const files = {};

    // Generate signed URLs for Cloudinary assets (valid for 1 hour)
    if (order.customization.uploadedImage && order.customization.uploadedImage.publicId) {
      files.uploadedImage = cloudinary.url(order.customization.uploadedImage.publicId, {
        secure: true,
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      });
    }

    if (order.customization.selectedVideo) {
      if (order.customization.selectedVideo.publicId) {
        files.selectedVideo = cloudinary.url(order.customization.selectedVideo.publicId, {
          resource_type: 'video',
          secure: true,
          sign_url: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        });
      } else if (order.customization.selectedVideo.url) {
        files.selectedVideo = order.customization.selectedVideo.url;
      }
    }

    if (order.customization.templateId) {
      const template = await Template.findById(order.customization.templateId).select('name imageUrl');
      if (template) {
        files.templateImage = template.imageUrl;
        files.templateName = template.name;
      }
    }

    const arTarget = await ARTarget.findOne({ orderId: order._id });
    if (arTarget) {
      files.arTarget = {
        imageUrl: arTarget.imageUrl,
        videoUrl: arTarget.videoUrl,
        mindFileUrl: arTarget.targetFileUrl || null,
      };
    }

    res.status(200).json({ success: true, files, orderId: order.orderId });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order stats for admin dashboard
// @route   GET /api/orders/stats
// @access  Admin
const getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });

    const revenueResult = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('product.productId', 'name');

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  downloadOrderFiles,
  getOrderStats,
};
