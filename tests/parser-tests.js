#!/usr/bin/env node
// Node test runner for the phone-parser. Loads country-data.js and phone-parser.js
// in a sandbox with fake browser globals, then runs assertions on findPhonesInText.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadParser(hostname, lang) {
  const sandbox = {
    location: { hostname },
    document: { documentElement: { lang } },
    navigator: { language: lang },
    console
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "country-data.js"), "utf8"), sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "phone-parser.js"), "utf8"), sandbox);
  return sandbox;
}

const CASES = [
  // [description, text, hostname, lang, expectedE164OrNull]
  // --- REJECTIONS (the whole point of v0.3.0) ---
  ["bill number, no separators, no context", "Invoice 0542450901 paid", "mail.google.com", "en-US", null],
  ["bare digit blob, no context",            "0542450901",              "mail.google.com", "en-US", null],
  ["account number with #",                  "Account #1234567890",     "example.com",     "en-US", null],
  ["order ID",                               "Order 1234567890123 ship", "example.com",    "en-US", null],
  ["zip+4 lookalike, no separators",         "00012345",                "example.com",     "en-US", null],
  ["IPv4 address",                           "Server at 192.168.1.100", "example.com",     "en-US", null],
  ["IPv4 address starting 200",              "Host 200.150.1.100 ping", "example.com",     "en-US", null],
  ["US area code starts with 0",             "Call 0151234567",         "example.com",     "en-US", null],
  ["US area code starts with 1",             "Call 1235551234",         "example.com",     "en-US", null],
  ["NANP exchange starts with 1",            "Call 415-1-55-1234",      "example.com",     "en-US", null],
  ["too short (7 digits with seps)",         "Call 415-555",            "example.com",     "en-US", null],
  ["too long (18+ digit blob)",              "X 1234567890123456789",   "example.com",     "en-US", null],
  ["date with dashes",                       "Created 2026-05-20 ok",   "example.com",     "en-US", null],

  // --- ACCEPTANCES ---
  ["+ international, spaces",                "Call +33 6 12 34 56 78",  "example.com",     "en-US", "33612345678"],
  ["+ international, solid",                 "Reach me at +33612345678","example.com",     "en-US", "33612345678"],
  ["+ US with parens and dashes",            "+1 (415) 555-1234",       "example.com",     "en-US", "14155551234"],
  ["00 international prefix",                "00 33 6 12 34 56 78",     "example.com",     "en-US", "33612345678"],
  ["FR mobile from .fr context",             "Tel: 06 12 34 56 78",     "pagesjaunes.fr",  "fr-FR", "33612345678"],
  ["FR mobile dots",                         "06.12.34.56.78",          "pagesjaunes.fr",  "fr-FR", "33612345678"],
  ["FR with phone context word",             "Téléphone: 0612345678",   "pagesjaunes.fr",  "fr-FR", "33612345678"],
  ["US with separators, no context",         "415-555-1234 today",      "example.com",     "en-US", "14155551234"],
  ["US with parens",                         "(415) 555-1234",          "example.com",     "en-US", "14155551234"],
  ["US with dots and label",                 "Call us: 415.555.1234",   "example.com",     "en-US", "14155551234"],
  ["US bare digits with phone word",         "Phone: 4155551234",       "example.com",     "en-US", "14155551234"],
  ["UK from .uk",                            "Phone 020 7946 0958",     "bbc.co.uk",       "en-GB", "442079460958"],
  ["DE from .de",                            "Tel: 030 12345678",       "example.de",      "de-DE", "493012345678"],

  // --- Boundary cases ---
  ["only +, no number",                      "Call +",                  "example.com",     "en-US", null],
  ["WhatsApp emoji context",                 "📞 4155551234",            "example.com",     "en-US", "14155551234"],
  ["URL trailing digits",                    "see /page-1234567",       "example.com",     "en-US", null],
];

let passed = 0, failed = 0;
const failures = [];

for (const [desc, text, hostname, lang, expected] of CASES) {
  const sb = loadParser(hostname, lang);
  const country = sb.inferCountry();
  const matches = sb.findPhonesInText(text, country);
  const got = matches[0]?.e164 ?? null;
  const ok = got === expected;
  if (ok) {
    passed++;
    console.log(`  PASS  ${desc}`);
  } else {
    failed++;
    failures.push({ desc, text, expected, got });
    console.log(`  FAIL  ${desc}`);
    console.log(`        text:     ${JSON.stringify(text)}`);
    console.log(`        expected: ${expected}`);
    console.log(`        got:      ${got}`);
  }
}

console.log(`\n${passed}/${passed + failed} passed${failed ? ", " + failed + " failed" : ""}`);
process.exit(failed === 0 ? 0 : 1);
