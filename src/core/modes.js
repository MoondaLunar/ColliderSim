import { runStandardSimulation } from './physics.js';
import { MODE_ORDER, MODES, SHARED_QUANTITY, SHARED_UNIT, resultCore, noPrediction } from './result.js';
import { DEFAULT_MACHINE_ID, machineById, machineChecks } from './machines.js';
import { evaluateMoonLoop } from '../moonloop/experiment.js';
import { effectiveFriedmann, PLANCK_DENSITY_KG_PER_M3 } from '../moonloop/effective.js';
import { playgroundLayer } from '../playground/effects.js';

/** The standard number, reported by whichever framework claims it. */
export function researchCore(standardResult, machine = machineById(DEFAULT_MACHINE_ID)) {
  const checks = machineChecks(standardResult, machine);
  return resultCore({
    mode: 'research',
    quantity: SHARED_QUANTITY,
    value: standardResult.collision.centerOfMassGeV,
    unit: SHARED_UNIT,
    uncertainty: null,
    byproducts: [
      { name: 'beam kinetic energy per proton', value: standardResult.beam.kineticEnergyGeV, unit: 'GeV' },
      { name: 'beam power required', value: standardResult.powerW, unit: 'W' }
    ],
    checks,
    note: `Exact within the stated idealizations. ${checks.length} published-machine check${checks.length === 1 ? '' : 's'} against ${machine.name}; the model error lives in the assumption set and is shown there, not hidden in a quoted uncertainty.`
  });
}

function moonLoopCore(standardResult) {
  return noPrediction(
    'moon-loop',
    'The Moon-Loop framework makes no prediction for collider √s. Its transition acts near the bounce density, many orders of magnitude above anything a reachable collider can probe. Reported as no prediction rather than borrowing the standard value.'
  );
}

export function runSimulation(mode, input) {
  const standardResult = runStandardSimulation(input);
  const machine = machineById(input.referenceMachine ?? DEFAULT_MACHINE_ID);
  if (mode === 'research') {
    return Object.freeze({ mode, core: researchCore(standardResult, machine), standardResult, machine });
  }
  if (mode === 'moon-loop') {
    const moonLoop = evaluateMoonLoop(input.moonLoop ?? {});
    const cosmology = effectiveFriedmann({
      densityKgPerM3: input.cosmology?.densityKgPerM3 ?? null,
      bounceDensityKgPerM3: input.cosmology?.bounceDensityKgPerM3 ?? PLANCK_DENSITY_KG_PER_M3
    });
    return Object.freeze({ mode, core: moonLoopCore(standardResult), standardResult, moonLoop, cosmology });
  }
  if (mode === 'playground') {
    return playgroundLayer(standardResult, input.playground, researchCore(standardResult, machine));
  }
  throw new RangeError(`Unknown mode: ${mode}`);
}

/** Same record, three frameworks, one shape. */
export function compareModes(input) {
  return Object.freeze(MODE_ORDER.map(mode => Object.freeze({ mode, core: runSimulation(mode, input).core })));
}

/** Guard: a mode may never report a claim that is not its own. */
export function auditClaims(input) {
  return Object.freeze(MODE_ORDER.map(mode => {
    const { core } = runSimulation(mode, input);
    return Object.freeze({ mode, claim: core.claim, expected: MODES[mode].claim, ok: core.claim === MODES[mode].claim });
  }));
}
