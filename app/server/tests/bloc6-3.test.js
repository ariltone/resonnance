// Tests Bloc 6.3 — moteur de tirage intégré à /api/session/new (comportement validé conservé).
// Usage : serveur démarré sur :3001 puis `node tests/bloc6-3.test.js`
const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
async function req(method, p, body) {
  const r = await fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}
const SANS_SCORE = (o) => !/score|diagnostic|personnalit|classement|signifi|bonne.?r[eé]ponse|recommand|profil/i.test(JSON.stringify(o));
const sig = (t) => (t.images || []).map((i) => i.id).sort((a, b) => a - b).join(',');

async function main() {
  // 1. tirage par défaut : 6 images uniques, actives
  const t1 = await req('POST', '/api/session/new', {});
  ok('tirage 6 images uniques', t1.status === 200 && t1.body.images.length === 6 && new Set(t1.body.images.map((i) => i.id)).size === 6);
  ok('images actives uniquement', (t1.body.images || []).every((i) => (i.status ?? 'active') === 'active'));

  // 2. archivée jamais proposée (créée pour le test puis supprimée)
  const ext = await req('POST', '/api/admin/images', { title: 'b63-temporaire', url: 'https://inexistant.invalid/b63.png' });
  ok('image de test créée', ext.status === 200 && ext.body.id);
  const xid = ext.body.id;
  await req('PATCH', `/api/admin/images/${xid}`, { status: 'archived' });
  let vue = false;
  for (let k = 0; k < 3; k++) {
    const t = await req('POST', '/api/session/new', {});
    if ((t.body.images || []).some((i) => i.id === xid)) vue = true;
  }
  ok('archivée exclue du tirage', !vue);
  const del = await req('DELETE', `/api/admin/images/${xid}`);
  ok('nettoyage image de test', del.status === 200);

  // 3. le tirage ne modifie pas l'historique existant
  const seq1 = t1.body.sequence.id;
  const avant = await req('GET', `/api/session/${seq1}/evenements`);
  const t2 = await req('POST', '/api/session/new', {});
  const apres = await req('GET', `/api/session/${seq1}/evenements`);
  ok('historique intact après nouveau tirage', t2.status === 200 && JSON.stringify(avant.body) === JSON.stringify(apres.body));

  // 4. variabilité réelle entre tirages
  const signatures = new Set([sig(t1.body), sig(t2.body)]);
  for (let k = 0; k < 6 && signatures.size < 2; k++) {
    const t = await req('POST', '/api/session/new', {});
    signatures.add(sig(t.body));
  }
  ok('tirages variables', signatures.size >= 2);

  // 5. contexte éditorial transmis : texte avant images, consigne présente
  ok('texte + consigne (contexte moteur)', !!t2.body.text && !!t2.body.text.content && !!t2.body.consigne);

  // 6. aucune signification ni valorisation exposée
  ok('pas de signification (F-023)', SANS_SCORE(t2.body) && !(t2.body.images || []).some((i) => /signifi|bonne.?r[eé]ponse|recommand/i.test(JSON.stringify(i))));

  // 7. non-régression du flux validé
  const img = t2.body.images[0];
  const ch = await req('POST', `/api/session/${t2.body.sequence.id}/choix`, { imageId: img.id });
  const ex = await req('POST', `/api/session/${t2.body.sequence.id}/expression`, { imageId: img.id, voir: 'b63', silence: false });
  const carnet = await req('GET', '/api/carnet');
  ok('flux choix/expression/carnet intact', ch.status === 200 && ex.status === 200 && (carnet.body || []).some((s) => s.id === t2.body.sequence.id));

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
