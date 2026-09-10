// Tests Bloc 6.4 — signaux comportementaux (faits observables, jamais de preuves psy).
// Partie unitaire (sans serveur) + partie HTTP (serveur :3001).
// Usage : serveur démarré puis `node tests/bloc6-4.test.js`
import { calculerSignaux, NATURE_SIGNAL } from '../src/signaux.js';

const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
const SANS_SCORE = (o) => !/score|diagnostic|personnalit|classement|profil|niveau.?psy|anxi|confiance/i.test(JSON.stringify(o));

// --- unitaire : calculs purs ---
const T0 = '2026-01-01T10:00:00.000Z';
const evts = [
  { id: 3, created_at: '2026-01-01T10:00:05.000Z', type: 'presente', details: '{}' },
  { id: 1, created_at: T0, type: 'presente', details: '{"deja_vue":1}' },
  { id: 2, created_at: '2026-01-01T10:00:02.000Z', type: 'presente', details: '{}' },
  { id: 4, created_at: '2026-01-01T10:00:30.000Z', type: 'choisie', details: '{}' },
  { id: 5, created_at: '2026-01-01T10:00:40.000Z', type: 'choix_retire', details: '{}' },
  { id: 6, created_at: '2026-01-01T10:00:50.000Z', type: 'choisie', details: '{}' },
  { id: 7, created_at: '2026-01-01T10:01:00.000Z', type: 'expression', details: '{"silence":1}' },
  { id: 8, created_at: '2026-01-01T10:01:10.000Z', type: 'rejetee', details: '{}' }
];
const s = calculerSignaux(evts, T0);
ok('nature observation (jamais interprétation)', s.nature === 'observation' && NATURE_SIGNAL === 'observation');
ok('délai premier choix (30s)', s.delais_ms.premier_choix === 30000);
ok('délai expression (60s)', s.delais_ms.expression === 60000);
ok('réponse absente = null (pas 0 déguisé)', s.delais_ms.premiere_reponse === null);
ok('comptes exacts', s.comptes.presentees === 3 && s.comptes.choisies === 2 && s.comptes.choix_retires === 1 && s.comptes.rejetees === 1 && s.comptes.revisites === 1 && s.comptes.silences === 1 && s.comptes.reponses === 0);
ok('vide = zéros et nulls', (() => { const v = calculerSignaux([], T0); return v.comptes.presentees === 0 && v.delais_ms.premier_choix === null; })());
ok('dates invalides = null sans crash', calculerSignaux([{ id: 1, created_at: 'nimporte', type: 'choisie', details: 'pas-json' }], 'idem').delais_ms.premier_choix === null);
ok('aucune clé interprétative', Object.keys(s).join() === 'nature,delais_ms,comptes' && SANS_SCORE(s));

// --- HTTP : signaux branchés sur le journal réel ---
async function req(method, p, body, token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = 'Bearer ' + token;
  const r = await fetch(BASE + p, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}
const U = Date.now();
const regA = await req('POST', '/api/register', { pseudo: `b64a${U}`, password: 'Signaux-8!' });
const regB = await req('POST', '/api/register', { pseudo: `b64b${U}`, password: 'Signaux-8!' });
const tA = regA.body.token, tB = regB.body.token;
const nw = await req('POST', '/api/session/new', {}, tA);
const seqId = nw.body.sequence.id;
await req('POST', `/api/session/${seqId}/choix`, { imageId: nw.body.images[0].id }, tA);
const sg = await req('GET', `/api/session/${seqId}/signaux`, null, tA);
ok('signaux séquence (journal réel)', sg.status === 200 && sg.body.nature === 'observation' && sg.body.comptes.presentees === nw.body.images.length && sg.body.comptes.choisies === 1 && sg.body.delais_ms.premier_choix >= 0);
ok('signaux sans interprétation (HTTP)', SANS_SCORE(sg.body));
ok('séquence inconnue (404)', (await req('GET', '/api/session/999999999/signaux', null, tA)).status === 404);
ok("séquence d'autrui (403)", (await req('GET', `/api/session/${seqId}/signaux`, null, tB)).status === 403);
const pa = await req('POST', '/api/parties', {}, tA);
await req('POST', `/api/parties/${pa.body.partie.id}/choisir`, { choix_id: pa.body.partie.situation.choix[0].id }, tA);
const sp = await req('GET', `/api/parties/${pa.body.partie.id}/signaux`, null, tA);
ok('signaux partie (réponse comptée)', sp.status === 200 && sp.body.comptes.reponses === 1 && sp.body.delais_ms.premiere_reponse >= 0);
await req('DELETE', '/api/me/data', null, tA);
await req('DELETE', '/api/me', null, tA);
await req('DELETE', '/api/me', null, tB);

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
