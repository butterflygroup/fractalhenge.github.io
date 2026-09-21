/**
 * Builds a circular ring of labels with equal spacing (360 / count degrees).
 *
 * Digit 9 at 12 o'clock: place `9` first in labels (same as startAngleDeg default).
 *
 * For digits 1–9 with 9 on top and equal spacing, a natural clockwise order is:
 *   9, 1, 2, 3, 4, 5, 6, 7, 8
 *
 * To use descending clockwise from top instead:
 *   [9, 8, 7, 6, 5, 4, 3, 2, 1]
 */

const DEFAULT_RING_CLASS = 'numeric-ring';
const MOD_EGYPTIAN_CLASS = 'numeric-ring--egyptian';
const MOD_GREEK_CLASS = 'numeric-ring--greek';
const MOD_LITERARY_CLASS = 'numeric-ring--literary';
const MOD_MEDICINE_CLASS = 'numeric-ring--medicine';
const TRACK_CLASS = 'numeric-ring__track';
const CHORDS_CLASS = 'numeric-ring__chords';
const CHORD_GROUP_CLASS_PREFIX = 'numeric-ring__chord--';
const NODE_CLASS = 'numeric-ring__node';
const CHORD_HIT_CLASS = 'numeric-ring__chord-hit';
const CHORD_ACTIVE_CLASS = 'numeric-ring__chord--active';
const SECTOR_CLASS = 'numeric-ring__sector';
/** Sector arcs sit this far outside the junction circle (SVG user units), inside the numerals. */
const SECTOR_RADIUS_OFFSET = 0.05;
/** Degrees trimmed from each end of a sector arc so neighbours do not touch. */
const SECTOR_END_PAD_DEG = 4;
const SYMBOL_LINE_CLASS = 'numeric-ring__symbol-line';
const HUB_TITLE_MOD = 'numeric-ring__hub-definition--title';
/** Fallback radii (SVG user units) for browsers without CSS `r`; keep in sync with `--nr-node-*-radius`. */
const NODE_RADIUS = 0.028;
const NODE_GROUP_RADIUS = 0.038;
const ARM_CLASS = 'numeric-ring__arm';
const ARM_DIGIT_CLASS = 'numeric-ring__arm--digit';
const ARM_NAME_CLASS = 'numeric-ring__arm--name';
const ARM_PLANET_EPHEM_CLASS = 'numeric-ring__arm--planet-ephem';
const SYMBOL_NAME_CLASS = 'numeric-ring__symbol-name';
const SYMBOL_STACK_CLASS = 'numeric-ring__symbol-name-stack';
const EPHEM_CONTAINER_CLASS = 'numeric-ring__symbol-ephem';
const EPHEM_LINE_CLASS = 'numeric-ring__symbol-ephem-line';
const PLANET_EPHEM_STACK_CLASS = 'numeric-ring__planet-ephem-stack';
const MOD_PLANET_EPHEM_CLASS = 'numeric-ring--planetEphemeris';

const SVG_NS = 'http://www.w3.org/2000/svg';

const HUB_DECK_ID = 'numeric-ring-hub-deck';
const HUB_DECK_CLASS = 'numeric-ring__hub-deck';
const HUB_STACK_CLASS = 'numeric-ring__hub-deck-stack';
const HUB_DEFINITION_CLASS = 'numeric-ring__hub-definition';
const DIGIT_HIT_CLASS = 'numeric-ring__digit-hit';
const SYMBOL_HIT_CLASS = 'numeric-ring__symbol-hit';
const CARD_HIT_HUB_MOD = 'numeric-ring__card-hit--hub';

/** @type {WeakMap<HTMLElement, AbortController>} */
const hubEscapeAbortByRoot = new WeakMap();

/**
 * Ring root dispatches this; the active mount listens and runs the same close as Escape.
 * Works across duplicate ESM instances (e.g. `numeric-ring.js` vs `numeric-ring.js?v=…`).
 */
export const NUMERIC_RING_REQUEST_CLOSE_HUB_EVENT = 'fractalhenge-close-hub-deck';

