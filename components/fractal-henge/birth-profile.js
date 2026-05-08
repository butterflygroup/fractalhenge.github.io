import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@3/+esm';

import {
  computeEphemerisRows,
  formatEphemerisPosition,
  longitudeToPlacement,
} from './planet-ephemeris.js';
import { ascendantTropicalLongitude } from './natal-ascendant.js';
import {
  closeNumericRingHubDeck,
  NUMERIC_RING_HUB_OPENED_EVENT,
} from '../numeric-ring/numeric-ring.js';

export const BIRTH_PROFILE_STORAGE_KEY = 'fractalhenge-birth-profile-v1';

/** @type {string[]} */
const FALLBACK_TIME_ZONES = [
  'UTC',
  'America/Chicago',
  'America/New_York',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Africa/Cairo',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
];

/**
 * @typedef {object} BirthProfileV1
 * @property {'1'} schemaVersion
 * @property {string} birthDate YYYY-MM-DD
 * @property {string} birthTime HH:mm (24h)
 * @property {string} ianaZone
 * @property {number} latitudeDeg
 * @property {number} longitudeDeg
 * @property {string} placeLabel
 * @property {string} birthUtcIso
 */

/** @returns {BirthProfileV1 | null} */
export function loadBirthProfile() {
  try {
    const raw = localStorage.getItem(BIRTH_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o?.schemaVersion !== '1') return null;
    if (
      typeof o.birthDate !== 'string' ||
      typeof o.birthTime !== 'string' ||
      typeof o.ianaZone !== 'string' ||
      typeof o.placeLabel !== 'string' ||
      typeof o.birthUtcIso !== 'string' ||
      typeof o.latitudeDeg !== 'number' ||
      typeof o.longitudeDeg !== 'number' ||
      !Number.isFinite(o.latitudeDeg) ||
      !Number.isFinite(o.longitudeDeg)
    ) {
      return null;
    }
    return /** @type {BirthProfileV1} */ (o);
  } catch {
    return null;
  }
}

