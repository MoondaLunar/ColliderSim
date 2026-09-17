/**
 * The physics seam. Every mode returns exactly this shape for the same run.
 *
 * The claim label is read from the mode registry below, never passed in by the
 * caller, so a script cannot relabel its own output as established physics.
 */
export const Claim = Object.freeze({
  ESTABLISHED: 'established',
  DERIVED: 'derived',
  THEORETICAL: 'theoretical',
  INVENTED: 'invented'
});

export const MODES = Object.freeze({
  research: Object.freeze({
    id: 'research',
    name: 'Research Lab',
    framework: 'Standard Model and special-relativistic kinematics',
    claim: Claim.ESTABLISHED
  }),
  'moon-loop': Object.freeze({
    id: 'moon-loop',
    name: 'Moon-Loop Experimental',
    framework: 'Moon-Loop bounce cosmology (unproven hypothesis)',
    claim: Claim.THEORETICAL
  }),
  playground: Object.freeze({
    id: 'playground',
    name: 'Collider Playground',
    framework: 'Fiction layered over the standard result',
    claim: Claim.INVENTED
  })
});

export const MODE_ORDER = Object.freeze(['research', 'moon-loop', 'playground']);

export const SHARED_QUANTITY = 'collision centre-of-mass energy √s';
export const SHARED_UNIT = 'GeV';

/** A value of null means the framework makes no prediction for this quantity. */
export function resultCore({ mode, quantity, value, unit, uncertainty = null, byproducts = [], note = '' }) {
  const entry = MODES[mode];
  if (!entry) throw new RangeError(`Unknown mode: ${mode}`);
  if (!quantity) throw new RangeError('A core result needs a named quantity.');
  if (value !== null && !Number.isFinite(value)) throw new RangeError('A core value must be finite or null.');
  if (uncertainty !== null && !Number.isFinite(uncertainty)) throw new RangeError('An uncertainty must be finite or null.');
  return Object.freeze({
    mode,
    modeName: entry.name,
    framework: entry.framework,
    claim: entry.claim,
    quantity,
    value,
    unit,
    uncertainty,
    byproducts: Object.freeze(byproducts.map(b => Object.freeze({ ...b }))),
    note
  });
}

/** Explicit no-prediction, with a reason. Never counted as agreement. */
export function noPrediction(mode, reason) {
  return resultCore({ mode, quantity: SHARED_QUANTITY, value: null, unit: SHARED_UNIT, note: reason });
}
