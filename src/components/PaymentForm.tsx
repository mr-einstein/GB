import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { updateOrderPayment } from '../utils/supabase';
import PayPalButton from './PayPalButton';
import { PaymentProvider } from '../types/order';

interface PaymentFormProps {
  totalAmount: number;
  orderId: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ totalAmount, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('stripe');

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !orderId) {
      return;
    }

    setIsProcessing(true);

    try {
      // First update order to processing status
      await updateOrderPayment(orderId, {
        payment_status: 'processing',
        payment_provider: 'stripe',
        payment_intent_id: null,
      });

      // Confirm the payment
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?orderId=${orderId}`,
        },
        redirect: 'always', // Always redirect to handle payment status via webhook
      });

      // If we get here, it means the payment failed immediately
      if (paymentError) {
        await updateOrderPayment(orderId, {
          payment_status: 'failed',
          payment_provider: 'stripe',
          payment_intent_id: paymentIntent?.id || null,
        });
        setError(paymentError.message || 'Ein Fehler ist aufgetreten.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Ein Fehler ist aufgetreten bei der Verarbeitung Ihrer Zahlung.');
      
      // Update order status to failed
      try {
        await updateOrderPayment(orderId, {
          payment_status: 'failed',
          payment_provider: 'stripe',
          payment_intent_id: null,
        });
      } catch (updateErr) {
        console.error('Failed to update order status:', updateErr);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalSuccess = () => {
    navigate(`/payment-success?orderId=${orderId}`);
  };

  const handlePayPalError = (err: any) => {
    setError('Ein Fehler ist aufgetreten bei der PayPal-Zahlung.');
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <div className="text-lg font-semibold mb-4">
          Zahlungsbetrag: €{totalAmount.toFixed(2)}
        </div>
        
        <div className="mb-6">
          <div className="text-sm font-medium mb-2">Zahlungsmethode wählen:</div>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                paymentMethod === 'stripe'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Kreditkarte
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                paymentMethod === 'paypal'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              PayPal
            </button>
          </div>
        </div>

        {paymentMethod === 'stripe' ? (
          <form onSubmit={handleStripeSubmit}>
            <PaymentElement />
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isProcessing || !stripe || !elements}
              className={`w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-3 px-6 rounded-md font-medium transition-colors ${
                (isProcessing || !stripe || !elements) && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'Verarbeitung...' : 'Jetzt bezahlen'}
            </button>
          </form>
        ) : (
          <div>
            <PayPalButton
              amount={totalAmount}
              orderId={orderId}
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
            />
            {error && (
              <div className="text-red-500 text-sm mt-4">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
