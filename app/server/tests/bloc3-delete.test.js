// Tests fin Bloc 3 — suppression sécurisée.
// Usage : serveur démarré sur :3001 puis `node tests/bloc3-delete.test.js`
const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
async function req(method, p, body) {
  const r = await fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}
const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

async function main() {
  const cats = await (await fetch(BASE + '/api/admin/categories')).json();
  const tags = await (await fetch(BASE + '/api/admin/tags')).json();
  const solitude = tags.find(t => t.name === 'solitude');
  const catId = cats.find(c => c.status === 'active').id;

  // 1. image utilisée -> suppression bloquée 409, toujours présente, archivage proposé.
  // (tirage forcé : on isole la cible en archivant temporairement le reste, puis on restaure)
  const mk = await req('POST', '/api/admin/images', { title: 'DEL used', url: 'https://picsum.photos/seed/del-used-1/600/400', category_id: catId, tag_ids: [solitude.id] });
  ok('création image cible', mk.status === 200 && mk.body.id, JSON.stringify(mk));
  const usedId = mk.body.id;
  const avant = await (await fetch(BASE + '/api/admin/images')).json();
  const actives = avant.filter(i => i.id !== usedId && i.status === 'active');
  for (const o of actives) await req('PATCH', `/api/admin/images/${o.id}`, { status: 'archived' });
  const s0 = await req('POST', '/api/session/new', {});
  const cibleTiree = (s0.body.images || []).some(i => i.id === usedId);
  for (const o of actives) await req('PATCH', `/api/admin/images/${o.id}`, { status: 'active' });
  ok('tirage isolé sur image cible', s0.status === 200 && cibleTiree, JSON.stringify(s0.body.images || []).slice(0, 200));
  const used = await req('DELETE', `/api/admin/images/${usedId}`);
  ok('image utilisée bloquée 409', used.status === 409 && /archiv/i.test(used.body.error || ''), JSON.stringify(used));
  const stillThere = (await (await fetch(BASE + '/api/admin/images')).json()).some(i => i.id === usedId);
  ok('image utilisée conservée', stillThere);
  await req('PATCH', `/api/admin/images/${usedId}`, { status: 'archived' }); // nettoyage : utilisée donc inarchivable-supprimable, sortie du jeu

  // 2. suppression externe sans historique -> définitive
  const ext = await req('POST', '/api/admin/images', { title: 'DEL ext', url: 'https://picsum.photos/seed/del-ext-1/600/400', category_id: catId, tag_ids: [solitude.id] });
  ok('création image à supprimer', ext.status === 200, JSON.stringify(ext));
  const del = await req('DELETE', `/api/admin/images/${ext.body.id}`);
  ok('suppression externe 200', del.status === 200);
  const list = await (await fetch(BASE + '/api/admin/images')).json();
  ok('supprimée absente photothèque', !list.some(i => i.id === ext.body.id));

  // 3. import local puis suppression -> fichier physique supprimé + associations nettoyées
  const fd = new FormData();
  fd.append('file', new Blob([png1x1], { type: 'image/png' }), 'del.png');
  fd.append('title', 'DEL local');
  fd.append('category_id', String(catId));
  fd.append('tag_ids', JSON.stringify([solitude.id]));
  const imp = await fetch(BASE + '/api/admin/images/import', { method: 'POST', body: fd });
  const impB = await imp.json();
  ok('import à supprimer', imp.status === 200 && impB.id);
  const row = (await (await fetch(BASE + '/api/admin/images')).json()).find(i => i.id === impB.id);
  ok('associations tags présentes avant', row && row.tags.length === 1);
  const fileUrl = row.url;
  const delL = await req('DELETE', `/api/admin/images/${impB.id}`);
  ok('suppression locale 200', delL.status === 200);
  const gone = await fetch(BASE + fileUrl);
  ok('fichier uploadé supprimé', gone.status === 404);
  const list2 = await (await fetch(BASE + '/api/admin/images')).json();
  ok('pas de référence orpheline', !list2.some(i => i.id === impB.id));

  // 4. archivage indépendant intact
  const a = await req('POST', '/api/admin/images', { title: 'DEL arch', url: 'https://picsum.photos/seed/del-arch-1/600/400' });
  await req('PATCH', `/api/admin/images/${a.body.id}`, { status: 'archived' });
  const pub = await (await fetch(BASE + '/api/images')).json();
  ok('archive exclue tirage', !pub.some(i => i.id === a.body.id));
  await req('PATCH', `/api/admin/images/${a.body.id}`, { status: 'active' });
  const delA = await req('DELETE', `/api/admin/images/${a.body.id}`);
  ok('archive puis suppression OK', delA.status === 200);

  // 5. inexistante -> 404
  const nf = await req('DELETE', '/api/admin/images/999999');
  ok('inexistante 404', nf.status === 404);

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
