// Phone parser: finds candidate phone strings in text and normalizes to E.164.
// Returns null when the candidate doesn't pass length/format checks.

const PHONE_REGEX = /(?:\+|00)?\d(?:[\s.\- ()/]?\d){6,16}/g;

function inferCountry() {
  const host = (location.hostname || "").toLowerCase();
  const tld = host.split(".").pop();
  if (tld && TLD_TO_COUNTRY[tld]) return TLD_TO_COUNTRY[tld];

  const lang = (document.documentElement.lang || navigator.language || "").toLowerCase();
  const region = lang.split("-")[1];
  if (region && COUNTRY_DATA[region.toUpperCase()]) return region.toUpperCase();

  const langOnly = lang.split("-")[0];
  const guessFromLang = { en: "US", fr: "FR", de: "DE", es: "ES", pt: "PT",
    it: "IT", nl: "NL", sv: "SE", da: "DK", no: "NO", fi: "FI", pl: "PL",
    cs: "CZ", el: "GR", ro: "RO", tr: "TR", ru: "RU", uk: "UA", ar: "AE",
    he: "IL", id: "ID", th: "TH", vi: "VN", ms: "MY", zh: "CN", ja: "JP",
    ko: "KR" };
  if (guessFromLang[langOnly]) return guessFromLang[langOnly];
  return "US";
}

function stripSeparators(s) {
  return s.replace(/[\s.\- ()/]/g, "");
}

function normalizeToE164(raw, defaultCountry) {
  let s = raw.trim();
  let digits;

  if (s.startsWith("+")) {
    digits = stripSeparators(s).replace(/^\+/, "");
    return matchByDialCode(digits);
  }
  if (s.startsWith("00")) {
    digits = stripSeparators(s).replace(/^00/, "");
    return matchByDialCode(digits);
  }

  digits = stripSeparators(s);
  const country = COUNTRY_DATA[defaultCountry];
  if (!country) return null;

  let national = digits;
  if (country.trunk && national.startsWith(country.trunk)) {
    national = national.slice(country.trunk.length);
  }
  if (!country.lengths.includes(national.length)) return null;

  return country.dial + national;
}

function matchByDialCode(digits) {
  for (const { iso, dial } of DIAL_CODES_SORTED) {
    if (digits.startsWith(dial)) {
      const national = digits.slice(dial.length);
      const country = COUNTRY_DATA[iso];
      if (country.lengths.includes(national.length)) {
        return dial + national;
      }
    }
  }
  // Loose fallback: any 8-15 digit international-looking number passes through.
  if (digits.length >= 8 && digits.length <= 15) return digits;
  return null;
}

function findPhonesInText(text, defaultCountry) {
  const matches = [];
  let m;
  PHONE_REGEX.lastIndex = 0;
  while ((m = PHONE_REGEX.exec(text)) !== null) {
    const raw = m[0];
    const stripped = stripSeparators(raw);
    if (stripped.length < 8 || stripped.length > 17) continue;
    const e164 = normalizeToE164(raw, defaultCountry);
    if (!e164) continue;
    matches.push({ raw, e164, start: m.index, end: m.index + raw.length });
  }
  return matches;
}
