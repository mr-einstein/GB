const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Log environment variables (securely)
  console.log('Stripe Key exists:', !!process.env.STRIPE_SECRET_KEY);
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { amount, orderId } = JSON.parse(event.body);
    console.log('Received request:', { amount, orderId });

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not configured');
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      metadata: { orderId },
    });

    console.log('Payment Intent created:', paymentIntent.id);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
    };
  } catch (error) {
    console.error('Function error:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ 
        error: error.message || 'Failed to create payment intent',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};
