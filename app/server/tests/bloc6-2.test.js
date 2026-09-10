// Tests Bloc 6.2 — historique & mémoire (journal append-only, snapshots, rencontres).
// Usage : serveur démarré sur :3001 puis `node tests/bloc6-2.test.js`
// Données créées via compte jetable, purgées en fin de test (cascade /api/me).
const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
async function req(method, p, body, token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = 'Bearer ' + token;
  const r = await fetch(BASE + p, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}
const SANS_SCORE = (o) => !/score|diagnostic|personnalit|classement|profil_psy|q\.?i\.?|traumatisme|a peur de|tu es\b/i.test(JSON.stringify(o));
const det = (e) => { try { return typeof e.details === 'string' ? JSON.parse(e.details) : (e.details || {}); } catch { return {}; } };
const croissant = (evts) => evts.every((e, i) => i === 0 || (e.id > evts[i - 1].id && e.created_at >= evts[i - 1].created_at));

async function main() {
  const U = Date.now();
  const reg = await req('POST', '/api/register', { pseudo: `b62${U}`, password: 'Memoire-8!' });
  ok('compte de test', reg.status === 200 && reg.body.token);
  const T = reg.body.token;

  // 1. tirage journalisé : une 'presente' par image, positions croissantes, version tracée
  const nw = await req('POST', '/api/session/new', {}, T);
  ok('séquence créée', nw.status === 200 && nw.body.sequence && nw.body.sequence.id);
  const seqId = nw.body.sequence.id;
  const imgs = nw.body.images;
  let ev = await req('GET', `/api/session/${seqId}/evenements`, null, T);
  ok('présentations journalisées', ev.status === 200 && ev.body.length === imgs.length && ev.body.every((e) => e.type === 'presente'));
  ok('ordre chronologique + positions', croissant(ev.body) && ev.body.map((e) => e.position).join(',') === imgs.map((_, i) => i).join(','));
  const cfg = await req('GET', '/api/admin/configs');
  const defaut = (cfg.body || []).filter((c) => c.nom === 'defaut' && c.statut === 'active').sort((a, b) => b.version - a.version)[0];
  ok('version éditoriale tracée', !!defaut && ev.body.every((e) => e.config_version && e.config_editoriale_id === defaut.id));
  ok('absence score/diagnostic (journal)', SANS_SCORE(ev.body));

  // 2. choix puis changement : retrait journalisé, passé non réécrit
  const [imgA, imgB, imgC] = imgs;
  await req('POST', `/api/session/${seqId}/choix`, { imageId: imgA.id }, T);
  await req('POST', `/api/session/${seqId}/choix`, { imageId: imgB.id }, T);
  ev = await req('GET', `/api/session/${seqId}/evenements`, null, T);
  const retire = ev.body.filter((e) => e.type === 'choix_retire' && e.image_id === imgA.id);
  const choisiesA = ev.body.filter((e) => e.type === 'choisie' && e.image_id === imgA.id);
  const choisiesB = ev.body.filter((e) => e.type === 'choisie' && e.image_id === imgB.id);
  ok('retrait de choix journalisé', retire.length === 1);
  ok('passé non réécrit (1er choix conservé)', choisiesA.length === 1 && choisiesB.length === 1);
  ok('chronologie préservée', croissant(ev.body));

  // 3. rejet + expression (silence = fait, texte hors journal)
  await req('POST', `/api/session/${seqId}/statut`, { imageId: imgC.id, status: 'rejetee' }, T);
  await req('POST', `/api/session/${seqId}/expression`, { imageId: imgB.id, silence: true }, T);
  ev = await req('GET', `/api/session/${seqId}/evenements`, null, T);
  ok('rejet journalisé', ev.body.some((e) => e.type === 'rejetee' && e.image_id === imgC.id));
  const expr = ev.body.find((e) => e.type === 'expression');
  ok('expression journalisée sans le texte', !!expr && JSON.stringify(det(expr)).includes('silence') && !('voir' in det(expr)));

  // 4. revisite distinguée au tirage suivant
  const nw2 = await req('POST', '/api/session/new', {}, T);
  const ev2 = await req('GET', `/api/session/${nw2.body.sequence.id}/evenements`, null, T);
  ok('revisite distinguée (deja_vue)', ev2.body.some((e) => e.type === 'presente' && det(e).deja_vue === 1));

  // 5. rencontres : faits agrégés, sans données joueur
  const renc = await req('GET', `/api/editorial/rencontres?image_id=${imgB.id}`);
  const rb = renc.body || {};
  ok('rencontres : vue + choix + séquence', renc.status === 200 && rb.vues >= 1 && rb.choix >= 1 && (rb.sequences || []).some((s) => s.seq_id === seqId));
  ok('rencontres sans fuite (pas de user_id/texte)', !/user_id|voir|ressentir|password|token/i.test(JSON.stringify(rb)));
  ok('absence score/diagnostic (rencontres)', SANS_SCORE(rb));
  const rencBad = await req('GET', '/api/editorial/rencontres?image_id=999999999');
  ok('image inconnue (404)', rencBad.status === 404);

  // 6. partie : config snapshotée, réponse = événement + snapshot intelligible
  const pa = await req('POST', '/api/parties', {}, T);
  const pid = pa.body.partie.id;
  ok('partie snapshotée (config_editoriale_id)', pa.status === 200 && pa.body.partie.config_editoriale_id === defaut.id);
  const ch = await req('POST', `/api/parties/${pid}/choisir`, { choix_id: pa.body.partie.situation.choix[0].id }, T);
  ok('choix de partie', ch.status === 200);
  const hist = await req('GET', `/api/parties/${pid}/historique`, null, T);
  const repEv = (hist.body.evenements || []).filter((e) => e.type === 'reponse');
  ok('réponse = événement', repEv.length === 1 && det(repEv[0]).choix_texte);
  const rep = (hist.body.reponses || [])[0];
  ok('snapshot intelligible (titres/textes conservés)', !!rep && !!rep.situation_titre && !!rep.situation_texte && !!rep.choix_texte);
  ok('absence score/diagnostic (historique)', SANS_SCORE(hist.body));

  // 7. interruption/reprise : mémoire conservée, suite ajoutée
  const nAv = hist.body.evenements.length;
  await req('POST', `/api/parties/${pid}/interrompre`, null, T);
  const histPause = await req('GET', `/api/parties/${pid}/historique`, null, T);
  ok('historique intact en pause', histPause.body.evenements.length === nAv);
  await req('POST', `/api/parties/${pid}/reprendre`, null, T);
  await req('POST', `/api/parties/${pid}/choisir`, { choix_id: histPause.body.partie.situation.choix[0].id }, T);
  const histApres = await req('GET', `/api/parties/${pid}/historique`, null, T);
  ok('reprise : suite ajoutée, rien effacé', histApres.body.evenements.length === nAv + 1 && histApres.body.reponses.length === 2);

  // 8. cascade : suppression des données purge aussi le journal
  await req('DELETE', '/api/me/data', null, T);
  const evGone = await req('GET', `/api/session/${seqId}/evenements`, null, T);
  const histGone = await req('GET', `/api/parties/${pid}/historique`, null, T);
  ok('journal purgé avec les données', evGone.status === 404 && histGone.status === 404);
  await req('DELETE', '/api/me', null, T);

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
