const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

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
    const { orderId, supabaseOrderId } = JSON.parse(event.body);
    console.log('Capturing PayPal order:', orderId, 'for Supabase order:', supabaseOrderId);

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

    // Capture the PayPal order
    const captureResponse = await axios({
      method: 'post',
      url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (captureResponse.data.status === 'COMPLETED') {
      // Update order status in Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'succeeded',
          payment_provider: 'paypal',
          paypal_order_id: orderId,
          paypal_payer_id: captureResponse.data.payer.payer_id,
        })
        .eq('id', supabaseOrderId);

      if (updateError) {
        console.error('Error updating order in Supabase:', updateError);
        throw updateError;
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(captureResponse.data),
    };

  } catch (error) {
    console.error('PayPal capture error:', error.response?.data || error.message);
    
    // If there's a Supabase orderId, update the order status to failed
    if (event.body) {
      try {
        const { supabaseOrderId } = JSON.parse(event.body);
        if (supabaseOrderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              payment_provider: 'paypal',
            })
            .eq('id', supabaseOrderId);
        }
      } catch (updateError) {
        console.error('Error updating failed status:', updateError);
      }
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://testilicious.netlify.app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to capture PayPal payment',
        details: error.response?.data || error.message,
      }),
    };
  }
};
