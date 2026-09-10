// Test bout-en-bout Bloc 4 — compte → parcours → retour → exports → suppressions.
// Usage : serveur démarré sur :3001 puis `npm run test:e2e`
// Contraintes : aucune fonctionnalité modifiée, aucune table créée, routes réelles
// uniquement, données nettoyées, reproductible, indépendant de tout existant.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const BASE = process.env.BASE || 'http://localhost:3001';
const PSEUDO = 'e2e_bloc4';
const PASSWORD = 'Resonance-E2E-2026!';
const results = [];
const tick = (name, cond) => { results.push({ name, ok: !!cond }); if (!cond) console.log(`✗ ${name}`); };

async function req(method, p, body, token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = 'Bearer ' + token;
  const r = await fetch(BASE + p, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}

async function main() {
  // Pré-nettoyage : reproductible même après un run interrompu (routes réelles uniquement).
  const pre = await req('POST', '/api/login', { pseudo: PSEUDO, password: PASSWORD });
  if (pre.status === 200 && pre.body.token) {
    await req('DELETE', '/api/me', null, pre.body.token);
  }

  // 1. Création du compte
  const reg = await req('POST', '/api/register', { pseudo: PSEUDO, password: PASSWORD });
  tick('création du compte', (reg.status === 200 || reg.status === 201) && !!reg.body.token);
  const userId = reg.body?.user?.id;
  // Mot de passe jamais en clair (lecture seule, aucune modification).
  const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'resonance.db');
  const stored = new DatabaseSync(dbPath, { readonly: true }).prepare('SELECT password_hash FROM users WHERE pseudo=?').get(PSEUDO)?.password_hash || '';
  tick('création du compte', stored.startsWith('scrypt$') && !stored.includes(PASSWORD));

  // 2. Compte connecté : GET /me, sans sensible exposé.
  const me = await req('GET', '/api/me', null, reg.body.token);
  const meStr = JSON.stringify(me.body);
  tick('authentification', me.status === 200 && me.body?.user?.pseudo === PSEUDO && !/password|hash|token/i.test(meStr.replace(/"user":\{"id":\d+,"pseudo":"e2e_bloc4"\}/, '')) && me.body?.user?.id === userId);

  // 3. Parcours : séquence rattachée auto (jamais de user_id envoyé), visible au carnet.
  const s = await req('POST', '/api/session/new', { availability: 'e2e', question: '' }, reg.body.token);
  const seqId = s.body?.sequence?.id;
  tick('création du parcours', s.status === 200 && !!seqId);
  const carnet = await req('GET', '/api/carnet', null, reg.body.token);
  const mine = (carnet.body || []).find(x => x.id === seqId);
  tick('rattachement utilisateur', !!mine && mine.user_id === userId);

  // 4. Déconnexion : token invalidé.
  const lo = await req('POST', '/api/logout', null, reg.body.token);
  tick('déconnexion', lo.status === 200);
  const dead = await req('GET', '/api/me', null, reg.body.token);
  tick('token invalidé', dead.status === 401);

  // 5. Retour ultérieur : nouveau token, parcours toujours présent.
  const li = await req('POST', '/api/login', { pseudo: PSEUDO, password: PASSWORD });
  tick('reconnexion', li.status === 200 && !!li.body.token && li.body.token !== reg.body.token);
  const t2 = li.body.token;
  const me2 = await req('GET', '/api/me', null, t2);
  tick('reconnexion', me2.status === 200 && me2.body?.user?.id === userId);
  const carnet2 = await req('GET', '/api/carnet', null, t2);
  tick('carnet retrouvé', (carnet2.body || []).some(x => x.id === seqId && x.user_id === userId));

  // 6. Carnet privé : rien d'un autre utilisateur.
  const other = await req('POST', '/api/register', { pseudo: 'e2e_autre', password: PASSWORD });
  const carOther = await req('GET', '/api/carnet', null, other.body.token);
  tick('carnet privé', !(carOther.body || []).some(x => x.id === seqId));
  await req('DELETE', '/api/me', null, other.body.token); // nettoyage compte témoin

  // 7. Export HTML : autonome, contient le parcours.
  const eh = await fetch(BASE + '/api/carnet/export?format=html', { headers: { Authorization: 'Bearer ' + t2 } });
  const ehT = await eh.text();
  tick('export HTML', eh.status === 200 && (eh.headers.get('content-type') || '').includes('text/html') && ehT.includes('<!DOCTYPE html>') && ehT.includes(`#${seqId}`) && !/localhost:5173|localhost:3001\/api/.test(ehT));

  // 8. Export JSON : valide, complet, sans secrets.
  const ej = await fetch(BASE + '/api/carnet/export?format=json', { headers: { Authorization: 'Bearer ' + t2 } });
  const ejB = await ej.json().catch(() => null);
  const ejStr = JSON.stringify(ejB || {});
  tick('export JSON', ej.status === 200 && !!ejB && (ejB.sequences || []).some(x => x.id === seqId) && !/mot de passe|password_hash|Resonance-E2E-2026!|"token"/.test(ejStr));

  // 9. Suppression des données : carnet vide, compte vivant.
  const dd = await req('DELETE', '/api/me/data', null, t2);
  const carEmpty = await req('GET', '/api/carnet', null, t2);
  const alive = await req('GET', '/api/me', null, t2);
  tick('suppression des données', dd.status === 200 && Array.isArray(carEmpty.body) && carEmpty.body.length === 0 && alive.status === 200);

  // 10. Suppression du compte : tout inaccessible.
  const da = await req('DELETE', '/api/me', null, t2);
  const goneMe = await req('GET', '/api/me', null, t2);
  tick('suppression du compte', da.status === 200 && goneMe.status === 401);
  tick('accès impossible après suppression', (await req('POST', `/api/session/${seqId}/statut`, { imageId: 1, status: 'vue' }, t2)).status !== 200);

  // 11. Reconnexion impossible, aucune séquence accessible.
  const relog = await req('POST', '/api/login', { pseudo: PSEUDO, password: PASSWORD });
  tick('accès impossible après suppression', relog.status === 401);
  const anon = await (await fetch(BASE + '/api/carnet')).json().catch(() => []);
  tick('accès impossible après suppression', !(anon || []).some(x => x.id === seqId));

  const labels = ['création du compte', 'authentification', 'création du parcours', 'rattachement utilisateur', 'déconnexion', 'token invalidé', 'reconnexion', 'carnet retrouvé', 'carnet privé', 'export HTML', 'export JSON', 'suppression des données', 'suppression du compte', 'accès impossible après suppression'];
  console.log('\nBLOC 4 E2E');
  let allPass = true;
  for (const l of labels) {
    const rs = results.filter(r => r.name === l);
    const pass = rs.length > 0 && rs.every(r => r.ok);
    if (!pass) allPass = false;
    console.log(`${pass ? '✓' : '✗'} ${l}`);
  }
  console.log(`\nBLOC 4 E2E : ${allPass ? 'PASS' : 'FAIL'}`);
  process.exit(allPass ? 0 : 1);
}
main().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
