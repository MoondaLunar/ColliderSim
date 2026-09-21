/**
 * Mode 1 audit bench: the simulator's own numbers, checked against machines
 * that actually exist.
 *
 * Mode 1 is W = qEL over a uniform field with no losses. That is a real
 * equation and it is also a lie about how accelerators work. This file holds
 * the published machine values and shows, in the same core result, exactly
 * where the idealization diverges from them.
 *
 * Three quantities, three checks:
 *   1. Beam energy        -> vs the machine's published beam energy
 *   2. Magnetic rigidity  -> p ~ 0.2998 * B * rho: the real energy cap
 *   3. Synchrotron loss   -> assumed zero by the simulator; E^4 in reality
 *
 * Every check carries its own source string. Nothing here is invented to make
 * the simulator look right, and nothing is invented to make it look wrong.
 */
import {
  ELEMENTARY_CHARGE_C,
  JOULES_PER_GEV,
  PROTON_REST_ENERGY_GEV,
  SPEED_OF_LIGHT_MPS,
  VACUUM_PERMITTIVITY
} from './units.js';

/** Relativistic rigidity: p[GeV/c] = 0.299792458 * B[T] * rho[m]. */
export const RIGIDITY_GEV_PER_TESLA_METRE = 0.299792458;

/** Ultrarelativistic energy loss per turn: U0 = (e^2 / 3 eps0) * gamma^4 / rho. */
const SYNCHROTRON_CONSTANT_J_M = (ELEMENTARY_CHARGE_C ** 2) / (3 * VACUUM_PERMITTIVITY);

export const ELECTRON_REST_ENERGY_GEV = 0.00051099895;

/**
 * Published machine parameters. Values are the ones in the design reports and
 * run records named in `sources`, not rounded hobby figures.
 */
export const PUBLISHED_MACHINES = Object.freeze({
  lhc: Object.freeze({
    id: 'lhc',
    name: 'CERN Large Hadron Collider (proton)',
    particle: 'proton',
    restEnergyGeV: PROTON_REST_ENERGY_GEV,
    beamEnergyGeV: 6800,
    designBeamEnergyGeV: 7000,
    centerOfMassGeV: 13600,
    dipoleFieldT: 8.33,
    bendingRadiusM: 2803.95,
    circumferenceM: 26658.883,
    particlesPerBeam: 2.8e14,
    sources: Object.freeze([
      'CERN LHC Design Report, CERN-2004-003: 7 TeV per beam, 8.33 T main dipoles, 2803.95 m bending radius, 26658.883 m circumference.',
      'CERN Run 3 proton operation: 6.8 TeV per beam, sqrt(s) = 13.6 TeV (2022 onward).'
    ])
  }),
  lep2: Object.freeze({
    id: 'lep2',
    name: 'CERN LEP 2 (electron-positron)',
    particle: 'electron',
    restEnergyGeV: ELECTRON_REST_ENERGY_GEV,
    beamEnergyGeV: 104.5,
    designBeamEnergyGeV: 104.5,
    centerOfMassGeV: 209,
    dipoleFieldT: null,
    bendingRadiusM: 3096,
    circumferenceM: 26658.883,
    particlesPerBeam: null,
    sources: Object.freeze([
      'CERN LEP 2 operation: up to 104.5 GeV per beam, sqrt(s) = 209 GeV (2000).',
      'LEP average bending radius ~3096 m over the same 26.7 km tunnel as the LHC.'
    ])
  })
});

export const DEFAULT_MACHINE_ID = 'lhc';

export function machineById(id) {
  const machine = PUBLISHED_MACHINES[id];
  if (!machine) throw new RangeError(`Unknown reference machine: ${id}`);
  return machine;
}

/** Peak momentum a magnet of field B and bending radius rho can hold. */
export function rigidityLimitGeV({ dipoleFieldT, bendingRadiusM }) {
  if (!(dipoleFieldT > 0) || !(bendingRadiusM > 0)) {
    throw new RangeError('Rigidity needs a positive field and bending radius.');
  }
  return RIGIDITY_GEV_PER_TESLA_METRE * dipoleFieldT * bendingRadiusM;
}

