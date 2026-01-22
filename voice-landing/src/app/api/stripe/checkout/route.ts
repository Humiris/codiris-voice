import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { email, machineId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create customer using fetch
    const customerRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}&metadata[machineId]=${encodeURIComponent(machineId || '')}`,
    });

    if (!customerRes.ok) {
      const err = await customerRes.json();
      return NextResponse.json({ error: err.error?.message || 'Failed to create customer' }, { status: 500 });
    }

    const customer = await customerRes.json();

    // Create checkout session
    const origin = request.headers.get('origin') || 'https://voice.codiris.build';
    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'customer': customer.id,
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': 'Codiris Voice Pro',
        'line_items[0][price_data][product_data][description]': 'Unlimited voice-to-text transcription with AI enhancement',
        'line_items[0][price_data][unit_amount]': '999',
        'line_items[0][price_data][recurring][interval]': 'month',
        'line_items[0][quantity]': '1',
        'mode': 'subscription',
        'success_url': `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${origin}/pricing`,
        'metadata[machineId]': machineId || '',
      }).toString(),
    });

    if (!sessionRes.ok) {
      const err = await sessionRes.json();
      return NextResponse.json({ error: err.error?.message || 'Failed to create session' }, { status: 500 });
    }

    const session = await sessionRes.json();

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
