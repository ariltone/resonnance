// Tests Bloc 6.7 — carnet complet : 3 niveaux distincts, restitution sans interprétation.
// Usage : serveur démarré sur :3001 puis `node tests/bloc6-7.test.js`
const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
const SANS_INTERPRETATION = (o) => !/score|diagnostic|personnalit|classement|profil|signifie|révèle|tu es une personne/i.test(JSON.stringify(o));
async function req(method, p, body, token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = 'Bearer ' + token;
  const r = await fetch(BASE + p, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}

const U = Date.now();
const reg = await req('POST', '/api/register', { pseudo: `b67${U}`, password: 'Carnet-8!' });
const T = reg.body.token;
// carnet vide d'abord (aucune donnée non autorisée par défaut)
const vide = await req('GET', '/api/carnet/complet', null, T);
ok('carnet vide : structure sans crash', vide.status === 200 && vide.body.entrees.length === 0 && vide.body.niveaux.faits.length === 0 && vide.body.questions_ouvertes.length === 0);
// séquence avec question + choix + expression
const nw = await req('POST', '/api/session/new', { question: `b67 ouverte ${U} ?` }, T);
const seqId = nw.body.sequence.id;
await req('POST', `/api/session/${seqId}/choix`, { imageId: nw.body.images[0].id }, T);
await req('POST', `/api/session/${seqId}/expression`, { imageId: nw.body.images[0].id, voir: 'b67 voit', ressentir: 'b67 ressent', evoque: 'b67 evoque' }, T);
const cc = await req('GET', '/api/carnet/complet', null, T);
ok('endpoint complet (200)', cc.status === 200 && cc.body.entrees.length === 1);
const niv = cc.body.niveaux;
ok('3 niveaux distincts', !!niv && !!niv.faits && !!niv.parole_joueur && !!niv.propositions_systeme);
const fait = niv.faits[0], parole = niv.parole_joueur[0];
ok('faits : texte/images/choix/date', fait.seq_id === seqId && !!fait.texte && fait.images.length === nw.body.images.length && fait.images.some((i) => i.statut === 'choisie'));
ok('parole : expressions hors des faits', parole.expressions.length === 1 && parole.expressions[0].voir === 'b67 voit' && !('expressions' in fait) && !JSON.stringify(fait).includes('b67 voit'));
ok('question ouverte listée', (cc.body.questions_ouvertes || []).some((q) => q.seq_id === seqId && q.question.includes('b67 ouverte')));
ok('récurrences tracées ou absentes (pas de ponctuel)', (niv.propositions_systeme.recurrences || []).every((o) => o.niveau !== 'ponctuel' && Array.isArray(o.sources)));
ok('ordre et contenu cohérents avec /api/carnet', (await req('GET', '/api/carnet', null, T)).body[0].id === cc.body.entrees[0].id);
ok('aucune interprétation automatique', SANS_INTERPRETATION(cc.body));
await req('DELETE', '/api/me/data', null, T);
await req('DELETE', '/api/me', null, T);

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
