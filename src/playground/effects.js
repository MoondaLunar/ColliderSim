/** Fictional presentation effects. They only decorate an immutable core result. */
export function playgroundLayer(core, { superstorm = false, seed = 0 } = {}) {
  const cards = [];
  if (superstorm) cards.push({ name: 'Aurora Sensor Scramble', label: 'GAME', real: 'Geomagnetic storms can disturb technology and sensors.', fiction: 'No accelerator-energy bonus is applied.' });
  if (seed % 7 === 0) cards.push({ name: 'Chronal Loop Echo', label: 'GAME', real: 'Known particle lifetimes are not negative.', fiction: 'A fictional rare-event card.' });
  if (core.collision.centerOfMassGeV > 125) cards.push({ name: 'Discovery Confetti', label: 'GAME', real: 'Energy accessibility does not guarantee a particle event.', fiction: 'An educational reward for reaching a scale.' });
  return Object.freeze({ mode: 'playground', standardResult: core, gameCards: cards, glossary: { proton: 'A tiny positively charged particle found inside atomic nuclei.', trigger: 'A fast filter that decides which detector events to save.', centerOfMassEnergy: 'The collision energy available to make new things.' } });
}
