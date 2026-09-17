# ColliderSim

ColliderSim is a local, no-install collider-learning prototype with a single shared physics core and three deliberately separated modes:

- **Research Lab** — documented special-relativistic acceleration, beam power, and head-on/fixed-target kinematics. It does **not** yet claim an event generator, detector, trigger, reconstruction, cross sections, or a Standard Model Monte Carlo.
- **Moon-Loop Experimental** — the exact Research Lab result plus a hypothesis test-bed. Missing microscopic physics is reported as `INCONCLUSIVE` or `NOT YET DEFINED BY THE HYPOTHESIS`; it cannot silently turn into a success.
- **Collider Playground** — friendly explanations and silly game cards over the same unmodified standard result. Every fictional effect has a “what’s real” explanation.

## Run locally

Open `index.html` in a modern browser. Everything required for the interactive lab is checked in and it makes no network requests.

If Node.js is installed, run tests with:

```sh
npm test
```

## Architecture

`src/core` owns units, kinematics, beam power, and the mode dispatcher. `src/moonloop` can read but never mutate the core output. `src/playground` likewise decorates an immutable standard output. The mode-isolation tests enforce this boundary.

The next serious additions should be interfaces—not invented physics—for event generation, detector response, trigger selection, reconstruction, analysis, and provider-neutral local/remote simulation jobs. Compute tiers must only be added when they run genuinely different workloads.

## Scientific boundaries

Accelerator fields, beam loss, magnet/cryogenic loads, luminosity, event rates, detector response, and cosmic transition dynamics need substantially more modeling than this prototype provides. Particle cards state **kinematic accessibility only**, never production probability or a simulated event. Moon-Loop is an unproven hypothesis; ER=EPR is not presented as proof, and “Cosmic Valve” is not treated as a literal object.

See [LEGACY_AUDIT.md](LEGACY_AUDIT.md) for the supplied project's architecture, scientific classification, and removed legacy contamination.

## Security and cloud/HPC

Basic operation is local and does not require credentials. Do not commit API keys, service-account JSON, access tokens, or private certificates. Remote/HPC work is a roadmap item, not a working feature in this release.

## Contributions

Keep units explicit, cite/describe assumptions, add tests, and preserve the direction `shared core → Moon-Loop/Playground`. Fiction and hypothesis controls must never alter the authoritative Research Lab result.
