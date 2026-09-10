// Progression — RÉSONANCE Bloc 6.6.
// Sources : règles §16 (avancement = séquences traversées, ni score ni niveaux),
// §17 (clôture = restitution, pas conclusion), concept §16 (pas de niveaux classiques),
// moteur-editorial §31 (6 phases nominatives), §33 (montée progressive de l'intensité).
// PROGRESSION ≠ SCORE : seule mesure = compteur de séquences. Aucun point, aucun niveau
// chiffré, aucune performance. Les paliers sont CONFIGURABLES ; leurs défauts sont des
// choix techniques documentés, à valider humainement (les cahiers ne chiffrent rien).
export const PHASES_EDITORIALES = ['Entrer', 'Résonner', 'Approfondir', 'Déplacer', 'Relier', 'Formuler'];
export const DEFAUT_PALIERS_PHASE = [3, 6, 10, 15, 21]; // seuils de séquences ; techniques, modifiables
export const INTENSITE_MAX_ECHELLE = 3; // échelle 6.1 (doc éditorial §32 : 1-5, à trancher)

// nbSequences : entier >= 0. paliers : 5 seuils croissants (sinon défaut).
// plafond_intensite : dosage max conseillé, dérivé de la phase (montée progressive §33).
export function etatProgression(nbSequences = 0, paliers = DEFAUT_PALIERS_PHASE) {
  const n = Math.max(0, Math.floor(Number(nbSequences) || 0));
  const p = Array.isArray(paliers) && paliers.length === 5 && paliers.every((v) => Number.isInteger(v) && v >= 1) && paliers.every((v, i) => i === 0 || v > paliers[i - 1])
    ? paliers : DEFAUT_PALIERS_PHASE;
  let indice = 0;
  for (let i = 0; i < p.length; i++) { if (n >= p[i]) indice = i + 1; }
  return {
    sequences_traversees: n,
    phase_suggeree: PHASES_EDITORIALES[indice],
    indice_phase: indice,
    plafond_intensite: Math.min(INTENSITE_MAX_ECHELLE, 1 + Math.floor(indice / 2)),
    paliers_appliques: [...p]
  };
}
