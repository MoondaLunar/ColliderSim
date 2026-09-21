import test from 'node:test';
import assert from 'node:assert/strict';
import { MODE_ORDER, MODES, SHARED_QUANTITY, SHARED_UNIT, resultCore } from '../src/core/result.js';
import { compareModes, auditClaims, runSimulation } from '../src/core/modes.js';
import { effectiveFriedmann, PLANCK_DENSITY_KG_PER_M3 } from '../src/moonloop/effective.js';
import { milesToMeters } from '../src/core/units.js';

const input = Object.freeze({
  fieldMVPerM: 100, verticalLengthM: milesToMeters(20), log10BeamRate: 9, geometry: 'head-on',
  useIdealizedHelix: false, helixTurns: 100, helixRadiusM: 5,
  moonLoop: { minimumScaleFactor: 0, ricciScalar: Infinity, kretschmannScalar: Infinity },
  cosmology: { densityKgPerM3: PLANCK_DENSITY_KG_PER_M3 * 0.5, bounceDensityKgPerM3: PLANCK_DENSITY_KG_PER_M3 },
  playground: { superstorm: true, seed: 7 }
});

test('every mode returns the same core shape', () => {
  const keys = ['mode','modeName','framework','claim','quantity','value','unit','uncertainty','byproducts','checks','note'];
  for (const { core } of compareModes(input)) {
    assert.deepEqual(Object.keys(core), keys);
    assert.equal(core.quantity, SHARED_QUANTITY);
    assert.equal(core.unit, SHARED_UNIT);
  }
});

test('a mode can never relabel its own claim', () => {
  const smuggled = resultCore({ mode: 'moon-loop', quantity: 'x', value: 1, unit: 'GeV', claim: 'established' });
  assert.equal(smuggled.claim, 'theoretical', 'a caller-supplied claim must be ignored');
  for (const row of auditClaims(input)) assert.ok(row.ok, `${row.mode} reported ${row.claim}`);
  assert.equal(MODES['moon-loop'].claim, 'theoretical');
  assert.equal(MODES.playground.claim, 'invented');
});

test('research and playground report the identical standard number', () => {
  const rows = compareModes(input);
  const research = rows.find(r => r.mode === 'research').core;
  const playground = rows.find(r => r.mode === 'playground').core;
  assert.equal(research.value, playground.value);
  assert.notEqual(research.claim, playground.claim);
});

test('moon-loop reports no prediction for collider √s, with a reason', () => {
  const core = compareModes(input).find(r => r.mode === 'moon-loop').core;
  assert.equal(core.value, null);
  assert.ok(core.note.length > 40);
});

test('a null prediction is never scored as agreement', () => {
  const rows = compareModes(input);
  const defined = rows.filter(r => r.core.value !== null);
  assert.equal(defined.length, 2);
});

test('effective equation is real inside the bounce density and refuses past it', () => {
  const inside = effectiveFriedmann({ densityKgPerM3: PLANCK_DENSITY_KG_PER_M3 * 0.5 });
  assert.ok(inside.available && inside.hubbleRatePerSecond > 0);
  const turnaround = effectiveFriedmann({ densityKgPerM3: PLANCK_DENSITY_KG_PER_M3 });
  assert.equal(turnaround.hubbleRatePerSecond, 0);
  const past = effectiveFriedmann({ densityKgPerM3: PLANCK_DENSITY_KG_PER_M3 * 2 });
  assert.equal(past.available, false);
  assert.match(past.reason, /past the bounce density/);
});

test('mode isolation survives the seam', () => {
  const a = runSimulation('research', input).standardResult;
  const b = runSimulation('moon-loop', input).standardResult;
  const c = runSimulation('playground', input).standardResult;
  assert.deepEqual(b, a);
  assert.deepEqual(c, a);
});

test('unknown modes are refused', () => {
  assert.throws(() => runSimulation('marketing', input), RangeError);
  assert.throws(() => resultCore({ mode: 'marketing', quantity: 'x', value: 1, unit: 'GeV' }), RangeError);
});

test('MODE_ORDER covers every registered mode', () => {
  assert.deepEqual([...MODE_ORDER].sort(), Object.keys(MODES).sort());
});