/** Energy radiated per turn by one ultrarelativistic charged particle. */
export function synchrotronLossPerTurnJ({ energyGeV, restEnergyGeV, bendingRadiusM }) {
  if (!(energyGeV > 0) || !(restEnergyGeV > 0) || !(bendingRadiusM > 0)) {
    throw new RangeError('Synchrotron loss needs positive energy, rest energy and bending radius.');
  }
  const gamma = energyGeV / restEnergyGeV;
  return SYNCHROTRON_CONSTANT_J_M * gamma ** 4 / bendingRadiusM;
}

/**
 * The audit. Same shape as everything else in the seam: a value, what it is
 * checked against, the divergence between them, and the source that fixes the
 * published side. Null means the comparison is not defined, never that it
 * passed.
 */
export function machineChecks(standardResult, machine) {
  const simulatedGeV = standardResult.beam.kineticEnergyGeV;
  const publishedGeV = machine.beamEnergyGeV;
  const checks = [];

  checks.push(Object.freeze({
    name: 'Beam energy',
    simulated: simulatedGeV,
    published: publishedGeV,
    unit: 'GeV',
    divergenceFactor: simulatedGeV / publishedGeV,
    verdict: 'the simulator integrates a uniform field over a straight length; it is not a ring',
    note: `W = qEL puts ${simulatedGeV.toPrecision(4)} GeV against ${publishedGeV} GeV published. A ring machine sets its energy by magnetic rigidity over its bending magnets, not by field times total circumference, so agreement here would be an accident. The divergence is the idealization stating itself in numbers.`,
    sources: machine.sources
  }));

  if (machine.dipoleFieldT) {
    const ceilingGeV = rigidityLimitGeV(machine);
    checks.push(Object.freeze({
      name: 'Magnetic rigidity ceiling',
      simulated: ceilingGeV,
      published: publishedGeV,
      unit: 'GeV',
      divergenceFactor: ceilingGeV / publishedGeV,
      verdict: 'consistent with the published beam energy',
      note: `p = 0.299792458 * B * rho with B = ${machine.dipoleFieldT} T and rho = ${machine.bendingRadiusM} m. This is the real cap on beam energy in the machine named in the source, and it is the relationship the simulator does not model.`,
      sources: machine.sources
    }));
  }

  const lossPerTurnJ = synchrotronLossPerTurnJ({
    energyGeV: publishedGeV,
    restEnergyGeV: machine.restEnergyGeV,
    bendingRadiusM: machine.bendingRadiusM
  });
  const lossPerTurnGeV = lossPerTurnJ / JOULES_PER_GEV;
  checks.push(Object.freeze({
    name: 'Synchrotron loss per turn',
    simulated: 0,
    published: lossPerTurnGeV,
    unit: 'GeV/turn',
    divergenceFactor: null,
    verdict: 'the simulator assumes zero loss; a real machine must pay this every turn',
    note: `U0 = (e^2 / 3 eps0) * gamma^4 / rho = ${(lossPerTurnGeV * 1e6).toPrecision(4)} keV per turn at ${publishedGeV} GeV in this ring. The scaling is E^4, so doubling the energy multiplies the loss by sixteen. This is the term that breaks the lossless beam first.`,
    sources: [...machine.sources, 'Standard synchrotron-radiation energy-loss formula U0 = (e^2/3eps0) gamma^4 / rho, ultrarelativistic limit.']
  }));

  if (machine.particlesPerBeam) {
    const revolutionHz = SPEED_OF_LIGHT_MPS / machine.circumferenceM;
    const radiatedW = lossPerTurnJ * machine.particlesPerBeam * revolutionHz;
    checks.push(Object.freeze({
      name: 'Power radiated by the beam',
      simulated: standardResult.powerW,
      published: radiatedW,
      unit: 'W',
      divergenceFactor: radiatedW / (standardResult.powerW || NaN),
      verdict: 'the simulator charges accelerating power and radiates none of it back out',
      note: `Nominal ${machine.particlesPerBeam.toExponential(1)} protons per beam at ${revolutionHz.toFixed(1)} Hz revolution frequency radiate ${radiatedW.toPrecision(3)} W. The simulator's required power is a lower bound on the wall power; the real budget must also carry this radiation and the cryogenic plant that keeps the magnets superconducting.`,
      sources: machine.sources
    }));
  }

  return Object.freeze(checks);
}
