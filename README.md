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

## The physics seam (added 2026-09-17)

Every mode now returns the same `core` object for the same run:

```
{ mode, modeName, framework, claim, quantity, value, unit, uncertainty, byproducts, checks, note }
```

- `claim` is read from the mode registry in `src/core/result.js`, never passed in by a caller, so a script cannot relabel its own output as established physics.
- `value: null` means the framework makes no prediction for that quantity. It is a real answer, never scored as agreement.
- `checks` is the Mode 1 audit bench: the simulator's own numbers placed next to machines that exist. It is empty for modes that have nothing to check, so the shape never varies.
- `compareModes(input)` puts all three cores side by side. The UI shows the same table.

Honest limit, stated in code and here: a collider at any reachable energy cannot probe a bounce at Planckian density. The Moon-Loop mode therefore reports **no prediction** for collider √s and separately evaluates the published effective modified Friedmann equation it reduces to, labeled `derived` and cited:

> A. Ashtekar, T. Pawlowski, P. Singh, *Quantum Nature of the Big Bang: Improved dynamics*, Phys. Rev. Lett. **96**, 141301 (2006).

Reproducing a published equation is a connection, not evidence for a mechanism.

## Mode 1 against real machines (added 2026-09-17)

Mode 1 is `W = qEL` over a uniform field with no losses. That is a real equation and a lie about how accelerators work, so every Research Lab core result now carries an audit against a published machine (LHC or LEP 2, selected in the UI). Divergences are shown, not smoothed:

- **Beam energy.** The simulator's integrated value next to the machine's published beam energy, with the ratio. The two disagree because a ring sets energy by magnetic rigidity, not by field times circumference. Agreement would be an accident.
- **Magnetic rigidity ceiling.** `p = 0.299792458 * B * rho` from the machine's published dipole field and bending radius. LHC: 8.33 T, 2803.95 m -> 7002 GeV, against 7000 GeV design. This is the relationship the simulator does not model.
- **Synchrotron loss per turn.** The simulator assumes zero. `U0 = (e^2 / 3 eps0) * gamma^4 / rho` gives ~5.9 keV/turn for LHC protons at 6.8 TeV and ~3.4 GeV/turn for LEP 2 electrons at 104.5 GeV, in the same 26.7 km tunnel. Same ring, 13 orders of magnitude apart, because the loss scales as E^4 and inversely with mass^4.
- **Power radiated by the beam.** The machine's radiated power next to the simulator's required power, so the lossless lower bound is visible for what it is.

Sources are named per check (CERN LHC Design Report CERN-2004-003; CERN Run 3 parameters; LEP 2 operation; the standard synchrotron-radiation formula). Nothing is invented to make the simulator look right, and nothing is invented to make it look wrong.

## Running it

```sh
npm start      # zero dependencies, node built-in server, prints http://localhost:5173
npm test       # node --test, no install either
```

Double-clicking `index.html` does **not** work: browsers block ES modules loaded from `file://` (origin `null`). That is a browser rule, not a bug in this project, and it is why `npm start` exists.
