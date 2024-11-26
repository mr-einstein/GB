import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Shield, FileText, Mail, Printer, Building2, ArrowRight, HelpCircle } from 'lucide-react';
import PropertyForm from './components/PropertyForm';
import Benefits from './components/Benefits';
import FAQ from './components/FAQ';
import PaymentSection from './components/PaymentSection';
import PaymentPage from './components/PaymentPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import { DocumentProvider } from './context/DocumentContext';
import { useLegalModals } from './components/LegalModal';

function App() {
  const { openLegalModal, LegalModalComponent } = useLegalModals();

  return (
    <Router>
      <DocumentProvider>
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen bg-white">
              <header className="border-b">
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

              <div 
                className="relative py-16"
                style={{
                  backgroundImage: `linear-gradient(rgba(255, 251, 235, 0.9), rgba(254, 243, 199, 0.9)), url('https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&q=80&w=2070')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="container mx-auto px-4">
                  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
                    <PropertyForm />
                  </div>
                </div>
              </div>

              <Benefits />
              <PaymentSection />
              <FAQ />

              <footer className="bg-gray-50 py-4 mt-16 border-t">
                <div className="container mx-auto px-4 text-center text-sm text-gray-600">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => openLegalModal('agb')} className="hover:text-gray-900">AGB</button>
                    <button onClick={() => openLegalModal('widerruf')} className="hover:text-gray-900">Widerruf</button>
                    <button onClick={() => openLegalModal('datenschutz')} className="hover:text-gray-900">Datenschutz</button>
                    <button onClick={() => openLegalModal('impressum')} className="hover:text-gray-900">Impressum</button>
                  </div>
                </div>
              </footer>
              {LegalModalComponent}
            </div>
          } />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
        </Routes>
      </DocumentProvider>
    </Router>
  );
}

export default App;