const ARTarget = require('../models/ARTarget');
const Order = require('../models/Order');

// @desc    Get AR target by orderId
// @route   GET /api/ar/target/:orderId
// @access  Public
const getARTarget = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const arTarget = await ARTarget.findOne({
      orderIdString: orderId.toUpperCase(),
      isActive: true,
    });

    if (!arTarget) {
      return res.status(404).json({
        success: false,
        message: 'AR target not found for this order. Please ensure your order is confirmed.',
      });
    }

    // Increment scan count
    await ARTarget.findByIdAndUpdate(arTarget._id, {
      $inc: { scanCount: 1 },
      lastScannedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      arTarget: {
        id: arTarget._id,
        imageUrl: arTarget.imageUrl,
        videoUrl: arTarget.videoUrl,
        mindFileUrl: arTarget.targetFileUrl || null,
        // Note: .mind file should be pre-compiled using MindAR compiler
        // For production: generate .mind file server-side or via external service
        scanCount: arTarget.scanCount + 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update AR target
// @route   POST /api/ar/target
// @access  Admin / Internal
const createARTarget = async (req, res, next) => {
  try {
    const { orderId, imageUrl, videoUrl, targetFileUrl, imagePublicId, videoPublicId } = req.body;

    if (!orderId || !imageUrl || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'orderId, imageUrl, and videoUrl are required.',
      });
    }

    const order = await Order.findOne({ orderId: orderId.toUpperCase() });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Upsert AR target
    const arTarget = await ARTarget.findOneAndUpdate(
      { orderIdString: orderId.toUpperCase() },
      {
        orderId: order._id,
        orderIdString: orderId.toUpperCase(),
        imageUrl,
        imagePublicId: imagePublicId || '',
        videoUrl,
        videoPublicId: videoPublicId || '',
        targetFileUrl: targetFileUrl || '',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Update order with AR target reference
    await Order.findByIdAndUpdate(order._id, {
      'arTarget.url': imageUrl,
      'arTarget.mindFileUrl': targetFileUrl || '',
    });

    res.status(201).json({
      success: true,
      message: 'AR target created/updated successfully.',
      arTarget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update AR target mind file URL (after compilation)
// @route   PUT /api/ar/target/:orderId/mind-file
// @access  Admin
const updateMindFile = async (req, res, next) => {
  try {
    const { targetFileUrl, targetFilePublicId } = req.body;
    const { orderId } = req.params;

    const arTarget = await ARTarget.findOneAndUpdate(
      { orderIdString: orderId.toUpperCase() },
      { targetFileUrl, targetFilePublicId: targetFilePublicId || '' },
      { new: true }
    );

    if (!arTarget) {
      return res.status(404).json({ success: false, message: 'AR target not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Mind file URL updated successfully.',
      arTarget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate AR target
// @route   DELETE /api/ar/target/:orderId
// @access  Admin
const deactivateARTarget = async (req, res, next) => {
  try {
    const arTarget = await ARTarget.findOneAndUpdate(
      { orderIdString: req.params.orderId.toUpperCase() },
      { isActive: false },
      { new: true }
    );

    if (!arTarget) {
      return res.status(404).json({ success: false, message: 'AR target not found.' });
    }

    res.status(200).json({ success: true, message: 'AR target deactivated.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getARTarget, createARTarget, updateMindFile, deactivateARTarget };
