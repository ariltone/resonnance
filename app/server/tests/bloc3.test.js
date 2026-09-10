// Tests Bloc 3 — photothèque : import, URL, catégories, tags, archivage, stats, compat Bloc 2.
// Usage : serveur démarré sur :3001 puis `npm run test:bloc3`
const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
async function req(method, p, body, headers = {}) {
  const r = await fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}

const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

async function main() {
  // 1. conservation existantes + stats
  const imgs = await (await fetch(BASE + '/api/admin/images')).json();
  ok('conservation démo resonance-1', imgs.some(i => i.seed === 'resonance-1'));
  ok('stats existantes', imgs[0]?.stats && typeof imgs[0].stats.apparitions === 'number');

  // 2. catégories (noms uniques par run, catégorie active pour les assignations)
  const U = Date.now();
  const cats = await (await fetch(BASE + '/api/admin/categories')).json();
  ok('catégories non vides', cats.length >= 4);
  const activeCat = cats.find(c => c.status === 'active').id;
  const c1 = await req('POST', '/api/admin/categories', { name: `bloc3test-cat-${U}` });
  ok('création catégorie', c1.status === 200 && c1.body.id, JSON.stringify(c1));
  const cDup = await req('POST', '/api/admin/categories', { name: `BLOC3TEST-CAT-${U}` });
  ok('doublon catégorie insensible casse refusé', cDup.status === 400);
  await req('PATCH', `/api/admin/categories/${c1.body.id}`, { status: 'archived' });
  const img0 = imgs[0].id;
  const assignDisabled = await req('PATCH', `/api/admin/images/${img0}`, { category_id: c1.body.id });
  ok('catégorie désactivée non assignable', assignDisabled.status === 400);

  // 3. tags
  const tags = await (await fetch(BASE + '/api/admin/tags')).json();
  ok('tags incluent solitude', tags.some(t => t.name === 'solitude'));
  const t1 = await req('POST', '/api/admin/tags', { name: `bloc3test-tag-${U}` });
  ok('création tag référentiel', t1.status === 200);
  const tDup = await req('POST', '/api/admin/tags', { name: `Bloc3Test-Tag-${U}` });
  ok('pas de doublons solitude/Solitude', tDup.status === 400);
  await req('PATCH', `/api/admin/tags/${t1.body.id}`, { status: 'archived' });
  const tagDisabled = await req('PATCH', `/api/admin/images/${img0}`, { tag_ids: [t1.body.id] });
  ok('tag désactivé non assignable', tagDisabled.status === 400);

  // 4. tags libres refusés depuis fiche image
  const free1 = await req('PATCH', `/api/admin/images/${img0}`, { tags: 'libre' });
  ok('tag libre refusé fiche image', free1.status === 400);
  const free2 = await req('PATCH', `/api/admin/images/${img0}`, { category: 'libre' });
  ok('catégorie libre refusée fiche image', free2.status === 400);

  // 5. multi-tags via ids
  const solitude = tags.find(t => t.name === 'solitude');
  const choix = tags.find(t => t.name === 'choix');
  const multi = await req('POST', '/api/admin/images', { title: 'BLOC3 multi', url: `https://picsum.photos/seed/bloc3-multi-${U}/600/400`, category_id: activeCat, tag_ids: [solitude.id, choix.id] });
  ok('sélection plusieurs tags', multi.status === 200, JSON.stringify(multi));
  const after = await (await fetch(BASE + '/api/admin/images')).json();
  const created = after.find(i => i.id === multi.body.id);
  ok('2 tags stockés via ids', created && created.tags.length === 2);

  // 6. URL page HTML rejetée
  const html = await req('POST', '/api/admin/images', { title: 'BAD', url: 'https://example.com' });
  ok('URL page HTML rejetée message clair', html.status === 400 && /HTML/.test(html.body.error || ''), JSON.stringify(html));

  // 7. import valide + affichage + stats
  const fd = new FormData();
  fd.append('file', new Blob([png1x1], { type: 'image/png' }), 'test.png');
  fd.append('title', 'BLOC3 import');
  fd.append('category_id', String(activeCat));
  fd.append('tag_ids', JSON.stringify([solitude.id]));
  const imp = await fetch(BASE + '/api/admin/images/import', { method: 'POST', body: fd });
  const impB = await imp.json().catch(() => ({}));
  ok('import image valide', imp.status === 200 && impB.id, JSON.stringify(impB));
  const impRow = (await (await fetch(BASE + '/api/admin/images')).json()).find(i => i.id === impB.id);
  ok('importée visible photothèque + stats', !!impRow && impRow.storage === 'local' && !!impRow.stats);
  const fileResp = await fetch(BASE + impRow.url);
  ok('fichier servi URL interne stable', fileResp.status === 200 && (fileResp.headers.get('content-type') || '').includes('image'));

  // 8. format invalide rejeté
  const fd2 = new FormData();
  fd2.append('file', new Blob(['hello'], { type: 'text/plain' }), 'test.txt');
  fd2.append('title', 'BAD');
  const bad = await fetch(BASE + '/api/admin/images/import', { method: 'POST', body: fd2 });
  ok('format invalide rejeté', bad.status === 400);

  // 9. archivage / désarchivage / exclusion tirage (via /api/images déterministe + tirage sanity)
  await req('PATCH', `/api/admin/images/${impB.id}`, { status: 'archived' });
  const pub = await (await fetch(BASE + '/api/images')).json();
  ok('archivée exclue (liste jeu)', !pub.some(i => i.id === impB.id));
  const s = await req('POST', '/api/session/new', { availability: '', question: '' });
  ok('tirage OK malgré archive', s.status === 200 && s.body.images.length > 0);
  await req('PATCH', `/api/admin/images/${impB.id}`, { status: 'active' });
  const pub2 = await (await fetch(BASE + '/api/images')).json();
  ok('désarchivée revient', pub2.some(i => i.id === impB.id));

  // 10. Bloc 2 intact
  const s2 = await req('POST', '/api/session/new', { availability: 't', question: '' });
  ok('Bloc2 session consigne_type', s2.status === 200 && !!s2.body.consigne_type);
  const st = await req('POST', `/api/session/${s2.body.sequence.id}/statut`, { imageId: s2.body.images[0].id, status: 'choisie' });
  ok('Bloc2 statut choisie', st.status === 200);
  const carnet = await (await fetch(BASE + '/api/carnet')).json();
  ok('Bloc2 carnet', Array.isArray(carnet));

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
