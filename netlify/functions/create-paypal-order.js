const axios = require('axios');

exports.handler = async (event) => {
  // Log environment variables (securely)
  console.log('PayPal credentials exist:', {
    clientId: !!process.env.PAYPAL_CLIENT_ID,
    clientSecret: !!process.env.PAYPAL_CLIENT_SECRET
  });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    const { amount, orderId } = JSON.parse(event.body);
    console.log('Received request:', { amount, orderId });

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials are not configured');
    }

    // Get PayPal access token
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: 'grant_type=client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;

    // Create PayPal order
    const orderResponse = await axios({
      method: 'post',
      url: 'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId,
          amount: {
            currency_code: 'EUR',
            value: amount.toString(),
          },
        }],
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderResponse.data),
    };

  } catch (error) {
    console.error('PayPal API error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to create PayPal order',
        details: error.response?.data || error.message,
      }),
    };
  }
};
