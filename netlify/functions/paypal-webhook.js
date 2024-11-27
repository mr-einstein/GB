const fetch = require('node-fetch');
const crypto = require('crypto');

exports.handler = async (event) => {
  // Verify PayPal webhook signature
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const requestBody = event.body;
  const transmissionId = event.headers['paypal-transmission-id'];
  const timestamp = event.headers['paypal-transmission-time'];
  const webhookEvent = event.headers['paypal-transmission-sig'];
  const certUrl = event.headers['paypal-cert-url'];
  const authAlgo = event.headers['paypal-auth-algo'];

  try {
    // Get PayPal access token
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await tokenResponse.json();

    // Verify webhook signature
    const verificationResponse = await fetch('https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: timestamp,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: webhookEvent,
        webhook_id: webhookId,
        webhook_event: JSON.parse(requestBody),
      }),
    });

    const verificationResult = await verificationResponse.json();

    if (verificationResult.verification_status !== 'SUCCESS') {
      throw new Error('Invalid webhook signature');
    }

    // Parse the webhook event
    const paypalEvent = JSON.parse(requestBody);
    console.log('PayPal webhook received:', paypalEvent.event_type);

    // Handle different event types
    switch (paypalEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        console.log('Payment completed:', paypalEvent.resource.id);
        // Add your business logic here
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        console.log('Payment denied:', paypalEvent.resource.id);
        // Add your business logic here
        break;

      case 'PAYMENT.CAPTURE.PENDING':
        console.log('Payment pending:', paypalEvent.resource.id);
        // Add your business logic here
        break;

      default:
        console.log(`Unhandled event type: ${paypalEvent.event_type}`);
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
