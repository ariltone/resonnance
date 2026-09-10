// Tests Bloc 5 — moteur de parcours (parties, progression, reprise, mémoire).
// Usage : serveur démarré sur :3001 puis `node tests/bloc5.test.js`
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
const SANS_SCORE = (o) => !/score|diagnostic|personnalit|classement|profil_psy|q\.?i\.?/i.test(JSON.stringify(o));

async function main() {
  const U = Date.now();
  const clean = [];
  const reg = async (pseudo) => {
    const r = await req('POST', '/api/register', { pseudo, password: 'Parcours-8!' });
    clean.push(r.body.token);
    return r.body.token;
  };
  const tA = await reg(`b5a${U}`);
  const tB = await reg(`b5b${U}`);

  // 1. partie anonyme + authentifiée
  const anon = await req('POST', '/api/parties', {});
  ok('création partie anonyme', anon.status === 200 && anon.body.partie && !anon.body.partie.terminee);
  const auth = await req('POST', '/api/parties', {}, tA);
  ok('création partie authentifiée', auth.status === 200 && auth.body.partie.id);
  const idA = auth.body.partie.id;

  // 2. démarrage = première situation avec choix, sans futur ni score
  const s0 = anon.body.partie.situation;
  ok('première situation affichée', !!s0 && !!s0.titre && !!s0.texte && s0.choix.length === 3);
  ok('futur non révélé', !('suivante' in (anon.body.partie || {})) && !('total' in (anon.body.partie || {})) && !('situations' in anon.body));
  ok('absence score/diagnostic (start)', SANS_SCORE(anon.body));

  // 3. choix + enregistrement complet
  const c1 = await req('POST', `/api/parties/${anon.body.partie.id}/choisir`, { choix_id: s0.choix[0].id });
  const e = c1.body.enregistre || {};
  ok('choix enregistré', c1.status === 200 && e.position === 1 && e.espace && e.situation && e.choix && e.created_at);
  ok('absence score/diagnostic (choix)', SANS_SCORE(c1.body));

  // 4. progression + changement de situation puis d'espace
  ok('progression 1', c1.body.partie.progression.reponses === 1);
  const s1id = c1.body.partie.situation.id;
  ok('changement de situation', s1id !== s0.id);
  const c2 = await req('POST', `/api/parties/${anon.body.partie.id}/choisir`, { choix_id: c1.body.partie.situation.choix[1].id });
  ok('progression 2', c2.body.partie.progression.reponses === 2);
  ok("changement d'espace", c2.body.partie.espace_courant !== e.espace || c2.body.partie.situation.titre === 'Continuer');
  const c3 = await req('POST', `/api/parties/${anon.body.partie.id}/choisir`, { choix_id: c2.body.partie.situation.choix[0].id });
  ok('partie terminée', c3.body.partie.terminee === true && c3.body.partie.situation === null);

  // 5. interruption / reprise / conservation
  const p2 = await req('POST', '/api/parties', {}, tA);
  const idP = p2.body.partie.id;
  const sit0 = p2.body.partie.situation.id;
  await req('POST', `/api/parties/${idP}/choisir`, { choix_id: p2.body.partie.situation.choix[0].id }, tA);
  const intr = await req('POST', `/api/parties/${idP}/interrompre`, null, tA);
  ok('interruption', intr.status === 200 && intr.body.partie.statut === 'en_pause');
  const cur = intr.body.partie.situation;
  const blocked = await req('POST', `/api/parties/${idP}/choisir`, { choix_id: cur.choix[0].id }, tA);
  ok('choix bloqué en pause', blocked.status === 409);
  const repr = await req('POST', `/api/parties/${idP}/reprendre`, null, tA);
  ok('reprise exacte', repr.status === 200 && repr.body.partie.situation.id === cur.id && repr.body.partie.progression.reponses === 1);
  const cont = await req('POST', `/api/parties/${idP}/choisir`, { choix_id: cur.choix[0].id }, tA);
  ok('continuer après reprise', cont.status === 200);

  // 6. mémoire alimentée (choix + fragments, pas de log brut)
  const mem = await req('GET', '/api/memoire', null, tA);
  const mp = (mem.body || []).find(p => p.id === idP);
  ok('carnet/mémoire alimenté', !!mp && mp.reponses.length === 2 && mp.reponses.every(r => r.choix_texte && r.fragment !== undefined));

  // 7. séparation utilisateurs + anonyme sans compte de bout en bout
  const cross = await req('POST', `/api/parties/${idP}/choisir`, { choix_id: 1 }, tB);
  ok('séparation parties (403)', cross.status === 403);
  const memB = await req('GET', '/api/memoire', null, tB);
  ok('mémoire isolée', !(memB.body || []).some(p => p.id === idP));
  const full = await req('POST', '/api/parties', {});
  let pid = full.body.partie.id, done = false;
  for (let i = 0; i < 5 && !done; i++) {
    const st = await req('GET', `/api/parties/${pid}`);
    if (st.body.partie.terminee) { done = true; break; }
    const ch = await req('POST', `/api/parties/${pid}/choisir`, { choix_id: st.body.partie.situation.choix[0].id });
    done = ch.body.partie.terminee;
  }
  ok('partie anonyme bout-en-bout', done);

  // 8. export contient le parcours
  const ej = await fetch(BASE + '/api/carnet/export?format=json', { headers: { Authorization: 'Bearer ' + tA } });
  const ejB = await ej.json();
  ok('export parcours', (ejB.parcours || []).some(p => p.id === idP));

  // nettoyage comptes de test
  await req('DELETE', '/api/me/data', null, tA);
  await req('DELETE', '/api/me', null, tA);
  await req('DELETE', '/api/me', null, tB);

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
