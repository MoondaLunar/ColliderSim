# Legacy archive audit — 2026-09-17

## What was supplied

The ZIP contains an incomplete Java/Spring/Python/Godot prototype, not a runnable repository: Java classes sit directly in `src/main` rather than Maven source roots; there is no Spring application entry point, no `SimulationTaskRepository`, and the Java runner requests `python_math.py` while the supplied Python file is `python math.py`. The GCP service has undeclared dependencies and references undefined variables. Docker does not build the application or provide Python/NumPy. No tests or credentials were supplied.

Useful preserved concepts: a zero-install browser lab; a 20-mile accelerator framing; electric work; relativistic beta/gamma; head-on versus fixed-target kinematics; helix geometry as an explicit idealization; Godot/visual UI ideas; compute tiers as a future workload architecture.

## Scientific classification

| Legacy calculation/system | Classification | Treatment |
|---|---|---|
| `qEL`, relativistic gamma/beta | A — established physics | Reimplemented and tested in shared core. |
| Helical path length | B — geometric approximation | Retained only as an explicit aligned-field idealization. |
| Coriolis / chimney / atmospheric harvesting | F/B | Not moved into research; needs a defined engineering model. |
| Particle threshold loot table | E/D | Replaced by correctly labeled kinematic-access cards; no event claims. |
| Schumann/helix "resonance" multiplier | E — dimensionally invalid | Removed. |
| Kp aurora energy bonus | E in physics; D in game | Removed from shared physics; game explanation only. |
| Cosmic Valve/stability/entropy formulas | E/C | Replaced with transparent Moon-Loop test statuses; no fabricated scores. |
| Chronal Loop Echo / Entangled String Pair | D — fiction | Preserved only as Playground cards. |
| GCP 32-TB “God Tier” | F architecture, not physics | Future compute-backend seam; no fake fidelity setting. |

## Configuration/security

No secrets were found. `.gitignore` excludes common credentials. Cloud execution is deliberately not required or claimed functional. A future provider-neutral `SimulationBackend` job interface should add local/remote execution, cancellation, provenance and cost/resource estimates only after a real remote backend exists.

## Current test coverage

`tests/core.test.mjs` covers conversions, beta/gamma, geometry, collision geometry, beam power, mode isolation, and Moon-Loop failure/inconclusive behavior.
