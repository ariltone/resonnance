// Moteur de tirage — RÉSONANCE Bloc 6.3.
// Couche identifiable : la route demande « quels stimuli proposer dans ce contexte ? »,
// le moteur répond par une sélection. Pur : aucune base, aucun réseau, aucun état global.
// Principe : construire une rencontre éditoriale intéressante, jamais dire ce qu'elle signifie.
// Les pondérations internes (s'il y en a) ne sont ni exposées, ni stockées, ni affichées.
export function graineAleatoire() {
  return Math.floor(Math.random() * 2 ** 31);
}
// Hasard contrôlable (mulberry32) : même graine + mêmes entrées = même tirage. Tests uniquement.
export function hasardControle(graine) {
  let a = (Number(graine) >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function melanger(tableau, rand = Math.random) {
  const t = [...tableau];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

export const DEFAUT_CONFIG_TIRAGE = { hasard: 100, diversite_minimale: 3, exclusion_recente: true, intensite_max: null };

// Candidat : { id, categorie (nullable), intensite (nullable), actif }.
// Contexte : { texte } transmis pour les blocs futurs (compatibilités texte/stimulus). Non exploité en 6.3 :
// sans table de compatibilités explicites, tout candidat est neutre (jamais de sens imposé).
// Compatibilités : { [id]: 'forte'|'moyenne'|'neutre'|'contraste' } + 'exclue' (écarté du contexte).
export function composerTirage({ candidats = [], nombre = 6, imposes = [], recents = [], config = {}, contexte = {}, compatibilites = {}, random = Math.random } = {}) {
  const cfg = { ...DEFAUT_CONFIG_TIRAGE, ...(config || {}) };
  const N = Math.max(0, Math.floor(Number(nombre) || 0));
  const dejaPris = new Set((imposes || []).map((c) => c.id));
  // 1. Disponibilité : actifs uniquement (re-vérifié ici même si la route filtre déjà).
  let pool = (candidats || []).filter((c) => c && c.actif !== false && !dejaPris.has(c.id));
  const totalCandidats = pool.length;
  // 2. Dosage éditorial (intensité), pas un score.
  const maxI = cfg.intensite_max;
  if (maxI != null && maxI !== '') {
    pool = pool.filter((c) => c.intensite == null || c.intensite <= Number(maxI));
  }
  // 3. Compatibilités explicites ; défaut neutre.
  const niveauDe = (c) => compatibilites[c.id] ?? compatibilites[String(c.id)] ?? 'neutre';
  let exclusContexte = 0;
  pool = pool.filter((c) => { if (niveauDe(c) === 'exclue') { exclusContexte++; return false; } return true; });
  // 4. Historique récent avec repli : l'exclusion ne doit jamais faire planter le tirage.
  const ordreRecent = new Map();
  (recents || []).forEach((id, i) => { if (!ordreRecent.has(id)) ordreRecent.set(id, i); });
  let exclusionLevee = false;
  if (cfg.exclusion_recente) {
    pool = pool.filter((c) => !ordreRecent.has(c.id));
  }
  const manque = Math.max(0, N - (imposes || []).length);
  if (pool.length < manque) {
    // Repli : on réintègre les récents (les moins récents d'abord), hors intensité/contexte interdits.
    const dansPool = new Set(pool.map((c) => c.id));
    const reintegres = [...ordreRecent.entries()].sort((a, b) => b[1] - a[1])
      .map(([id]) => (candidats || []).find((c) => c && c.id === id))
      .filter(Boolean);
    for (const c of reintegres) {
      if (pool.length >= manque) break;
      if (c.actif === false || dejaPris.has(c.id) || dansPool.has(c.id)) continue;
      if (maxI != null && maxI !== '' && c.intensite != null && c.intensite > Number(maxI)) continue;
      if (niveauDe(c) === 'exclue') continue;
      pool.push(c); dansPool.add(c.id);
    }
    exclusionLevee = true;
  }
  // 5. Hasard + diversité : part aléatoire puis complément glouton (catégories inédites d'abord).
  const hasard = Math.min(100, Math.max(0, Number(cfg.hasard ?? 100)));
  const nbHasard = Math.round(manque * hasard / 100);
  const brasses = melanger(pool, random);
  const choixHasard = brasses.slice(0, Math.min(nbHasard, brasses.length));
  const reste = brasses.slice(choixHasard.length);
  const choixDivers = [];
  const vues = new Set(choixHasard.map((c) => c.categorie));
  for (const c of reste) {
    if (choixDivers.length >= manque - choixHasard.length) break;
    if (c.categorie == null || !vues.has(c.categorie)) { choixDivers.push(c); if (c.categorie != null) vues.add(c.categorie); }
  }
  for (const c of reste) {
    if (choixDivers.length >= manque - choixHasard.length) break;
    if (!choixHasard.includes(c) && !choixDivers.includes(c)) choixDivers.push(c);
  }
  // 6. Ordre final brassé : aucune image n'est valorisée comme « bonne réponse » (recette F-022).
  const choix = melanger([...choixHasard, ...choixDivers], random);
  return {
    choix,
    infos: {
      demande: N,
      candidats: totalCandidats,
      retenus: choix.length,
      imposes: (imposes || []).length,
      exclus_contexte: exclusContexte,
      exclusion_levee: exclusionLevee,
      diversite_atteinte: new Set(choix.map((c) => c.categorie).filter((v) => v != null)).size
    }
  };
}
