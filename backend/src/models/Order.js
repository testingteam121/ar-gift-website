const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
      },
      phone: { type: String, required: true, trim: true },
      address: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
        country: { type: String, default: 'India', trim: true },
      },
    },
    product: {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, default: 1, min: 1 },
    },
    customization: {
      uploadedImage: {
        url: String,
        publicId: String,
      },
      selectedVideo: {
        url: String,
        publicId: String,
        type: {
          type: String,
          enum: ['preset', 'upload'],
        },
        presetVideoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'PresetVideo',
        },
      },
      templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
      },
    },
    payment: {
      method: {
        type: String,
        enum: ['razorpay', 'cod'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      amount: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      paidAt: Date,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'printing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    arTarget: {
      url: String,
      publicId: String,
      mindFileUrl: String,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    trackingNumber: String,
    estimatedDelivery: Date,
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ orderId: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
