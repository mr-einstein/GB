import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import SignatureCanvas from './SignatureCanvas';
import { useLegalModals } from './LegalModal';

interface FinalSectionProps {
  onSubmit: () => void;
  onSignature: (signature: string) => void;
}

const FinalSection: React.FC<FinalSectionProps> = ({ onSubmit, onSignature }) => {
  const navigate = useNavigate();
  const { selectedDocuments } = useDocuments();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [correctnessAccepted, setCorrectnessAccepted] = useState(false);
  const [signatureSubmitted, setSignatureSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const { openLegalModal, LegalModalComponent } = useLegalModals();

  const totalPrice = selectedDocuments.reduce((sum, doc) => sum + doc.price, 0);

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!termsAccepted) newErrors.terms = true;
    if (!correctnessAccepted) newErrors.correctness = true;
    if (!signatureSubmitted) newErrors.signature = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit();
      navigate('/payment', {
        state: {
          selectedDocuments: selectedDocuments.map(doc => doc.name),
          totalAmount: totalPrice
        }
      });
    }
  };

  const handleSignatureSave = (signatureData: string) => {
    if (signatureData && signatureData.startsWith('data:image/png;base64,')) {
      onSignature(signatureData);
      setSignatureSubmitted(true);
      setErrors(prev => ({ ...prev, signature: false }));
    } else {
      setErrors(prev => ({ ...prev, signature: true }));
    }
  };

  const clearSignature = () => {
    onSignature('');
    setSignatureSubmitted(false);
    setErrors(prev => ({ ...prev, signature: true }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="space-y-6">
      <div className="bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-medium text-gray-900">
          Abschluss
        </h2>
      </div>

      <div className="space-y-6">
        {/* AGB Section */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agb"
              className="mt-1 text-yellow-500"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (e.target.checked) {
                  setErrors(prev => ({ ...prev, terms: false }));
                }
              }}
            />
            <label htmlFor="agb" className="text-sm">
              Ich akzeptiere die{' '}
              <button
                type="button"
                onClick={() => openLegalModal('agb')}
                className="text-blue-600 hover:underline"
              >
                AGB
              </button>
              {' '}und habe die Bestimmungen zum{' '}
              <button
                type="button"
                onClick={() => openLegalModal('datenschutz')}
                className="text-blue-600 hover:underline"
              >
                Datenschutz
              </button>
              {' '}zur Kenntnis genommen. Ich verlange und bin ausdrücklich damit einverstanden, dass bereits vor dem Ende der{' '}
              <button
                type="button"
                onClick={() => openLegalModal('widerruf')}
                className="text-blue-600 hover:underline"
              >
                Widerrufsfrist
              </button>
              {' '}mit der Ausführung der Dienstleistung begonnen wird. Sehen Sie hierzu unsere{' '}
              <button
                type="button"
                onClick={() => openLegalModal('widerrufsformular')}
                className="text-blue-600 hover:underline"
              >
                Widerrufsbelehrung
              </button>
              {' '}und das Muster-Widerrufsformular.
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-sm">Dieses Feld ist erforderlich.</p>
          )}
        </div>

        {/* Correctness Section */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="correctness"
              className="mt-1 text-yellow-500"
              checked={correctnessAccepted}
              onChange={(e) => {
                setCorrectnessAccepted(e.target.checked);
                if (e.target.checked) {
                  setErrors(prev => ({ ...prev, correctness: false }));
                }
              }}
            />
            <label htmlFor="correctness" className="text-sm">
              Ich bestätige hiermit die Korrektheit meiner Angaben, sowie die Übernahme der Kosten die von den Behörden 
              erhoben werden (in der Regel 10 bis 20 EUR je Auszug) und erteile dein-grundbuch-online.de eine Vollmacht für die 
              Antragstellung und dessen Versand, sowie für die Korrespondenz mit den Behörden.
            </label>
          </div>
          {errors.correctness && (
            <p className="text-red-500 text-sm">Dieses Feld ist erforderlich.</p>
          )}
        </div>

        {/* Signature Section */}
        <div className="space-y-2">
          <label className="font-bold text-gray-700">
            Unterschrift per Maus oder am Touchscreen per Finger <span className="text-red-500">*</span>
          </label>
          <SignatureCanvas onSave={handleSignatureSave} onClear={clearSignature} />
          {errors.signature && (
            <p className="text-red-500 text-sm">Dieses Feld ist erforderlich.</p>
          )}
        </div>

        {/* Total Price */}
        <div className="text-green-600 font-medium">
          Die einmalige Servicegebühr von dein-grundbuch-online.de beträgt
          <div className="text-xl font-bold">{totalPrice.toFixed(2)} €</div>
          <div className="text-sm">inkl. MwSt. zzgl. Gebühr der Behörde. bezahlen Sie bequem per PayPal, Kreditkarte, Giropay oder Sofortüberweisung.</div>
        </div>

        {/* Final Notice */}
        <div className="bg-yellow-50 p-4 rounded-md text-center">
          <p>Bitte kontrollieren Sie nochmal Ihre eingegebenen Daten.</p>
          <p>Änderungen sind später nicht mehr möglich.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="text-blue-600 hover:underline mt-2"
          >
            ↑ Zum Anfang des Formulars
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-md font-medium transition-colors"
          >
            Jetzt kostenpflichtig beauftragen
          </button>
        </div>
      </div>

      {LegalModalComponent}
    </section>
  );
};

export default FinalSection;