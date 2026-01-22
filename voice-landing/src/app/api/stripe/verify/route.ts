import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      return NextResponse.json({
        isPremium: false,
        subscription: null,
      });
    }

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Check for trialing subscriptions too
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'trialing',
        limit: 1,
      });

      if (trialingSubscriptions.data.length === 0) {
        return NextResponse.json({
          isPremium: false,
          subscription: null,
        });
      }

      const subscription = trialingSubscriptions.data[0] as any;
      return NextResponse.json({
        isPremium: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end || subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || subscription.cancelAtPeriodEnd,
        },
      });
    }

    const subscription = subscriptions.data[0] as any;

    return NextResponse.json({
      isPremium: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end || subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || subscription.cancelAtPeriodEnd,
      },
    });
  } catch (error: any) {
    console.error('Stripe verify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
