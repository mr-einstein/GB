import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  // Document Selection and Options
  selected_documents: {
    id: string;
    name: string;
    price: number;
  }[];
  certified_grundbuchauszug?: boolean;
  owner_proof_liegenschaftskarte?: boolean;

  // Purpose and Interest
  document_purpose: string;
  legal_interest: string;

  // Signature
  signature_data: string | null;

  // Payment Information
  total_amount: number;
  payment_intent_id?: string;
  payment_status: 'pending' | 'processing' | 'succeeded' | 'failed';
  stripe_customer_id?: string;
}

export const createOrder = async (orderData: OrderData) => {
  // Ensure total_amount is a number with 2 decimal places
  const processedOrderData = {
    ...orderData,
    total_amount: Number(orderData.total_amount.toFixed(2))
  };

  console.log('Creating order with data:', {
    ...processedOrderData,
    document_purpose: `"${processedOrderData.document_purpose}"`, // Log with quotes to see empty spaces
    purpose_type: typeof processedOrderData.document_purpose,
    purpose_length: processedOrderData.document_purpose.length
  });

  const { data, error } = await supabase
    .from('orders')
    .insert([processedOrderData])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return { data, error };
};

export const updateOrderPayment = async (orderId: string, paymentData: {
  payment_intent_id: string;
  payment_status: OrderData['payment_status'];
  stripe_customer_id?: string;
}) => {
  const { data, error } = await supabase
    .from('orders')
    .update(paymentData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order payment:', error);
    throw error;
  }

  return { data, error };
};

export const getOrder = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    throw error;
  }

  return { data, error };
};
