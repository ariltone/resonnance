// Événements (récurrences observées) — RÉSONANCE Bloc 6.5.
// Sources : cahier-IA §12 (échelle apparition→répétition→significative→forte, seuils
// paramétrables), §35-36 (traçabilité : toute observation repose sur des éléments
// retrouvables), moteur-editorial §44 (répétition provoquée vs accidentelle).
// Une observation n'agit sur RIEN dans ce bloc : l'intervention reste une POSSIBILITÉ
// (mise en perspective / question = blocs suivants). Jamais de signification.
export const NIVEAUX_RECURRENCE = ['ponctuel', 'repetition', 'significatif', 'fort'];
export const DEFAUT_SEUILS_RECURRENCE = { repetition: 2, significatif: 3, forte: 4 };
export const INTERVENTIONS_POSSIBLES = {
  ponctuel: 'aucune',
  repetition: 'signalement_possible',
  significatif: 'question_eventuelle',
  fort: 'mise_en_perspective_possible'
};

// lignes : [{ image_id, seq_id, statut ('choisie'|...), fantome (0/1) }] — faits 6.2.
// seuils : { repetition, significatif, forte } (entiers >= 1, croissants ; sinon défaut).
// Ne retient que les images APPARUES plus d'une fois ? Non : tout est listé, le niveau
// 'ponctuel' portant explicitement 'aucune' (pas de signalement précoce, §12/§42 IA).
export function analyserRecurrences(lignes = [], seuils = {}) {
  const s = {
    repetition: Number.isInteger(seuils.repetition) && seuils.repetition >= 1 ? seuils.repetition : DEFAUT_SEUILS_RECURRENCE.repetition,
    significatif: Number.isInteger(seuils.significatif) && seuils.significatif >= 1 ? seuils.significatif : DEFAUT_SEUILS_RECURRENCE.significatif,
    forte: Number.isInteger(seuils.forte) && seuils.forte >= 1 ? seuils.forte : DEFAUT_SEUILS_RECURRENCE.forte
  };
  if (!(s.repetition <= s.significatif && s.significatif <= s.forte)) {
    s.repetition = DEFAUT_SEUILS_RECURRENCE.repetition;
    s.significatif = DEFAUT_SEUILS_RECURRENCE.significatif;
    s.forte = DEFAUT_SEUILS_RECURRENCE.forte;
  }
  const parImage = new Map();
  for (const l of lignes || []) {
    if (l == null || l.image_id == null || l.seq_id == null) continue;
    if (!parImage.has(l.image_id)) parImage.set(l.image_id, { apparitions: 0, choix: 0, seq_ids: [], provoquee: false });
    const o = parImage.get(l.image_id);
    o.apparitions++;
    if (l.statut === 'choisie') o.choix++;
    if (!o.seq_ids.includes(l.seq_id)) o.seq_ids.push(l.seq_id);
    if (l.fantome) o.provoquee = true; // §44 : réapparition voulue, distinguée de l'accidentelle
  }
  return [...parImage.entries()].map(([image_id, o]) => {
    const niveau = o.apparitions >= s.forte ? 'fort' : o.apparitions >= s.significatif ? 'significatif' : o.apparitions >= s.repetition ? 'repetition' : 'ponctuel';
    return { image_id, apparitions: o.apparitions, choix: o.choix, niveau, intervention: INTERVENTIONS_POSSIBLES[niveau], provoquee: o.provoquee, sources: [...o.seq_ids].sort((a, b) => a - b) };
  }).sort((a, b) => b.apparitions - a.apparitions || a.image_id - b.image_id);
}
