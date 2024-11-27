const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { orderId } = JSON.parse(event.body);

    // Get PayPal access token
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: 'grant_type=client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;

    // Capture PayPal order
    const captureResponse = await axios({
      method: 'post',
      url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const captureData = captureResponse.data;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(captureData),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to capture PayPal order' }),
    };
  }
};
