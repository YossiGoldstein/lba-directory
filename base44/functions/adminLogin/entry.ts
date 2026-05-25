import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const normalizedEmail = email.toLowerCase().trim();
    const users = await base44.asServiceRole.entities.User.filter({ email: normalizedEmail });
    const adminUser = users.find(u => u.role === 'admin' || u.role === 'owner');

    if (!adminUser) {
      return Response.json({ isAdmin: false });
    }

    // If admin has a password set, verify it
    // Support both plain text and btoa-encoded passwords
    if (adminUser.password_hash) {
      const passwordHash = btoa(password || "");
      const plainMatch = adminUser.password_hash === (password || "");
      const btaoMatch = adminUser.password_hash === passwordHash;
      if (!plainMatch && !btaoMatch) {
        return Response.json({ isAdmin: false, error: 'Invalid password' });
      }
    }

    return Response.json({
      isAdmin: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error("Admin login check error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});