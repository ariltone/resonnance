// Tests Bloc 6.1 — modèle éditorial (stimuli, questions, phases, configs versionnées).
// Usage : serveur démarré sur :3001 puis `node tests/bloc6-1.test.js`
// Données créées préfixées b61-<timestamp> puis archivées en fin de test (aucune suppression).
const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
async function req(method, p, body) {
  const r = await fetch(BASE + p, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}
const SANS_SCORE = (o) => !/score|diagnostic|personnalit|classement|profil_psy|q\.?i\.?|traumatisme/i.test(JSON.stringify(o));

async function main() {
  const U = Date.now();
  const toArchive = { questions: [], stimuli: [], configs: [] };

  // 1. question valide puis rejets
  const q1 = await req('POST', '/api/admin/questions', { type: 'expression', formulation: `b61 voir ${U} ?`, intensite: 2, ordre: 1 });
  ok('question créée', q1.status === 200 && q1.body.id);
  const q1id = q1.body.id; toArchive.questions.push(q1id);
  const qVide = await req('POST', '/api/admin/questions', { type: 'expression', formulation: '   ' });
  ok('question sans formulation rejetée (400)', qVide.status === 400);
  const qInt = await req('POST', '/api/admin/questions', { type: 'expression', formulation: `b61 x ${U}`, intensite: 9 });
  ok('intensité hors 1-3 rejetée (400)', qInt.status === 400);

  // 2. stimulus valide puis rejets
  const s1 = await req('POST', '/api/admin/stimuli', { type: 'question', question_id: q1id, intensite: 2 });
  ok('stimulus créé', s1.status === 200 && s1.body.id);
  const s1id = s1.body.id; toArchive.stimuli.push(s1id);
  const sType = await req('POST', '/api/admin/stimuli', { type: '', question_id: q1id });
  ok('type vide rejeté (400)', sType.status === 400);
  const sRef = await req('POST', '/api/admin/stimuli', { type: 'question', question_id: 999999999 });
  ok('référence inconnue rejetée', sRef.status === 400);
  const sIncoh = await req('POST', '/api/admin/stimuli', { type: 'image', question_id: q1id });
  ok('type/référence incohérents rejetés', sIncoh.status === 400);
  const sDoublon = await req('POST', '/api/admin/stimuli', { type: 'question', question_id: q1id });
  ok('contenu déjà enveloppé rejeté (400)', sDoublon.status === 400);

  // 3. stimulus image sur contenu existant + payload sans score
  const imgs = await req('GET', '/api/images');
  ok('photothèque non vide', imgs.status === 200 && (imgs.body || []).length > 0);
  const enveloppes = await req('GET', '/api/admin/stimuli');
  const dejaEnveloppees = new Set((enveloppes.body || []).filter((s) => s.type === 'image').map((s) => s.contenu && s.contenu.id));
  const imgLibre = (imgs.body || []).find((i) => !dejaEnveloppees.has(i.id));
  ok('image libre disponible', !!imgLibre);
  const sImg = await req('POST', '/api/admin/stimuli', { type: 'image', image_id: imgLibre.id, intensite: 1 });
  ok('stimulus image créé', sImg.status === 200 && sImg.body.id);
  toArchive.stimuli.push(sImg.body.id);
  const all = await req('GET', '/api/admin/stimuli');
  const p1 = (all.body || []).find((s) => s.id === s1id);
  ok('payload stimulus complet', !!p1 && p1.cle === `question-${q1id}` && p1.contenu && p1.contenu.formulation && Array.isArray(p1.phases));
  ok('absence score/diagnostic (payloads)', SANS_SCORE(all.body));

  // 4. inactif exclu des disponibles, réactivé inclus
  const disp1 = await req('GET', '/api/editorial/disponibles?type=question');
  ok('disponibles contient le stimulus', (disp1.body || []).some((s) => s.id === s1id));
  await req('PATCH', `/api/admin/stimuli/${s1id}`, { statut: 'archived' });
  const disp2 = await req('GET', '/api/editorial/disponibles?type=question');
  ok('archivé exclu des disponibles', !(disp2.body || []).some((s) => s.id === s1id));
  await req('PATCH', `/api/admin/stimuli/${s1id}`, { statut: 'active' });
  const disp3 = await req('GET', '/api/editorial/disponibles?type=question');
  ok('réactivé de nouveau disponible', (disp3.body || []).some((s) => s.id === s1id));
  // contenu archivé => enveloppe indisponible
  await req('PATCH', '/api/admin/questions/' + q1id, { statut: 'archived' });
  const disp4 = await req('GET', '/api/editorial/disponibles?type=question');
  ok('contenu archivé => enveloppe indisponible', !(disp4.body || []).some((s) => s.id === s1id));
  await req('PATCH', '/api/admin/questions/' + q1id, { statut: 'active' });

  // 5. variante liée, incohérente rejetée
  const q2 = await req('POST', '/api/admin/questions', { type: 'expression', formulation: `b61 variante ${U} ?`, variante_de: q1id });
  ok('question variante créée', q2.status === 200 && q2.body.id);
  toArchive.questions.push(q2.body.id);
  const s2 = await req('POST', '/api/admin/stimuli', { type: 'question', question_id: q2.body.id, variante_de: s1id });
  ok('stimulus variante liée', s2.status === 200 && s2.body.id);
  toArchive.stimuli.push(s2.body.id);
  const sVarBad = await req('POST', '/api/admin/stimuli', { type: 'image', image_id: imgLibre.id, variante_de: s1id });
  ok('variante de type différent rejetée', sVarBad.status === 400);

  // 6. phases : seed, association, filtre
  const ph = await req('GET', '/api/admin/phases');
  const accueil = (ph.body || []).find((p) => p.name === 'accueil');
  ok('phases seed présentes', !!accueil);
  await req('PATCH', `/api/admin/stimuli/${s1id}`, { phase_ids: [accueil.id] });
  const dispPh = await req('GET', '/api/editorial/disponibles?phase=accueil');
  ok('filtre phase', (dispPh.body || []).some((s) => s.id === s1id));
  const phBad = await req('POST', '/api/admin/stimuli', { type: 'texte', texte_id: 1, phase_ids: [999999999] });
  ok('phase inconnue rejetée', phBad.status === 400);

  // 7. configs versionnées, immuables, auto-incrément
  const c1 = await req('POST', '/api/admin/configs', { nom: `b61cfg${U}`, parametres: { nombre_stimuli: 6, hasard: 80 } });
  ok('config v1 créée', c1.status === 200 && c1.body.version === 1);
  toArchive.configs.push(c1.body.id);
  const c2 = await req('POST', '/api/admin/configs', { nom: `b61cfg${U}`, parametres: { nombre_stimuli: 4 } });
  ok('config v2 auto-incrémentée', c2.status === 200 && c2.body.version === 2);
  toArchive.configs.push(c2.body.id);
  const cBad = await req('POST', '/api/admin/configs', { nom: `b61cfg${U}`, parametres: 'pas-un-objet' });
  ok('parametres non-objet rejetés (400)', cBad.status === 400);
  const cDup = await req('POST', '/api/admin/configs', { nom: `b61cfg${U}`, version: 1, parametres: {} });
  ok('doublon nom+version rejeté (400)', cDup.status === 400);

  // 8. Bloc 5 intact (compatibilité données)
  const carnet = await req('GET', '/api/carnet');
  ok('carnet Bloc 1-4 intact (200)', carnet.status === 200 && Array.isArray(carnet.body));
  const partie = await req('POST', '/api/parties', {});
  ok('partie Bloc 5 intacte (200)', partie.status === 200 && partie.body.partie && !partie.body.partie.terminee);

  // nettoyage : archive tout ce que le test a créé
  for (const id of toArchive.stimuli) await req('PATCH', `/api/admin/stimuli/${id}`, { statut: 'archived' });
  for (const id of toArchive.questions) await req('PATCH', `/api/admin/questions/${id}`, { statut: 'archived' });
  for (const id of toArchive.configs) await req('PATCH', `/api/admin/configs/${id}`, { statut: 'archived' });
  const dispFin = await req('GET', '/api/editorial/disponibles');
  const reste = (dispFin.body || []).filter((s) => toArchive.stimuli.includes(s.id));
  ok('nettoyage : créations archivées', reste.length === 0);

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
