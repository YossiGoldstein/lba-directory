import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.filter({ email: email, role: 'admin' });
    const adminUser = users[0];

    if (!adminUser) {
      return Response.json({ isAdmin: false });
    }

    // If admin has a password set, verify it
    if (adminUser.password_hash) {
      const passwordHash = btoa(password || "");
      if (adminUser.password_hash !== passwordHash) {
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