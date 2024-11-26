import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(dirname(__dirname), '../.env') });

// Verify required environment variables
const requiredEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const app = express();
const port = 3001;

app.use((req, res, next) => {
  if (req.path === '/webhook' && req.method === 'POST') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://newassets.hcaptcha.com', 'https://api2.hcaptcha.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// PayPal API Configuration
const PAYPAL_API = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Generate PayPal access token
async function generatePayPalAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// Webhook endpoint for Stripe events
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        
        // Update order status in Supabase
        await supabase
          .from('orders')
          .update({
            payment_status: 'succeeded',
            payment_intent_id: paymentIntent.id,
            stripe_customer_id: paymentIntent.customer
          })
          .eq('id', orderId);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            payment_intent_id: failedPayment.id
          })
          .eq('id', failedPayment.metadata.orderId);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      metadata: { orderId }, // Store orderId in metadata for reference
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Send publishable key and PaymentIntent details to client
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create PayPal Order
app.post('/create-paypal-order', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const accessToken = await generatePayPalAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: amount.toFixed(2),
          },
          custom_id: orderId,
        }],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error creating PayPal order:', err);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

// Capture PayPal Order
app.post('/capture-paypal-order', async (req, res) => {
  try {
    const { orderId, supabaseOrderId } = req.body;
    const accessToken = await generatePayPalAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (data.status === 'COMPLETED') {
      // Update order status in Supabase
      await supabase
        .from('orders')
        .update({
          payment_status: 'succeeded',
          payment_provider: 'paypal',
          paypal_order_id: orderId,
          paypal_payer_id: data.payer.payer_id,
        })
        .eq('id', supabaseOrderId);
    }

    res.json(data);
  } catch (err) {
    console.error('Error capturing PayPal order:', err);
    res.status(500).json({ error: 'Failed to capture PayPal order' });
  }
});

// Add basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV,
    stripeVersion: stripe.VERSION,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    hasPayPalClientId: !!process.env.PAYPAL_CLIENT_ID,
    hasPayPalSecret: !!process.env.PAYPAL_CLIENT_SECRET,
    envPath: path.join(dirname(__dirname), '../.env'),
    currentDir: __dirname
  });
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
