import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, Building2, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { updateOrderPayment } from '../utils/supabase';
import PayPalButton from './PayPalButton';
import { API_ENDPOINTS, fetchApi } from '../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface LocationState {
  orderId: string;
  propertyAddress: string;
  selectedDocuments: string[];
  totalAmount: number;
}

type PaymentMethod = 'stripe' | 'paypal';

const PaymentForm: React.FC<{ totalAmount: number; orderId: string }> = ({ totalAmount, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Update order status to processing
      await updateOrderPayment(orderId, {
        payment_status: 'processing',
        payment_intent_id: '', // Will be updated after confirmation
      });

      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?orderId=${orderId}`,
        },
      });

      if (paymentError) {
        setError(paymentError.message || 'Ein Fehler ist aufgetreten.');
        // Update order status to failed
        await updateOrderPayment(orderId, {
          payment_status: 'failed',
          payment_intent_id: paymentIntent?.id || '',
        });
        setProcessing(false);
      }
      // If successful, the user will be redirected to the success page
    } catch (err) {
      setError('Ein Fehler ist aufgetreten bei der Verarbeitung Ihrer Zahlung.');
      setProcessing(false);
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setError(null);
  };

  const handlePayPalError = (error: any) => {
    setError('Ein Fehler ist bei der PayPal-Zahlung aufgetreten.');
    console.error('PayPal error:', error);
  };

  const handlePayPalSuccess = () => {
    navigate(`/payment-success?orderId=${orderId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handlePaymentMethodChange('stripe')}
          className={`flex-1 py-2 px-4 rounded-md ${
            paymentMethod === 'stripe'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Kreditkarte
        </button>
        <button
          onClick={() => handlePaymentMethodChange('paypal')}
          className={`flex-1 py-2 px-4 rounded-md ${
            paymentMethod === 'paypal'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          PayPal
        </button>
      </div>

      {paymentMethod === 'stripe' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={!stripe || processing}
            className="w-full bg-yellow-500 text-white py-3 px-4 rounded-md font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Verarbeitung...' : `${totalAmount}€ Bezahlen`}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <PayPalButton
            amount={totalAmount}
            orderId={orderId}
            onSuccess={handlePayPalSuccess}
            onError={handlePayPalError}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      )}
    </div>
  );
};

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get state from location
  const state = location.state as LocationState;

  // If no state, redirect to home
  useEffect(() => {
    if (!location.state) {
      console.error('No state provided');
      navigate('/');
      return;
    }
  }, [location.state, navigate]);

  const initializePayment = async () => {
    try {
      const data = await fetchApi(API_ENDPOINTS.createPaymentIntent, {
        method: 'POST',
        body: JSON.stringify({
          amount: state.totalAmount,
          orderId: state.orderId,
        }),
      });
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Ein Fehler ist aufgetreten bei der Erstellung der Zahlung.');
    }
  };

  useEffect(() => {
    if (!state?.orderId || !state?.totalAmount) {
      return;
    }
    initializePayment();
  }, [state?.orderId, state?.totalAmount]);

  if (!state) {
    return null;
  }

  return (
    <PayPalScriptProvider options={{ 
      "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
      currency: "EUR"
    }}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-yellow-500" />
              <span className="font-semibold text-gray-800">dein-grundbuch-online.de</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1590593162201-f67611a18b87?auto=format&fit=crop&q=80&w=100"
              alt="German Flag"
              className="h-8"
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold">Gleich geschafft</h1>
            </div>

            {/* Service Details */}
            <div className="bg-gray-50 p-4 rounded-md mb-6 space-y-2">
              <div className="text-sm text-gray-600">Antragsservice für:</div>
              <div>{state.selectedDocuments.join(', ')}</div>
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>{state.propertyAddress}</span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <h2 className="font-semibold">Zahlungsinformationen</h2>
              </div>
              {clientSecret && (
                <Elements stripe={stripePromise} options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}>
                  <PaymentForm totalAmount={state.totalAmount} orderId={state.orderId} />
                </Elements>
              )}
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </PayPalScriptProvider>
  );
};

export default PaymentPage;