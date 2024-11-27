import React, { useEffect } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { updateOrderPayment } from '../utils/supabase';

interface PayPalButtonProps {
  amount: number;
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  orderId,
  onSuccess,
  onError,
}) => {
  const [{ isResolved }] = usePayPalScriptReducer();

  const createOrder = async () => {
    try {
      // Update order status to processing
      await updateOrderPayment(orderId, {
        payment_status: 'processing',
        payment_provider: 'paypal',
        payment_intent_id: '',
      });

      // Create PayPal order
      const response = await fetch('http://localhost:3001/create-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
        }),
      });

      const order = await response.json();
      return order.id;
    } catch (err) {
      console.error('Error creating PayPal order:', err);
      onError?.(err);
      throw err;
    }
  };

  const onApprove = async (data: any) => {
    try {
      // Capture the funds from the transaction
      const response = await fetch(`http://localhost:3001/capture-paypal-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
          supabaseOrderId: orderId,
        }),
      });

      const details = await response.json();

      // Update order with PayPal details
      await updateOrderPayment(orderId, {
        payment_status: 'succeeded',
        payment_provider: 'paypal',
        paypal_order_id: data.orderID,
        paypal_payer_id: details.payer_id,
      });

      onSuccess?.();
    } catch (err) {
      console.error('Error capturing PayPal order:', err);
      onError?.(err);
      
      // Update order status to failed
      await updateOrderPayment(orderId, {
        payment_status: 'failed',
        payment_provider: 'paypal',
        paypal_order_id: data.orderID,
      });
    }
  };

  if (!isResolved) {
    return <div>Loading PayPal...</div>;
  }

  return (
    <PayPalButtons
      style={{ layout: 'horizontal' }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={(err) => {
        console.error('PayPal error:', err);
        onError?.(err);
      }}
    />
  );
};

export default PayPalButton;
