/**
 * The one quantitative leg the Moon-Loop framework gets here, and it is a
 * published equation, not an invention:
 *
 *   H^2 = (8 pi G / 3) rho (1 - rho / rho_c)
 *
 * This is the effective modified Friedmann equation of loop quantum cosmology
 * with improved dynamics (Ashtekar, Pawlowski, Singh, PRL 96, 141301, 2006).
 * The Moon-Loop "valve" at n = 1 reproduces it, so we evaluate it as the
 * derived consequence of that family and label it derived, never established.
 * Reproducing a known equation is a connection, not evidence for a mechanism.
 */
export const NEWTON_G = 6.67430e-11;
export const PLANCK_DENSITY_KG_PER_M3 = 5.155e96;
export const EFFECTIVE_EQUATION_CITATION = 'Ashtekar, Pawlowski, Singh, Phys. Rev. Lett. 96, 141301 (2006)';

export function effectiveFriedmann({ densityKgPerM3 = null, bounceDensityKgPerM3 = PLANCK_DENSITY_KG_PER_M3 } = {}) {
  const rho = Number(densityKgPerM3);
  const rhoC = Number(bounceDensityKgPerM3);
  if (!Number.isFinite(rho) || rho < 0) {
    return Object.freeze({ available: false, reason: 'A finite non-negative density is required.' });
  }
  if (!Number.isFinite(rhoC) || rhoC <= 0) {
    return Object.freeze({ available: false, reason: 'A finite positive bounce density is required.' });
  }
  if (rho > rhoC) {
    return Object.freeze({
      available: false,
      reason: 'Density is past the bounce density, so the effective equation has no real Hubble rate there. This is the model stating its own limit, not a numerical failure.'
    });
  }
  const hubbleRatePerSecond = Math.sqrt((8 * Math.PI * NEWTON_G / 3) * rho * (1 - rho / rhoC));
  return Object.freeze({
    available: true,
    hubbleRatePerSecond,
    densityKgPerM3: rho,
    bounceDensityKgPerM3: rhoC,
    atTurnAround: rho === rhoC,
    citation: EFFECTIVE_EQUATION_CITATION,
    note: 'Derived from the published effective equation, not from the Moon-Loop mechanism itself. At rho = rho_c the rate is zero: the turn-around.'
  });
}
