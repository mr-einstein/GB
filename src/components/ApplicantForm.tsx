import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import FinalSection from './FinalSection';
import TooltipWrapper from './TooltipWrapper';
import { formTooltips } from '../config/tooltips';

interface ApplicantFormProps {
  onSubmit: (data: any) => void;
}

interface ValidationError {
  hasError: boolean;
  message: string;
}

type Errors = {
  [key: string]: ValidationError;
};

const ApplicantForm: React.FC<ApplicantFormProps> = ({ onSubmit }) => {
  const [showFinalSection, setShowFinalSection] = useState(false);
  const [customerType, setCustomerType] = useState<'private' | 'business'>('private');
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    street: '',
    houseNumber: '',
    zipCode: '',
    city: '',
    phone: '',
    email: '',
    signature_data: ''
  });
  
  const [errors, setErrors] = useState<Errors>({});
  const [isValidatingZip, setIsValidatingZip] = useState(false);

  const validateZipCode = async (zipCode: string): Promise<ValidationError> => {
    console.log('Validating zip code:', zipCode);
    // First check length
    if (zipCode.length < 5) {
      console.log('Zip code is too short');
      return {
        hasError: true,
        message: 'Mindestens 5 Zahlen.'
      };
    }

    // Then check format
    if (!zipCode.match(/^\d{5}$/)) {
      console.log('Zip code format is invalid');
      return {
        hasError: true,
        message: 'Bitte geben Sie eine gültige Postleitzahl ein.'
      };
    }

    try {
      setIsValidatingZip(true);
      const response = await fetch(`https://api.zippopotam.us/DE/${zipCode}`);
      setIsValidatingZip(false);
      
      if (!response.ok) {
        console.log('Zip code not found in API');
        // Clear city and set error
        setFormData(prev => ({ ...prev, city: '' }));
        return {
          hasError: true,
          message: 'Ungültige PLZ'
        };
      }

      // Valid zip code
      const data = await response.json();
      console.log('Zip code valid, city found:', data.places[0]['place name']);
      setFormData(prev => ({ ...prev, city: data.places[0]['place name'] }));
      return { hasError: false, message: '' };
      
    } catch (error) {
      console.error('Error validating zip code:', error);
      setIsValidatingZip(false);
      setFormData(prev => ({ ...prev, city: '' }));
      return {
        hasError: true,
        message: 'Ungültige PLZ'
      };
    }
  };

  const validateField = (name: string, value: string): ValidationError => {
    console.log('Validating field:', name, value);
    switch (name) {
      case 'companyName':
        if (value.length < 2) {
          console.log('Company name is too short');
          return { 
            hasError: true, 
            message: 'Bitte geben Sie einen gültigen Firmennamen ein.' 
          };
        }
        break;

      case 'firstName':
      case 'lastName':
        if (value.length < 2 || /\d/.test(value)) {
          console.log('First/Last name is invalid');
          return { 
            hasError: true, 
            message: `Bitte geben Sie einen gültigen ${name === 'firstName' ? 'Vornamen' : 'Nachnamen'} ein.` 
          };
        }
        break;

      case 'street':
        if (value.length < 2) {
          console.log('Street name is too short');
          return { 
            hasError: true, 
            message: 'Bitte geben Sie einen gültigen Straßennamen ein.' 
          };
        }
        break;

      case 'houseNumber':
        if (!value.match(/^[1-9]\d{0,3}[a-zA-Z]?(-[1-9]\d{0,3}[a-zA-Z]?)?$/)) {
          console.log('House number is invalid');
          return { 
            hasError: true, 
            message: 'Bitte geben Sie eine gültige Hausnummer ein.' 
          };
        }
        break;

      case 'zipCode':
        if (value.length < 5) {
          console.log('Zip code is too short');
          return { 
            hasError: true, 
            message: 'Mindestens 5 Zahlen.'
          };
        }
        if (!value.match(/^\d{5}$/)) {
          console.log('Zip code format is invalid');
          return { 
            hasError: true, 
            message: 'Bitte geben Sie eine gültige Postleitzahl ein.' 
          };
        }
        break;

      case 'city':
        if (value.length < 2 || /\d/.test(value)) {
          console.log('City name is invalid');
          return { 
            hasError: true, 
            message: 'Bitte geben Sie einen gültigen Ortsnamen ein.' 
          };
        }
        break;

      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
          console.log('Email is invalid');
          return { 
            hasError: true, 
            message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' 
          };
        }
        break;

      case 'phone':
        // Remove all spaces, dashes, and parentheses for validation
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        // Check for German phone number formats:
        // +49..., 0049..., or 0... (followed by area code and number)
        if (value && !cleanPhone.match(/^(\+49|0049|0)[1-9]\d{6,14}$/)) {
          console.log('Phone number is invalid');
          return { 
            hasError: true, 
            message: 'Bitte geben Sie eine gültige Telefonnummer ein.' 
          };
        }
        break;
    }
    console.log('Field is valid');
    return { hasError: false, message: '' };
  };

  const validateForm = () => {
    console.log('Validating form');
    const newErrors: Errors = {};
    const requiredFields = ['firstName', 'lastName', 'street', 'houseNumber', 'zipCode', 'city', 'email'];
    
    if (customerType === 'business') {
      requiredFields.push('companyName');
    }

    let isValid = true;

    // Check all required fields and perform validation regardless of empty state
    requiredFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      
      // Check if field is empty first
      if (!value) {
        console.log('Field is empty:', field);
        newErrors[field] = {
          hasError: true,
          message: 'Dieses Feld ist erforderlich.'
        };
        isValid = false;
      }
      
      // Always perform validation check if there's a value
      if (value) {
        const validationResult = validateField(field, value);
        if (validationResult.hasError) {
          console.log('Field is invalid:', field);
          newErrors[field] = validationResult;
          isValid = false;
        }
      }
    });

    // Validate optional phone if provided
    if (formData.phone) {
      const phoneValidation = validateField('phone', formData.phone);
      if (phoneValidation.hasError) {
        console.log('Phone number is invalid');
        newErrors.phone = phoneValidation;
        isValid = false;
      }
    }

    setErrors(newErrors);
    console.log('Validation result:', isValid);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value);
    
    // Only allow numbers for zip code
    if (name === 'zipCode') {
      if (!/^\d*$/.test(value)) {
        return;
      }
      // Clear city when zip code changes
      if (value !== formData.zipCode) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          city: ''
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: { hasError: false, message: '' }
      }));
    }
  };

  const handleZipCodeBlur = async () => {
    const zipCode = formData.zipCode;
    console.log('Zip code blur:', zipCode);
    if (zipCode) {
      const validationResult = await validateZipCode(zipCode);
      console.log('Validation result:', validationResult);
      setErrors(prev => ({
        ...prev,
        zipCode: validationResult
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log('Form submit');
    e.preventDefault();
    if (validateForm()) {
      setShowFinalSection(true);
      setTimeout(() => {
        document.getElementById('final-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleFinalSubmit = () => {
    console.log('Final submit');
    // Convert form data to proper format
    const formattedData = {
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      company_name: customerType === 'business' ? formData.companyName : undefined,
      street: formData.street,
      house_number: formData.houseNumber,
      postal_code: formData.zipCode,
      city: formData.city,
      signature_data: formData.signature_data || null
    };
    onSubmit(formattedData);
  };

  const handleSignature = (signatureData: string) => {
    setFormData(prev => ({
      ...prev,
      signature_data: signatureData
    }));
    setShowFinalSection(true);
    setTimeout(() => {
      document.getElementById('final-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <section className="space-y-6">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-medium text-gray-900">
            Antragssteller und Lieferanschrift
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Type Selection */}
          <div className="space-y-2">
            <label className="font-bold text-gray-700">
              Ich bin <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="customerType"
                  checked={customerType === 'private'}
                  onChange={() => setCustomerType('private')}
                  className="text-yellow-500"
                />
                <span>Privatkunde/in</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="customerType"
                  checked={customerType === 'business'}
                  onChange={() => setCustomerType('business')}
                  className="text-yellow-500"
                />
                <span>Firmenkunde/in</span>
              </label>
            </div>
          </div>

          {/* Company Name */}
          {customerType === 'business' && (
            <div className="space-y-2">
              <label className="font-bold text-gray-700">
                Firmenname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-md ${errors.companyName?.hasError ? 'border-red-500' : ''}`}
              />
              {errors.companyName?.hasError && (
                <p className="text-red-500 text-sm">{errors.companyName.message}</p>
              )}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-bold text-gray-700">
                Vorname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-md ${errors.firstName?.hasError ? 'border-red-500' : ''}`}
              />
              {errors.firstName?.hasError && (
                <p className="text-red-500 text-sm">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-bold text-gray-700">
                Nachname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-md ${errors.lastName?.hasError ? 'border-red-500' : ''}`}
              />
              {errors.lastName?.hasError && (
                <p className="text-red-500 text-sm">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-bold text-gray-700">
                Straße <span className="text-red-500">*</span>
              </label>
              <TooltipWrapper text={formTooltips.street.text} hint={formTooltips.street.hint}>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-md ${errors.street?.hasError ? 'border-red-500' : ''}`}
                />
              </TooltipWrapper>
              {errors.street?.hasError && (
                <p className="text-red-500 text-sm">{errors.street.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-bold text-gray-700">
                Hausnummer <span className="text-red-500">*</span>
              </label>
              <TooltipWrapper text={formTooltips.houseNumber.text} hint={formTooltips.houseNumber.hint}>
                <input
                  type="text"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-md ${errors.houseNumber?.hasError ? 'border-red-500' : ''}`}
                />
              </TooltipWrapper>
              {errors.houseNumber?.hasError && (
                <p className="text-red-500 text-sm">{errors.houseNumber.message}</p>
              )}
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-bold text-gray-700">
                PLZ <span className="text-red-500">*</span>
              </label>
              <TooltipWrapper text={formTooltips.zipCode.text} hint={formTooltips.zipCode.hint}>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  onBlur={handleZipCodeBlur}
                  className={`w-full p-3 border rounded-md ${errors.zipCode?.hasError ? 'border-red-500' : ''}`}
                  maxLength={5}
                />
              </TooltipWrapper>
              {errors.zipCode?.hasError && (
                <p className="text-red-500 text-sm">{errors.zipCode.message}</p>
              )}
              {isValidatingZip && (
                <p className="text-gray-500 text-sm">Überprüfe PLZ...</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-bold text-gray-700">
                Ort <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-md ${errors.city?.hasError ? 'border-red-500' : ''}`}
              />
              {errors.city?.hasError && (
                <p className="text-red-500 text-sm">{errors.city.message}</p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="space-y-2">
            <label className="font-bold text-gray-700">
              Telefon (für Rückfragen)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-md ${errors.phone?.hasError ? 'border-red-500' : ''}`}
            />
            {errors.phone?.hasError && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="font-bold text-gray-700">
              E-Mail <span className="text-red-500">*</span>
            </label>
            <TooltipWrapper text={formTooltips.email.text} hint={formTooltips.email.hint}>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-md ${errors.email?.hasError ? 'border-red-500' : ''}`}
                autoComplete="email"
              />
            </TooltipWrapper>
            {errors.email?.hasError && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="font-bold text-gray-700">
              Kopie Ausweis/Reisepass
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="font-medium mb-2">Ausweis oder Reisepass hochladen</h3>
                <p className="text-sm text-gray-500">Klicken Sie hier oder schieben Sie die Datei in dieses Fenster. Erlaubt sind PDF, JPG, JPEG (maximal 10 Dateien je 10MB).</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Wir empfehlen Ihnen als Identitätsnachweis bei der Behörde, Ihren Ausweis oder Reisepass hochzuladen.
            </p>
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
      </section>

      {showFinalSection && (
        <div id="final-section" className="mt-8">
          <FinalSection onSubmit={handleFinalSubmit} onSignature={handleSignature} />
        </div>
      )}
    </>
  );
};

export default ApplicantForm;