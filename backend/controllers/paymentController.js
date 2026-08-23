const Razorpay = require('razorpay');
const crypto = require('crypto');

const createOrder = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Invalid payment amount'
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys are missing in environment variables');

      return res.status(500).json({
        message: 'Razorpay keys are not configured on the server'
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `shopnest_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({
        message: 'Razorpay order creation failed'
      });
    }

    return res.status(200).json(order);

  } catch (error) {
    console.error('Razorpay order creation error:', error);

    return res.status(500).json({
      message: error.message || 'Razorpay order creation failed',
      code: error.code || null,
      description: error.description || null
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: 'Missing Razorpay payment details'
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        message: 'Razorpay secret is not configured on the server'
      });
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({
        message: 'Payment verified successfully'
      });
    }

    return res.status(400).json({
      message: 'Invalid payment signature'
    });

  } catch (error) {
    console.error('Razorpay payment verification error:', error);

    return res.status(500).json({
      message: error.message || 'Payment verification failed'
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};cd