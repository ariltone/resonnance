// Tests Bloc 7 — traversée en 3 temps + rythme + phrases (spec docs/spec-traversee-reglages.md).
// Usage : serveur démarré sur :3001 puis `npm run test:traversee`
const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
async function req(method, p, body) {
  const r = await fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}

async function main() {
  // 1. rythme : défauts affirmés, jamais de panne
  const ry = await (await fetch(BASE + '/api/rythme')).json();
  ok('rythme défaut 6/3/1', ry.taille_tirage === 6 && ry.nombre_tours === 3 && ry.decalage === 1, JSON.stringify(ry));

  // 2. tirage rattaché à une traversée, invariants conservés
  const cle = `T-${Date.now()}`;
  const s1 = await req('POST', '/api/session/new', { traversee: cle });
  ok('session rattachée', s1.status === 200 && s1.body.sequence.id, JSON.stringify(s1.body).slice(0, 200));
  const ids = (s1.body.images || []).map(i => i.id);
  ok('tirage 6 uniques actives', s1.status === 200 && ids.length === 6 && new Set(ids).size === 6);
  const bad = await req('POST', '/api/session/new', { traversee: 'mauvaise cle !!' });
  ok('clé invalide refusée', bad.status === 400);

  // 3. lecture traversée : groupement exact, 404/403 sains
  const t1 = await req('GET', `/api/traversees/${cle}`);
  ok('traversée groupée', t1.status === 200 && t1.body.sequences.length === 1 && t1.body.sequences[0].texte, JSON.stringify(t1.status));
  const t404 = await req('GET', '/api/traversees/T-inexistante-zzz');
  ok('traversée inconnue 404', t404.status === 404);
  const s2 = await req('POST', '/api/session/new', { traversee: cle });
  const t2 = await req('GET', `/api/traversees/${cle}`);
  ok('second tour complète', t2.status === 200 && t2.body.sequences.length === 2);

  // 4. écrit de traversée : upsert, relecture, silence
  const e0 = await req('GET', `/api/traversees/${cle}/ecrit`);
  ok('écrit absent = null', e0.status === 200 && e0.body === null);
  const e1 = await req('POST', `/api/traversees/${cle}/ecrit`, { mot: 'seuil', eveil: 'matin', enchainement: 'passage', silence: false });
  ok('écrit déposé', e1.status === 200 && e1.body.ecrit && e1.body.ecrit.mot === 'seuil');
  const e2 = await req('POST', `/api/traversees/${cle}/ecrit`, { mot: 'porte', silence: true });
  ok('écrit réécrit (upsert)', e2.status === 200 && e2.body.ecrit.mot === 'porte' && e2.body.ecrit.silence === 1);
  const e404 = await req('POST', '/api/traversees/T-inexistante-zzz/ecrit', { mot: 'x' });
  ok('écrit traversée inconnue 404', e404.status === 404);

  // 5. phrases : famille fermée, CRUD, protection historique
  const fam = await req('POST', '/api/admin/textes', { family: 'roman', content: 'test' });
  ok('famille hors liste refusée', fam.status === 400);
  const vide = await req('POST', '/api/admin/textes', { family: 'evocation', content: '   ' });
  ok('contenu vide refusé', vide.status === 400);
  const cr = await req('POST', '/api/admin/textes', { family: 'evocation', content: 'TEST phrase traversée' });
  ok('création phrase', cr.status === 200 && cr.body.id, JSON.stringify(cr));
  const tid = cr.body.id;
  const md = await req('PATCH', `/api/admin/textes/${tid}`, { content: 'TEST phrase modifiée' });
  ok('modification phrase', md.status === 200);
  const mf = await req('PATCH', `/api/admin/textes/${tid}`, { family: 'mauvaise' });
  ok('famille invalide refusée (modif)', mf.status === 400);
  const liste = await (await fetch(BASE + '/api/admin/textes')).json();
  ok('phrase listée', liste.some(t => t.id === tid));
  const del = await req('DELETE', `/api/admin/textes/${tid}`);
  ok('suppression phrase inutilisée', del.status === 200);
  const texteCite = t2.body.sequences[0].texte.id; // s1 cite forcément un texte
  const bloq = await req('DELETE', `/api/admin/textes/${texteCite}`);
  ok('phrase citée bloquée 409', bloq.status === 409 && /archiv/i.test(bloq.body.error || ''), JSON.stringify(bloq).slice(0, 160));

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
