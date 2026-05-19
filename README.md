# WhatsApp Quick Link Native

Inline-replaces phone numbers on any webpage with clickable `wa.me` links — only if the number is actually on WhatsApp.

## Install (unpacked)

1. Open `chrome://extensions`
2. Toggle **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this `whatsapp_link_opener/` folder
5. Visit any page with phone numbers — valid WhatsApp numbers will turn green with a small WA icon

## How it works

- `content.js` walks the DOM, finds phone-number-shaped text, normalizes to E.164 (using country inferred from TLD / `<html lang>` / `navigator.language`)
- For each candidate, sends a message to the background service worker
- `background.js` fetches `https://wa.me/<number>` and looks for "invalid number" markers in the HTML response, caches result in `chrome.storage.local` for 30 days
- Requests are queued with a 250ms gap to avoid rate-limiting from wa.me
- If the check is inconclusive (network error, ambiguous response), the link is rendered anyway (optimistic fallback)

## Verifying the wa.me marker logic

The validity-detection heuristic in `background.js` (`invalidMarkers` / `validMarkers`) is a best guess based on what wa.me currently serves. **Test it once on install**:

1. Pick a number you know is on WhatsApp (e.g. your own).
2. Pick a clearly bogus number (e.g. `+1 555 000 0000`).
3. Open the extension's service-worker DevTools (`chrome://extensions` → "Inspect views: service worker"), then in console:
   ```js
   fetch('https://wa.me/15550000000').then(r => r.text()).then(t => console.log(t.length, t.includes('invalid')))
   ```
4. If the markers no longer differentiate, update `invalidMarkers`/`validMarkers` in `background.js`.

WhatsApp changes their pages occasionally — this is the maintenance hotspot.

## Settings (popup)

- **Enable everywhere** — global on/off
- **Enable on this site** — per-host toggle
- **Clear cache** — wipes the 30-day validation cache

## Known limitations

- Phone parsing uses a built-in country dial-code table for ~50 countries. Bare local numbers from unlisted countries get the `default-from-TLD` treatment; if that's wrong, numbers won't match.
- wa.me is rate-limited per IP. The 250ms gap + 30-day cache keeps load light, but heavy use on number-dense pages may still hit limits.
- This relies on scraping wa.me, which is against WhatsApp's ToS for automated use. Don't ship to the Chrome Web Store as a paid product without considering the risk.
