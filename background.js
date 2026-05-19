// Background service worker:
// - Receives "check" messages from content scripts
// - Throttles wa.me fetches (single-flight per number, gap between requests)
// - Caches results in chrome.storage.local (30-day TTL)
// - Returns: true (on WA), false (not on WA), null (unknown — content script treats as valid)

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const FETCH_GAP_MS = 250;
const FETCH_TIMEOUT_MS = 6000;

const inflight = new Map();
let lastFetchAt = 0;
let queueTail = Promise.resolve();

async function getCached(e164) {
  const key = `wa:${e164}`;
  const obj = await chrome.storage.local.get(key);
  const entry = obj[key];
  if (!entry) return undefined;
  if (Date.now() - entry.t > CACHE_TTL_MS) return undefined;
  return entry.v;
}

async function setCached(e164, value) {
  const key = `wa:${e164}`;
  await chrome.storage.local.set({ [key]: { v: value, t: Date.now() } });
}

function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, {
    method: "GET",
    credentials: "omit",
    redirect: "follow",
    signal: ctrl.signal,
    headers: {
      "Accept": "text/html,application/xhtml+xml",
      "User-Agent": navigator.userAgent
    }
  }).finally(() => clearTimeout(id));
}

async function checkWhatsApp(e164) {
  const digits = e164.replace(/\D/g, "");
  try {
    const res = await fetchWithTimeout(`https://wa.me/${digits}`, FETCH_TIMEOUT_MS);
    if (!res.ok) return null;
    const html = await res.text();

    // Markers observed on the "invalid number" page served by wa.me / api.whatsapp.com.
    // wa.me returns the same shell HTML for both states then decides client-side, but
    // the invalid path includes specific copy / className markers in the inlined data.
    const invalidMarkers = [
      "Phone number shared via url is invalid",
      "phone number shared via url is invalid",
      '"invalid_number"',
      "main_block_invalid_number"
    ];
    const validMarkers = [
      'href="https://api.whatsapp.com/send',
      "action_button",
      "Continue to Chat",
      "Continue to chat"
    ];

    const looksInvalid = invalidMarkers.some(m => html.includes(m));
    const looksValid = validMarkers.some(m => html.includes(m));

    if (looksInvalid && !looksValid) return false;
    if (looksValid) return true;
    return null;
  } catch (e) {
    return null;
  }
}

function enqueue(e164) {
  if (inflight.has(e164)) return inflight.get(e164);

  const p = (async () => {
    queueTail = queueTail.then(async () => {
      const since = Date.now() - lastFetchAt;
      if (since < FETCH_GAP_MS) {
        await new Promise(r => setTimeout(r, FETCH_GAP_MS - since));
      }
      lastFetchAt = Date.now();
    });
    await queueTail;
    const result = await checkWhatsApp(e164);
    if (result !== null) await setCached(e164, result);
    return result;
  })();

  inflight.set(e164, p);
  p.finally(() => inflight.delete(e164));
  return p;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "check") return false;
  const { e164 } = msg;
  (async () => {
    const cached = await getCached(e164);
    if (cached !== undefined) {
      sendResponse({ e164, result: cached, cached: true });
      return;
    }
    const result = await enqueue(e164);
    sendResponse({ e164, result, cached: false });
  })();
  return true;
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "clearCache") return false;
  chrome.storage.local.get(null).then(all => {
    const keys = Object.keys(all).filter(k => k.startsWith("wa:"));
    chrome.storage.local.remove(keys).then(() => sendResponse({ cleared: keys.length }));
  });
  return true;
});
