import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Get all businesses without coordinates
    const businesses = await base44.asServiceRole.entities.Business.list();
    const needGeocoding = businesses.filter(b => 
      (!b.latitude || !b.longitude) && b.address_line1
    );

    const results = {
      total: businesses.length,
      needGeocoding: needGeocoding.length,
      updated: 0,
      failed: 0,
      details: [],
      debug: {
        withCoords: businesses.filter(b => b.latitude && b.longitude).length,
        withoutCoords: businesses.filter(b => !b.latitude || !b.longitude).length,
        withAddress: businesses.filter(b => b.address_line1).length,
        withoutAddress: businesses.filter(b => !b.address_line1).length,
        sampleBusinesses: businesses.slice(0, 3).map(b => ({
          name: b.business_name,
          hasLat: !!b.latitude,
          hasLng: !!b.longitude,
          hasAddress: !!b.address_line1
        }))
      }
    };

    for (const business of needGeocoding) {
      const address = `${business.address_line1}, ${business.city || 'Lakewood'}, ${business.state || 'NJ'}, ${business.zip_code || ''}`;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
          {
            headers: {
              'User-Agent': 'LBA-Directory/1.0'
            }
          }
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          await base44.asServiceRole.entities.Business.update(business.id, {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon)
          });
          
          results.updated++;
          results.details.push({
            business: business.business_name,
            status: 'success',
            coords: { lat: data[0].lat, lon: data[0].lon }
          });
        } else {
          results.failed++;
          results.details.push({
            business: business.business_name,
            status: 'not_found',
            address: address
          });
        }
        
        // Rate limit: 1 second between requests (Nominatim requirement)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.failed++;
        results.details.push({
          business: business.business_name,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});