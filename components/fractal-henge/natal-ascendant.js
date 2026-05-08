import * as Astronomy from 'https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/esm/astronomy.js';

import { normalizeLongitude } from './planet-ephemeris.js';

/**
 * True ecliptic longitude (tropical) where the ecliptic crosses the observer's
 * eastern horizon at `date`, chosen among horizon crossings by "rising" motion
 * over a short time step (not by house system).
 *
 * @param {Date} date
 * @param {number} latitudeDeg north positive
 * @param {number} longitudeDeg east positive
 * @returns {number} degrees [0,360)
 */
export function ascendantTropicalLongitude(date, latitudeDeg, longitudeDeg) {
  const observer = new Astronomy.Observer(latitudeDeg, longitudeDeg, 0);
  const t = Astronomy.MakeTime(date);

  /** @param {number} lambdaDeg */
  function horizonForLambda(lambdaDeg) {
    const λ = (Math.PI / 180) * normalizeLongitude(lambdaDeg);
    const vecEct = new Astronomy.Vector(Math.cos(λ), Math.sin(λ), 0, t);
    const rot = Astronomy.Rotation_ECT_EQJ(date);
    const vecEqj = Astronomy.RotateVector(rot, vecEct);
    const eq = Astronomy.EquatorFromVector(vecEqj);
    return Astronomy.Horizon(date, observer, eq.ra, eq.dec, null);
  }

  /** @param {number} lambdaDeg */
  function altitudeInterpolated(lambdaDeg) {
    return horizonForLambda(lambdaDeg).altitude;
  }

  /** Refine bracket [lo, hi] where altitude crosses zero. */
  function bisect(lo, hi) {
    let a = lo;
    let b = hi;
    let fa = altitudeInterpolated(a);
    let fb = altitudeInterpolated(b);
    for (let i = 0; i < 40; i++) {
      const mid = 0.5 * (a + b);
      const fm = altitudeInterpolated(mid);
      if (Math.abs(fm) < 1e-7) return mid;
      if (fa === 0) return a;
      if (fb === 0) return b;
      if (fa * fm <= 0) {
        b = mid;
        fb = fm;
      } else {
        a = mid;
        fa = fm;
      }
    }
    return 0.5 * (a + b);
  }

  /** @param {number} λ */
  function risingWithTime(λ) {
    const later = new Date(date.getTime() + 120000);
    const h = horizonForLambda(λ).altitude;
    const t2 = Astronomy.MakeTime(later);
    const λr = (Math.PI / 180) * normalizeLongitude(λ);
    const vecEct2 = new Astronomy.Vector(Math.cos(λr), Math.sin(λr), 0, t2);
    const rot2 = Astronomy.Rotation_ECT_EQJ(later);
    const eq2 = Astronomy.EquatorFromVector(Astronomy.RotateVector(rot2, vecEct2));
    const h2 = Astronomy.Horizon(later, observer, eq2.ra, eq2.dec, null).altitude;
    return h2 > h;
  }

  const step = 3;
  /** @type {{ lambda: number }[]} */
  const candidates = [];

  for (let start = 0; start < 360; start += step) {
    const end = start + step;
    const a0 = altitudeInterpolated(start);
    const a1 = altitudeInterpolated(end);
    if (a0 === 0) candidates.push({ lambda: start });
    if (a0 * a1 < 0) {
      candidates.push({ lambda: bisect(start, end) });
    }
  }

  if (candidates.length === 0) {
    let best = 0;
    let bestAbs = Infinity;
    for (let x = 0; x < 360; x += 2) {
      const v = Math.abs(altitudeInterpolated(x));
      if (v < bestAbs) {
        bestAbs = v;
        best = x;
      }
    }
    return normalizeLongitude(best);
  }

  const rising = candidates.filter((c) => risingWithTime(c.lambda));
  const pick = rising.length ? rising[0] : candidates[0];
  return normalizeLongitude(pick.lambda);
}
