const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = 3001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin privileges
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(cors());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('Creating payment intent for order:', orderId, 'amount:', amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId
      }
    });

    console.log('Payment intent created:', paymentIntent.id);

    // Update the order with the payment intent ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_intent_id: paymentIntent.id,
        payment_status: 'processing'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order with payment intent:', updateError);
      throw updateError;
    }

    console.log('Order updated with payment intent ID');

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint to handle Stripe events
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Processing payment_intent.succeeded:', paymentIntent.id);
        
        // Find the order with this payment intent
        const { data: orders, error: findError } = await supabase
          .from('orders')
          .select('id')
          .eq('payment_intent_id', paymentIntent.id)
          .single();

        if (findError) {
          console.error('Error finding order:', findError);
          break;
        }

        if (orders) {
          // Update order status
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: 'succeeded',
              stripe_customer_id: paymentIntent.customer || null
            })
            .eq('id', orders.id);

          if (updateError) {
            console.error('Error updating order:', updateError);
          } else {
            console.log('Successfully updated order:', orders.id);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Processing payment_intent.payment_failed:', failedPayment.id);
        
        // Update order status to failed
        const { error: failureError } = await supabase
          .from('orders')
          .update({
            payment_status: 'failed'
          })
          .eq('payment_intent_id', failedPayment.id);

        if (failureError) {
          console.error('Error updating failed payment:', failureError);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).send(`Webhook Error: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
