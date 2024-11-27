const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import('node-fetch').then(fetch => {
  exports.handler = async (event) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Max-Age': '86400',
        },
      };
    }

    // Log environment variables (securely)
    console.log('Stripe Key exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('Request path:', event.path);
    console.log('Request headers:', JSON.stringify(event.headers));
    
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    try {
      const { amount, orderId } = JSON.parse(event.body);
      console.log('Received request:', { amount, orderId });

      if (!process.env.STRIPE_SECRET_KEY) {
        console.error('Stripe key missing');
        throw new Error('Stripe secret key is not configured');
      }

      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'eur',
        metadata: { orderId },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log('Payment Intent created:', paymentIntent.id);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientSecret: paymentIntent.client_secret,
        }),
      };
    } catch (error) {
      console.error('Function error:', error.message);
      console.error('Error stack:', error.stack);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.message,
        }),
      };
    }
  };
});
