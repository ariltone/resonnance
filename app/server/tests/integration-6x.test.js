// Tests d'intégration 6.4→6.8 : Tirage → Signaux → Événements → Progression → Carnet → IA.
// Vérifie l'articulation sans boucle choix → profil → interprétation.
// Usage : serveur démarré sur :3001 puis `node tests/integration-6x.test.js`
const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
const SANS_BOUCLE = (o) => !/score|diagnostic|personnalit|profil|signifi.*tu|tu es (une|un)/i.test(JSON.stringify(o));
async function req(method, p, body, token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = 'Bearer ' + token;
  const r = await fetch(BASE + p, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}

const U = Date.now();
const reg = await req('POST', '/api/register', { pseudo: `b6x${U}`, password: 'Chaine-8!' });
const T = reg.body.token;
// Tirage → choix + expression (2 séquences pour nourrir l'historique)
const s1 = await req('POST', '/api/session/new', {}, T);
await req('POST', `/api/session/${s1.body.sequence.id}/choix`, { imageId: s1.body.images[0].id }, T);
await req('POST', `/api/session/${s1.body.sequence.id}/expression`, { imageId: s1.body.images[0].id, voir: 'b6x', silence: false }, T);
const s2 = await req('POST', '/api/session/new', {}, T);
// Signaux issus du tirage+choix
const sg = await req('GET', `/api/session/${s1.body.sequence.id}/signaux`, null, T);
ok('tirage → signaux (présentées + choix)', sg.body.comptes.presentees === s1.body.images.length && sg.body.comptes.choisies === 1);
// Événements issus de l'historique (recurrences globales : au moins nos images apparues)
const rec = await req('GET', '/api/editorial/recurrences');
const nosImages = new Set(s1.body.images.map((i) => i.id));
ok('signaux → événements (nos images tracées)', (rec.body || []).some((o) => nosImages.has(o.image_id) && o.sources.includes(s1.body.sequence.id)));
// Progression alimentée par les séquences
const pr = await req('GET', '/api/progression', null, T);
ok('événements → progression (2 séquences)', pr.body.sequences_traversees === 2);
// Carnet : faits + parole + système, sans boucle interprétative
const cc = await req('GET', '/api/carnet/complet', null, T);
ok('progression → carnet (2 entrées, 3 niveaux)', cc.body.entrees.length === 2 && !!cc.body.niveaux.faits && !!cc.body.niveaux.parole_joueur && !!cc.body.niveaux.propositions_systeme);
// IA : hors socle, formulations du carnet acceptées par les garde-fous (aucune conclusion imposée)
const ia = await req('GET', '/api/ia/statut');
ok('carnet → IA hors socle (niveau 0)', ia.body.socle === false && ia.body.niveau === 0);
ok('pas de boucle choix → profil → interprétation', SANS_BOUCLE({ sg: sg.body, pr: pr.body, cc: cc.body, ia: ia.body }));
await req('DELETE', '/api/me/data', null, T);
await req('DELETE', '/api/me', null, T);

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
