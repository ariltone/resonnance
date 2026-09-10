// Signaux — RÉSONANCE Bloc 6.4 (cahier-technique §11 : signaux comportementaux).
// Un signal est un FAIT observable du parcours (délai, comptage), jamais une preuve
// psychologique. Calculé à la lecture depuis le journal 6.2 : rien n'est stocké.
// Autorisé à influencer : RIEN dans ce bloc (ni tirage, ni affichage valorisant).
// Les données temporelles peuvent être exclues de l'analyse par configuration (bloc ultérieur).
export const NATURE_SIGNAL = 'observation';

function parsedDetails(e) {
  try { return typeof e.details === 'string' ? JSON.parse(e.details || '{}') : (e.details || {}); }
  catch { return {}; }
}
const dateDe = (e) => { const t = Date.parse(e.created_at); return Number.isFinite(t) ? t : null; };

// evenements : lignes du journal 6.2 (même séquence ou même partie), ordre quelconque.
// debut : date ISO de création de la séquence/partie (tronc commun des délais).
export function calculerSignaux(evenements = [], debut = null) {
  const evts = [...(evenements || [])].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  const parType = (t) => evts.filter((e) => e.type === t);
  const t0 = debut ? Date.parse(debut) : dateDe(evts[0] || {});
  const delaiDepuis = (e) => {
    const t = dateDe(e);
    if (t == null || t0 == null || !Number.isFinite(t0)) return null;
    return Math.max(0, t - t0);
  };
  const premier = (t) => parType(t)[0] ?? null;
  const premierChoix = premier('choisie');
  const expression = premier('expression');
  const reponse = premier('reponse');
  return {
    nature: NATURE_SIGNAL,
    delais_ms: {
      premier_choix: premierChoix ? delaiDepuis(premierChoix) : null,
      expression: expression ? delaiDepuis(expression) : null,
      premiere_reponse: reponse ? delaiDepuis(reponse) : null
    },
    comptes: {
      presentees: parType('presente').length,
      choisies: parType('choisie').length,
      choix_retires: parType('choix_retire').length,
      rejetees: parType('rejetee').length,
      revisites: parType('presente').filter((e) => parsedDetails(e).deja_vue === 1).length,
      silences: parType('expression').filter((e) => parsedDetails(e).silence === 1).length,
      reponses: parType('reponse').length
    }
  };
}
