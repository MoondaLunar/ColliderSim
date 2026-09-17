import { ELEMENTARY_CHARGE_C, PROTON_REST_ENERGY_GEV, SPEED_OF_LIGHT_MPS, gevToJoules, joulesToGeV, mvPerMeterToVPerMeter } from './units.js';

export const provenance = {
  model: 'Relativistic charged-particle acceleration and special-relativistic collision kinematics',
  equations: ['W = qEL (uniform electric field aligned with beam)', 'E_total = K + mc²', 'γ = E_total/(mc²)', 'β = √(1 − γ⁻²)', '√s = 2E (equal, head-on beams)', 's = 2m² + 2mE (fixed target)'],
  assumptions: ['Proton beam', 'Uniform aligned accelerating field', 'No synchrotron radiation, space charge, beam loss, or RF-phase model'],
  sources: ['Particle Data Group, Review of Particle Physics (relativistic kinematics)', 'CODATA 2018 exact elementary charge and speed of light']
};

export function helicalPathLength(verticalMeters, radiusMeters, turns) {
  if (verticalMeters < 0 || radiusMeters < 0 || turns < 0) throw new RangeError('Geometry values must be non-negative.');
  return Math.hypot(verticalMeters, 2 * Math.PI * radiusMeters * turns);
}

export function accelerateProton({ fieldMVPerM, acceleratingLengthM }) {
  if (fieldMVPerM < 0 || acceleratingLengthM < 0) throw new RangeError('Field and length must be non-negative.');
  const kineticEnergyJ = ELEMENTARY_CHARGE_C * mvPerMeterToVPerMeter(fieldMVPerM) * acceleratingLengthM;
  const kineticEnergyGeV = joulesToGeV(kineticEnergyJ);
  const totalEnergyGeV = PROTON_REST_ENERGY_GEV + kineticEnergyGeV;
  const gamma = totalEnergyGeV / PROTON_REST_ENERGY_GEV;
  const beta = Math.sqrt(Math.max(0, 1 - 1 / (gamma * gamma)));
  return Object.freeze({ particle: 'proton', kineticEnergyJ, kineticEnergyGeV, totalEnergyGeV, gamma, beta, speedMps: beta * SPEED_OF_LIGHT_MPS });
}

export function collisionKinematics(beam, geometry) {
  if (!['head-on', 'fixed-target'].includes(geometry)) throw new RangeError('Unsupported collision geometry.');
  const centerOfMassGeV = geometry === 'head-on'
    ? 2 * beam.totalEnergyGeV
    : Math.sqrt(2 * PROTON_REST_ENERGY_GEV ** 2 + 2 * PROTON_REST_ENERGY_GEV * beam.totalEnergyGeV);
  return Object.freeze({ geometry, centerOfMassGeV, beamCount: geometry === 'head-on' ? 2 : 1 });
}

export function beamPowerWatts(beam, particlesPerSecond, beamCount = 1) {
  if (particlesPerSecond < 0) throw new RangeError('Beam rate must be non-negative.');
  return beam.kineticEnergyJ * particlesPerSecond * beamCount;
}

/** Kinematic cards, deliberately not probabilities or event generation. */
export const accessibilityCards = Object.freeze([
  { name: 'Light-hadron production scale', thresholdGeV: 0.28, note: 'Kinematic context only; a collision model is still required.' },
  { name: 'Proton–antiproton pair scale', thresholdGeV: 1.876, note: 'Quantum numbers and final-state phase space still matter.' },
  { name: 'W/Z boson scale', thresholdGeV: 91, note: 'Parton distributions and cross sections are not implemented.' },
  { name: 'Higgs boson scale', thresholdGeV: 125, note: 'Accessibility is not a prediction of a Higgs event.' },
  { name: 'Top-pair scale', thresholdGeV: 346, note: 'Requires a suitable hard parton collision and an event generator.' },
  { name: 'Quark–gluon plasma', thresholdGeV: Infinity, note: 'Not inferred from proton √s alone; a heavy-ion model is required.' }
]);

export function runStandardSimulation(input) {
  const length = input.useIdealizedHelix
    ? helicalPathLength(input.verticalLengthM, input.helixRadiusM, input.helixTurns)
    : input.verticalLengthM;
  const beam = accelerateProton({ fieldMVPerM: input.fieldMVPerM, acceleratingLengthM: length });
  const collision = collisionKinematics(beam, input.geometry);
  const particlesPerSecond = 10 ** input.log10BeamRate;
  const powerW = beamPowerWatts(beam, particlesPerSecond, collision.beamCount);
  return Object.freeze({
    input: { ...input, acceleratingLengthM: length }, beam, collision, powerW,
    accessibility: accessibilityCards.map(card => ({ ...card, accessible: collision.centerOfMassGeV >= card.thresholdGeV })),
    limitations: ['No event generator is installed.', 'No detector response, trigger, reconstruction, luminosity, or cross-section model is implemented yet.'],
    provenance
  });
}

export const energyRoundTrip = gev => joulesToGeV(gevToJoules(gev));
