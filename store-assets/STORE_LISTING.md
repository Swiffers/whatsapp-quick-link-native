# Chrome Web Store listing — copy to paste

Paste each field into the corresponding box in the Developer Dashboard.

---

## Name (45 chars max)
```
WhatsApp Quick Link Native
```

## Summary (132 chars max — appears under the name in search results)
```
Turns phone numbers on any webpage into clickable WhatsApp links — only if the number is actually on WhatsApp.
```

## Category
```
Productivity
```

## Language
```
English (United States)
```

## Detailed description (16,000 chars max)
```
WhatsApp Quick Link Native makes every phone number on the web a one-click WhatsApp chat — without you having to copy, paste, or manually type wa.me URLs.

HOW IT WORKS
• The extension scans the text of each page you visit for phone numbers.
• For every number it finds, it checks (in the background) whether that number is registered on WhatsApp.
• Valid numbers are turned into clickable links right where they appear on the page, with a small WhatsApp icon next to them.
• Invalid or non-WhatsApp numbers are left untouched.

WHY IT'S DIFFERENT
Most "WhatsApp link" extensions either build a wa.me URL from any number blindly (so half your clicks land on dead numbers) or require you to type the number yourself in a popup. This one is native — the links appear inline on the actual page — and it's pre-validated, so every link you see is a number that's really on WhatsApp.

PRIVACY
• No accounts, no signup, no telemetry, no analytics.
• The only network requests we make are to wa.me (operated by WhatsApp/Meta), to validate numbers.
• Validation results are cached locally in your browser for 30 days.
• Full privacy policy: [insert your hosted privacy-policy.html URL]

GOOD FOR
• Real estate listings, restaurant pages, classifieds, contact-us pages.
• Business directories like Yelp, Pages Jaunes, Google Maps.
• Anywhere a business publishes a phone number and you'd rather text than call.

CONTROLS
• Global on/off and per-site disable from the toolbar popup.
• Clear-cache button to force re-validation.

LIMITATIONS
• Phone-number detection uses country dial codes for ~50 markets. Bare local numbers from less common countries may not be recognized.
• Validation depends on wa.me's response; if WhatsApp throttles or changes its response format, the extension will fall back to optimistic linking (showing the link without certainty).

This extension is not affiliated with, endorsed by, or sponsored by WhatsApp Inc., Meta Platforms, or any of their subsidiaries. "WhatsApp" is a trademark of WhatsApp LLC.
```

---

## Permission justifications (asked during submission)

### Justification for `storage` permission
```
Used to cache phone-number validation results locally (30-day TTL) so the same number isn't re-checked on every page visit, and to persist the user's on/off and per-site disable preferences. No data leaves the user's browser.
```

### Justification for `host_permissions` (wa.me, api.whatsapp.com)
```
The extension validates each detected phone number by sending a single HTTP GET request to https://wa.me/<number> and inspecting the response to determine whether the number is registered with WhatsApp. This is the core function of the extension.
```

### Justification for broad host access (content scripts on `<all_urls>`)
```
Phone numbers can appear on any website (real estate listings, restaurant pages, contact-us pages, business directories, classifieds, etc.). The content script must run on all sites the user visits in order to scan for and replace phone numbers in place. The script does not read, transmit, or store any page content other than the phone numbers themselves.
```

### Justification for "remote code" (if asked — answer NO)
```
The extension does not execute any remote code. All JavaScript runs from the packaged bundle. The only network requests are HTTP GETs to wa.me whose response is parsed (not executed) as plain text/HTML.
```

---

## Privacy practices form (Web Store data-use disclosure)

| Data type                  | Collected? | Notes |
|----------------------------|-----------|-------|
| Personally identifiable info | No |  |
| Health info                | No |  |
| Financial info             | No |  |
| Authentication info        | No |  |
| Personal communications    | No | (The extension does not access WhatsApp messages.) |
| Location                   | No |  |
| Web history                | No | (Page content is read locally but never transmitted.) |
| User activity              | No |  |
| Website content            | No | (Phone numbers are extracted locally and only the number itself is sent to wa.me for validation.) |

Check all three certifications:
- ☑ I do not sell or transfer user data to third parties outside of approved use cases.
- ☑ I do not use or transfer user data for purposes unrelated to my extension's single purpose.
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes.

---

## Single purpose
```
Detect phone numbers on web pages and turn the ones that are registered on WhatsApp into clickable WhatsApp chat links.
```

---

## Distribution
- Visibility: **Public**
- Regions: **All regions**
- Pricing: **Free**

---

## Support / homepage URLs
- Homepage URL: (your GitHub repo or a landing page — required-ish)
- Support email: hermes.bozec@gmail.com
- Privacy policy URL: (your hosted privacy-policy.html URL — REQUIRED)
