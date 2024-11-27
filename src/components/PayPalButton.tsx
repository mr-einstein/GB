import React, { useEffect } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { updateOrderPayment } from '../utils/supabase';
import { API_ENDPOINTS, fetchApi } from '../utils/api';

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
      const orderData = await fetchApi(API_ENDPOINTS.createPayPalOrder, {
        method: 'POST',
        body: JSON.stringify({
          amount,
          orderId,
        }),
      });

      return orderData.id;
    } catch (err) {
      console.error('Error creating PayPal order:', err);
      onError?.(err);
      throw err;
    }
  };

  const onApprove = async (data: any) => {
    try {
      // Capture PayPal payment
      const captureData = await fetchApi(API_ENDPOINTS.capturePayPalOrder, {
        method: 'POST',
        body: JSON.stringify({
          orderId: data.orderID,
          supabaseOrderId: orderId,
        }),
      });

      // Update order status to succeeded (not completed)
      await updateOrderPayment(orderId, {
        payment_status: 'succeeded',
        payment_provider: 'paypal',
        payment_intent_id: data.orderID,
      });

      onSuccess?.();
    } catch (err) {
      console.error('Error capturing PayPal payment:', err);
      onError?.(err);
      
      // Update order status to failed
      await updateOrderPayment(orderId, {
        payment_status: 'failed',
        payment_provider: 'paypal',
        payment_intent_id: data.orderID,
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
