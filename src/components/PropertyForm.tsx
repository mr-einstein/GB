import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import DocumentSelection from './DocumentSelection';
import ApplicationDetails from './ApplicationDetails';
import TooltipWrapper from './TooltipWrapper';
import { formTooltips } from '../config/tooltips';
import { useDocuments } from '../context/DocumentContext';

const PropertyForm = () => {
  const [showNextSections, setShowNextSections] = useState(false);
  const [plz, setPlz] = useState('');
  const [city, setCity] = useState('');
  const [plzError, setPlzError] = useState('');
  const [isValidatingPlz, setIsValidatingPlz] = useState(false);
  const { selectedDocuments } = useDocuments();

  const handlePlzChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      return;
    }
    
    setPlz(value);
    setPlzError('');
    setCity('');
    
    if (value.length === 5) {
      validatePlz(value);
    }
  };

  const validatePlz = async (value: string) => {
    if (value.length < 5) {
      setPlzError('Mindestens 5 Zahlen.');
      setCity('');
      return;
    }

    try {
      setIsValidatingPlz(true);
      const response = await fetch(`https://api.zippopotam.us/DE/${value}`);
      
      if (!response.ok) {
        setPlzError('Ungültige PLZ');
        setCity('');
      } else {
        const data = await response.json();
        setCity(data.places[0]['place name']);
        setPlzError('');
      }
    } catch (error) {
      console.error('Error fetching city:', error);
      setPlzError('Ungültige PLZ');
      setCity('');
    } finally {
      setIsValidatingPlz(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate PLZ if it hasn't been validated yet
    if (plz.length === 5 && !plzError && !city) {
      await validatePlz(plz);
    }

    // Check if PLZ is valid before proceeding
    if (plz.length !== 5 || plzError || !city) {
      setPlzError(plzError || 'Bitte geben Sie eine gültige PLZ ein.');
      return;
    }

    setShowNextSections(true);
    setTimeout(() => {
      document.getElementById('document-selection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-medium text-gray-900">
            Angaben zum Grundstück oder der Immobilie
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="font-bold text-gray-700">
              Straße
            </label>
            <TooltipWrapper text={formTooltips.propertyStreet.text} hint={formTooltips.propertyStreet.hint}>
              <input
                type="text"
                className="w-full p-3 border rounded-md"
                placeholder="Straßenname"
                required
              />
            </TooltipWrapper>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-gray-700">
              Hausnummer
            </label>
            <TooltipWrapper text={formTooltips.propertyHouseNumber.text} hint={formTooltips.propertyHouseNumber.hint}>
              <input
                type="text"
                className="w-full p-3 border rounded-md"
                placeholder="Nr."
                required
              />
            </TooltipWrapper>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-gray-700">PLZ</label>
            <input
              type="text"
              className={`w-full p-3 border rounded-md ${plzError ? 'border-red-500' : ''}`}
              placeholder="Postleitzahl"
              required
              value={plz}
              onChange={handlePlzChange}
              onBlur={() => plz && validatePlz(plz)}
              maxLength={5}
            />
            {plzError && (
              <p className="text-red-500 text-sm mt-1">{plzError}</p>
            )}
            {isValidatingPlz && (
              <p className="text-gray-500 text-sm mt-1">Überprüfe PLZ...</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="font-bold text-gray-700">Ort</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md bg-gray-50"
              placeholder="wird automatisch befüllt"
              value={city}
              readOnly
            />
          </div>
        </div>

        <div className="text-yellow-600 flex items-start gap-2 py-2">
          <span className="text-lg">•</span>
          <p className="text-sm">
            Um eine schnellere Bearbeitung zu ermöglichen, bitten wir Sie auch die nachfolgenden Daten anzugeben.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="font-bold text-gray-700">
              Flur und Flurstücknummer (falls bekannt)
            </label>
            <TooltipWrapper text={formTooltips.flurFlurstuck.text} hint={formTooltips.flurFlurstuck.hint}>
              <input
                type="text"
                className="w-full p-3 border rounded-md"
              />
            </TooltipWrapper>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-gray-700">
              Blattnummer (falls bekannt)
            </label>
            <TooltipWrapper text={formTooltips.blattnummer.text} hint={formTooltips.blattnummer.hint}>
              <input
                type="text"
                className="w-full p-3 border rounded-md"
              />
            </TooltipWrapper>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-bold text-gray-700">
            Gemarkung (falls bekannt)
          </label>
          <TooltipWrapper text={formTooltips.gemarkung.text} hint={formTooltips.gemarkung.hint}>
            <input
              type="text"
              className="w-full p-3 border rounded-md"
            />
          </TooltipWrapper>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-md font-medium transition-colors"
          >
            Weiter
          </button>
        </div>
      </form>

      {showNextSections && (
        <>
          <DocumentSelection />
          {selectedDocuments.length > 0 && <ApplicationDetails />}
        </>
      )}
    </>
  );
};

export default PropertyForm;