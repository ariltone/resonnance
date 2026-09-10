// Tests Bloc 6.6 — progression = avancement, jamais un score (règles §16-17).
// Partie unitaire (sans serveur) + partie HTTP (serveur :3001).
// Usage : serveur démarré puis `node tests/bloc6-6.test.js`
import { etatProgression, PHASES_EDITORIALES, DEFAUT_PALIERS_PHASE } from '../src/progression.js';

const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
const SANS_SCORE = (o) => !/score|classement|points?|niveau.?psy|diagnostic|performance|réussite/i.test(JSON.stringify(o));
async function req(method, p, body, token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = 'Bearer ' + token;
  const r = await fetch(BASE + p, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}

// --- unitaire ---
let e = etatProgression(0);
ok('départ : Entrer, plafond 1', e.phase_suggeree === 'Entrer' && e.indice_phase === 0 && e.plafond_intensite === 1 && e.sequences_traversees === 0);
ok('6 phases éditoriales (§31)', PHASES_EDITORIALES.join() === 'Entrer,Résonner,Approfondir,Déplacer,Relier,Formuler');
ok('paliers franchis', etatProgression(3).phase_suggeree === 'Résonner' && etatProgression(10).phase_suggeree === 'Déplacer' && etatProgression(21).phase_suggeree === 'Formuler');
ok('plafond progressif 1→2→3', etatProgression(0).plafond_intensite === 1 && etatProgression(6).plafond_intensite === 2 && etatProgression(15).plafond_intensite === 3);
ok('paliers personnalisés', etatProgression(2, [2, 4, 6, 8, 10]).phase_suggeree === 'Résonner');
ok('paliers invalides = défaut', etatProgression(3, [9, 2]).paliers_appliques.join() === DEFAUT_PALIERS_PHASE.join());
ok('négatif = 0 sans crash', etatProgression(-5).sequences_traversees === 0);
ok('aucune clé de score/niveau/points', Object.keys(etatProgression(7)).join() === 'sequences_traversees,phase_suggeree,indice_phase,plafond_intensite,paliers_appliques' && SANS_SCORE(etatProgression(99)));

// --- HTTP ---
const U = Date.now();
const reg = await req('POST', '/api/register', { pseudo: `b66${U}`, password: 'Progress-8!' });
const T = reg.body.token;
await req('POST', '/api/session/new', {}, T);
await req('POST', '/api/session/new', {}, T);
const pr = await req('GET', '/api/progression', null, T);
ok('progression branchée (2 séquences)', pr.status === 200 && pr.body.sequences_traversees === 2 && pr.body.phase_suggeree === 'Entrer');
ok('sans score (HTTP)', SANS_SCORE(pr.body));
await req('DELETE', '/api/me/data', null, T);
await req('DELETE', '/api/me', null, T);

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
