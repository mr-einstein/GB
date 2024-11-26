import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../context/DocumentContext';
import ApplicantForm from './ApplicantForm';
import { createOrder } from '../utils/supabase';
import type { OrderData } from '../utils/supabase';
import { formTooltips } from '../config/tooltips';
import { useLegalModals } from './LegalModal';

const ApplicationDetails = () => {
  const navigate = useNavigate();
  const { selectedDocuments, totalPrice } = useDocuments();
  const { openLegalModal, LegalModalComponent } = useLegalModals();
  const [purpose, setPurpose] = useState('');
  const [interest, setInterest] = useState('');
  const [otherPurpose, setOtherPurpose] = useState('');
  const [otherInterest, setOtherInterest] = useState('');
  const [showApplicantForm, setShowApplicantForm] = useState(false);
  const [isBeglaubigt, setIsBeglaubigt] = useState('nein');
  const [showEigentuemer, setShowEigentuemer] = useState('nein');
  const [otherInterestError, setOtherInterestError] = useState(false);
  const [otherPurposeError, setOtherPurposeError] = useState(false);

  const purposeOptions = [
    { value: '', label: '- Bitte auswählen -' },
    { value: 'Bauantrag/Abriss/Nutzungsänderung', label: 'Bauantrag/Abriss/Nutzungsänderung' },
    { value: 'Gutachten/Bewertung/Wertermittlung', label: 'Gutachten/Bewertung/Wertermittlung' },
    { value: 'Finanzierung/Kredit/Umschuldung', label: 'Finanzierung/Kredit/Umschuldung' },
    { value: 'Kauf/Verkauf/Beurkundung', label: 'Kauf/Verkauf/Beurkundung' },
    { value: 'Sonstiges', label: 'Sonstiges' }
  ];

  const interestOptions = [
    { value: 'Eigentümer/in (oder Recht im Grundbuch)', label: 'Eigentümer/in (oder Recht im Grundbuch)' },
    { value: 'Bevollmächtigt (Vollmacht liegt vor)', label: 'Bevollmächtigt (Vollmacht liegt vor)' },
    { value: 'Bevollmächtigt (Vollmacht liegt nicht vor)', label: 'Bevollmächtigt (Vollmacht liegt nicht vor)' },
    { value: 'Kauf des Grundstücks/ der Immobilie', label: 'Kauf des Grundstücks/ der Immobilie' },
    { value: 'Erbbauberechtigt', label: 'Erbbauberechtigt' },
    { value: 'Im Rahmen einer Erbangelegenheit', label: 'Im Rahmen einer Erbangelegenheit' },
    { value: 'Sonstiger Grund', label: 'Sonstiger Grund' }
  ];

  const needsProof = ['Bevollmächtigt (Vollmacht liegt vor)', 'Kauf des Grundstücks/ der Immobilie', 'Erbbauberechtigt', 'Im Rahmen einer Erbangelegenheit'].includes(interest);
  const showVollmachtNotice = interest === 'Bevollmächtigt (Vollmacht liegt nicht vor)';
  const showOtherReason = interest === 'Sonstiger Grund';

  const handleOtherPurposeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 80) {
      setOtherPurpose(value);
      setOtherPurposeError(false);
    }
  };

  const handleOtherInterestChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 255) {
      setOtherInterest(value);
      setOtherInterestError(false);
    }
  };

  const handleWeiterClick = () => {
    if (interest === 'Sonstiger Grund' && !otherInterest.trim()) {
      setOtherInterestError(true);
      return;
    }
    if (purpose === 'Sonstiges' && !otherPurpose.trim()) {
      setOtherPurposeError(true);
      return;
    }
    setOtherInterestError(false);
    setOtherPurposeError(false);
    setShowApplicantForm(true);
    setTimeout(() => {
      document.getElementById('applicant-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleApplicantFormSubmit = async (formData: any) => {
    try {
      // Validate purpose
      if (!purpose || purpose === '') {
        throw new Error('Bitte wählen Sie einen Zweck aus.');
      }

      if (purpose === 'Sonstiges' && !otherPurpose.trim()) {
        throw new Error('Bitte geben Sie einen sonstigen Zweck an.');
      }

      const finalPurpose = purpose === 'Sonstiges' ? otherPurpose.trim() : purpose;

      // Create order data
      const orderData: OrderData = {
        // Customer Information
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || '',  
        company_name: formData.company_name,

        // Property Information
        street: formData.street,
        house_number: formData.house_number,
        postal_code: formData.postal_code,
        city: formData.city,
        sheet_number: formData.sheet_number || '',
        field_parcel_number: formData.field_parcel_number || '',
        district: formData.district || '',

        // Document Selection
        selected_documents: selectedDocuments,
        certified_grundbuchauszug: isBeglaubigt === 'ja',  
        owner_proof_liegenschaftskarte: showEigentuemer === 'ja',

        // Purpose and Interest
        document_purpose: finalPurpose,
        legal_interest: interest === 'Sonstiger Grund' ? otherInterest.trim() : interest,

        // Signature - properly handle null case
        signature_data: formData.signature_data ? 
          formData.signature_data.replace(/^data:image\/png;base64,/, '') : 
          null,

        // Payment Information
        total_amount: totalPrice,
        payment_status: 'pending'
      };

      console.log('Submitting order data:', orderData);

      // Create order in Supabase
      const { data: order, error } = await createOrder(orderData);

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      if (!order?.id) {
        throw new Error('No order ID returned from Supabase');
      }

      // Navigate to payment page with order details
      navigate('/payment', {
        state: {
          orderId: order.id,
          propertyAddress: `${orderData.street} ${orderData.house_number}, ${orderData.postal_code} ${orderData.city}`,
          selectedDocuments: selectedDocuments.map(doc => doc.name),
          totalAmount: totalPrice
        }
      });

    } catch (error) {
      console.error('Error creating order:', error);
      alert(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten bei der Erstellung Ihrer Bestellung.');
    }
  };

  return (
    <>
      <section className="space-y-6">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-medium text-gray-900">
            Angaben zum Antrag
          </h2>
        </div>

        <div className="space-y-6">
          {selectedDocuments.some(doc => doc.id === 'grundbuchauszug') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <label className="font-bold text-gray-700">Soll Ihr Grundbuchauszug beglaubigt werden?</label>
                <HelpCircle 
                  className="h-4 w-4 text-gray-400 cursor-help"
                  onClick={() => openLegalModal('grundbuch_beglaubigung')}
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="beglaubigt"
                    value="nein"
                    checked={isBeglaubigt === 'nein'}
                    onChange={(e) => setIsBeglaubigt(e.target.value)}
                    className="text-yellow-500"
                  />
                  <span>Nein</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="beglaubigt"
                    value="ja"
                    checked={isBeglaubigt === 'ja'}
                    onChange={(e) => setIsBeglaubigt(e.target.value)}
                    className="text-yellow-500"
                  />
                  <span>Ja, beglaubigt</span>
                </label>
              </div>
            </div>
          )}

          {selectedDocuments.some(doc => doc.id === 'liegenschaftskarte') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <label className="font-bold text-gray-700">Soll auf der Liegenschaftskarte der Eigentümer/in nachgewiesen werden?</label>
                <HelpCircle 
                  className="h-4 w-4 text-gray-400 cursor-help"
                  onClick={() => openLegalModal('eigentuemer_nachweis')}
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="eigentuemer"
                    value="nein"
                    checked={showEigentuemer === 'nein'}
                    onChange={(e) => setShowEigentuemer(e.target.value)}
                    className="text-yellow-500"
                  />
                  <span>Nein</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="eigentuemer"
                    value="ja"
                    checked={showEigentuemer === 'ja'}
                    onChange={(e) => setShowEigentuemer(e.target.value)}
                    className="text-yellow-500"
                  />
                  <span>Ja, mit Eigentümer</span>
                </label>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center gap-2 font-bold text-gray-700">
              Für welchen Zweck benötigen Sie die Dokumente? <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-3 border rounded-md bg-white"
              required
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                if (e.target.value !== 'Sonstiges') {
                  setOtherPurpose('');
                }
              }}
            >
              <option value="" disabled>- Bitte auswählen -</option>
              {purposeOptions.slice(1).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {purpose === 'Sonstiges' && (
              <div className="mt-2">
                <textarea
                  className={`w-full p-3 border rounded-md ${otherPurposeError ? 'border-red-500' : ''}`}
                  rows={3}
                  placeholder="Bitte geben Sie eine kurze Begründung an"
                  required
                  value={otherPurpose}
                  onChange={handleOtherPurposeChange}
                  maxLength={80}
                />
                {otherPurposeError && (
                  <div className="text-red-500 text-sm">
                    Dieses Feld ist erforderlich.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 font-bold text-gray-700">
              Welches berechtigte Interesse besteht? <span className="text-red-500">*</span>
              <HelpCircle 
                className="h-4 w-4 text-gray-400 cursor-help"
                onClick={() => openLegalModal('berechtigtes_interesse')}
              />
            </label>
            <select
              className="w-full p-3 border rounded-md bg-white"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              required
            >
              <option value="">- Bitte auswählen -</option>
              {interestOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {showOtherReason && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-bold text-gray-700">
                  Sonstige Begründung für das berechtigte Interesse *
                </label>
                <textarea
                  className={`w-full p-3 border rounded-md ${otherInterestError ? 'border-red-500' : ''}`}
                  rows={3}
                  placeholder="Bitte beschreiben Sie Ihr berechtigtes Interesse"
                  required
                  maxLength={255}
                  value={otherInterest}
                  onChange={handleOtherInterestChange}
                />
                {otherInterestError && (
                  <div className="text-red-500 text-sm">
                    Dieses Feld ist erforderlich.
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  {otherInterest.length} von maximal 255 Zeichen.
                </div>
              </div>
            )}
          </div>

          {showVollmachtNotice && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-blue-800">
              Nach Abschluss der Bestellung erhalten Sie von uns eine Vollmachts-Vorlage per E-Mail. 
              Diese, oder auch eine Vollmacht des Eigentümers, können Sie uns dann einfach zu 
              einem späteren Zeitpunkt nachreichen. Weitere Informationen dazu erhalten Sie in der E-Mail.
            </div>
          )}

          {needsProof && (
            <>
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-bold text-gray-700">
                  Für das ausgewählte berechtigte Interesse benötigen wir einen Nachweis
                </label>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Zum Beispiel:</li>
                  <li>Vollmacht des Eigentümers</li>
                  <li>Vorsorge- oder Generalvollmacht</li>
                  <li>Kaufvertrag oder Nachweis der Vertragsverhandlungen</li>
                  <li>Maklervertrag</li>
                  <li>Erbschein / Testament / Erbvertrag</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Vollmacht, Kaufvertrag, Erbschein oder sonstigen Nachweis hochladen.</h3>
                    <p className="text-sm text-gray-500">Dateityp: PDF, JPG, PNG (max. 10MB)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" className="text-yellow-500" id="noProof" />
                <label htmlFor="noProof" className="text-sm text-gray-600">
                  Ich habe gerade keinen Nachweis zur Hand und möchte diesen nachreichen
                </label>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleWeiterClick}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-md font-medium transition-colors"
            >
              Weiter
            </button>
          </div>
        </div>
      </section>

      {showApplicantForm && (
        <div id="applicant-form" className="mt-8">
          <ApplicantForm onSubmit={handleApplicantFormSubmit} />
        </div>
      )}
      {LegalModalComponent}
    </>
  );
};

export default ApplicationDetails;