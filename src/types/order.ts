export type PaymentProvider = 'stripe' | 'paypal';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

export interface OrderData {
  id?: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  sheet_number?: string;
  field_parcel_number?: string;
  district?: string;
  selected_documents: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  certified_grundbuchauszug: boolean;
  owner_proof_liegenschaftskarte: boolean;
  document_purpose: string;
  other_purpose_reason?: string;
  legal_interest: string;
  other_interest_reason?: string;
  signature_data?: string;
  proof_document_path?: string;
  proof_document_name?: string;
  proof_document_type?: string;
  proof_document_size?: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'paid' | 'completed' | 'failed' | 'cancelled';
  payment_status: PaymentStatus;
  payment_provider?: PaymentProvider;
  payment_intent_id?: string;
  stripe_customer_id?: string;
  paypal_order_id?: string;
  paypal_payer_id?: string;
  created_at?: string;
  updated_at?: string;
}
