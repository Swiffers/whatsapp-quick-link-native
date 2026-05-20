# WhatsApp Quick Link Native

Chrome extension. Detects phone numbers on any webpage and replaces them inline with clickable `wa.me` links — no popup, no copy-paste.

## Install (unpacked)

1. Open `chrome://extensions`
2. Toggle **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder

## How it works

- `content.js` walks each page's text, applies the regex + country rules in `phone-parser.js`, and rewrites valid phone-number text into `<a href="https://wa.me/...">` links with an inline WhatsApp icon
- `country-data.js` holds dial codes, trunk prefixes, and national-number length rules for ~50 countries
- `background.js` is a minimal service worker that holds preferences only — the extension makes no network requests of its own
- Default country is inferred from page TLD → `<html lang>` → `navigator.language`

## Why no WhatsApp validation

Earlier versions tried to verify each number against `wa.me` before linking. **This is no longer possible** without WhatsApp credentials:

- `wa.me` serves identical HTML for valid and invalid numbers (the validity check runs in client-side JS that we can't execute from a service worker)
- `wa.me` returns `x-frame-options: DENY`, so an offscreen document can't load it either
- Meta deprecated the `/contacts` endpoint of the WhatsApp Business API
- Reverse-engineering the internal XHR is brittle, against ToS, and risks IP-level blocking

Since reliable validation is impossible, the extension now focuses on **near-zero-false-positive parsing**: digit blobs without `+`, separators, or phone-context words are rejected; US/CA numbers must follow NANP area-code rules (2-9); etc. See `tests/parser-tests.js` for the full behavior.

## Running tests

```bash
node tests/parser-tests.js
```

## Settings (popup)

- **Enable everywhere** — global on/off
- **Enable on this site** — per-host toggle
- **Clear cache** — wipes any legacy preferences from previous versions
