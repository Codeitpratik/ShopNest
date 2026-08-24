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

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log('Razorpay Key ID exists:', !!keyId);
    console.log('Razorpay Key Secret exists:', !!keySecret);

    if (!keyId || !keySecret) {
      return res.status(500).json({
        message: 'Razorpay keys are missing on server'
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `shopnest_${Date.now()}`
    };

    console.log('Creating Razorpay order:', options);

    const order = await instance.orders.create(options);

    console.log('Razorpay order created:', order);

    return res.status(200).json(order);

  } catch (error) {
    console.error('===== RAZORPAY ERROR =====');
    console.error('message:', error?.message);
    console.error('name:', error?.name);
    console.error('code:', error?.code);
    console.error('statusCode:', error?.statusCode);
    console.error('description:', error?.description);
    console.error('error object:', error);
    console.error('==========================');

    return res.status(500).json({
      message: error?.message || 'Razorpay order creation failed',
      code: error?.code || null,
      statusCode: error?.statusCode || null,
      description: error?.description || null
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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: 'Missing Razorpay payment details'
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: 'Razorpay secret is missing on server'
      });
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac('sha256', secret)
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
    console.error('Payment verification error:', error);

    return res.status(500).json({
      message: error?.message || 'Payment verification failed'
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};