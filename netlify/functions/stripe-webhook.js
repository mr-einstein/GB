const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    // Verify the webhook signature
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );

    console.log('Webhook received:', stripeEvent.type);

    // Handle different event types
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // Add your business logic here
        break;

      case 'payment_intent.failed':
        const failedPayment = stripeEvent.data.object;
        console.log('Payment failed:', failedPayment.id);
        // Add your business logic here
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.error('Webhook error:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Webhook Error: ${err.message}`,
      }),
    };
  }
};
