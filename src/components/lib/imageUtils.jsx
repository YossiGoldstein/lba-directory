/**
 * Fixes image URLs to work across domain changes
 * Handles Base44 storage URLs that may contain old domains
 * @param {string} url - The image URL to fix
 * @returns {string} - The corrected image URL
 */
export function fixImageUrl(url) {
  if (!url) return url;
  
  // If it's not a string, return as-is
  if (typeof url !== 'string') return url;
  
  // Handle Base44 file API URLs - convert to storage URLs
  if (url.includes('/api/apps/') && url.includes('/files/public/')) {
    const match = url.match(/\/files\/public\/([^/]+)\/(.+)$/);
    if (match) {
      const [, appId, fileName] = match;
      return `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/${appId}/${fileName}`;
    }
  }
  
  // Extract the path from Supabase storage URLs
  const storagePathMatch = url.match(/\/storage\/v1\/object\/public\/(.+)$/);
  if (storagePathMatch) {
    // Reconstruct with the canonical storage domain
    return `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/${storagePathMatch[1]}`;
  }
  
  // Return original if external URL
  return url;
}