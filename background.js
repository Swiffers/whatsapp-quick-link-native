// Background service worker:
// - Holds user preferences (storage) and a clear-cache passthrough for legacy state.
// - No network requests. WhatsApp validity cannot be determined from a service-worker
//   fetch — wa.me serves identical HTML for valid and invalid numbers and the client-side
//   JS that performs the check refuses to load in any iframe (X-Frame-Options: DENY).
//   We therefore convert every well-formed phone number directly to a wa.me link and
//   rely on aggressive parser filtering (see phone-parser.js + tests/parser-tests.js).

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "clearCache") return false;
  chrome.storage.local.get(null).then(all => {
    const keys = Object.keys(all).filter(k => k.startsWith("wa:"));
    chrome.storage.local.remove(keys).then(() => sendResponse({ cleared: keys.length }));
  });
  return true;
});
