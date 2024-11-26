// Get the base URL depending on environment
const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const API_ENDPOINTS = {
  createPaymentIntent: `${getBaseUrl()}/create-payment`,
  createPayPalOrder: `${getBaseUrl()}/create-paypal-order`,
  capturePayPalOrder: `${getBaseUrl()}/capture-paypal-order`,
};

// Helper function for API calls
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
}