/**
 * Dismiss digit hub deck (card chips) if open — same state as Escape.
 * @param {HTMLElement} root
 */
export function closeNumericRingHubDeck(root) {
  if (!(root instanceof HTMLElement)) return;
  root.dispatchEvent(
    new CustomEvent(NUMERIC_RING_REQUEST_CLOSE_HUB_EVENT, { bubbles: false })
  );
}

/** Fired on the ring root when a digit opens the inner hub deck (`bubbles: false`). */
export const NUMERIC_RING_HUB_OPENED_EVENT = 'fractalhenge-hub-opened';

/**
 * @param {string} digit
 * @param {object} card
 * @param {(detail: { digit: string, card: object }) => void} onSlotCardActivate
 */
function createDeckCardButton(digit, card, onSlotCardActivate) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `numeric-ring__card-hit ${CARD_HIT_HUB_MOD}`;
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-controls', 'emotion-card-modal');
  btn.setAttribute(
    'aria-label',
    `${card.title}; card ${card.ordinal} of ${card.ordinalTotal ?? '?'}`
  );
  btn.title = card.title;

  const chipInner = document.createElement('span');
  chipInner.className = 'numeric-ring__card-chip-inner';
  chipInner.textContent = card.title;
  btn.appendChild(chipInner);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    onSlotCardActivate({ digit, card });
  });

  return btn;
}

/**
 * A symbol name is a string (may contain `\n`) or an array of lines; array lines after the first
 * render as secondary text (`numeric-ring__symbol-line--sub`).
 * @param {HTMLElement} el
 * @param {string | string[]} name
 */
function fillSymbolName(el, name) {
  if (!Array.isArray(name)) {
    el.textContent = name;
    return;
  }
  name.forEach((line, i) => {
    const span = document.createElement('span');
    span.className = i === 0 ? SYMBOL_LINE_CLASS : `${SYMBOL_LINE_CLASS} ${SYMBOL_LINE_CLASS}--sub`;
    span.textContent = line;
    el.appendChild(span);
  });
}

/** @param {string | string[]} name — single-line form for aria labels */
function flatSymbolName(name) {
  return (Array.isArray(name) ? name.join(', ') : String(name)).replace(/\s*\n\s*/g, ', ');
}

/**
 * Flattens body text from slot card `sections` (same shape as emotion/story cards).
 * @param {object} card
 * @returns {string[]}
 */
function collectCardBodyParagraphs(card) {
  const out = [];
  const sections = card && card.sections;
  if (!Array.isArray(sections)) return out;
  for (const s of sections) {
    if (s && Array.isArray(s.bodyParagraphs)) {
      for (const p of s.bodyParagraphs) {
        if (typeof p === 'string' && p.trim()) {
          out.push(p);
        }
      }
    }
  }
  return out;
}

/**
 * Parses `--nr-chord-radius-ratio` or measures `1 − stroke/size`. mountNumericRing copies this to `--nr-junction-ratio` so SVG chords and digit radius match.
 * @param {HTMLElement} el
 */
function resolveChordRadiusRatio(el) {
  const raw = getComputedStyle(el).getPropertyValue('--nr-chord-radius-ratio').trim();
  const simple = Number.parseFloat(raw);
  if (!raw.includes('calc') && Number.isFinite(simple)) {
    return Math.max(0.01, simple);
  }

  const side = el.clientWidth;
  const stroke = Number.parseFloat(
    getComputedStyle(el).getPropertyValue('--nr-ring-width').trim()
  );
  if (Number.isFinite(side) && side > 0 && Number.isFinite(stroke)) {
    return Math.max(0.01, 1 - stroke / side);
  }

  return 1;
}

/**
 * Clockwise from 12 o'clock — matches `rotate(angle) translateY(-r)`.
 * @param {number} rChord — radius in SVG user space (-1..1 viewBox)
 * @param {number} angleDeg
 */
function polarToChordXY(rChord, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: rChord * Math.sin(rad),
    y: -rChord * Math.cos(rad),
  };
}

/**
 * @param {Iterable<(string|number)[]>} raw — `[a, b]` or `[a, b, group]`
 * @returns {[string, string, string | undefined][]}
 */
