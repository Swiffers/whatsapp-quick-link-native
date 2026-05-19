// Country dial codes + national-number rules for top markets.
// trunk = leading digit dropped when going international (e.g. FR "06..." -> "+33 6...").
// lengths = valid national-number digit counts (excluding country code).
const COUNTRY_DATA = {
  US: { dial: "1",   trunk: null, lengths: [10] },
  CA: { dial: "1",   trunk: null, lengths: [10] },
  GB: { dial: "44",  trunk: "0",  lengths: [10] },
  FR: { dial: "33",  trunk: "0",  lengths: [9] },
  DE: { dial: "49",  trunk: "0",  lengths: [10, 11] },
  ES: { dial: "34",  trunk: null, lengths: [9] },
  IT: { dial: "39",  trunk: null, lengths: [9, 10] },
  PT: { dial: "351", trunk: null, lengths: [9] },
  BR: { dial: "55",  trunk: "0",  lengths: [10, 11] },
  MX: { dial: "52",  trunk: null, lengths: [10] },
  AR: { dial: "54",  trunk: "0",  lengths: [10] },
  CL: { dial: "56",  trunk: null, lengths: [9] },
  CO: { dial: "57",  trunk: null, lengths: [10] },
  IN: { dial: "91",  trunk: "0",  lengths: [10] },
  CN: { dial: "86",  trunk: "0",  lengths: [11] },
  JP: { dial: "81",  trunk: "0",  lengths: [9, 10] },
  KR: { dial: "82",  trunk: "0",  lengths: [9, 10] },
  AU: { dial: "61",  trunk: "0",  lengths: [9] },
  NZ: { dial: "64",  trunk: "0",  lengths: [8, 9] },
  NL: { dial: "31",  trunk: "0",  lengths: [9] },
  BE: { dial: "32",  trunk: "0",  lengths: [8, 9] },
  CH: { dial: "41",  trunk: "0",  lengths: [9] },
  AT: { dial: "43",  trunk: "0",  lengths: [10, 11] },
  SE: { dial: "46",  trunk: "0",  lengths: [9] },
  NO: { dial: "47",  trunk: null, lengths: [8] },
  DK: { dial: "45",  trunk: null, lengths: [8] },
  FI: { dial: "358", trunk: "0",  lengths: [9, 10] },
  IE: { dial: "353", trunk: "0",  lengths: [9] },
  PL: { dial: "48",  trunk: null, lengths: [9] },
  CZ: { dial: "420", trunk: null, lengths: [9] },
  GR: { dial: "30",  trunk: null, lengths: [10] },
  RO: { dial: "40",  trunk: "0",  lengths: [9] },
  TR: { dial: "90",  trunk: "0",  lengths: [10] },
  RU: { dial: "7",   trunk: "8",  lengths: [10] },
  UA: { dial: "380", trunk: "0",  lengths: [9] },
  ZA: { dial: "27",  trunk: "0",  lengths: [9] },
  NG: { dial: "234", trunk: "0",  lengths: [10] },
  KE: { dial: "254", trunk: "0",  lengths: [9] },
  EG: { dial: "20",  trunk: "0",  lengths: [10] },
  MA: { dial: "212", trunk: "0",  lengths: [9] },
  AE: { dial: "971", trunk: "0",  lengths: [9] },
  SA: { dial: "966", trunk: "0",  lengths: [9] },
  IL: { dial: "972", trunk: "0",  lengths: [9] },
  ID: { dial: "62",  trunk: "0",  lengths: [9, 10, 11, 12] },
  TH: { dial: "66",  trunk: "0",  lengths: [9] },
  VN: { dial: "84",  trunk: "0",  lengths: [9, 10] },
  PH: { dial: "63",  trunk: "0",  lengths: [10] },
  MY: { dial: "60",  trunk: "0",  lengths: [9, 10] },
  SG: { dial: "65",  trunk: null, lengths: [8] },
  HK: { dial: "852", trunk: null, lengths: [8] },
  TW: { dial: "886", trunk: "0",  lengths: [9] }
};

// TLD -> ISO mapping. Falls back to lang attr / navigator.language if no match.
const TLD_TO_COUNTRY = {
  us: "US", ca: "CA", uk: "GB", gb: "GB", fr: "FR", de: "DE", es: "ES",
  it: "IT", pt: "PT", br: "BR", mx: "MX", ar: "AR", cl: "CL", co: "CO",
  in: "IN", cn: "CN", jp: "JP", kr: "KR", au: "AU", nz: "NZ", nl: "NL",
  be: "BE", ch: "CH", at: "AT", se: "SE", no: "NO", dk: "DK", fi: "FI",
  ie: "IE", pl: "PL", cz: "CZ", gr: "GR", ro: "RO", tr: "TR", ru: "RU",
  ua: "UA", za: "ZA", ng: "NG", ke: "KE", eg: "EG", ma: "MA", ae: "AE",
  sa: "SA", il: "IL", id: "ID", th: "TH", vn: "VN", ph: "PH", my: "MY",
  sg: "SG", hk: "HK", tw: "TW"
};

// Sorted longest-first so "351" matches before "35" or "3".
const DIAL_CODES_SORTED = Object.entries(COUNTRY_DATA)
  .map(([iso, d]) => ({ iso, dial: d.dial }))
  .sort((a, b) => b.dial.length - a.dial.length);
