const Order = require('../models/Order');

const generateOrderId = async () => {
  const year = new Date().getFullYear();
  const prefix = `ARG-${year}-`;

  // Generate a random 6-character alphanumeric suffix
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const orderId = `${prefix}${suffix}`;

  // Ensure uniqueness
  const existing = await Order.findOne({ orderId });
  if (existing) {
    return generateOrderId(); // Recurse until unique
  }

  return orderId;
};

module.exports = generateOrderId;
