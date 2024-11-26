export interface OrderData {
  // Customer Information
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company_name?: string;

  // Property Information
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  sheet_number?: string;
  field_parcel_number?: string;
  district?: string;

  // Document Selection
  selected_documents: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  certified_grundbuchauszug?: boolean;
  owner_proof_liegenschaftskarte?: boolean;

  // Purpose and Interest
  document_purpose: string;
  legal_interest: string;

  // Signature
  signature_data: string;

  // Payment Information
  total_amount: number;
  payment_status: 'pending' | 'processing' | 'succeeded' | 'failed';
  payment_intent_id?: string;
  stripe_customer_id?: string;
}

export interface PaymentFormData {
  orderId: string;
  propertyAddress: string;
  selectedDocuments: string[];
  totalAmount: number;
}
