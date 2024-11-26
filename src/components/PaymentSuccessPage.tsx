import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, FileText } from 'lucide-react';
import { updateOrderPayment } from '../utils/supabase';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    // Update order status to succeeded when component mounts
    if (orderId && paymentIntentId) {
      updateOrderPayment(orderId, {
        payment_status: 'succeeded',
        payment_intent_id: paymentIntentId,
      }).catch(console.error);
    }
  }, [orderId, paymentIntentId]);

  return (
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
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Vielen Dank für Ihre Bestellung!</h1>
            <p className="text-gray-600">
              Ihre Zahlung wurde erfolgreich verarbeitet.
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="font-semibold mb-2">Nächste Schritte</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Sie erhalten in Kürze eine Bestätigungs-E-Mail von uns</li>
                <li>• Wir erstellen Ihre Anträge und senden diese an die zuständigen Behörden</li>
                <li>• Die Behörden senden Ihnen die Dokumente direkt zu</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-md text-blue-800">
              <h2 className="font-semibold mb-2">Haben Sie Fragen?</h2>
              <p>
                Unser Kundenservice steht Ihnen gerne zur Verfügung:<br />
                E-Mail: support@dein-grundbuch-online.de<br />
                Tel: 0800 123 456 789
              </p>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-md font-medium transition-colors"
              >
                Zurück zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;
