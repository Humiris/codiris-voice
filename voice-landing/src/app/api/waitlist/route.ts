import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email to notify you of new signups
const ADMIN_EMAIL = 'joel@codiris.build';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, platform } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const apiKey = process.env.STRIPE_SECRET_KEY;
    let isExistingUser = false;

    if (apiKey) {
      // Store in Stripe as a customer with waitlist metadata
      // This makes it easy to email them when iOS launches

      // First check if customer already exists
      const searchRes = await fetch(
        `https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(email)}'`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();

        if (searchData.data && searchData.data.length > 0) {
          isExistingUser = true;
          // Customer exists, update their metadata
          const customerId = searchData.data[0].id;

          await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              'metadata[waitlist_ios]': 'true',
              'metadata[waitlist_ios_date]': new Date().toISOString(),
              'metadata[waitlist_platform]': platform || 'ios',
            }).toString(),
          });
        }
      }

      if (!isExistingUser) {
        // Create new customer with waitlist metadata
        await fetch('https://api.stripe.com/v1/customers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'email': email,
            'metadata[source]': 'waitlist',
            'metadata[waitlist_ios]': 'true',
            'metadata[waitlist_ios_date]': new Date().toISOString(),
            'metadata[waitlist_platform]': platform || 'ios',
          }).toString(),
        });
      }
    }

    // Send emails
    if (resend) {
      // Send confirmation email to the user
      await resend.emails.send({
        from: 'Codiris Voice <hello@codiris.build>',
        to: email,
        subject: "You're on the Codiris Voice iOS waitlist!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 28px;">🎙️</span>
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">You're on the list!</h1>
                </div>

                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                  Thanks for your interest in Codiris Voice for iOS! We're working hard to bring the same powerful voice-to-text experience to your iPhone.
                </p>

                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                  You'll be among the first to know when we launch. In the meantime, you can try Codiris Voice on Mac today.
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://voice.codiris.build/install" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Try on Mac
                  </a>
                </div>

                <p style="color: #888; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">
                  Questions? Just reply to this email.
                </p>
              </div>

              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 24px;">
                © ${new Date().getFullYear()} Codiris. All rights reserved.
              </p>
            </div>
          </body>
          </html>
        `,
      });

      // Notify admin of new signup
      await resend.emails.send({
        from: 'Codiris Voice <hello@codiris.build>',
        to: ADMIN_EMAIL,
        subject: `🎉 New iOS Waitlist Signup: ${email}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
            <h2 style="color: #3b82f6;">New Waitlist Signup!</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Platform:</strong> ${platform || 'ios'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Existing user:</strong> ${isExistingUser ? 'Yes' : 'No'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #888; font-size: 14px;">
              <a href="https://dashboard.stripe.com/customers" style="color: #3b82f6;">View all customers in Stripe →</a>
            </p>
          </body>
          </html>
        `,
      });

      console.log(`[Waitlist] Emails sent for: ${email}`);
    }

    // Log the signup (useful for debugging and backup)
    console.log(`[Waitlist] New signup: ${email} for platform: ${platform || 'ios'} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: "Thanks for joining the waitlist! We'll email you when the iOS app is ready."
    });

  } catch (error: any) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

// GET endpoint to check waitlist stats (protected, for admin use)
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    // Get count of waitlist signups from Stripe
    const searchRes = await fetch(
      `https://api.stripe.com/v1/customers/search?query=metadata['waitlist_ios']:'true'&limit=100`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!searchRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    const data = await searchRes.json();

    return NextResponse.json({
      count: data.data?.length || 0,
      hasMore: data.has_more || false
    });

  } catch (error: any) {
    console.error('Waitlist stats error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
