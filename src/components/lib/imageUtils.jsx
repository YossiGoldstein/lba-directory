/**
 * Fixes image URLs to work across domain changes
 * Handles Base44 storage URLs that may contain old domains
 * @param {string} url - The image URL to fix
 * @returns {string} - The corrected image URL
 */
export function fixImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  // If already a valid Supabase storage URL, return as-is
  if (url.startsWith('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/')) {
    return url;
  }

  // Handle media.base44.com URLs - return as-is (valid CDN)
  if (url.startsWith('https://media.base44.com/')) {
    return url;
  }
  
  // Handle Base44 file API URLs - convert to storage URLs
  // Handles both /files/public/ and /files/mp/public/ formats
  if (url.includes('/api/apps/') && (url.includes('/files/public/') || url.includes('/files/mp/public/'))) {
    const match = url.match(/\/files\/(?:mp\/)?public\/([^/]+)\/(.+)$/);
    if (match) {
      const [, appId, fileName] = match;
      return `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/${appId}/${fileName}`;
    }
  }
  
  // Extract the path from other Supabase storage URLs
  const storagePathMatch = url.match(/\/storage\/v1\/object\/public\/(.+)$/);
  if (storagePathMatch) {
    return `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/${storagePathMatch[1]}`;
  }
  
  // Return original URL (external URLs)
  return url;
}