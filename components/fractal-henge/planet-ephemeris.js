import * as Astronomy from 'https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/esm/astronomy.js';

const ZODIAC = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

/** @type {Array<{ name: string, body: 'Sun' | 'Moon' | number }>} */
const EPHEM_BODIES = [
  { name: 'Sun', body: 'Sun' },
  { name: 'Moon', body: 'Moon' },
  { name: 'Mercury', body: Astronomy.Body.Mercury },
  { name: 'Venus', body: Astronomy.Body.Venus },
  { name: 'Mars', body: Astronomy.Body.Mars },
  { name: 'Jupiter', body: Astronomy.Body.Jupiter },
  { name: 'Saturn', body: Astronomy.Body.Saturn },
  { name: 'Uranus', body: Astronomy.Body.Uranus },
  { name: 'Neptune', body: Astronomy.Body.Neptune },
  { name: 'Pluto', body: Astronomy.Body.Pluto },
];

const RETRO_DELTA_HOURS = 6;

/**
 * Ordered ephemeris `name` keys per ring digit (`9`→`8`), matching PLANET_NAMES in the app.
 * @type {Record<string, string[]>}
 */
export const PLANET_EPHEM_BODY_NAMES_BY_DIGIT = {
  '9': ['Venus'],
  '1': ['Mercury'],
  '2': ['Moon'],
  '3': ['Sun'],
  '4': ['Neptune'],
  '5': ['Uranus'],
  '6': ['Saturn'],
  '7': ['Jupiter'],
  '8': ['Mars', 'Pluto'],
};

/**
 * @param {number} deg
 */
export function normalizeLongitude(deg) {
  let x = deg % 360;
  if (x < 0) x += 360;
  return x;
}

/**
 * Shortest directed difference lonB - lonA in (-180, 180].
 * @param {number} lonAdeg
 * @param {number} lonBdeg
 */
function shortestLongitudeDeltaDeg(lonAdeg, lonBdeg) {
  const a = normalizeLongitude(lonAdeg);
  const b = normalizeLongitude(lonBdeg);
  let d = b - a;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

/**
 * @param {Date} date
 * @param {EPHEM_BODIES[number]['body']} body
 */
function geocentricEclipticLongitude(date, body) {
  if (body === 'Sun') {
    return normalizeLongitude(Astronomy.SunPosition(date).elon);
  }
  if (body === 'Moon') {
    const s = Astronomy.EclipticGeoMoon(date);
    return normalizeLongitude(s.lon);
  }
  const v = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(v);
  return normalizeLongitude(ecl.elon);
}

/**
 * @param {number} longitudeDeg
 */
function longitudeToPlacement(longitudeDeg) {
  const lon = normalizeLongitude(longitudeDeg);
  const signIdx = Math.min(11, Math.floor(lon / 30));
  const degInSign = lon % 30;
  const degInt = Math.floor(degInSign);
  const min = Math.round((degInSign - degInt) * 60);
  const safeMin = Math.min(59, Math.max(0, min));
  return {
    sign: ZODIAC[signIdx],
    degreeInSign: degInt,
    minuteInSign: safeMin,
    longitude: lon,
  };
}

/**
 * @param {Date} date
 * @param {EPHEM_BODIES[number]['body']} body
 */
function isRetrograde(date, body) {
  if (body === 'Sun' || body === 'Moon') return false;
  const ms = date.getTime();
  const before = new Date(ms - RETRO_DELTA_HOURS * 3600000);
  const after = new Date(ms + RETRO_DELTA_HOURS * 3600000);
  const lon0 = geocentricEclipticLongitude(before, body);
  const lon1 = geocentricEclipticLongitude(after, body);
  return shortestLongitudeDeltaDeg(lon0, lon1) < 0;
}

/**
 * @typedef {{ name: string, sign: string, degreeInSign: number, minuteInSign: number, longitude: number, retrograde: boolean }} EphemerisRow
 */

/**
 * Tropical geocentric positions (approximate apparent ecliptic of date via astronomy-engine).
 * @param {Date} date
 * @returns {EphemerisRow[]}
 */
export function computeEphemerisRows(date) {
  /** @type {EphemerisRow[]} */
  const rows = [];

  for (const { name, body } of EPHEM_BODIES) {
    const lon = geocentricEclipticLongitude(date, body);
    const { sign, degreeInSign, minuteInSign, longitude } = longitudeToPlacement(lon);
    rows.push({
      name,
      sign,
      degreeInSign,
      minuteInSign,
      longitude,
      retrograde: isRetrograde(date, body),
    });
  }

  return rows;
}

/**
 * @param {EphemerisRow} row
 */
export function formatEphemerisPosition(row) {
  const mm = String(row.minuteInSign).padStart(2, '0');
  const r = row.retrograde ? ' R' : '';
  return `${row.degreeInSign}° ${mm}′ ${row.sign}${r}`;
}

/**
 * Preformatted hub lines keyed by digit. Single-body spokes: position only (large title is outside the ring).
 * Digit 8 (Mars + Pluto): lines include body name prefix.
 * @param {Date} date
 * @returns {Record<string, string[]>}
 */
export function buildPlanetEphemerisByDigit(date) {
  const rows = computeEphemerisRows(date);
  const byName = new Map(rows.map((r) => [r.name, r]));
  /** @type {Record<string, string[]>} */
  const out = {};

  for (const digit of Object.keys(PLANET_EPHEM_BODY_NAMES_BY_DIGIT)) {
    const names = PLANET_EPHEM_BODY_NAMES_BY_DIGIT[digit];
    const multiBody = names.length > 1;
    const lines = [];
    for (const nm of names) {
      const row = byName.get(nm);
      if (row) {
        lines.push(
          multiBody
            ? `${nm} · ${formatEphemerisPosition(row)}`
            : formatEphemerisPosition(row)
        );
      }
    }
    out[digit] = lines;
  }

  return out;
}
