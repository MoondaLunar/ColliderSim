import { runStandardSimulation } from './physics.js';
import { evaluateMoonLoop } from '../moonloop/experiment.js';
import { playgroundLayer } from '../playground/effects.js';

export function runSimulation(mode, input) {
  const standardResult = runStandardSimulation(input);
  if (mode === 'research') return Object.freeze({ mode, standardResult });
  if (mode === 'moon-loop') return Object.freeze({ mode, standardResult, moonLoop: evaluateMoonLoop(input.moonLoop ?? {}) });
  if (mode === 'playground') return playgroundLayer(standardResult, input.playground);
  throw new RangeError(`Unknown mode: ${mode}`);
}
