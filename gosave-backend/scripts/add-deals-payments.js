require('dotenv').config();
const { supabase } = require('../config/supabase');

async function addDealsAndPayments() {
  console.log('🎯 Adding deals and payments data...\n');

  try {
    // 4. Insert deals
    console.log('🏷️ Inserting deals...');
    const { error: dealsError } = await supabase.from('deals').insert([
      // Food & Restaurant Deals
      {
        id: '550e8400-e29b-41d4-a716-446655440030',
        partner_id: '550e8400-e29b-41d4-a716-446655440020',
        deal_title: 'Buy 2 Parathas, Get 1 Free',
        description: 'Valid on weekends only. Fresh parathas with authentic Pakistani taste.',
        start_date: '2025-08-16',
        end_date: '2025-10-23',
        min_discount: 10,
        max_discount: 20,
        membership_tier: 'basic',
        location: 'G-9 Markaz',
        city: 'Islamabad'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440031',
        partner_id: '550e8400-e29b-41d4-a716-446655440020',
        deal_title: '25% Off Family Tea Package',
        description: 'Premium tea experience for families. Includes traditional snacks.',
        start_date: '2025-08-20',
        end_date: '2025-11-30',
        min_discount: 20,
        max_discount: 25,
        membership_tier: 'premium',
        location: 'G-9 Markaz',
        city: 'Islamabad'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440032',
        partner_id: '550e8400-e29b-41d4-a716-446655440021',
        deal_title: 'Flat 15% on Biryani Platters',
        description: 'Authentic Karachi-style biryani with raita and shorba.',
        start_date: '2025-08-15',
        end_date: '2025-12-31',
        min_discount: 15,
        max_discount: 15,
        membership_tier: 'both',
        location: 'Gulshan-e-Iqbal',
        city: 'Karachi'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440033',
        partner_id: '550e8400-e29b-41d4-a716-446655440021',
        deal_title: '30% Off Premium Biryani',
        description: 'Special mutton and chicken biryani with premium ingredients.',
        start_date: '2025-09-01',
        end_date: '2025-11-15',
        min_discount: 30,
        max_discount: 30,
        membership_tier: 'premium',
        location: 'Gulshan-e-Iqbal',
        city: 'Karachi'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440034',
        partner_id: '550e8400-e29b-41d4-a716-446655440022',
        deal_title: 'Buy 3 Kulfi, Get 1 Free',
        description: 'Traditional kulfi made with pure milk and dry fruits.',
        start_date: '2025-08-10',
        end_date: '2025-10-31',
        min_discount: 20,
        max_discount: 20,
        membership_tier: 'basic',
        location: 'Liberty Market',
        city: 'Lahore'
      },
      // Clothing Deals
      {
        id: '550e8400-e29b-41d4-a716-446655440035',
        partner_id: '550e8400-e29b-41d4-a716-446655440023',
        deal_title: 'Flat 12% on Summer Collection',
        description: 'All summer clothing items included. Latest fashion trends.',
        start_date: '2025-08-13',
        end_date: '2025-10-08',
        min_discount: 12,
        max_discount: 12,
        membership_tier: 'both',
        location: 'Liberty Market',
        city: 'Lahore'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440036',
        partner_id: '550e8400-e29b-41d4-a716-446655440023',
        deal_title: '40% Off Premium Suits',
        description: 'Designer suits and formal wear for special occasions.',
        start_date: '2025-09-01',
        end_date: '2025-12-25',
        min_discount: 35,
        max_discount: 40,
        membership_tier: 'premium',
        location: 'Liberty Market',
        city: 'Lahore'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440037',
        partner_id: '550e8400-e29b-41d4-a716-446655440024',
        deal_title: '25% Off Traditional Wear',
        description: 'Shalwar kameez, kurtas, and traditional Pakistani clothing.',
        start_date: '2025-08-20',
        end_date: '2025-11-20',
        min_discount: 20,
        max_discount: 25,
        membership_tier: 'basic',
        location: 'Zamzama Street',
        city: 'Karachi'
      },
      // Electronics Deals
      {
        id: '550e8400-e29b-41d4-a716-446655440038',
        partner_id: '550e8400-e29b-41d4-a716-446655440025',
        deal_title: '10% Off Laptop Repairs',
        description: 'Professional laptop repair services with warranty.',
        start_date: '2025-08-01',
        end_date: '2025-12-31',
        min_discount: 10,
        max_discount: 10,
        membership_tier: 'basic',
        location: 'Saddar',
        city: 'Karachi'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440039',
        partner_id: '550e8400-e29b-41d4-a716-446655440025',
        deal_title: '25% Off Premium Tech Support',
        description: 'Complete tech solutions and premium support packages.',
        start_date: '2025-08-15',
        end_date: '2025-11-30',
        min_discount: 20,
        max_discount: 25,
        membership_tier: 'premium',
        location: 'Saddar',
        city: 'Karachi'
      }
    ]);
    
    if (dealsError) throw dealsError;
    console.log('✅ Deals inserted\n');

    // 5. Insert payments
    console.log('💳 Inserting payments...');
    const { error: paymentsError } = await supabase.from('payments').insert([
      // Successful payments for premium members
      {
        id: '550e8400-e29b-41d4-a716-446655440050',
        user_id: '550e8400-e29b-41d4-a716-446655440011',
        membership_id: '550e8400-e29b-41d4-a716-446655440002',
        amount: 4999,
        currency: 'PKR',
        status: 'successful',
        payment_method: 'easypaisa',
        reference_id: 'EP2025081501234'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440051',
        user_id: '550e8400-e29b-41d4-a716-446655440012',
        membership_id: '550e8400-e29b-41d4-a716-446655440002',
        amount: 4999,
        currency: 'PKR',
        status: 'successful',
        payment_method: 'jazzcash',
        reference_id: 'JC2025082012345'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440052',
        user_id: '550e8400-e29b-41d4-a716-446655440013',
        membership_id: '550e8400-e29b-41d4-a716-446655440002',
        amount: 4999,
        currency: 'PKR',
        status: 'successful',
        payment_method: 'bank_transfer',
        reference_id: 'BT2025081823456'
      },
      // Successful payments for basic members
      {
        id: '550e8400-e29b-41d4-a716-446655440053',
        user_id: '550e8400-e29b-41d4-a716-446655440014',
        membership_id: '550e8400-e29b-41d4-a716-446655440001',
        amount: 2999,
        currency: 'PKR',
        status: 'successful',
        payment_method: 'easypaisa',
        reference_id: 'EP2025080534567'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440054',
        user_id: '550e8400-e29b-41d4-a716-446655440015',
        membership_id: '550e8400-e29b-41d4-a716-446655440001',
        amount: 2999,
        currency: 'PKR',
        status: 'successful',
        payment_method: 'jazzcash',
        reference_id: 'JC2025081045678'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440055',
        user_id: '550e8400-e29b-41d4-a716-446655440016',
        membership_id: '550e8400-e29b-41d4-a716-446655440001',
        amount: 2999,
        currency: 'PKR',
        status: 'successful',
        payment_method: 'credit_card',
        reference_id: 'CC2025080756789'
      }
    ]);
    
    if (paymentsError) throw paymentsError;
    console.log('✅ Payments inserted\n');

    console.log('🎯 Deals and payments data added successfully!');
    console.log('\n📊 Final Summary:');
    console.log('- 2 membership plans');
    console.log('- 9 users (1 admin, 6 members, 2 viewers)');
    console.log('- 6 approved partners');
    console.log('- 11 active deals');
    console.log('- 6 successful payments');

  } catch (error) {
    console.error('❌ Error adding deals and payments:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addDealsAndPayments();
}

module.exports = { addDealsAndPayments };
