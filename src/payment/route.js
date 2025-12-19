const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cors = require('cors');

// Add middleware after webhook
router.use(cors());
router.use(express.json());


const {
  createCheckoutSession,
  paymentSuccess,
  postWebhooks
} = require('./controller');

// ⚠️ Must come BEFORE express.json!
router.post('/webhook', express.raw({ type: 'application/json' }), postWebhooks);

router.post('/checkout', auth, createCheckoutSession);
router.get('/payment/success',  paymentSuccess);

module.exports = router;
