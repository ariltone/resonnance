// Garde-fous IA — RÉSONANCE Bloc 6.8. L'IA est HORS SOCLE : ce module ne génère rien.
// Il CONTRÔLE des formulations (cahier-IA §37 : diagnostics, affirmations psychologiques,
// jugements, certitudes, conseils non sollicités, manipulations, extrapolations) à partir
// des exemples EXPLICITEMENT interdits par les cahiers (§13, §15, §17, §22, §23, §35).
// Toute génération (reformulation, mise en relation, questionnement) est À SPÉCIFIER.
export const NIVEAUX_IA = [0, 1, 2, 3, 4]; // §38 : 0 absente (défaut) → 4 mise en perspective

// Chaque règle = { categorie (§37), source, motifs (regex sur formulations interdites citées) }.
const REGLES = [
  { categorie: 'affirmation_psychologique', source: 'cahier-ia §15', motifs: [/tu as peur de/i, /tu manques de confiance/i, /ton enfance explique/i] },
  { categorie: 'diagnostic', source: 'cahier-ia §15-16', motifs: [/tu es une personne (anxieuse|dépressive|névrosée)/i, /ton (trouble|diagnostic|état mental|pathologie)/i, /diagnosti/i] },
  { categorie: 'pseudo_science', source: 'cahier-ia §17', motifs: [/signifie que tu es (impulsif|impulsive|\w+)/i, /choisir .* (signifie|prouve) que tu/i, /les? (rouge|bleu|noir)s? (signifie|révèle)/i] },
  { categorie: 'jugement', source: 'cahier-ia §13', motifs: [/tu es (contradictoire|instable|incohérent|indécis)\b/i] },
  { categorie: 'profil_psychologique', source: 'cahier-ia §22', motifs: [/\b(introversion|anxiété|confiance|maturité|intelligence|courage)\s*:\s*\d+\s*%/i] },
  { categorie: 'score_psychologique', source: 'cahier-ia §23', motifs: [/\b\d+\s*%\s*de (connaissance de soi|personnalité|maturité|confiance)/i] },
  { categorie: 'certitude_injustifiee', source: 'cahier-ia §37', motifs: [/cela prouve que/i, /sans aucun doute,? tu/i, /il est (certain|prouvé) que tu/i] },
  { categorie: 'conseil_non_sollicite', source: 'cahier-ia §37', motifs: [/tu devrais (consulter|suivre une thérapie|prendre rendez-vous)/i] }
];
// $35 : « Tu avais choisi cette image auparavant » interdit si non enregistré.
const MARQUEUR_Souvenir = /tu avais (déjà |)(\w+ )?(choisi|vu|écarté)|cette image.*(auparavant|précédemment)|tu avais dit/i;

export function controlerFormulation(texte = '') {
  const t = String(texte ?? '');
  const motifs = [];
  for (const r of REGLES) {
    if (r.motifs.some((m) => m.test(t))) motifs.push({ categorie: r.categorie, source: r.source });
  }
  return { accepte: motifs.length === 0, motifs };
}
// histoire : { images_choisies: [ids] } — faits 6.2 uniquement (minimisation §20).
export function verifierSouvenir(texte = '', histoire = {}) {
  const t = String(texte ?? '');
  if (!MARQUEUR_Souvenir.test(t)) return { concerne: false, fonde: true };
  const ids = new Set([...(histoire.images_choisies || []), ...(histoire.images_vues || [])].map(Number));
  const cites = [...t.matchAll(/#?(\d{1,6})/g)].map((m) => Number(m[1])).filter((n) => ids.has(n));
  return { concerne: true, fonde: cites.length > 0, sources: cites };
}
export function niveauIACourant(params = {}) {
  const n = Number(params.niveau_ia);
  return NIVEAUX_IA.includes(n) ? n : 0;
}
