import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PUBLISHED_MACHINES,
  DEFAULT_MACHINE_ID,
  machineById,
  rigidityLimitGeV,
  synchrotronLossPerTurnJ,
  machineChecks,
  RIGIDITY_GEV_PER_TESLA_METRE
} from '../src/core/machines.js';
import { runSimulation, compareModes } from '../src/core/modes.js';
import { PROTON_REST_ENERGY_GEV, JOULES_PER_GEV, milesToMeters } from '../src/core/units.js';

const input = Object.freeze({
  fieldMVPerM: 100, verticalLengthM: milesToMeters(20), log10BeamRate: 9, geometry: 'head-on',
  useIdealizedHelix: false, helixTurns: 100, helixRadiusM: 5,
  referenceMachine: 'lhc',
  moonLoop: { minimumScaleFactor: 0, ricciScalar: Infinity, kretschmannScalar: Infinity },
  cosmology: { densityKgPerM3: null, bounceDensityKgPerM3: null },
  playground: { superstorm: true, seed: 14 }
});

test('Mode 1 core carries published-machine checks, and every other mode carries the same key', () => {
  for (const { core } of compareModes(input)) {
    assert.ok(Array.isArray(core.checks), `${core.mode} has no checks array`);
    assert.deepEqual(Object.keys(core), [
      'mode', 'modeName', 'framework', 'claim', 'quantity', 'value', 'unit',
      'uncertainty', 'byproducts', 'checks', 'note'
    ]);
  }
  const research = runSimulation('research', input).core;
  assert.ok(research.checks.length >= 3, 'Mode 1 must be audited against a real machine');
  assert.ok(research.checks.every(c => Array.isArray(c.sources) && c.sources.length > 0), 'every check must be cited');
  const moon = compareModes(input).find(r => r.mode === 'moon-loop').core;
  assert.equal(moon.checks.length, 0, 'Mode 2 has nothing to check, and says so by being empty');
});

test('rigidity relation reproduces the LHC design energy from published magnets', () => {
  const lhc = PUBLISHED_MACHINES.lhc;
  const ceiling = rigidityLimitGeV(lhc);
  const design = lhc.designBeamEnergyGeV;
  assert.ok(Math.abs(ceiling / design - 1) < 0.01, `rigidity ${ceiling} GeV vs design ${design} GeV`);
  // the same relation, written out, so a wrong constant cannot hide
  assert.equal(RIGIDITY_GEV_PER_TESLA_METRE, 0.299792458);
});

test('synchrotron loss is E^4 and lands on the published LHC and LEP figures', () => {
  const lhcLossGeV = synchrotronLossPerTurnJ({
    energyGeV: PUBLISHED_MACHINES.lhc.designBeamEnergyGeV,
    restEnergyGeV: PROTON_REST_ENERGY_GEV,
    bendingRadiusM: PUBLISHED_MACHINES.lhc.bendingRadiusM
  }) / JOULES_PER_GEV;
  // LHC protons at 7 TeV radiate ~6.7 keV per turn
  assert.ok(lhcLossGeV * 1e6 > 6 && lhcLossGeV * 1e6 < 7.5, `LHC loss ${lhcLossGeV * 1e6} keV/turn`);
  const lepLossGeV = synchrotronLossPerTurnJ({
    energyGeV: PUBLISHED_MACHINES.lep2.beamEnergyGeV,
    restEnergyGeV: PUBLISHED_MACHINES.lep2.restEnergyGeV,
    bendingRadiusM: PUBLISHED_MACHINES.lep2.bendingRadiusM
  }) / JOULES_PER_GEV;
  // LEP 2 electrons at 104.5 GeV radiate ~3.4 GeV per turn
  assert.ok(lepLossGeV > 3 && lepLossGeV < 3.8, `LEP loss ${lepLossGeV} GeV/turn`);
  const doubled = synchrotronLossPerTurnJ({
    energyGeV: 2 * PUBLISHED_MACHINES.lep2.beamEnergyGeV,
    restEnergyGeV: PUBLISHED_MACHINES.lep2.restEnergyGeV,
    bendingRadiusM: PUBLISHED_MACHINES.lep2.bendingRadiusM
  }) / synchrotronLossPerTurnJ({
    energyGeV: PUBLISHED_MACHINES.lep2.beamEnergyGeV,
    restEnergyGeV: PUBLISHED_MACHINES.lep2.restEnergyGeV,
    bendingRadiusM: PUBLISHED_MACHINES.lep2.bendingRadiusM
  });
  assert.ok(Math.abs(doubled - 16) < 1e-9, `doubling energy must multiply loss by 16, got ${doubled}`);
});

test('the divergence between the simulator and the machine is reported, not smoothed', () => {
  const { core, machine } = runSimulation('research', input);
  const energy = core.checks.find(c => c.name === 'Beam energy');
  assert.equal(energy.published, machine.beamEnergyGeV);
  const expected = core.byproducts.find(b => b.name === 'beam kinetic energy per proton').value / machine.beamEnergyGeV;
  assert.equal(energy.divergenceFactor, expected);
  assert.notEqual(energy.divergenceFactor, 1, 'a divergence of exactly one would be suspicious here');
});

test('switching the reference machine changes the checks and nothing else', () => {
  const lhc = runSimulation('research', { ...input, referenceMachine: 'lhc' }).core;
  const lep2 = runSimulation('research', { ...input, referenceMachine: 'lep2' }).core;
  assert.equal(lhc.value, lep2.value, 'the standard number must not depend on the machine we audit against');
  assert.notDeepEqual(lhc.checks, lep2.checks);
  assert.equal(lep2.checks.find(c => c.name === 'Beam energy').published, PUBLISHED_MACHINES.lep2.beamEnergyGeV);
});

test('unknown reference machines are refused, and the default is real', () => {
  assert.equal(DEFAULT_MACHINE_ID, 'lhc');
  assert.throws(() => machineById('unicorn'), RangeError);
  assert.throws(() => runSimulation('research', { ...input, referenceMachine: 'unicorn' }), RangeError);
});

test('machineChecks refuses to invent a comparison without a positive field', () => {
  assert.throws(() => rigidityLimitGeV({ dipoleFieldT: 0, bendingRadiusM: 2804 }), RangeError);
  assert.throws(() => synchrotronLossPerTurnJ({ energyGeV: 0, restEnergyGeV: PROTON_REST_ENERGY_GEV, bendingRadiusM: 2804 }), RangeError);
});

test('the LEP 2 entry carries no rigidity number it cannot support', () => {
  const checks = machineChecks(runSimulation('research', input).standardResult, PUBLISHED_MACHINES.lep2);
  assert.ok(!checks.some(c => c.name === 'Magnetic rigidity ceiling'), 'no published dipole field means no rigidity claim');
});
