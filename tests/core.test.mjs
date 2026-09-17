import test from 'node:test';
import assert from 'node:assert/strict';
import { energyRoundTrip, accelerateProton, collisionKinematics, helicalPathLength, runStandardSimulation } from '../src/core/physics.js';
import { milesToMeters } from '../src/core/units.js';
import { runSimulation } from '../src/core/modes.js';

const input = Object.freeze({ fieldMVPerM: 100, verticalLengthM: milesToMeters(20), log10BeamRate: 9, geometry: 'head-on', useIdealizedHelix: false, helixTurns: 100, helixRadiusM: 5, moonLoop: { minimumScaleFactor: 0, ricciScalar: Infinity, kretschmannScalar: Infinity }, playground: { superstorm: true, seed: 7 } });
test('energy conversions round trip', () => assert.ok(Math.abs(energyRoundTrip(125.0) - 125.0) < 1e-12));
test('relativistic beta remains below one', () => { const beam=accelerateProton({fieldMVPerM:100,acceleratingLengthM:milesToMeters(20)}); assert.ok(beam.beta > 0 && beam.beta < 1); assert.ok(beam.gamma > 1); });
test('head-on centre-of-mass energy exceeds fixed target for same beam', () => { const b=accelerateProton({fieldMVPerM:1,acceleratingLengthM:1000}); assert.ok(collisionKinematics(b,'head-on').centerOfMassGeV > collisionKinematics(b,'fixed-target').centerOfMassGeV); });
test('helix path is at least vertical path', () => assert.ok(helicalPathLength(100,5,10) >= 100));
test('beam power is energy per particle times beam rate', () => { const r=runStandardSimulation(input); assert.equal(r.powerW, r.beam.kineticEnergyJ * 1e9 * 2); });
test('Moon-Loop mode cannot alter standard baseline', () => { const a=runSimulation('research',input).standardResult; const b=runSimulation('moon-loop',input).standardResult; assert.deepEqual(b,a); });
test('Playground mode cannot alter standard baseline', () => { const a=runSimulation('research',input).standardResult; const b=runSimulation('playground',input).standardResult; assert.deepEqual(b,a); });
test('undefined Moon-Loop transition reports inconclusive rather than a success', () => { const m=runSimulation('moon-loop',input).moonLoop; assert.ok(m.tests.some(t=>t.status==='INCONCLUSIVE')); assert.ok(m.tests.some(t=>t.status==='FAIL')); });