/** @param {BirthProfileV1 | null} profile */
export function saveBirthProfile(profile) {
  if (!profile) {
    localStorage.removeItem(BIRTH_PROFILE_STORAGE_KEY);
    return;
  }
  localStorage.setItem(BIRTH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

const NATAL_SNAPSHOT_HIDDEN_KEY = 'fractalhenge-natal-snapshot-hidden-v1';

function loadNatalSnapshotUserHidden() {
  try {
    return localStorage.getItem(NATAL_SNAPSHOT_HIDDEN_KEY) === '1';
  } catch {
    return false;
  }
}

function setNatalSnapshotUserHidden(hidden) {
  try {
    if (hidden) localStorage.setItem(NATAL_SNAPSHOT_HIDDEN_KEY, '1');
    else localStorage.removeItem(NATAL_SNAPSHOT_HIDDEN_KEY);
  } catch {
    /* noop */
  }
}

/** Clear persisted “hide snapshot” preference (e.g. after Clear chart) so next save shows overlay. */
function clearNatalSnapshotHiddenPref() {
  try {
    localStorage.removeItem(NATAL_SNAPSHOT_HIDDEN_KEY);
  } catch {
    /* noop */
  }
}

/**
 * Applies user toggle + profile state on #natal-hub (class + aria-hidden).
 * @param {HTMLElement} hubEl
 */
function applyNatalSnapshotVisibility(hubEl) {
  hubEl.classList.remove('natal-hub--snapshot-hidden');
  const profile = loadBirthProfile();
  if (!profile) {
    hubEl.removeAttribute('aria-hidden');
    return;
  }
  if (loadNatalSnapshotUserHidden()) {
    hubEl.classList.add('natal-hub--snapshot-hidden');
    hubEl.setAttribute('aria-hidden', 'true');
  } else {
    hubEl.removeAttribute('aria-hidden');
  }
}

/**
 * @param {string} birthDate YYYY-MM-DD
 * @param {string} birthTime HH:mm
 * @param {string} ianaZone
 */
export function composeBirthUtc(birthDate, birthTime, ianaZone) {
  const [y, mo, da] = birthDate.split('-').map(Number);
  const tm = birthTime.includes(':')
    ? birthTime.split(':').map(Number)
    : [Number(birthTime), 0];
  const h = tm[0] ?? 0;
  const mi = tm[1] ?? 0;
  const dt = DateTime.fromObject(
    {
      year: y,
      month: mo,
      day: da,
      hour: h,
      minute: mi,
      second: 0,
      millisecond: 0,
    },
    { zone: ianaZone }
  );
  if (!dt.isValid) throw new Error('Invalid date/time for that timezone.');
  return dt.toUTC();
}

/** @param {HTMLSelectElement} select */
export function populateTimeZones(select) {
  select.replaceChildren();
  /** @type {string[]} */
  let zones = [];
  try {
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      zones = Intl.supportedValuesOf('timeZone').slice();
      zones.sort((a, b) => a.localeCompare(b));
    }
  } catch {
    zones = [];
  }
  if (zones.length === 0) zones = FALLBACK_TIME_ZONES.slice();
  else {
    for (const z of FALLBACK_TIME_ZONES) {
      if (!zones.includes(z)) zones.push(z);
    }
    zones.sort((a, b) => a.localeCompare(b));
  }
  const opt0 = document.createElement('option');
  opt0.value = '';
  opt0.textContent = 'Select timezone…';
  select.appendChild(opt0);
  for (const z of zones) {
    const o = document.createElement('option');
    o.value = z;
    o.textContent = z;
    select.appendChild(o);
  }
}

/** @param {BirthProfileV1 | null} profile */
export function describeProfileSummary(profile) {
  if (!profile) return '';
  const dt = DateTime.fromISO(profile.birthUtcIso, { zone: 'utc' });
  const utcStr = dt.toFormat("ccc yyyy-LL-dd HH:mm 'UTC'");
  return `${profile.placeLabel} · ${profile.birthDate} ${profile.birthTime} (${profile.ianaZone}) · ${utcStr}`;
}

/** @param {BirthProfileV1 | null} profile */
export function renderNatalInto(natalHubEl, profile) {
  if (!(natalHubEl instanceof HTMLElement)) return;
  natalHubEl.replaceChildren();

  if (!profile) {
    natalHubEl.classList.add('natal-hub--empty');
    return;
  }

  natalHubEl.classList.remove('natal-hub--empty');

  const card = document.createElement('article');
  card.className = 'natal-hub__card';

  const utc = composeBirthUtc(
    profile.birthDate,
    profile.birthTime,
    profile.ianaZone
  ).toJSDate();

  let ascLon;
  try {
    ascLon = ascendantTropicalLongitude(
      utc,
      profile.latitudeDeg,
      profile.longitudeDeg
    );
  } catch {
    ascLon = 0;
  }
  const ascPlace = longitudeToPlacement(ascLon);
  const ascStr = `${ascPlace.degreeInSign}° ${String(ascPlace.minuteInSign).padStart(
    2,
    '0'
  )}′ ${ascPlace.sign}`;

  const rows = computeEphemerisRows(utc);

  /** @type {HTMLParagraphElement[]} */
  const planets = [];

  /** @param {string} name */
  function rowNamed(name) {
    const row = rows.find((r) => r.name === name);
    return row ? formatEphemerisPosition(row) : '';
  }

  const hTitle = document.createElement('h3');
  hTitle.className = 'natal-hub__title';
  hTitle.textContent = 'Your natal snapshot';

  const rise = document.createElement('p');
  rise.className = 'natal-hub__line natal-hub__line--bold';
  rise.textContent = `Rising (Ascendant) ${ascStr}`;

  const sun = document.createElement('p');
  sun.className = 'natal-hub__line natal-hub__line--bold';
  sun.textContent = `Sun ${rowNamed('Sun')}`;

  const moon = document.createElement('p');
  moon.className = 'natal-hub__line natal-hub__line--bold';
  moon.textContent = `Moon ${rowNamed('Moon')}`;

  planets.push(rise, sun, moon);

  const omit = new Set(['Sun', 'Moon']);
  for (const r of rows) {
    if (omit.has(r.name)) continue;
    const p = document.createElement('p');
    p.className = 'natal-hub__line';
    p.textContent = `${r.name} ${formatEphemerisPosition(r)}`;
    planets.push(p);
  }

  card.append(hTitle, ...planets);
  natalHubEl.appendChild(card);
}

/**
 * @param {object} opts
 * @param {HTMLElement | null} opts.datetimeCt
 * @param {HTMLDialogElement | null} opts.dialog
 * @param {HTMLElement | null} opts.natalHub
 * @param {HTMLElement | null} [opts.numericRingRoot] defaults to `#ring-one`
 * @param {() => void} [opts.onSave]
 */
export function initBirthProfile(opts) {
  const { datetimeCt, dialog, natalHub, numericRingRoot: numericRingRootOpt, onSave } =
    opts;

  if (!dialog || !natalHub || !datetimeCt) return;

  const numericRingRoot =
    numericRingRootOpt instanceof HTMLElement
      ? numericRingRootOpt
      : typeof document !== 'undefined'
        ? document.getElementById('ring-one')
        : null;

  const form = dialog.querySelector('[data-birth-form]');
  const errEl = dialog.querySelector('[data-birth-error]');
  const tzSelect =
    dialog.querySelector('[data-birth-timezone]') ??
    dialog.querySelector('select[name="ianaZone"]');
  const geoBtn =
    dialog.querySelector('[data-birth-geocode]') ??
    dialog.querySelector('[data-geocode-trigger]');

  /** @type {HTMLInputElement | null} */
  const dateIn = dialog.querySelector('input[name="birthDate"]');
  /** @type {HTMLInputElement | null} */
  const timeIn = dialog.querySelector('input[name="birthTime"]');
  /** @type {HTMLSelectElement | null} */
  const tz =
    tzSelect instanceof HTMLSelectElement ? tzSelect : null;
  /** @type {HTMLInputElement | null} */
  const latIn = dialog.querySelector('input[name="latitudeDeg"]');
  /** @type {HTMLInputElement | null} */
  const lonIn = dialog.querySelector('input[name="longitudeDeg"]');
  /** @type {HTMLInputElement | null} */
  const placeIn = dialog.querySelector('input[name="placeSearch"]');

  const tzPanel = dialog.querySelector('[data-birth-tz-panel]');

  /**
   * @param {HTMLSelectElement} select
   * @param {string} zone
   */
  function ensureTzOption(select, zone) {
    if (!Array.from(select.options).some((o) => o.value === zone)) {
      const o = document.createElement('option');
      o.value = zone;
      o.textContent = zone;
      select.appendChild(o);
    }
    select.value = zone;
  }

  function setTzPanelShown(visible) {
    if (!(tzPanel instanceof HTMLElement) || !tz) return;
    if (visible) {
      tzPanel.hidden = false;
      tzPanel.removeAttribute('aria-hidden');
      tz.required = true;
    } else {
      tzPanel.hidden = true;
      tzPanel.setAttribute('aria-hidden', 'true');
      tz.required = false;
      tz.selectedIndex = 0;
    }
  }

  function syncBirthEntryButtonLabel() {
    const row = datetimeCt.querySelector('.datetime-ct__setme-row');
    const btn = row?.querySelector('button');
    if (!(btn instanceof HTMLButtonElement)) return;
    const profile = loadBirthProfile();
    if (profile) {
      btn.textContent = 'Edit me';
      btn.setAttribute('aria-label', 'Edit birth date, place, and time zone');
    } else {
      btn.textContent = 'Set Me';
      btn.setAttribute('aria-label', 'Set birth date, place, and time zone');
    }
  }

  function syncNatalSnapshotOverlayUi() {
    applyNatalSnapshotVisibility(/** @type {HTMLElement} */ (natalHub));
    const srow = datetimeCt.querySelector('.datetime-ct__snapshot-toggle-row');
    if (!(srow instanceof HTMLElement)) return;
    const hasProfile = !!loadBirthProfile();
    srow.hidden = !hasProfile;
    const tbtn = srow.querySelector('[data-natal-snapshot-toggle]');
    if (!(tbtn instanceof HTMLButtonElement) || srow.hidden) return;
    const userHidden = loadNatalSnapshotUserHidden();
    if (userHidden) {
      tbtn.textContent = 'Show snapshot';
      tbtn.setAttribute('aria-pressed', 'false');
      tbtn.setAttribute('aria-label', 'Show natal snapshot on the ring');
    } else {
      tbtn.textContent = 'Hide snapshot';
      tbtn.setAttribute('aria-pressed', 'true');
      tbtn.setAttribute('aria-label', 'Hide natal snapshot on the ring');
    }
  }

  if (!datetimeCt.querySelector('.datetime-ct__setme-row')) {
    const row = document.createElement('div');
    row.className = 'datetime-ct__setme-row';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'datetime-ct__setme';
    btn.textContent = 'Set Me';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-controls', 'birth-profile-modal');
    row.appendChild(btn);
    datetimeCt.appendChild(row);

    btn.addEventListener('click', () => {
      fillFromProfile(loadBirthProfile());
      errEl instanceof HTMLElement && (errEl.textContent = '');
      dialog.showModal?.();
      try {
        dateIn?.focus();
      } catch {
        /* noop */
      }
    });
  }

  if (!datetimeCt.querySelector('.datetime-ct__snapshot-toggle-row')) {
    const srow = document.createElement('div');
    srow.className = 'datetime-ct__snapshot-toggle-row';
    srow.hidden = true;
    const tbtn = document.createElement('button');
    tbtn.type = 'button';
    tbtn.className = 'datetime-ct__snapshot-toggle';
    tbtn.setAttribute('data-natal-snapshot-toggle', '');
    tbtn.textContent = 'Hide snapshot';
    tbtn.setAttribute('aria-pressed', 'true');
    tbtn.setAttribute('aria-label', 'Hide natal snapshot on the ring');
    tbtn.addEventListener('click', () => {
      setNatalSnapshotUserHidden(!loadNatalSnapshotUserHidden());
      if (!loadNatalSnapshotUserHidden() && numericRingRoot instanceof HTMLElement) {
        closeNumericRingHubDeck(numericRingRoot);
      }
      syncNatalSnapshotOverlayUi();
    });
    srow.appendChild(tbtn);
    datetimeCt.appendChild(srow);
  }

  if (tz instanceof HTMLSelectElement) {
    populateTimeZones(tz);
  }

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  const closeBtn = dialog.querySelector('[data-birth-modal-close]');
  if (closeBtn) closeBtn.addEventListener('click', () => dialog.close());

  /** @param {BirthProfileV1 | null} p */
  function fillFromProfile(p) {
    if (!dateIn || !timeIn || !tz || !latIn || !lonIn) return;
    if (!p) {
      dateIn.value = '';
      timeIn.value = '';
      tz.selectedIndex = 0;
      latIn.value = '';
      lonIn.value = '';
      if (placeIn) placeIn.value = '';
      setTzPanelShown(false);
      return;
    }
    dateIn.value = p.birthDate;
    timeIn.value = p.birthTime;
    ensureTzOption(tz, p.ianaZone);
    latIn.value = String(p.latitudeDeg);
    lonIn.value = String(p.longitudeDeg);
    if (placeIn) placeIn.value = p.placeLabel;
    setTzPanelShown(true);
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (
      !(errEl instanceof HTMLElement) ||
      !(dateIn && timeIn && tz && latIn && lonIn)
    )
      return;
    errEl.textContent = '';
    try {
      const bd = dateIn.value.trim();
      const bt = timeIn.value.trim();
      if (!bd || !bt) throw new Error('Date and time are required.');
      if (tzPanel instanceof HTMLElement && tzPanel.hidden) {
        throw new Error('Use “Search place” to set timezone (and coordinates) before saving.');
      }
      const zoneVal = tz.value.trim();
      if (!zoneVal) throw new Error('Choose a time zone.');
      const lat = Number(latIn.value.trim());
      const lon = Number(lonIn.value.trim());
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90.');
      }
      if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
        throw new Error('Longitude must be between -180 and 180.');
      }
      const utc = composeBirthUtc(bd, bt, zoneVal);
      /** @type {BirthProfileV1} */
      const profile = {
        schemaVersion: '1',
        birthDate: bd,
        birthTime: bt,
        ianaZone: zoneVal,
        latitudeDeg: lat,
        longitudeDeg: lon,
        placeLabel:
          placeIn instanceof HTMLInputElement && placeIn.value.trim()
            ? placeIn.value.trim()
            : `Lat ${lat.toFixed(3)}°, Lon ${lon.toFixed(3)}°`,
        birthUtcIso: utc.toJSDate().toISOString(),
      };
      saveBirthProfile(profile);
      renderNatalInto(natalHub, profile);
      syncBirthEntryButtonLabel();
      syncNatalSnapshotOverlayUi();
      dialog.close();
      onSave?.();
    } catch (ex) {
      errEl.textContent = ex instanceof Error ? ex.message : String(ex);
    }
  });

  const clearBtn = dialog.querySelector('[data-birth-clear]');

  clearBtn?.addEventListener('click', () => {
    saveBirthProfile(null);
    clearNatalSnapshotHiddenPref();
    renderNatalInto(natalHub, null);
    fillFromProfile(null);
    syncBirthEntryButtonLabel();
    syncNatalSnapshotOverlayUi();
    errEl instanceof HTMLElement && (errEl.textContent = '');
    dialog.close();
    onSave?.();
  });

  geoBtn?.addEventListener('click', async () => {
    if (!(placeIn instanceof HTMLInputElement) || !latIn || !lonIn) return;
    const q = placeIn.value.trim();
    if (!q) return;
    if (errEl instanceof HTMLElement) errEl.textContent = '';
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        q
      )}&count=5&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Geocoder request failed.');
      const data = await res.json();
      const first =
        Array.isArray(data.results) && data.results.length ? data.results[0] : null;
      if (!first) throw new Error('No place found.');
      latIn.value = String(first.latitude);
      lonIn.value = String(first.longitude);
      placeIn.value = [first.name, first.admin1, first.country]
        .filter(Boolean)
        .join(', ');
      const ianaTz =
        typeof first.timezone === 'string' && first.timezone.trim()
          ? first.timezone.trim()
          : '';
      if (!ianaTz) {
        if (errEl instanceof HTMLElement) {
          errEl.textContent =
            'Place found but no timezone from geocoder; try another place or spelling.';
        }
        return;
      }
      if (tz) ensureTzOption(tz, ianaTz);
      setTzPanelShown(true);
    } catch (ex) {
      if (errEl instanceof HTMLElement) {
        errEl.textContent = ex instanceof Error ? ex.message : String(ex);
      }
    }
  });

  dialog.querySelector('[data-birth-geolocate]')?.addEventListener('click', () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (latIn) latIn.value = String(Number(pos.coords.latitude.toFixed(5)));
        if (lonIn) lonIn.value = String(Number(pos.coords.longitude.toFixed(5)));
      },
      () => {
        if (errEl instanceof HTMLElement) errEl.textContent = 'Location permission denied.';
      }
    );
  });

  const initial = loadBirthProfile();
  renderNatalInto(natalHub, initial);
  fillFromProfile(initial);
  syncBirthEntryButtonLabel();
  syncNatalSnapshotOverlayUi();

  if (numericRingRoot instanceof HTMLElement) {
    numericRingRoot.addEventListener(NUMERIC_RING_HUB_OPENED_EVENT, () => {
      if (!loadBirthProfile()) return;
      setNatalSnapshotUserHidden(true);
      syncNatalSnapshotOverlayUi();
    });
  }
}
