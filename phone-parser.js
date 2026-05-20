// Phone parser: finds candidate phone strings in text and normalizes to E.164.
// Returns null when the candidate doesn't pass length/format/context checks.

const PHONE_REGEX = /(?:\+|00)?\(?\d(?:[\s.\- ()/]*\d){6,16}/g;

// Words that, when appearing just before a candidate, vouch for it being a phone number.
// Used to accept bare digit blobs (no +, no separators) that would otherwise be rejected.
const PHONE_CONTEXT_REGEX = /(?:\b(?:phone|tel|mobile|fax|cellphone|call|whatsapp|sms|téléphone|tel|portable|telefon|teléfono|telefono|cellulare|telefoon|telefone|电话|手机|電話)\b|☎|📞|📱)\s*[:#]?\s*$/i;

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
  return s.replace(/[\s.\- ()/]/g, "");
}

function hasSeparators(s) {
  return /[\s.\- ()/]/.test(s.trim());
}

// Country-specific first-digit validity rules for the *national* number (after trunk strip).
// Returns true if the national number's leading digit(s) look plausible for a real subscriber number.
function passesNationalDigitRule(iso, national) {
  if (national.length === 0) return false;
  const d0 = national[0];
  switch (iso) {
    case "US":
    case "CA":
      // NANP: area code N (digit 1) must be 2-9, exchange N (digit 4) must be 2-9.
      if (d0 < "2") return false;
      if (national.length >= 4 && national[3] < "2") return false;
      return true;
    case "FR":
      // Mobile/landline first digit 1-9 (after trunk-0 strip). 0/1/8 ranges have special meaning,
      // but most subscribers are 1-7 or 9.
      return d0 >= "1" && d0 <= "9";
    case "GB":
      // First digit 1-9 after trunk strip.
      return d0 >= "1" && d0 <= "9";
    default:
      // Generic: most national numbering plans don't start subscriber numbers with 0.
      return d0 !== "0";
  }
}

function normalizeToE164(raw, defaultCountry, precedingText) {
  let s = raw.trim();
  const stripped = stripSeparators(s);
  const hasPlus = s.startsWith("+");
  const has00 = s.startsWith("00");
  const sep = hasSeparators(s);
  const contextual = PHONE_CONTEXT_REGEX.test(precedingText || "");

  // The single most important filter: a bare digit blob with no + / no 00 / no separators
  // and no phone-context word in front of it is almost certainly NOT a phone number
  // (it's an invoice number, order ID, account number, zip+4, etc.).
  if (!hasPlus && !has00 && !sep && !contextual) return null;

  let digits;
  if (hasPlus) {
    digits = stripped.replace(/^\+/, "");
    return matchByDialCode(digits);
  }
  if (has00) {
    digits = stripped.replace(/^00/, "");
    return matchByDialCode(digits);
  }

  digits = stripped;
  const country = COUNTRY_DATA[defaultCountry];
  if (!country) return null;

  let national = digits;
  if (country.trunk && national.startsWith(country.trunk)) {
    national = national.slice(country.trunk.length);
  }
  if (!country.lengths.includes(national.length)) return null;
  if (!passesNationalDigitRule(defaultCountry, national)) return null;

  return country.dial + national;
}

function matchByDialCode(digits) {
  for (const { iso, dial } of DIAL_CODES_SORTED) {
    if (digits.startsWith(dial)) {
      const national = digits.slice(dial.length);
      const country = COUNTRY_DATA[iso];
      if (country.lengths.includes(national.length) && passesNationalDigitRule(iso, national)) {
        return dial + national;
      }
    }
  }
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
    const preceding = text.slice(Math.max(0, m.index - 30), m.index);
    const e164 = normalizeToE164(raw, defaultCountry, preceding);
    if (!e164) continue;
    matches.push({ raw, e164, start: m.index, end: m.index + raw.length });
  }
  return matches;
}
