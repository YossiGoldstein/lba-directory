import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// Read-only lookup used by the /Success page so it can show the REAL payment
// state instead of a fake 2-second "verifying" spinner. Takes only the
// unguessable Stripe checkout session id.
Deno.serve(async (req) => {
  try {
    const { session_id } = await req.json();

    if (!session_id || typeof session_id !== 'string') {
      return Response.json({ success: false, error: 'session_id is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    return Response.json({
      success: true,
      paid: session.payment_status === 'paid',
      checkout_status: session.status, // 'open' | 'complete' | 'expired'
      mode: session.metadata?.mode || 'new'
    });
  } catch (error) {
    console.error('verifyCheckoutSession error:', error);
    return Response.json({ success: false, error: 'Could not verify session' }, { status: 200 });
  }
});
