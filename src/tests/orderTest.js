import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrderInsertion() {
  try {
    // Sample order data
    const orderData = {
      // Customer Information
      email: 'test@example.com',
      first_name: 'Max',
      last_name: 'Mustermann',
      phone: '+49123456789',
      company_name: 'Test GmbH',

      // Property Information
      street: 'Musterstraße',
      house_number: '123',
      postal_code: '12345',
      city: 'Berlin',
      sheet_number: 'BL123', // optional
      field_parcel_number: 'FL456', // optional
      district: 'Mitte', // optional

      // Document Selection and Options
      selected_documents: [
        {
          id: 'grundbuchauszug',
          name: 'Grundbuchauszug',
          price: 2990
        },
        {
          id: 'liegenschaftskarte',
          name: 'Liegenschaftskarte',
          price: 2990
        }
      ],
      certified_grundbuchauszug: true,
      owner_proof_liegenschaftskarte: false,

      // Purpose and Interest
      document_purpose: 'Bauantrag/Abriss/Nutzungsänderung',
      legal_interest: 'Eigentümer/in (oder Recht im Grundbuch)',

      // Signature (sample base64 PNG data)
      signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',

      // Payment Information
      total_amount: 5980, // 59.80€ (2990 + 2990)
      status: 'pending'
    };

    // Insert order into database
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();

    if (error) {
      console.error('Error inserting order:', error);
      return;
    }

    console.log('Order inserted successfully:', data);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testOrderInsertion().catch(console.error);
