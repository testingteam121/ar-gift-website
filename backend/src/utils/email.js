const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    processing: 'Processing',
    printing: 'Printing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    pending: '#F59E0B',
    processing: '#3B82F6',
    printing: '#8B5CF6',
    shipped: '#10B981',
    delivered: '#059669',
    cancelled: '#EF4444',
  };
  return colors[status] || '#6B7280';
};

// @desc Send order confirmation email
const sendOrderConfirmation = async (order) => {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - AR Gifts</title>
    </head>
    <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#f4f4f5;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#7C3AED,#A855F7);padding:40px 32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">✨ AR Gifts</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:16px;">Your Order is Confirmed!</p>
        </div>

        <!-- Success Icon -->
        <div style="text-align:center;padding:32px 32px 0;">
          <div style="display:inline-block;width:72px;height:72px;background:#F0FDF4;border-radius:50%;line-height:72px;font-size:36px;">✅</div>
          <h2 style="color:#111827;font-size:22px;margin:16px 0 4px;">Thank you, ${order.customer.name}!</h2>
          <p style="color:#6B7280;margin:0;font-size:15px;">We've received your order and are getting it ready.</p>
        </div>

        <!-- Order Details -->
        <div style="padding:24px 32px;">
          <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#6B7280;font-size:14px;">Order ID</span>
              <span style="color:#111827;font-weight:700;font-size:14px;font-family:monospace;">${order.orderId}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#6B7280;font-size:14px;">Product</span>
              <span style="color:#111827;font-weight:600;font-size:14px;">${order.product.name}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#6B7280;font-size:14px;">Quantity</span>
              <span style="color:#111827;font-weight:600;font-size:14px;">${order.product.quantity}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#6B7280;font-size:14px;">Payment Method</span>
              <span style="color:#111827;font-weight:600;font-size:14px;">${order.payment.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
            </div>
            <div style="border-top:1px solid #E5E7EB;padding-top:12px;margin-top:8px;">
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#111827;font-weight:700;font-size:16px;">Total Amount</span>
                <span style="color:#7C3AED;font-weight:700;font-size:18px;">₹${order.payment.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <!-- Delivery Address -->
          <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin-bottom:20px;">
            <h3 style="color:#111827;font-size:15px;font-weight:600;margin:0 0 12px;">Delivery Address</h3>
            <p style="color:#4B5563;font-size:14px;margin:0;line-height:1.6;">
              ${order.customer.address.street},<br>
              ${order.customer.address.city}, ${order.customer.address.state} - ${order.customer.address.pincode}<br>
              ${order.customer.address.country}
            </p>
          </div>

          <!-- AR Gift Info -->
          <div style="background:linear-gradient(135deg,#EDE9FE,#DDD6FE);border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #C4B5FD;">
            <h3 style="color:#5B21B6;font-size:15px;font-weight:600;margin:0 0 8px;">🎯 Your AR Gift is Being Created</h3>
            <p style="color:#6D28D9;font-size:14px;margin:0;line-height:1.5;">
              Once your order is processed, you'll be able to scan your gift with any smartphone camera to play the video message. We'll send you the scan instructions when your gift is ready.
            </p>
          </div>

          <!-- Track Order CTA -->
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${process.env.FRONTEND_URL}/track-order?orderId=${order.orderId}"
               style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#A855F7);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
              Track Your Order
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#F9FAFB;padding:24px 32px;text-align:center;border-top:1px solid #E5E7EB;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">
            Questions? Email us at <a href="mailto:support@argifts.com" style="color:#7C3AED;">support@argifts.com</a><br>
            © ${new Date().getFullYear()} AR Gifts. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"AR Gifts" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Order Confirmed - ${order.orderId} | AR Gifts`,
    html,
  };

  return transporter.sendMail(mailOptions);
};

// @desc Send order status update email
const sendOrderStatusUpdate = async (order) => {
  const transporter = createTransporter();
  const statusColor = getStatusColor(order.orderStatus);
  const statusLabel = getStatusLabel(order.orderStatus);

  const statusMessages = {
    processing: 'Great news! We\'ve started processing your order.',
    printing: 'Your AR gift is now being printed with care.',
    shipped: 'Your order is on its way! Get ready for the magic.',
    delivered: 'Your AR gift has been delivered. Enjoy the experience!',
    cancelled: 'Your order has been cancelled. Contact us if you have questions.',
  };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - AR Gifts</title>
    </head>
    <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#f4f4f5;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <div style="background:linear-gradient(135deg,#7C3AED,#A855F7);padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">✨ AR Gifts</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;">Order Status Update</p>
        </div>

        <div style="padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="display:inline-block;background:${statusColor};color:#fff;padding:8px 20px;border-radius:20px;font-size:14px;font-weight:600;">
              ${statusLabel}
            </span>
          </div>

          <h2 style="color:#111827;font-size:20px;margin:0 0 8px;text-align:center;">Hi ${order.customer.name}!</h2>
          <p style="color:#6B7280;text-align:center;margin:0 0 24px;font-size:15px;">
            ${statusMessages[order.orderStatus] || 'Your order status has been updated.'}
          </p>

          <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#6B7280;font-size:14px;">Order ID</span>
              <span style="color:#111827;font-weight:700;font-size:14px;font-family:monospace;">${order.orderId}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#6B7280;font-size:14px;">Product</span>
              <span style="color:#111827;font-weight:600;font-size:14px;">${order.product.name}</span>
            </div>
            ${order.trackingNumber ? `
            <div style="display:flex;justify-content:space-between;margin-top:8px;">
              <span style="color:#6B7280;font-size:14px;">Tracking No.</span>
              <span style="color:#111827;font-weight:600;font-size:14px;font-family:monospace;">${order.trackingNumber}</span>
            </div>
            ` : ''}
          </div>

          <div style="text-align:center;">
            <a href="${process.env.FRONTEND_URL}/track-order?orderId=${order.orderId}"
               style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#A855F7);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
              Track Your Order
            </a>
          </div>
        </div>

        <div style="background:#F9FAFB;padding:20px 32px;text-align:center;border-top:1px solid #E5E7EB;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">
            © ${new Date().getFullYear()} AR Gifts. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"AR Gifts" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Order ${statusLabel} - ${order.orderId} | AR Gifts`,
    html,
  });
};

module.exports = { sendOrderConfirmation, sendOrderStatusUpdate };
