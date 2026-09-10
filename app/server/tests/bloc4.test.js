// Tests Bloc 4 — comptes + carnet privé + exports + suppressions.
// Usage : serveur démarré sur :3001 puis `node tests/bloc4.test.js`
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

async function main() {
  const U = Date.now();
  const A = `b4a${U}`, B = `b4b${U}`, PW = 'motdepasse-8';

  // anonymes existants conservés
  const anonBefore = await (await fetch(BASE + '/api/carnet')).json();
  ok('anonymes conservés', Array.isArray(anonBefore) && anonBefore.length > 0);

  // création + doublon + mot de passe protégé (hash, pas clair)
  const ra = await req('POST', '/api/register', { pseudo: A, password: PW });
  ok('création compte', ra.status === 200 && ra.body.token, JSON.stringify(ra));
  const dup = await req('POST', '/api/register', { pseudo: A.toUpperCase(), password: PW });
  ok('pseudo unique insensible casse', dup.status === 409);
  const weak = await req('POST', '/api/register', { pseudo: `b4w${U}`, password: 'court' });
  ok('mot de passe faible refusé', weak.status === 400);

  // login valide / invalide
  const bad = await req('POST', '/api/login', { pseudo: A, password: 'mauvais-mot-de-passe' });
  ok('login invalide 401', bad.status === 401);
  const li = await req('POST', '/api/login', { pseudo: A, password: PW });
  ok('login valide', li.status === 200 && li.body.token);
  const tA = li.body.token;

  // session : /me avec token
  const me = await req('GET', '/api/me', null, tA);
  ok('session /me', me.status === 200 && me.body.user.pseudo.toLowerCase() === A.toLowerCase());
  const noAuth = await req('GET', '/api/me');
  ok('sans token 401', noAuth.status === 401);
  const fake = await req('GET', '/api/me', null, '0'.repeat(64));
  ok('faux token 401', fake.status === 401);

  // séquence utilisateur + isolement
  const rb = await req('POST', '/api/register', { pseudo: B, password: PW });
  const tB = rb.body.token;
  const sA = await req('POST', '/api/session/new', { availability: 'a', question: '' }, tA);
  ok('séquence utilisateur', sA.status === 200);
  const idA = sA.body.sequence.id;
  const cross = await req('POST', `/api/session/${idA}/statut`, { imageId: sA.body.images[0].id, status: 'choisie' }, tB);
  ok('accès autre utilisateur interdit 403', cross.status === 403);
  const own = await req('POST', `/api/session/${idA}/statut`, { imageId: sA.body.images[0].id, status: 'choisie' }, tA);
  ok('propriétaire autorisé', own.status === 200);
  const carA = await req('GET', '/api/carnet', null, tA);
  ok('carnet A contient sa séquence', carA.body.some(s => s.id === idA));
  const carB = await req('GET', '/api/carnet', null, tB);
  ok('carnet B isolé', !carB.body.some(s => s.id === idA));
  const carAnon = await (await fetch(BASE + '/api/carnet')).json();
  ok('anonymes non rattachés', !carAnon.some(s => s.id === idA) && carAnon.length > 0);

  // exports
  const ej = await fetch(BASE + '/api/carnet/export?format=json', { headers: { Authorization: 'Bearer ' + tA } });
  const ejB = await ej.json();
  ok('export JSON', ej.status === 200 && ejB.pseudo.toLowerCase() === A.toLowerCase() && ejB.sequences.some(s => s.id === idA));
  const eh = await fetch(BASE + '/api/carnet/export?format=html', { headers: { Authorization: 'Bearer ' + tA } });
  const ehT = await eh.text();
  ok('export HTML autonome', eh.status === 200 && ehT.includes('<!DOCTYPE html>') && ehT.includes(A.toLowerCase()) && ehT.includes('@media print'));

  // logout invalide immédiatement
  const lo = await req('POST', '/api/logout', null, tA);
  ok('logout', lo.status === 200);
  const afterLo = await req('GET', '/api/me', null, tA);
  ok('token invalidé après logout', afterLo.status === 401);

  // suppression données (re-login) : carnet vide, compte vivant
  const li2 = await req('POST', '/api/login', { pseudo: A, password: PW });
  const tA2 = li2.body.token;
  const dd = await req('DELETE', '/api/me/data', null, tA2);
  ok('suppression données', dd.status === 200);
  const carEmpty = await req('GET', '/api/carnet', null, tA2);
  ok('carnet vide après suppression', Array.isArray(carEmpty.body) && carEmpty.body.length === 0);
  const stillMe = await req('GET', '/api/me', null, tA2);
  ok('compte vivant après suppression données', stillMe.status === 200);

  // suppression compte : plus aucun accès
  const da = await req('DELETE', '/api/me', null, tA2);
  ok('suppression compte', da.status === 200);
  const goneLogin = await req('POST', '/api/login', { pseudo: A, password: PW });
  ok('login impossible après suppression', goneLogin.status === 401);
  const goneTok = await req('GET', '/api/me', null, tA2);
  ok('token mort après suppression', goneTok.status === 401);

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
