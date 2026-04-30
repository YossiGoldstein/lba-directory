const API_KEY = "AIzaSyDfr-zgnbCEuvQGbEll582R4kSes79FDc8";
let promise = null;

/**
 * Universal Google Maps loader — works regardless of how (or whether) the
 * Maps script is loaded in index.html.
 *
 * Resolution order:
 *  1. Already loaded (classic async/defer script has fully executed)
 *  2. Bootstrap Loader present (importLibrary shim is synchronously available)
 *  3. async/defer script tag exists but hasn't executed yet → poll
 *  4. No script at all → inject our own with a named callback
 */
export function loadGoogleMaps() {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (promise) return promise;

  promise = new Promise((resolve, reject) => {
    // Case 2: Bootstrap Loader inline script already ran — importLibrary is available
    if (window.google?.maps?.importLibrary) {
      window.google.maps.importLibrary("maps")
        .then(() => resolve())
        .catch(reject);
      return;
    }

    // Case 3: A classic async/defer <script> tag exists but hasn't executed yet
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      const iv = setInterval(() => {
        if (window.google?.maps?.Map) { clearInterval(iv); clearTimeout(to); resolve(); }
      }, 100);
      const to = setTimeout(() => {
        clearInterval(iv);
        promise = null;
        reject(new Error("Google Maps timed out waiting for async/defer script"));
      }, 10000);
      return;
    }

    // Case 4: No script present — inject one ourselves with a named callback
    const cbName = "_googleMapsReady";
    window[cbName] = () => { delete window[cbName]; resolve(); };
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker&callback=${cbName}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => {
      promise = null;
      delete window[cbName];
      reject(new Error("Google Maps script failed to load"));
    };
    document.head.appendChild(s);
  });

  return promise;
}
