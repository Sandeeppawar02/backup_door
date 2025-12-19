require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Knex = require('../../db/knex');
const pool = require('../../db/dbConfig');
const { nanoid } = require('nanoid');
const Joi = require('joi');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Optional dev flag to test in Postman (disable in production!)
const BYPASS_SIGNATURE_VERIFICATION = false;

// ✅ Schema for validating input
const schema = Joi.object({
  plan_id: Joi.number().required(),
  amount: Joi.number().required()
});

// Create Stripe Subscription Session and Store Transaction
const createCheckoutSession = async (req, res) => {
  const trx = await Knex.transaction();

  try {
    const user_id = req.id;
    const { value, error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const user = await trx('users').where({ id: user_id }).first();
    if (!user) return res.status(404).json({ error: 'User not found' });

    let stripeCustomerId = user.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email });
      stripeCustomerId = customer.id;

      await trx('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .where({ id: user_id });
    }

    const plan = await trx('plans').where({ id: value.plan_id }).first();
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const transactionId = nanoid();

    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: plan.price_id, quantity: 1 }],
      subscription_data: {
        metadata: {
          transaction_public_id: transactionId
        }
      },
      success_url: `${baseUrl}/api/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/api/payment/cancel`
    });

    await trx('transactions').insert({
      user_id,
      plan_id: plan.id,
      amount: plan.amount, // Always use backend-verified amount
      gateway_id: 1,
      transaction_public_id: transactionId
    });

    // Example: mark all users of this company as verified
    await trx('users')
      .update({ is_verified: true })
      .where({ company_id: user.company_id });

    await trx.commit();

    res.json({ url: session.url });
  } catch (err) {
    await trx.rollback();
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Handle Stripe Success URL and Fetch User Transaction
const paymentSuccess = async (req, res) => {
  try {
    const session_id = req.query.session_id;
    // console.log("session_id :", session_id);
    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id in query" });
    }

    // Get Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    // console.log("session", session)
    if (!session || !session.customer) {
      return res.status(404).json({ error: "Session not found or customer missing" });
    }

    const stripeCustomerId = session.customer;
    const payment_status = session.payment_status;
    console.log("payment_status :",payment_status)

    // Get user from database using stripe_customer_id
    const user = await Knex('users').where({ stripe_customer_id: stripeCustomerId }).first();
    if (!user) {
      return res.status(404).json({ error: "User not found in DB" });
    }

    // Fetch transactions for this user
    const result = await pool.query(
      Knex('transactions').select().where({ user_id: user.id }).toString()
    );

    const response = {
      message: "Subscription Successful",
      payment_status,
      user_id: user.id,
      email: user.email,
      transactions: result.rows[0],
      status: true
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Success page error:", err);
    res.status(500).send("Error loading success page");
  }
};

//Handle Stripe Webhook Events (Success/Failure)
const postWebhooks = async (req, res) => {
  let event;

  try {
    if (BYPASS_SIGNATURE_VERIFICATION) {
      event = req.body; // Directly from Postman (dev only)
    } else {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data;
  const eventType = event.type;

  try {
    if (eventType === 'payment_intent.succeeded') {
      const charge_id = data.object.latest_charge;
      const stripeCustomerId = data.object.customer;
      const invoiceId = data.object.invoice;

      const customer = await stripe.customers.retrieve(stripeCustomerId);
      const cus_number = customer.metadata.cus_number;
      const cus_plan = customer.metadata.cus_plan;

      const invoice = await stripe.invoices.retrieve(invoiceId);
      const order_id = invoice.subscription_details.metadata.order_id;
      const subscription_id = invoice.subscription;
      const sub_status = invoice.status;

      const subscription = await stripe.subscriptions.retrieve(subscription_id);
      const startdate = new Date(subscription.current_period_start * 1000);
      const enddate = new Date(subscription.current_period_end * 1000);

      const info = {
        user_id: cus_number,
        plan_id: cus_plan,
        status: sub_status,
        sub_id: subscription_id,
        start_id: startdate,
        end_at: enddate,
        transaction_gateway_id: charge_id
      };

      const updateTrans = {
        payment_id: data.object.id,
        transaction_gateway_id: charge_id,
        payment_status: "Success",
        payment_reason_code: sub_status
      };

      const existsub = await pool.query(
        Knex('user_subscriptions')
          .where({ user_id: cus_number, transaction_gateway_id: charge_id })
          .toString()
      );

      if (existsub.rowCount === 0) {
        await pool.query(Knex('user_subscriptions').insert(info).toString());
        await pool.query(
          Knex('transactions')
            .update(updateTrans)
            .where({ user_id: cus_number, transaction_public_id: order_id })
            .toString()
        );
      }
    }

    if (eventType === 'payment_intent.payment_failed') {
      const charge_id = data.object.last_payment_error.charge;
      const stripeCustomerId = data.object.customer;
      const invoiceId = data.object.invoice;
      const payment_reason_code = data.object.last_payment_error.message;

      const customer = await stripe.customers.retrieve(stripeCustomerId);
      const cus_number = customer.metadata.cus_number;

      const invoice = await stripe.invoices.retrieve(invoiceId);
      const order_id = invoice.subscription_details.metadata.order_id;

      const updateTrans = {
        payment_id: data.object.id,
        transaction_gateway_id: charge_id,
        payment_status: "Failed",
        payment_reason_code
      };

      const existsTran = await pool.query(
        Knex('transactions')
          .where({ user_id: cus_number, transaction_gateway_id: charge_id })
          .toString()
      );

      if (existsTran.rowCount === 0) {
        await pool.query(
          Knex('transactions')
            .update(updateTrans)
            .where({ user_id: cus_number, transaction_public_id: order_id })
            .toString()
        );
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).send("Webhook processing failed.");
  }
};

module.exports = {
  createCheckoutSession,
  paymentSuccess,
  postWebhooks
};
