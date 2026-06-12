import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// SECURITY: this endpoint sets a password and is publicly callable, so it must
// prove the caller controls the email. It requires a single-use `token` that
// was generated server-side and stored on the account by sendPasswordResetEmail
// / sendPasswordSetupEmail. Possession of the email string is NOT sufficient.
Deno.serve(async (req) => {
  try {
    const { email, password, token } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (!token) {
      return Response.json({ error: 'A valid reset link is required. Please use the link from your email.' }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const normalizedEmail = String(email).toLowerCase().trim();
    // UTF-8-safe hash, same encoding as registerCustomer
    const passwordHash = btoa(unescape(encodeURIComponent(password)));

    const tokenValid = (account) =>
      !!account?.reset_token &&
      account.reset_token === token &&
      typeof account.reset_token_expiry === 'number' &&
      Date.now() < account.reset_token_expiry;

    const invalidTokenResponse = () =>
      Response.json(
        { success: false, error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 403 }
      );

    // Business owner?
    const businesses = await base44.asServiceRole.entities.Business.filter({ email: normalizedEmail });
    const business = businesses[0];
    if (business) {
      if (!tokenValid(business)) return invalidTokenResponse();
      await base44.asServiceRole.entities.Business.update(business.id, {
        password_hash: passwordHash,
        reset_token: null,        // single-use: consume the token
        reset_token_expiry: null,
      });
      return Response.json({ success: true, message: 'Password updated successfully', type: 'business' });
    }

    // Regular customer?
    const customers = await base44.asServiceRole.entities.Customer.filter({ email: normalizedEmail });
    const customer = customers[0];
    if (customer) {
      if (!tokenValid(customer)) return invalidTokenResponse();
      await base44.asServiceRole.entities.Customer.update(customer.id, {
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expiry: null,
      });
      return Response.json({ success: true, message: 'Password updated successfully', type: 'customer' });
    }

    return Response.json({ success: false, error: 'Email not found' }, { status: 404 });

  } catch (error) {
    console.error("Error updating password:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});
