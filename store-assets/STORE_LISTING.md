# Chrome Web Store listing — copy to paste

Paste each field into the corresponding box in the Developer Dashboard.

---

## Name (45 chars max)
```
WhatsApp Quick Link Native
```

## Summary (132 chars max — appears under the name in search results)
```
Turns phone numbers on any webpage into clickable WhatsApp (wa.me) links, inline where they appear.
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
WhatsApp Quick Link Native makes every phone number on the web a one-click WhatsApp chat — without you having to copy, paste, or manually build wa.me URLs.

HOW IT WORKS
• The extension scans the text of each page you visit for phone numbers.
• Numbers that pass the parser's format and country-code checks are turned into clickable wa.me links right where they appear on the page, with a small WhatsApp icon next to them.
• Clicking the link opens WhatsApp with the conversation pre-loaded — exactly as if you had built the wa.me URL by hand.

WHY IT'S DIFFERENT
Other "WhatsApp link" extensions require you to open a popup and type the number every time. This one is native: links appear inline on the actual page, automatically, with no popup interaction. Smart parsing keeps false positives low — invoice numbers, account IDs, IP addresses, dates, and other digit-strings without phone-number context are left alone.

PRIVACY
• No accounts, no signup, no telemetry, no analytics.
• The extension makes ZERO network requests of its own. Links are generated entirely on your device.
• When you click a generated link, your browser navigates to wa.me exactly as it would for any link — the extension itself never communicates with WhatsApp, Meta, or any other server.
• Full privacy policy: https://swiffers.github.io/whatsapp-quick-link-native/privacy.html

GOOD FOR
• Real estate listings, restaurant pages, classifieds, contact-us pages.
• Business directories like Yelp, Pages Jaunes, Google Maps results.
• Anywhere a business publishes a phone number and you'd rather text than call.

CONTROLS
• Global on/off and per-site disable from the toolbar popup.

LIMITATIONS
• The extension converts phone numbers it detects on the page. It does NOT verify that each detected number is registered on WhatsApp — that verification is technically impossible without WhatsApp credentials. If you click a link for a number that isn't on WhatsApp, WhatsApp's own page will tell you so.
• Phone-number detection uses country dial codes for ~50 markets. Bare local numbers from less common countries may not be recognized.

OPEN SOURCE
Source code, issue tracker, and changelog: https://github.com/Swiffers/whatsapp-quick-link-native

This extension is not affiliated with, endorsed by, or sponsored by WhatsApp Inc., Meta Platforms, or any of their subsidiaries. "WhatsApp" is a trademark of WhatsApp LLC.
```

---

## Permission justifications (asked during submission)

### Justification for `storage` permission
```
Used to persist the user's on/off and per-site disable preferences locally. No data leaves the user's browser.
```

### Justification for broad host access (content scripts on `<all_urls>`)
```
Phone numbers can appear on any website (real estate listings, restaurant pages, contact-us pages, business directories, classifieds, etc.). The content script must run on all sites the user visits in order to scan for and replace phone numbers in place. The script does not read, transmit, or store any page content — it only locates phone-number-shaped substrings in the rendered text and rewrites them into wa.me links. The extension makes no network requests of its own.
```

### Justification for "remote code" (if asked — answer NO)
```
The extension does not execute any remote code. All JavaScript runs from the packaged bundle and the extension makes no network requests.
```

---

## Privacy practices form (Web Store data-use disclosure)

For the "What user data do you plan to collect?" question, leave **all categories unchecked**. As of v0.4.0 the extension makes no network requests of its own and transfers no data off the user's device.

Check all three certifications:
- ☑ I do not sell or transfer user data to third parties, outside of approved use cases.
- ☑ I do not use or transfer user data for purposes unrelated to my extension's single purpose.
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes.

---

## Single purpose
```
Detect phone numbers on web pages and turn them into clickable WhatsApp chat links inline.
```

---

## Distribution
- Visibility: **Public**
- Regions: **All regions**
- Pricing: **Free**

---

## Support / homepage URLs
- Homepage URL: https://swiffers.github.io/whatsapp-quick-link-native/
- Support email: hermes.bozec@gmail.com
- Privacy policy URL: https://swiffers.github.io/whatsapp-quick-link-native/privacy.html
