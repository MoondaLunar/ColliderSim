import { milesToMeters } from '../core/units.js';
import { runSimulation, compareModes } from '../core/modes.js';
import { PLANCK_DENSITY_KG_PER_M3 } from '../moonloop/effective.js';

const $ = id => document.getElementById(id);
let mode = 'research';
const fmt = (n, d = 3) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(n);
const power = w => w >= 1e12 ? `${fmt(w / 1e12)} TW` : w >= 1e9 ? `${fmt(w / 1e9)} GW` : w >= 1e6 ? `${fmt(w / 1e6)} MW` : w >= 1e3 ? `${fmt(w / 1e3)} kW` : `${fmt(w)} W`;

function input() {
  return {
    fieldMVPerM: +$('field').value,
    verticalLengthM: milesToMeters(+$('length').value),
    log10BeamRate: +$('rate').value,
    geometry: $('geometry').value,
    useIdealizedHelix: $('helix').checked,
    helixTurns: +$('turns').value,
    helixRadiusM: +$('radius').value,
    moonLoop: { minimumScaleFactor: 0, ricciScalar: Infinity, kretschmannScalar: Infinity },
    cosmology: { densityKgPerM3: PLANCK_DENSITY_KG_PER_M3 * (+$('density').value / 100), bounceDensityKgPerM3: PLANCK_DENSITY_KG_PER_M3 },
    playground: { superstorm: true, seed: 14 }
  };
}

function coreHtml(core) {
  const value = core.value === null ? '<b class="none">NO PREDICTION</b>' : `<b>${fmt(core.value)} ${core.unit}</b>`;
  const unc = core.uncertainty === null ? '' : `<small>± ${fmt(core.uncertainty)} ${core.unit}</small>`;
  const by = core.byproducts.map(b => `<li>${b.name}: ${fmt(b.value)} ${b.unit}</li>`).join('');
  return `<div class="core">
    <p class="claim ${core.claim.replaceAll(' ', '-')}">claim: ${core.claim}</p>
    <p class="q">${core.quantity}</p>
    <p class="v">${value} ${unc}</p>
    <p class="fw">${core.framework}</p>
    <p class="nt">${core.note}</p>
    ${by ? `<ul class="bp">${by}</ul>` : ''}
  </div>`;
}

function render() {
  const data = runSimulation(mode, input());
  const s = data.standardResult, b = s.beam, c = s.collision;
  $('fieldOut').textContent = `${$('field').value} MV/m`;
  $('lengthOut').textContent = `${$('length').value} mi`;
  $('rateOut').textContent = `10^${$('rate').value} p/s`;
  $('turnsOut').textContent = $('turns').value;
  $('radiusOut').textContent = `${$('radius').value} m`;
  $('densityOut').textContent = `${$('density').value}% of Planck density`;
  $('helixOptions').classList.toggle('hidden', !$('helix').checked);
  $('energy').textContent = `${fmt(b.kineticEnergyGeV)} GeV`;
  $('energyJ').textContent = `${b.kineticEnergyJ.toExponential(3)} J`;
  $('speed').textContent = `${fmt(b.beta * 100, 9)}% c`;
  $('gamma').textContent = `γ = ${fmt(b.gamma)}`;
  $('com').textContent = `${fmt(c.centerOfMassGeV)} GeV`;
  $('geometryNote').textContent = c.geometry === 'head-on' ? 'Two moving beams' : 'Fixed target';
  $('power').textContent = power(s.powerW);
  $('accessibility').innerHTML = s.accessibility.map(x => `<div class="${x.accessible ? 'yes' : ''}"><b>${x.accessible ? '✓' : '○'} ${x.name}</b><small> threshold ${x.thresholdGeV === Infinity ? 'heavy-ion model' : x.thresholdGeV + ' GeV'}</small><p>${x.note}</p></div>`).join('');

  const panel = $('modePanel');
  if (mode === 'research') panel.innerHTML = '<h2>Research Lab</h2><p>Only the shared, documented kinematics are authoritative here. Collision event generation, detector response, trigger, reconstruction and cross sections are intentionally shown as not implemented.</p>';
  if (mode === 'moon-loop') {
    const m = data.moonLoop, cosmo = data.cosmology;
    panel.innerHTML = `<h2>Moon-Loop Experimental</h2><p>${m.classification}</p>${m.tests.map(t => `<p><span class="status ${t.status.toLowerCase().replaceAll(' ', '-')}">${t.status}</span> <b>${t.name}</b> — ${t.detail}</p>`).join('')}
      <h3>Effective equation, evaluated</h3>
      ${cosmo.available
        ? `<p>H = <b>${cosmo.hubbleRatePerSecond.toExponential(4)} s⁻¹</b> at ρ = ${cosmo.densityKgPerM3.toExponential(3)} kg/m³${cosmo.atTurnAround ? ' (the turn-around, H = 0)' : ''}.</p><p><small>${cosmo.citation}. ${cosmo.note}</small></p>`
        : `<p class="none">No real Hubble rate. ${cosmo.reason}</p>`}
      <h3>Known limits</h3><ul>${m.limitations.map(x => `<li>${x}</li>`).join('')}</ul>`;
  }
  if (mode === 'playground') panel.innerHTML = `<h2>Collider Playground</h2><p>Fun presentation layered over the unchanged standard result.</p>${data.gameCards.map(x => `<p><span class="status">${x.label}</span> <b>${x.name}</b><br><small>Real: ${x.real} Game: ${x.fiction}</small></p>`).join('')}`;

  $('corePanel').innerHTML = `<h2>This run's core result</h2>${coreHtml(data.core)}`;

  const rows = compareModes(input());
  $('compare').innerHTML = `<table><thead><tr><th>Mode</th><th>Claim</th><th>${rows[0].core.quantity}</th></tr></thead><tbody>${rows.map(r => `<tr class="${r.mode === mode ? 'active' : ''}"><td>${r.core.modeName}</td><td class="claim ${r.core.claim.replaceAll(' ', '-')}">${r.core.claim}</td><td>${r.core.value === null ? '<span class="none">NO PREDICTION</span>' : `${fmt(r.core.value)} ${r.core.unit}`}</td></tr>`).join('')}</tbody></table><p class="caption">Null is a real answer. A framework that makes no prediction here borrows nothing, and is never counted as agreeing.</p>`;

  $('provenance').innerHTML = `<p><b>Model:</b> ${s.provenance.model}</p><p><b>Equations:</b> ${s.provenance.equations.join('; ')}.</p><p><b>Assumptions:</b> ${s.provenance.assumptions.join('; ')}.</p><p><b>Sources:</b> ${s.provenance.sources.join('; ')}. ${cosmoCitation()}</p><p><b>Current limitations:</b> ${s.limitations.join(' ')}</p>`;
}
function cosmoCitation() { return 'Moon-Loop effective equation: Ashtekar, Pawlowski, Singh, PRL 96, 141301 (2006).'; }

for (const el of document.querySelectorAll('input,select')) el.addEventListener('input', render);
for (const el of document.querySelectorAll('button[data-mode]')) el.addEventListener('click', () => {
  mode = el.dataset.mode;
  document.querySelectorAll('button[data-mode]').forEach(x => x.classList.toggle('active', x === el));
  $('mode-description').textContent = mode === 'research' ? 'Established special-relativistic kinematics' : mode === 'moon-loop' ? 'Same baseline + explicit hypothesis tests' : 'Same baseline + labeled game mechanics';
  render();
});
render();
