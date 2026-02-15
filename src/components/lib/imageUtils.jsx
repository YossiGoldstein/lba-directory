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
  
  // If it's an external URL (not Base44 storage), return as-is
  if (url.startsWith('http') && !url.includes('supabase.co/storage')) {
    return url;
  }
  
  // Extract the path from Base44 storage URLs
  const storagePathMatch = url.match(/\/storage\/v1\/object\/public\/(.+)$/);
  if (storagePathMatch) {
    // Reconstruct with the canonical storage domain
    return `https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/${storagePathMatch[1]}`;
  }
  
  // Return original if no match
  return url;
}