function dedupeUnorderedPairs(raw) {
  const seen = new Set();
  const out = [];

  for (const pair of raw) {
    const a = String(pair[0]);
    const b = String(pair[1]);
    if (a === b) continue;
    const lo = a < b ? a : b;
    const hi = a < b ? b : a;
    const key = `${lo}|${hi}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const group =
      typeof pair[2] === 'string' && /^[a-z][a-z0-9-]*$/i.test(pair[2]) ? pair[2] : undefined;
    out.push([lo, hi, group]);
  }

  return out;
}

/**
 * @param {HTMLElement} root
 * @param {object} [options]
 * @param {string[]} [options.labels] — clockwise from top, first item at 12 o'clock
 * @param {string} [options.orbitGap] — CSS length for `--nr-orbit-gap` (digit/deity radial offset beyond ring stroke)
 * @param {string|number} [options.orbitGapScale] — multiplier for orbit gap term (maps to `--nr-orbit-gap-scale`)
 * @param {(string|number)[][]} [options.chords] — unordered digit pairs; duplicates ignored. Optional third item names a group (e.g. `['9', '3', 'triad']`): the line gets `numeric-ring__chord--<group>` and is drawn above ungrouped chords
 * @param {boolean} [options.showNodes] — dot at each label's ring junction; digits touched by a grouped chord get `numeric-ring__node--<group>`
 * @param {Record<string, string | string[]>} [options.symbolNames] — keyed by digit, e.g. `'9'` → `'Ra'`. A string may contain `\n`; an array renders one line each, lines after the first as secondary text
 * @param {{ digits: string[], group: string }[]} [options.sectors] — arcs just outside the ring spanning consecutive digits (e.g. enneagram centres); each gets `numeric-ring__sector--<group>`
 * @param {(chord: { a: string, b: string, group?: string }) => ({ title?: string, lines?: string[] } | null)} [options.chordInfo] — makes chords clickable: the returned text shows in the hub; return null for a chord with nothing to say
 * @param {boolean} [options.showSymbolNames] — when true + map, deity label radially outward from digit
 * @param {string} [options.symbolPantheon] — layout modifier class `numeric-ring--<name>` (`greek`, `literary`, `medicine` have tuned rules; any other slug is available for styling)
 * @param {number} [options.phaseOffsetDeg] — added to every slot angle (chords + labels); default 0. Use with `--nr-digit-angle-nudge-deg: 0` if you want a single coherent rotation instead of CSS-only spokes.
 * @param {Record<string, object[]>} [options.slotCards] — deck chips per digit label string; inner hub panel appears when digit is clicked
 * @param {(detail: { digit: string, card: object }) => void} [options.onSlotCardActivate] — e.g. open modal when a hub chip is chosen
 * @param {'digit' | 'symbol'} [options.hubDeckTrigger] — `'digit'` (default): hub opens from digit button. `'symbol'`: hub opens from the radial symbol name button when symbol names are shown; digit stays plain.
 * @param {boolean} [options.hubDeckInlineDefinition] — when true with a single card, hub shows `bodyParagraphs` as prose instead of title chips (e.g. Story Elements definitions).
 * @param {Record<string, string[]>} [options.planetEphemerisByDigit] — optional ephemeris lines per digit (Planets mode); rendered on a separate radial arm
 *
 * When the inner hub deck opens, `root` dispatches {@link NUMERIC_RING_HUB_OPENED_EVENT} (`bubbles: false`, `detail.digit`). Closing from outside uses {@link closeNumericRingHubDeck} ({@link NUMERIC_RING_REQUEST_CLOSE_HUB_EVENT} on `root`).
 */
export function mountNumericRing(root, options = {}) {
  const labels = options.labels ?? ['9', '1', '2', '3', '4', '5', '6', '7', '8'];
  const symbolNames = options.symbolNames;
  const showSymbolNames = Boolean(options.showSymbolNames);
  const planetEphemerisByDigit = options.planetEphemerisByDigit;
  const hasPlanetEphem =
    planetEphemerisByDigit &&
    typeof planetEphemerisByDigit === 'object' &&
    Object.keys(planetEphemerisByDigit).some((k) => {
      const arr = planetEphemerisByDigit[k];
      return Array.isArray(arr) && arr.length > 0;
    });

  root.classList.add(DEFAULT_RING_CLASS);
  if (showSymbolNames) root.classList.add(MOD_EGYPTIAN_CLASS);
  else root.classList.remove(MOD_EGYPTIAN_CLASS);
  if (hasPlanetEphem) root.classList.add(MOD_PLANET_EPHEM_CLASS);
  else root.classList.remove(MOD_PLANET_EPHEM_CLASS);
  if (options.symbolPantheon === 'greek') root.classList.add(MOD_GREEK_CLASS);
  else root.classList.remove(MOD_GREEK_CLASS);
  if (options.symbolPantheon === 'literary') root.classList.add(MOD_LITERARY_CLASS);
  else root.classList.remove(MOD_LITERARY_CLASS);
  if (options.symbolPantheon === 'medicine') root.classList.add(MOD_MEDICINE_CLASS);
  else root.classList.remove(MOD_MEDICINE_CLASS);

  // Any other pantheon slug becomes a modifier class too; forget the previous mount's
  if (root.dataset.nrPantheon) root.classList.remove(`${DEFAULT_RING_CLASS}--${root.dataset.nrPantheon}`);
  delete root.dataset.nrPantheon;
  if (
    typeof options.symbolPantheon === 'string' &&
    /^[a-z][a-z0-9-]*$/.test(options.symbolPantheon) &&
    !['greek', 'literary', 'medicine'].includes(options.symbolPantheon)
  ) {
    root.dataset.nrPantheon = options.symbolPantheon;
    root.classList.add(`${DEFAULT_RING_CLASS}--${options.symbolPantheon}`);
  }

  if (options.orbitGap !== undefined) {
    root.style.setProperty('--nr-orbit-gap', options.orbitGap);
  }
  if (options.orbitGapScale !== undefined) {
    root.style.setProperty('--nr-orbit-gap-scale', String(options.orbitGapScale));
  }

  const prevAc = hubEscapeAbortByRoot.get(root);
  if (prevAc) {
    prevAc.abort();
    hubEscapeAbortByRoot.delete(root);
  }

  root.replaceChildren();

  const track = document.createElement('div');
  track.className = TRACK_CLASS;
  track.setAttribute('aria-hidden', 'true');
  root.appendChild(track);

  const junctionRatio = Math.max(0.01, resolveChordRadiusRatio(root));
  root.style.setProperty('--nr-junction-ratio', String(junctionRatio));

  const count = labels.length;
  const step = 360 / count;
  const parsedPhase = Number(options.phaseOffsetDeg);
  const phaseOffsetDeg = Number.isFinite(parsedPhase) ? parsedPhase : 0;

  /** @param {string} digit */
  function angleForDigit(digit) {
    const i = labels.indexOf(digit);
    if (i === -1) return null;
    return phaseOffsetDeg + step * i;
  }

  const chordPairs =
    options.chords !== undefined ? dedupeUnorderedPairs(options.chords) : [];

  const showNodes = Boolean(options.showNodes);
  const sectors = Array.isArray(options.sectors) ? options.sectors : [];
  const chordInfo = typeof options.chordInfo === 'function' ? options.chordInfo : null;

  /** @type {{ key: string, a: string, b: string, group?: string, hit: SVGLineElement, line: SVGLineElement }[]} */
  const chordHits = [];

  if (chordPairs.length > 0 || showNodes || sectors.length > 0) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '-1 -1 2 2');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('class', CHORDS_CLASS);
    // Purely decorative unless chords are interactive (hit lines carry their own labels)
    if (!chordInfo) svg.setAttribute('aria-hidden', 'true');

    for (const sector of sectors) {
      const ds = Array.isArray(sector.digits) ? sector.digits.map(String) : [];
      const first = angleForDigit(ds[0]);
      const last = angleForDigit(ds[ds.length - 1]);
      if (first === null || last === null) continue;
      const start = first - step / 2 + SECTOR_END_PAD_DEG;
      let end = last + step / 2 - SECTOR_END_PAD_DEG;
      while (end <= start) end += 360;
      const r = junctionRatio + SECTOR_RADIUS_OFFSET;
      const p0 = polarToChordXY(r, start);
      const p1 = polarToChordXY(r, end);
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute(
        'd',
        `M${p0.x} ${p0.y} A${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${p1.x} ${p1.y}`
      );
      const group = /^[a-z][a-z0-9-]*$/i.test(String(sector.group)) ? sector.group : '';
      path.setAttribute('class', group ? `${SECTOR_CLASS} ${SECTOR_CLASS}--${group}` : SECTOR_CLASS);
      path.setAttribute('aria-hidden', 'true');
      svg.appendChild(path);
    }

    /** @type {Map<string, string>} */
    const groupByDigit = new Map();
    // Ungrouped first so grouped (emphasized) chords paint on top
    const ordered = [...chordPairs].sort((a, b) => Number(Boolean(a[2])) - Number(Boolean(b[2])));

    for (const [d0, d1, group] of ordered) {
      const a0 = angleForDigit(d0);
      const a1 = angleForDigit(d1);
      if (a0 === null || a1 === null) continue;

      const p0 = polarToChordXY(junctionRatio, a0);
      const p1 = polarToChordXY(junctionRatio, a1);

      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', String(p0.x));
      line.setAttribute('y1', String(p0.y));
      line.setAttribute('x2', String(p1.x));
      line.setAttribute('y2', String(p1.y));
      if (group) {
        line.setAttribute('class', `${CHORD_GROUP_CLASS_PREFIX}${group}`);
        groupByDigit.set(d0, group);
        groupByDigit.set(d1, group);
      }
      line.setAttribute('aria-hidden', 'true');

      svg.appendChild(line);

      if (chordInfo) {
        // Wide invisible twin: the drawn line is too thin to tap
        const hit = document.createElementNS(SVG_NS, 'line');
        for (const attr of ['x1', 'y1', 'x2', 'y2']) hit.setAttribute(attr, line.getAttribute(attr));
        hit.setAttribute('class', CHORD_HIT_CLASS);
        hit.setAttribute('role', 'button');
        hit.setAttribute('tabindex', '0');
        hit.setAttribute('aria-controls', HUB_DECK_ID);
        hit.setAttribute('aria-expanded', 'false');
        hit.setAttribute('aria-label', `Line from ${d0} to ${d1}`);
        chordHits.push({ key: `chord:${d0}|${d1}`, a: d0, b: d1, group, hit, line });
      }
    }

    // Hit lines last so they sit above every drawn line
    for (const { hit } of chordHits) svg.appendChild(hit);

    if (showNodes) {
      for (const digit of labels) {
        const a = angleForDigit(digit);
        if (a === null) continue;
        const p = polarToChordXY(junctionRatio, a);
        const group = groupByDigit.get(digit);
        const node = document.createElementNS(SVG_NS, 'circle');
        node.setAttribute('cx', String(p.x));
        node.setAttribute('cy', String(p.y));
        node.setAttribute('r', String(group ? NODE_GROUP_RADIUS : NODE_RADIUS));
        node.setAttribute('class', group ? `${NODE_CLASS} ${NODE_CLASS}--${group}` : NODE_CLASS);
        svg.appendChild(node);
      }
    }

    if (svg.childElementCount > 0) root.appendChild(svg);
  }

  const digitOrbitRadius =
    'calc(var(--nr-size) / 2 + var(--nr-ring-width) / 2 + var(--nr-orbit-gap-scale) * var(--nr-orbit-gap))';

  /** @param {string} outsetCss Expression after `digitOrbitRadius +`, e.g. `var(--nr-name-outset)` */
  const spokeRadialTranslate = (outsetCss) =>
    `translateY(calc(-1 * ((${digitOrbitRadius}) + ${outsetCss}))) ` +
    `translateX(var(--nr-digit-tangent-shift, 0ch))`;

  /** @param {string} fractionCss Multiplier in (0,1), e.g. `var(--nr-planet-title-orbit-fraction)` */
  const spokeRadialInside = (fractionCss) =>
    `translateY(calc(-1 * ((${digitOrbitRadius}) * (${fractionCss})))) ` +
    `translateX(var(--nr-digit-tangent-shift, 0ch))`;

  const slotCards = options.slotCards;
  const onSlotCardActivate = options.onSlotCardActivate;
  const hubDeckTrigger =
    options.hubDeckTrigger === 'symbol' ? 'symbol' : 'digit';
  const hubDeckInlineDefinition = Boolean(options.hubDeckInlineDefinition);

  /** @type {{ digit: string; button: HTMLButtonElement; cards: object[] }[]} */
  const digitDeckToggles = [];

  labels.forEach((text, index) => {
    const angle = phaseOffsetDeg + step * index;
    const outer = document.createElement('span');
    outer.className = 'numeric-ring__label';
    outer.dataset.nrDigit = text;
    outer.style.setProperty('--nr-slot-deg', `${angle}deg`);
    // Clockwise position from the top; CSS uses it to stagger entrance animations
    outer.style.setProperty('--nr-slot-index', String(index));

    const digitArm = document.createElement('span');
    digitArm.className = `${ARM_CLASS} ${ARM_DIGIT_CLASS}`;
    digitArm.style.transform =
      `rotate(calc(${angle}deg + var(--nr-digit-angle-nudge-deg, 0deg))) translateY(` +
      `calc(-1 * (${digitOrbitRadius}) + var(--nr-digit-radial-nudge, 0px))) ` +
      `translateX(var(--nr-digit-tangent-shift, 0ch))`;

    const deity = symbolNames && symbolNames[text];

    const hasDeck =
      slotCards &&
      Array.isArray(slotCards[text]) &&
      slotCards[text].length > 0 &&
      typeof onSlotCardActivate === 'function';

    const useSymbolForHub =
      hasDeck &&
      hubDeckTrigger === 'symbol' &&
      showSymbolNames &&
      Boolean(deity);

    const useDigitForHub = hasDeck && !useSymbolForHub;

    if (useDigitForHub) {
      const digitBtn = document.createElement('button');
      digitBtn.type = 'button';
      digitBtn.className = DIGIT_HIT_CLASS;
      digitBtn.setAttribute('aria-controls', HUB_DECK_ID);
      digitBtn.setAttribute('aria-expanded', 'false');
      digitBtn.setAttribute('aria-label', `Number ${text}, toggle emotion cards`);
      const inner = document.createElement('span');
      inner.className = 'numeric-ring__label-inner';
      inner.textContent = text;
      digitBtn.appendChild(inner);
      digitArm.appendChild(digitBtn);
      digitDeckToggles.push({
        digit: text,
        button: digitBtn,
        cards: slotCards[text],
      });
    } else {
      const inner = document.createElement('span');
      inner.className = 'numeric-ring__label-inner';
      inner.textContent = text;
      digitArm.appendChild(inner);
    }

    outer.appendChild(digitArm);

    if (showSymbolNames && deity) {
      const rotateLead = `rotate(calc(${angle}deg + var(--nr-digit-angle-nudge-deg, 0deg))) `;

      const nameArm = document.createElement('span');
      nameArm.className = `${ARM_CLASS} ${ARM_NAME_CLASS}`;
      nameArm.style.transform = hasPlanetEphem
        ? `${rotateLead}${spokeRadialTranslate('var(--nr-planet-title-outset)')}`
        : `${rotateLead}${spokeRadialTranslate('var(--nr-name-outset)')}`;

      const stack = document.createElement('span');
      stack.className = SYMBOL_STACK_CLASS;

      if (useSymbolForHub) {
        const symBtn = document.createElement('button');
        symBtn.type = 'button';
        symBtn.className = `${SYMBOL_NAME_CLASS} ${SYMBOL_HIT_CLASS}`;
        fillSymbolName(symBtn, deity);
        symBtn.setAttribute('aria-controls', HUB_DECK_ID);
        symBtn.setAttribute('aria-expanded', 'false');
        symBtn.setAttribute(
          'aria-label',
          `${flatSymbolName(deity)}, number ${text}, toggle card deck`
        );
        stack.appendChild(symBtn);
        digitDeckToggles.push({
          digit: text,
          button: symBtn,
          cards: slotCards[text],
        });
      } else {
        const nameEl = document.createElement('span');
        nameEl.className = SYMBOL_NAME_CLASS;
        fillSymbolName(nameEl, deity);
        stack.appendChild(nameEl);
      }

      nameArm.appendChild(stack);
      outer.appendChild(nameArm);

      const ephemLines =
        hasPlanetEphem &&
        planetEphemerisByDigit &&
        Array.isArray(planetEphemerisByDigit[text])
          ? planetEphemerisByDigit[text]
          : [];

      if (ephemLines.length > 0) {
        const ephemArm = document.createElement('span');
        ephemArm.className = `${ARM_CLASS} ${ARM_PLANET_EPHEM_CLASS}`;
        ephemArm.style.transform =
          `${rotateLead}${spokeRadialInside('var(--nr-planet-ephem-orbit-fraction)')}`;

        const ephemSpin = document.createElement('span');
        ephemSpin.className = PLANET_EPHEM_STACK_CLASS;

        const ephem = document.createElement('span');
        ephem.className = EPHEM_CONTAINER_CLASS;
        for (const line of ephemLines) {
          const lineEl = document.createElement('span');
          lineEl.className = EPHEM_LINE_CLASS;
          lineEl.textContent = line;
          ephem.appendChild(lineEl);
        }
        ephemSpin.appendChild(ephem);
        ephemArm.appendChild(ephemSpin);
        outer.appendChild(ephemArm);
      }
    }

    root.appendChild(outer);
  });

  if (
    (digitDeckToggles.length > 0 && typeof onSlotCardActivate === 'function') ||
    chordHits.length > 0
  ) {
    const hubDeck = document.createElement('section');
    hubDeck.id = HUB_DECK_ID;
    hubDeck.className = HUB_DECK_CLASS;
    hubDeck.setAttribute('role', 'region');
    hubDeck.setAttribute('aria-live', 'polite');
    hubDeck.setAttribute('aria-label', 'Cards for selected number');
    hubDeck.hidden = true;
    hubDeck.setAttribute('aria-hidden', 'true');

    const stack = document.createElement('div');
    stack.className = HUB_STACK_CLASS;
    hubDeck.appendChild(stack);
    root.appendChild(hubDeck);

    let selectedDigit = null;

    function updateExpanded() {
      for (const { digit, button } of digitDeckToggles) {
        button.setAttribute('aria-expanded', String(selectedDigit === digit));
      }
      for (const { key, hit, line } of chordHits) {
        hit.setAttribute('aria-expanded', String(selectedDigit === key));
        line.classList.toggle(CHORD_ACTIVE_CLASS, selectedDigit === key);
      }
      root.classList.toggle('numeric-ring--chordSelected', String(selectedDigit).startsWith('chord:'));
    }

    function closeHub() {
      selectedDigit = null;
      hubDeck.hidden = true;
      hubDeck.setAttribute('aria-hidden', 'true');
      root.classList.remove('numeric-ring--hubDeckOpen');
      stack.replaceChildren();
      updateExpanded();
    }

    function openHub(digit, cards) {
      selectedDigit = digit;
      stack.replaceChildren();

      let usedInline = false;
      if (hubDeckInlineDefinition && cards.length === 1) {
        const paras = collectCardBodyParagraphs(cards[0]);
        if (paras.length > 0) {
          usedInline = true;
          for (const t of paras) {
            const p = document.createElement('p');
            p.className = HUB_DEFINITION_CLASS;
            p.textContent = t;
            stack.appendChild(p);
          }
          hubDeck.setAttribute('aria-label', 'Story element definition');
        }
      }

      if (!usedInline) {
        hubDeck.setAttribute('aria-label', 'Cards for selected number');
        for (const card of cards) {
          stack.appendChild(createDeckCardButton(digit, card, onSlotCardActivate));
        }
      }

      hubDeck.hidden = false;
      hubDeck.setAttribute('aria-hidden', 'false');
      root.classList.add('numeric-ring--hubDeckOpen');
      updateExpanded();
      root.dispatchEvent(
        new CustomEvent(NUMERIC_RING_HUB_OPENED_EVENT, {
          bubbles: false,
          detail: { digit },
        })
      );
    }

    /** @param {(typeof chordHits)[number]} chord */
    function openChord(chord) {
      const info = chordInfo ? chordInfo({ a: chord.a, b: chord.b, group: chord.group }) : null;
      if (!info) return;
      selectedDigit = chord.key;
      stack.replaceChildren();
      if (info.title) {
        const t = document.createElement('p');
        t.className = `${HUB_DEFINITION_CLASS} ${HUB_TITLE_MOD}`;
        t.textContent = info.title;
        stack.appendChild(t);
      }
      for (const text of info.lines ?? []) {
        const p = document.createElement('p');
        p.className = HUB_DEFINITION_CLASS;
        p.textContent = text;
        stack.appendChild(p);
      }
      hubDeck.setAttribute('aria-label', 'About this line');
      hubDeck.hidden = false;
      hubDeck.setAttribute('aria-hidden', 'false');
      root.classList.add('numeric-ring--hubDeckOpen');
      updateExpanded();
      root.dispatchEvent(
        new CustomEvent(NUMERIC_RING_HUB_OPENED_EVENT, { bubbles: false, detail: { chord: chord.key } })
      );
    }

    for (const chord of chordHits) {
      const toggle = (e) => {
        e.stopPropagation();
        if (selectedDigit === chord.key) closeHub();
        else openChord(chord);
      };
      chord.hit.addEventListener('click', toggle);
      chord.hit.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle(e);
        }
      });
    }

    for (const { digit, button, cards } of digitDeckToggles) {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        if (selectedDigit === digit) {
          closeHub();
        } else {
          openHub(digit, cards);
        }
      });
    }

    const ac = new AbortController();
    hubEscapeAbortByRoot.set(root, ac);
    root.addEventListener(
      NUMERIC_RING_REQUEST_CLOSE_HUB_EVENT,
      () => {
        closeHub();
      },
      { signal: ac.signal }
    );
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && selectedDigit !== null) {
          closeHub();
        }
      },
      { signal: ac.signal }
    );
  }
}

/**
 * Update planet ephemeris line text on the interior radial arm (hub deck unaffected).
 * @param {HTMLElement} root
 * @param {Record<string, string[]> | null | undefined} planetEphemerisByDigit
 */
export function patchPlanetEphemeris(root, planetEphemerisByDigit) {
  if (!(root instanceof HTMLElement)) return;

  const map =
    planetEphemerisByDigit && typeof planetEphemerisByDigit === 'object'
      ? planetEphemerisByDigit
      : null;


  for (const label of root.querySelectorAll('[data-nr-digit].numeric-ring__label')) {
    const digit = label.dataset.nrDigit;
    const ephemArm = label.querySelector(`.numeric-ring__arm.${ARM_PLANET_EPHEM_CLASS}`);

    const lines =
      digit && map && Array.isArray(map[digit]) ? map[digit] : [];

    if (!ephemArm) {
      continue;
    }

    const ephemSpin = ephemArm.querySelector(`.${PLANET_EPHEM_STACK_CLASS}`);
    let ephemEl =
      ephemSpin instanceof HTMLElement
        ? ephemSpin.querySelector(`.${EPHEM_CONTAINER_CLASS}`)
        : ephemArm.querySelector(`.${EPHEM_CONTAINER_CLASS}`);

    if (lines.length === 0) {
      ephemArm.remove();
      continue;
    }

    if (!(ephemSpin instanceof HTMLElement)) {
      continue;
    }

    if (!ephemEl) {
      ephemEl = document.createElement('span');
      ephemEl.className = EPHEM_CONTAINER_CLASS;
      ephemSpin.appendChild(ephemEl);
    }

    ephemEl.replaceChildren();
    for (const line of lines) {
      const lineSpan = document.createElement('span');
      lineSpan.className = EPHEM_LINE_CLASS;
      lineSpan.textContent = line;
      ephemEl.appendChild(lineSpan);
    }
  }
}
