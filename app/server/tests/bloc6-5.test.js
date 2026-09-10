// Tests Bloc 6.5 — récurrences observées (échelle cahier-IA §12, sans effet moteur).
// Partie unitaire (sans serveur) + partie HTTP (serveur :3001).
// Usage : serveur démarré puis `node tests/bloc6-5.test.js`
import { analyserRecurrences, DEFAUT_SEUILS_RECURRENCE } from '../src/recurrences.js';

const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
const SANS_SCORE = (o) => !/score|diagnostic|personnalit|classement|profil|niveau.?psy|anxi|confiance/i.test(JSON.stringify(o));
async function req(method, p, body) {
  const r = await fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}

// --- unitaire : échelle de seuils ---
const L = (img, n, statut = 'vue', fantome = 0) => Array.from({ length: n }, (_, i) => ({ image_id: img, seq_id: 100 + i, statut, fantome }));
let r = analyserRecurrences([...L(1, 1), ...L(2, 2), ...L(3, 3), ...L(4, 4, 'choisie')]);
const niv = (id) => r.find((o) => o.image_id === id);
ok('1 apparition = ponctuel, aucune intervention', niv(1).niveau === 'ponctuel' && niv(1).intervention === 'aucune');
ok('2 = repetition, signalement possible', niv(2).niveau === 'repetition' && niv(2).intervention === 'signalement_possible');
ok('3 = significatif, question éventuelle', niv(3).niveau === 'significatif' && niv(3).intervention === 'question_eventuelle');
ok('4 = fort, mise en perspective possible', niv(4).niveau === 'fort' && niv(4).intervention === 'mise_en_perspective_possible' && niv(4).choix === 4);
ok('seuils non croissants = défaut (pas de crash)', analyserRecurrences(L(5, 2), { repetition: 9, significatif: 2, forte: 3 })[0].niveau === 'repetition');
ok('seuils personnalisés respectés', analyserRecurrences(L(6, 3), { repetition: 3, significatif: 5, forte: 9 })[0].niveau === 'repetition');
ok('provoquée distinguée (fantome)', analyserRecurrences([{ image_id: 7, seq_id: 1, statut: 'vue', fantome: 0 }, { image_id: 7, seq_id: 2, statut: 'vue', fantome: 1 }])[0].provoquee === true);
ok('accidentelle par défaut', analyserRecurrences(L(8, 2))[0].provoquee === false);
ok('sources tracées et triées', JSON.stringify(analyserRecurrences([{ image_id: 9, seq_id: 5, statut: 'vue', fantome: 0 }, { image_id: 9, seq_id: 3, statut: 'vue', fantome: 0 }])[0].sources) === '[3,5]');
ok('vide = []', analyserRecurrences([]).length === 0 && analyserRecurrences().length === 0);
ok('lignes incomplètes ignorées', analyserRecurrences([null, {}, { image_id: 1 }]).length === 0);
ok('aucune signification exposée', SANS_SCORE(r) && DEFAUT_SEUILS_RECURRENCE.repetition === 2);

// --- HTTP : agrégats branchés sur l'historique réel ---
const rec = await req('GET', '/api/editorial/recurrences');
ok('endpoint récurrences (200, tableau)', rec.status === 200 && Array.isArray(rec.body));
ok('traçabilité (sources par observation)', (rec.body || []).every((o) => Array.isArray(o.sources) && typeof o.niveau === 'string' && typeof o.intervention === 'string'));
ok('sans interprétation (HTTP)', SANS_SCORE(rec.body));

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
