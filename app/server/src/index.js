import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import multer from 'multer';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { composerTirage } from './moteur-tirage.js'; // Bloc 6.3 : sélection déléguée au moteur
import { calculerSignaux } from './signaux.js'; // Bloc 6.4 : signaux comportementaux (lecture seule)
import { analyserRecurrences } from './recurrences.js'; // Bloc 6.5 : récurrences observées (sans effet)
import { etatProgression } from './progression.js'; // Bloc 6.6 : avancement, jamais un score
import { niveauIACourant } from './garde-fous-ia.js'; // Bloc 6.8 : IA hors socle (contrôle seul)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config.json');
const DB_PATH = path.join(ROOT, 'data', 'resonance.db');
const UPLOAD_DIR = path.join(ROOT, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

const db = new DatabaseSync(DB_PATH);
db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS texts(id INTEGER PRIMARY KEY, family TEXT, content TEXT);
CREATE TABLE IF NOT EXISTS images(id INTEGER PRIMARY KEY, seed TEXT UNIQUE, title TEXT, meta TEXT);
CREATE TABLE IF NOT EXISTS sequences(id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT, availability TEXT, question TEXT, text_id INTEGER, consigne TEXT, consigne_type TEXT DEFAULT 'attraction', config_version TEXT);
CREATE TABLE IF NOT EXISTS sequence_images(seq_id INTEGER, image_id INTEGER, position INTEGER, status TEXT DEFAULT 'vue', is_ghost INTEGER DEFAULT 0, PRIMARY KEY(seq_id, image_id));
CREATE TABLE IF NOT EXISTS expressions(seq_id INTEGER, image_id INTEGER, voir TEXT, ressentir TEXT, evoque TEXT, silence INTEGER DEFAULT 0, PRIMARY KEY(seq_id, image_id));
`);
try { db.exec(`ALTER TABLE sequences ADD COLUMN consigne_type TEXT DEFAULT 'attraction'`); } catch {}
try { db.exec(`ALTER TABLE sequence_images ADD COLUMN is_ghost INTEGER DEFAULT 0`); } catch {}
for (const col of [`status TEXT DEFAULT 'active'`, `tags TEXT DEFAULT ''`, `category TEXT DEFAULT ''`, `url TEXT DEFAULT ''`]) {
  try { db.exec(`ALTER TABLE images ADD COLUMN ${col}`); } catch {}
}
// --- Bloc 3 : référentiel + stockage local (migrations additives, données existantes conservées) ---
try { db.exec(`ALTER TABLE images ADD COLUMN storage TEXT DEFAULT 'external'`); } catch {}
try { db.exec(`ALTER TABLE images ADD COLUMN category_id INTEGER`); } catch {}
db.exec(`
CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE COLLATE NOCASE, status TEXT DEFAULT 'active');
CREATE TABLE IF NOT EXISTS tags(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE COLLATE NOCASE, status TEXT DEFAULT 'active');
CREATE TABLE IF NOT EXISTS image_tags(image_id INTEGER, tag_id INTEGER, PRIMARY KEY(image_id, tag_id));
`);
for (const c of ['lieu', 'seuil', 'nature', 'humain', 'objet', 'situation']) {
  try { db.prepare(`INSERT INTO categories(name, status) VALUES (?, 'active')`).run(c); } catch {}
}
for (const t of ['solitude', 'liberté', 'peur', 'mouvement', 'relation', 'choix', 'rupture', 'transformation']) {
  try { db.prepare(`INSERT INTO tags(name, status) VALUES (?, 'active')`).run(t); } catch {}
}
// --- Bloc 4 : comptes + sessions (additif, anonymes existants conservés, jamais rattachés auto) ---
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, pseudo TEXT UNIQUE COLLATE NOCASE, password_hash TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS tokens(token TEXT PRIMARY KEY, user_id INTEGER, created_at TEXT, expires_at TEXT);
`);
try { db.exec(`ALTER TABLE sequences ADD COLUMN user_id INTEGER`); } catch {}
// --- Bloc 5 : moteur de parcours (additif — aucune table Bloc 3/4 touchée) ---
db.exec(`
CREATE TABLE IF NOT EXISTS parcours(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, status TEXT DEFAULT 'active');
CREATE TABLE IF NOT EXISTS espaces(id INTEGER PRIMARY KEY AUTOINCREMENT, parcours_id INTEGER, position INTEGER, name TEXT, status TEXT DEFAULT 'active');
CREATE TABLE IF NOT EXISTS situations(id INTEGER PRIMARY KEY AUTOINCREMENT, espace_id INTEGER, position INTEGER, titre TEXT, texte TEXT, status TEXT DEFAULT 'active');
CREATE TABLE IF NOT EXISTS choix(id INTEGER PRIMARY KEY AUTOINCREMENT, situation_id INTEGER, position INTEGER, texte TEXT, fragment TEXT DEFAULT '', status TEXT DEFAULT 'active');
CREATE TABLE IF NOT EXISTS parties(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, parcours_id INTEGER, statut TEXT DEFAULT 'en_cours', situation_courante_id INTEGER, created_at TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS reponses(id INTEGER PRIMARY KEY AUTOINCREMENT, partie_id INTEGER, position INTEGER, espace_id INTEGER, situation_id INTEGER, choix_id INTEGER, situation_titre TEXT, situation_texte TEXT, choix_texte TEXT, fragment TEXT, created_at TEXT);
`);
if (!db.prepare('SELECT id FROM parcours LIMIT 1').get()) {
  const pid = Number(db.prepare("INSERT INTO parcours(name, status) VALUES ('Première traversée (démo)', 'active')").run().lastInsertRowid);
  const e1 = Number(db.prepare('INSERT INTO espaces(parcours_id, position, name) VALUES (?, 1, ?)').run(pid, 'Le seuil').lastInsertRowid);
  const e2 = Number(db.prepare('INSERT INTO espaces(parcours_id, position, name) VALUES (?, 2, ?)').run(pid, 'Le chemin').lastInsertRowid);
  const mk = (espace, pos, titre, texte, choix) => {
    const sid = Number(db.prepare('INSERT INTO situations(espace_id, position, titre, texte) VALUES (?, ?, ?, ?)').run(espace, pos, titre, texte).lastInsertRowid);
    choix.forEach(([t, f], i) => db.prepare('INSERT INTO choix(situation_id, position, texte, fragment) VALUES (?, ?, ?, ?)').run(sid, i + 1, t, f));
  };
  mk(e1, 1, 'Arriver', "Tu arrives quelque part. Rien ne presse, rien n'est attendu.", [["Faire un pas", "J'ai fait un pas."], ['Rester là un moment', 'Je suis resté là un moment.'], ['Regarder autour', "J'ai regardé autour."]]);
  mk(e1, 2, 'Une direction', "Deux directions s'ouvrent, sans panneau.", [['Aller à gauche', "Je suis allé à gauche."], ['Aller à droite', "Je suis allé à droite."], ['Ne pas choisir tout de suite', "Je n'ai pas choisi tout de suite."]]);
  mk(e2, 1, 'Continuer', 'Le chemin continue. Tu peux aussi t’arrêter ici.', [['Continuer encore un peu', "J'ai continué encore un peu."], ["S'arrêter ici", "Je me suis arrêté ici."], ['Revenir sur mes pas', 'Je suis revenu sur mes pas.']]);
}
function parcoursOrder(parcoursId) {
  return db.prepare(`SELECT s.id AS situation_id, e.id AS espace_id FROM situations s JOIN espaces e ON e.id=s.espace_id WHERE e.parcours_id=? AND e.status='active' AND s.status='active' ORDER BY e.position, s.position`).all(parcoursId);
}
function situationPayload(situationId) {
  // Situation courante uniquement : jamais le futur, jamais de total.
  const s = db.prepare(`SELECT s.id, s.titre, s.texte, e.id AS espace_id, e.name AS espace FROM situations s JOIN espaces e ON e.id=s.espace_id WHERE s.id=?`).get(situationId);
  if (!s) return null;
  return { ...s, choix: db.prepare(`SELECT id, position, texte FROM choix WHERE situation_id=? AND status='active' ORDER BY position`).all(situationId) };
}
function partieAccess(req, res, id) {
  const p = db.prepare('SELECT * FROM parties WHERE id=?').get(id);
  if (!p) { res.status(404).json({ error: 'Partie inconnue.' }); return null; }
  if (p.user_id == null) return p; // anonyme : même esprit que les séquences anonymes
  const u = authOptional(req);
  if (!u || u.id !== p.user_id) { res.status(403).json({ error: 'Accès interdit.' }); return null; }
  return p;
}
function partieState(p) {
  const nb = db.prepare('SELECT COUNT(*) v FROM reponses WHERE partie_id=?').get(p.id).v;
  const cur = p.situation_courante_id ? situationPayload(p.situation_courante_id) : null;
  return { id: p.id, statut: p.statut, config_editoriale_id: p.config_editoriale_id ?? null, espace_courant: cur?.espace ?? null, progression: { reponses: nb }, terminee: p.statut === 'terminee', situation: p.statut === 'terminee' ? null : cur };
}
const SESSION_DAYS = 365;
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const h = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `scrypt$16384$8$1$64$${salt}$${h}`;
}
function verifyPassword(pw, stored) {
  try {
    const [, N, r, p, klen, salt, h] = String(stored).split('$');
    const v = crypto.scryptSync(pw, salt, Number(klen)).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(v, 'hex'), Buffer.from(h, 'hex'));
  } catch { return false; }
}
function createToken(userId) {
  const t = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const exp = new Date(now.getTime() + SESSION_DAYS * 864e5).toISOString();
  db.prepare('INSERT INTO tokens(token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(t, userId, now.toISOString(), exp);
  return { token: t, expires_at: exp };
}
function authOptional(req) {
  // Preuve d'identité = token valide côté serveur uniquement (jamais le seul stockage client).
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  if (!m) return null;
  const row = db.prepare('SELECT t.*, u.pseudo FROM tokens t JOIN users u ON u.id=t.user_id WHERE t.token=?').get(m[1]);
  if (!row || new Date(row.expires_at).getTime() < Date.now()) return null;
  db.prepare('UPDATE tokens SET expires_at=? WHERE token=?').run(new Date(Date.now() + SESSION_DAYS * 864e5).toISOString(), m[1]); // renouvelable à l'usage
  return { id: row.user_id, pseudo: row.pseudo, token: m[1] };
}
function requireAuth(req, res) {
  const u = authOptional(req);
  if (!u) { res.status(401).json({ error: 'Authentification requise.' }); return null; }
  return u;
}
function seqOwner(seqId) {
  return db.prepare('SELECT user_id FROM sequences WHERE id=?').get(seqId);
}
function checkOwnership(req, res, seqId) {
  const seq = seqOwner(seqId);
  if (!seq) { res.status(404).json({ error: 'Séquence inconnue.' }); return false; }
  if (seq.user_id == null) return true; // anonymes historiques : comportement Bloc 2 inchangé
  const u = authOptional(req);
  if (!u || u.id !== seq.user_id) { res.status(403).json({ error: 'Accès interdit.' }); return false; }
  req.user = u;
  return true;
}
for (const im of db.prepare('SELECT * FROM images').all()) {
  try {
    if (im.category && !im.category_id) {
      const n = norm(im.category);
      let cat = db.prepare('SELECT * FROM categories WHERE name=?').get(n);
      if (!cat) { const r = db.prepare('INSERT INTO categories(name) VALUES (?)').run(n); cat = { id: Number(r.lastInsertRowid) }; }
      db.prepare('UPDATE images SET category_id=? WHERE id=?').run(cat.id, im.id);
    }
    if (im.tags) {
      for (const raw of String(im.tags).split(',')) {
        const n = norm(raw);
        if (!n) continue;
        let tag = db.prepare('SELECT * FROM tags WHERE name=?').get(n);
        if (!tag) { const r = db.prepare('INSERT INTO tags(name) VALUES (?)').run(n); tag = { id: Number(r.lastInsertRowid) }; }
        try { db.prepare('INSERT INTO image_tags(image_id, tag_id) VALUES (?, ?)').run(im.id, tag.id); } catch {}
      }
    }
  } catch {}
}
function imageTags(id) {
  return db.prepare('SELECT t.id, t.name, t.status FROM image_tags it JOIN tags t ON t.id=it.tag_id WHERE it.image_id=? ORDER BY t.name').all(id);
}
function imagePayload(r) {
  const st = db.prepare("SELECT COUNT(*) v, SUM(status='choisie') c, SUM(status='rejetee') rj FROM sequence_images WHERE image_id=?").get(r.id);
  const cat = r.category_id ? db.prepare('SELECT id, name, status FROM categories WHERE id=?').get(r.category_id) : null;
  return { ...withUrl(r), category: cat, tags: imageTags(r.id), stats: { apparitions: st.v, selections: st.c ?? 0, rejets: st.rj ?? 0, taux: st.v ? Math.round(((st.c ?? 0) / st.v) * 100) : 0 } };
}
function imgUrl(r) {
  if (r && r.url) return r.url; // externe ou /uploads/xxx local
  return `https://picsum.photos/seed/${r.seed}/600/400`; // démo existante conservée
}
function withUrl(r) { return { ...r, url: imgUrl(r) }; }
const norm = (s) => String(s ?? '').trim().toLowerCase();
function activeById(table, id) {
  return db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id);
}

// Seed minimal si vide
const nTexts = db.prepare('SELECT COUNT(*) v FROM texts').get().v;
if (nTexts === 0) {
  const seedTexts = [
    ['evocation', "Il y a des endroits où l'on reste longtemps après avoir cessé d'y être."],
    ['tension', "Une partie de toi veut avancer. Une autre préfère encore attendre."],
    ['choix', "Tu pourrais rester exactement où tu es. Tu pourrais aussi faire un pas."],
    ['deplacement', "Et si ce que tu considères comme un obstacle était aussi une protection ?"],
    ['projection', "Imagine que personne ne t'attende nulle part. Que choisirais-tu de faire ?"],
    ['evocation', "Certaines images retiennent le regard sans qu'on sache pourquoi."]
  ];
  const ins = db.prepare('INSERT INTO texts(family, content) VALUES (?, ?)');
  for (const t of seedTexts) ins.run(t[0], t[1]);
}
const nImg = db.prepare('SELECT COUNT(*) v FROM images').get().v;
if (nImg === 0) {
  const metas = ['seuil', 'ouverture', 'distance', 'passage', 'attente', 'refuge', 'mouvement', 'immobilite', 'presence', 'absence', 'lumiere', 'contraste'];
  const ins = db.prepare('INSERT INTO images(seed, title, meta) VALUES (?, ?, ?)');
  for (let i = 0; i < 12; i++) ins.run(`resonance-${i + 1}`, `Image ${i + 1}`, metas[i]);
}

const app = express();
app.use(cors());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.json({ limit: '1mb' }));

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const okMime = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    const okExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file.originalname).toLowerCase());
    if (okMime && okExt) cb(null, true);
    else cb(new Error('FORMAT_INVALIDE'));
  }
});

async function checkExternalUrl(url) {
  // Retourne {ok} ou {ok:false, reason}. Ne casse jamais : doute réseau = accepté avec avertissement.
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(url, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow' });
    clearTimeout(t);
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('text/html')) return { ok: false, reason: 'URL pointe vers une page HTML, pas une image.' };
    return { ok: true };
  } catch { return { ok: true, warning: 'Source externe non vérifiée (réseau).' }; }
}
function resolveCategory(id, currentId = null) {
  if (id == null || id === '') return currentId;
  const c = activeById('categories', Number(id));
  if (!c) throw new Error('CATEGORIE_INCONNUE');
  if (c.status !== 'active' && c.id !== currentId) throw new Error('CATEGORIE_DESACTIVEE');
  return c.id;
}
function resolveTags(ids) {
  if (ids == null) return null;
  const arr = Array.isArray(ids) ? ids : JSON.parse(ids);
  const out = [];
  for (const id of arr) {
    const t = activeById('tags', Number(id));
    if (!t) throw new Error('TAG_INCONNU');
    if (t.status !== 'active') throw new Error('TAG_DESACTIVE');
    out.push(t.id);
  }
  return [...new Set(out)];
}

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'resonance', config: loadConfig().version }));

app.get('/api/config', (req, res) => res.json(loadConfig()));

app.get('/api/images', (req, res) => {
  const rows = db.prepare("SELECT * FROM images WHERE COALESCE(status,'active')='active' ORDER BY id").all();
  res.json(rows.map(withUrl));
});

// --- Bloc 3 : admin photothèque (référentiel contrôlé, import local, URL externe secondaire) ---
app.get('/api/admin/images', (req, res) => {
  res.json(db.prepare('SELECT * FROM images ORDER BY id').all().map(imagePayload));
});
// Import fichier local : multipart (file + title + category_id + tag_ids JSON)
app.post('/api/admin/images/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fichier image requis (JPG/PNG/WEBP).' });
    const title = String(req.body.title || req.file.originalname).slice(0, 200);
    const category_id = resolveCategory(req.body.category_id);
    const tagIds = resolveTags(req.body.tag_ids ?? []);
    const rel = `/uploads/${req.file.filename}`;
    const r = db.prepare("INSERT INTO images(seed, title, meta, tags, category, url, storage, status, category_id) VALUES (?, ?, '', '', '', ?, 'local', 'active', ?)").run(`local-${Date.now()}`, title, rel, category_id);
    const id = Number(r.lastInsertRowid);
    for (const t of tagIds) db.prepare('INSERT INTO image_tags(image_id, tag_id) VALUES (?, ?)').run(id, t);
    res.json({ ok: true, id });
  } catch (e) {
    if (req.file) fs.rm(path.join(UPLOAD_DIR, req.file.filename), { force: true }, () => {});
    const m = { CATEGORIE_INCONNUE: 'Catégorie inconnue.', CATEGORIE_DESACTIVEE: 'Catégorie désactivée : choisis une catégorie active.', TAG_INCONNU: 'Tag inconnu du référentiel.', TAG_DESACTIVE: 'Tag désactivé.' }[e.message];
    res.status(400).json({ error: m ?? 'Import impossible.' });
  }
});
// URL externe secondaire (données de test conservées)
app.post('/api/admin/images', async (req, res) => {
  if (typeof req.body?.tags === 'string' || typeof req.body?.category === 'string') {
    return res.status(400).json({ error: 'Tags/categorie libres refuses : utilise category_id et tag_ids du referentiel.' });
  }
  const { title = 'Sans titre', url = '', meta = '' } = req.body ?? {};
  if (!/^https?:\/\/.+/i.test(url)) return res.status(400).json({ error: 'URL externe invalide (https://…).' });
  const check = await checkExternalUrl(url);
  if (!check.ok) return res.status(400).json({ error: check.reason + ' Corrige ou remplace la source.' });
  try {
    const category_id = resolveCategory(req.body.category_id);
    const tagIds = resolveTags(req.body.tag_ids ?? []);
    const r = db.prepare("INSERT INTO images(seed, title, meta, tags, category, url, storage, status, category_id) VALUES (?, ?, ?, '', '', ?, 'external', 'active', ?)").run(`custom-${Date.now()}`, String(title).slice(0, 200), String(meta).slice(0, 200), url, category_id);
    const id = Number(r.lastInsertRowid);
    for (const t of tagIds) db.prepare('INSERT INTO image_tags(image_id, tag_id) VALUES (?, ?)').run(id, t);
    res.json({ ok: true, id, warning: check.warning });
  } catch (e) {
    const m = { CATEGORIE_INCONNUE: 'Catégorie inconnue.', CATEGORIE_DESACTIVEE: 'Catégorie désactivée.', TAG_INCONNU: 'Tag inconnu.', TAG_DESACTIVE: 'Tag désactivé.' }[e.message];
    res.status(400).json({ error: m ?? 'seed deja utilise' });
  }
});
app.patch('/api/admin/images/:id', async (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare('SELECT * FROM images WHERE id=?').get(id);
  if (!cur) return res.status(404).json({ error: 'inconnue' });
  if (typeof req.body?.tags === 'string' || typeof req.body?.category === 'string') {
    return res.status(400).json({ error: 'Tags/categorie libres refuses : utilise category_id et tag_ids du referentiel.' });
  }
  try {
    const v = { ...cur, ...req.body };
    if (req.body.url && req.body.url !== cur.url && cur.storage !== 'local') {
      if (!/^https?:\/\/.+/i.test(req.body.url)) return res.status(400).json({ error: 'URL externe invalide.' });
      const check = await checkExternalUrl(req.body.url);
      if (!check.ok) return res.status(400).json({ error: check.reason });
    }
    const category_id = resolveCategory(req.body.category_id, cur.category_id);
    db.prepare('UPDATE images SET title=?, meta=?, url=?, seed=?, status=?, category_id=? WHERE id=?')
      .run(String(v.title ?? '').slice(0, 200), String(v.meta ?? '').slice(0, 200), v.url ?? '', v.seed, v.status === 'archived' ? 'archived' : 'active', category_id, id);
    if (req.body.tag_ids !== undefined) {
      const tagIds = resolveTags(req.body.tag_ids);
      db.prepare('DELETE FROM image_tags WHERE image_id=?').run(id);
      for (const t of tagIds) db.prepare('INSERT INTO image_tags(image_id, tag_id) VALUES (?, ?)').run(id, t);
    }
    res.json({ ok: true });
  } catch (e) {
    const m = { CATEGORIE_INCONNUE: 'Catégorie inconnue.', CATEGORIE_DESACTIVEE: 'Catégorie désactivée.', TAG_INCONNU: 'Tag inconnu.', TAG_DESACTIVE: 'Tag désactivé.' }[e.message];
    res.status(400).json({ error: m ?? 'Modification impossible.' });
  }
});
// Suppression sécurisée : bloquée si historique (sequence_images), sinon définitive.
app.delete('/api/admin/images/:id', (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare('SELECT * FROM images WHERE id=?').get(id);
  if (!cur) return res.status(404).json({ error: 'inconnue' });
  const used = db.prepare('SELECT COUNT(*) v FROM sequence_images WHERE image_id=?').get(id).v;
  if (used > 0) {
    return res.status(409).json({ error: `Photo utilisée dans ${used} séquence(s) : suppression impossible sans casser l'historique. Archive-la plutôt.`, usedIn: used });
  }
  db.prepare('DELETE FROM image_tags WHERE image_id=?').run(id);
  db.prepare('DELETE FROM expressions WHERE image_id=?').run(id);
  db.prepare('DELETE FROM images WHERE id=?').run(id);
  if (cur.storage === 'local' && cur.url && cur.url.startsWith('/uploads/')) {
    fs.rm(path.join(ROOT, cur.url.replace(/^\//, '')), { force: true }, () => {});
  }
  // Ressource distante (URL externe) : jamais touchée, seule la fiche est supprimée.
  res.json({ ok: true });
});
// Référentiel : création/modif UNIQUEMENT ici (jamais depuis la fiche image)
for (const kind of ['categories', 'tags']) {
  app.get(`/api/admin/${kind}`, (req, res) => {
    const rows = db.prepare(`SELECT * FROM ${kind} ORDER BY name`).all();
    res.json(rows.map(r => ({ ...r, images: db.prepare(kind === 'tags' ? 'SELECT COUNT(*) v FROM image_tags WHERE tag_id=?' : 'SELECT COUNT(*) v FROM images WHERE category_id=?').get(r.id).v })));
  });
  app.post(`/api/admin/${kind}`, (req, res) => {
    const name = norm(req.body?.name);
    if (!name) return res.status(400).json({ error: 'Nom requis.' });
    try {
      const r = db.prepare(`INSERT INTO ${kind}(name) VALUES (?)`).run(name);
      res.json({ ok: true, id: Number(r.lastInsertRowid) });
    } catch { res.status(400).json({ error: 'Doublon refuse (insensible a la casse).' }); }
  });
  app.patch(`/api/admin/${kind}/:id`, (req, res) => {
    const rid = Number(req.params.id);
    try {
      if (req.body.name !== undefined) {
        const name = norm(req.body.name);
        if (!name) return res.status(400).json({ error: 'Nom requis.' });
        db.prepare(`UPDATE ${kind} SET name=? WHERE id=?`).run(name, rid);
      }
      if (req.body.status !== undefined) {
        db.prepare(`UPDATE ${kind} SET status=? WHERE id=?`).run(req.body.status === 'archived' ? 'archived' : 'active', rid);
      }
      res.json({ ok: true });
    } catch { res.status(400).json({ error: 'Doublon refuse.' }); }
  });
}
// Erreurs upload (format invalide -> message clair, photothèque intacte)
app.use((err, req, res, next) => {
  if (err?.message === 'FORMAT_INVALIDE' || err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Format rejete. Acceptes : JPG / PNG / WEBP (8 Mo max).' });
  }
  next(err);
});

function authHandler(kind) {
  return (req, res) => {
    if (kind === 'logout') {
      const u = requireAuth(req, res);
      if (!u) return;
      db.prepare('DELETE FROM tokens WHERE token=?').run(u.token); // invalidation immédiate
      return res.json({ ok: true });
    }
    const pseudo = String(req.body?.pseudo ?? '').trim();
    const password = String(req.body?.password ?? '');
    if (pseudo.length < 2 || pseudo.length > 40) return res.status(400).json({ error: 'Pseudo requis (2-40 caractères).' });
    if (password.length < 8) return res.status(400).json({ error: 'Mot de passe requis (8 caractères minimum).' });
    if (kind === 'register') {
      if (db.prepare('SELECT id FROM users WHERE pseudo=?').get(pseudo)) return res.status(409).json({ error: 'Pseudo déjà utilisé.' });
      const r = db.prepare('INSERT INTO users(pseudo, password_hash, created_at) VALUES (?, ?, ?)').run(pseudo, hashPassword(password), new Date().toISOString());
      const t = createToken(Number(r.lastInsertRowid));
      return res.json({ ok: true, token: t.token, user: { id: Number(r.lastInsertRowid), pseudo } });
    }
    const user = db.prepare('SELECT * FROM users WHERE pseudo=?').get(pseudo);
    if (!user || !verifyPassword(password, user.password_hash)) return res.status(401).json({ error: 'Pseudo ou mot de passe invalide.' });
    const t = createToken(user.id);
    res.json({ ok: true, token: t.token, user: { id: user.id, pseudo: user.pseudo } });
  };
}
app.post('/api/register', authHandler('register'));
app.post('/api/login', authHandler('login'));
app.post('/api/logout', authHandler('logout'));
app.post('/register', authHandler('register'));
app.post('/login', authHandler('login'));
app.post('/logout', authHandler('logout'));
app.get('/api/me', (req, res) => {
  const u = requireAuth(req, res);
  if (!u) return;
  res.json({ ok: true, user: { id: u.id, pseudo: u.pseudo } });
});
app.post('/api/session/new', (req, res) => {
  const cfg = loadConfig();
  const { availability = '', question = '' } = req.body ?? {};
  const texts = db.prepare('SELECT * FROM texts').all();
  const text = texts[Math.floor(Math.random() * texts.length)];
  const consignes = cfg.consignes ?? [{ type: 'attraction', texte: cfg.consigne ?? "Laquelle t'attire ?" }];
  const consigne = consignes[Math.floor(Math.random() * consignes.length)];
  const allImg = db.prepare("SELECT * FROM images WHERE COALESCE(status,'active')='active'").all();
  if (allImg.length === 0) return res.status(400).json({ error: 'photothèque vide (tout archivé)' });
  // Fantômes : images déjà vues mais jamais choisies
  const N = cfg.tirage.nombre_images ?? 6;
  const NB_FANT = cfg.tirage.fantomes ?? 1;
  let ghosts = [];
  try {
    const seen = db.prepare('SELECT image_id, MAX(seq_id) last_seq FROM sequence_images GROUP BY image_id').all();
    const chosen = new Set(db.prepare("SELECT DISTINCT image_id FROM sequence_images WHERE status='choisie'").all().map(r => r.image_id));
    const candidates = seen.filter(r => !chosen.has(r.image_id)).sort((a, b) => b.last_seq - a.last_seq);
    const byId = new Map(allImg.map(i => [i.id, i]));
    ghosts = candidates.slice(0, NB_FANT).map(r => byId.get(r.image_id)).filter(Boolean);
  } catch {}
  const ghostIds = new Set(ghosts.map(g => g.id));
  // Bloc 6.3 : le moteur compose le complément (fantômes imposés = histoire préservée, route inchangée).
  const stimInt = new Map();
  try {
    for (const r of db.prepare('SELECT image_id, intensite FROM stimuli WHERE image_id IS NOT NULL').all()) {
      if (r.intensite != null) stimInt.set(r.image_id, r.intensite);
    }
  } catch {}
  const candidats = allImg
    .filter(i => !ghostIds.has(i.id))
    .map(i => ({ id: i.id, categorie: i.category_id ?? null, intensite: i.intensite ?? (stimInt.has(i.id) ? stimInt.get(i.id) : null), actif: (i.status ?? 'active') === 'active' }));
  let recents = [];
  try {
    const lastSeq = db.prepare('SELECT id FROM sequences ORDER BY id DESC LIMIT 1').get();
    if (lastSeq) recents = db.prepare('SELECT image_id FROM sequence_images WHERE seq_id=?').all(lastSeq.id).map(r => r.image_id);
  } catch {}
  const { choix: choixMoteur } = composerTirage({ candidats, nombre: Math.max(0, N - ghosts.length), recents, config: configMoteurParams(), contexte: { texte: { id: text.id, family: text.family } }, random: Math.random });
  const parId = new Map(allImg.map(i => [i.id, i]));
  const pickedNew = choixMoteur.map(c => parId.get(c.id)).filter(Boolean);
  const picked = [...ghosts.map(g => ({ ...g, fantome: true })), ...pickedNew.map(p => ({ ...p, fantome: false }))].sort(() => Math.random() - 0.5);
  const now = new Date().toISOString();
  const me = authOptional(req); // séquence authentifiée -> appartient à son utilisateur, sinon anonyme
  const r = db.prepare('INSERT INTO sequences(created_at, availability, question, text_id, consigne, consigne_type, config_version, config_editoriale_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(now, availability, question, text.id, consigne.texte, consigne.type, cfg.version, configEditorialeCourante(), me ? me.id : null);
  const seqId = Number(r.lastInsertRowid);
  const ins = db.prepare('INSERT INTO sequence_images(seq_id, image_id, position, is_ghost) VALUES (?, ?, ?, ?)');
  picked.forEach((img, i) => ins.run(seqId, img.id, i, img.fantome ? 1 : 0));
  // Bloc 6.2 : chaque image présentée = un événement (revisite distinguée, jamais déduite).
  picked.forEach((img, i) => {
    try {
      journaliser({ sequence_id: seqId, type: 'presente', image_id: img.id, stimulus_id: stimulusDeImage(img.id), position: i, details: { fantome: img.fantome ? 1 : 0, deja_vue: dejaVue(img.id, seqId) ? 1 : 0 }, config_version: cfg.version, config_editoriale_id: configEditorialeCourante() });
    } catch {}
  });
  res.json({
    sequence: { id: seqId, created_at: now, availability, question, config_version: cfg.version },
    text, consigne: consigne.texte, consigne_type: consigne.type,
    images: picked.map(p => withUrl(p))
  });
});

app.post('/api/session/:id/choix', (req, res) => {
  const seqId = Number(req.params.id);
  const { imageId } = req.body ?? {};
  if (!imageId) return res.status(400).json({ error: 'imageId requis' });
  if (!checkOwnership(req, res, seqId)) return;
  // Compat Bloc 1 : choix unique intuitif, modifiable (préserve les rejetées)
  const precedent = db.prepare("SELECT image_id FROM sequence_images WHERE seq_id=? AND status='choisie'").get(seqId);
  db.prepare("UPDATE sequence_images SET status='vue' WHERE seq_id=? AND status='choisie'").run(seqId);
  const r = db.prepare("UPDATE sequence_images SET status='choisie' WHERE seq_id=? AND image_id=?").run(seqId, imageId);
  if (r.changes === 0) return res.status(404).json({ error: 'image hors tirage' });
  // Bloc 6.2 : le retrait est un événement, pas un effacement (non-réécriture du passé).
  try {
    const seq = db.prepare('SELECT config_version, config_editoriale_id FROM sequences WHERE id=?').get(seqId);
    if (precedent && precedent.image_id !== Number(imageId)) {
      journaliser({ sequence_id: seqId, type: 'choix_retire', image_id: precedent.image_id, stimulus_id: stimulusDeImage(precedent.image_id), details: { via: 'choix' }, config_version: seq?.config_version ?? null, config_editoriale_id: seq?.config_editoriale_id ?? null });
    }
    journaliser({ sequence_id: seqId, type: 'choisie', image_id: Number(imageId), stimulus_id: stimulusDeImage(Number(imageId)), details: { via: 'choix' }, config_version: seq?.config_version ?? null, config_editoriale_id: seq?.config_editoriale_id ?? null });
  } catch {}
  res.json({ ok: true, seqId, imageId });
});

// Bloc 2 : statut explicite vue / choisie / rejetee (rejetées multiples autorisées)
app.post('/api/session/:id/statut', (req, res) => {
  const seqId = Number(req.params.id);
  const { imageId, status } = req.body ?? {};
  if (!imageId || !['vue', 'choisie', 'rejetee'].includes(status)) return res.status(400).json({ error: 'imageId + status(vue|choisie|rejetee) requis' });
  if (!checkOwnership(req, res, seqId)) return;
  const seq = db.prepare('SELECT consigne_type FROM sequences WHERE id=?').get(seqId);
  if (status === 'choisie' && (!seq || seq.consigne_type !== 'repulsion')) {
    db.prepare("UPDATE sequence_images SET status='vue' WHERE seq_id=? AND status='choisie'").run(seqId);
  }
  const r = db.prepare('UPDATE sequence_images SET status=? WHERE seq_id=? AND image_id=?').run(status, seqId, imageId);
  if (r.changes === 0) return res.status(404).json({ error: 'image hors tirage' });
  try {
    const seq = db.prepare('SELECT config_version, config_editoriale_id FROM sequences WHERE id=?').get(seqId);
    journaliser({ sequence_id: seqId, type: status, image_id: Number(imageId), stimulus_id: stimulusDeImage(Number(imageId)), details: { via: 'statut' }, config_version: seq?.config_version ?? null, config_editoriale_id: seq?.config_editoriale_id ?? null });
  } catch {}
  res.json({ ok: true });
});

app.post('/api/session/:id/expression', (req, res) => {
  const seqId = Number(req.params.id);
  const { imageId, voir = '', ressentir = '', evoque = '', silence = false } = req.body ?? {};
  if (!imageId) return res.status(400).json({ error: 'imageId requis' });
  if (!checkOwnership(req, res, seqId)) return;
  db.prepare(`INSERT INTO expressions(seq_id, image_id, voir, ressentir, evoque, silence)
    VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(seq_id, image_id) DO UPDATE SET voir=excluded.voir, ressentir=excluded.ressentir, evoque=excluded.evoque, silence=excluded.silence`)
    .run(seqId, imageId, voir, ressentir, evoque, silence ? 1 : 0);
  // Bloc 6.2 : l'expression est un événement factuel (le texte reste dans expressions, pas dans le journal).
  try {
    const seq = db.prepare('SELECT config_version, config_editoriale_id FROM sequences WHERE id=?').get(seqId);
    journaliser({ sequence_id: seqId, type: 'expression', image_id: Number(imageId), stimulus_id: stimulusDeImage(Number(imageId)), details: { silence: silence ? 1 : 0 }, config_version: seq?.config_version ?? null, config_editoriale_id: seq?.config_editoriale_id ?? null });
  } catch {}
  res.json({ ok: true });
});

// --- Bloc 5 : routes moteur (compte jamais obligatoire) ---
app.post('/api/parties', (req, res) => {
  const me = authOptional(req); // rattachée si connecté (mécanisme Bloc 4), anonyme sinon
  const pid = req.body?.parcours_id;
  const parcours = pid
    ? db.prepare("SELECT * FROM parcours WHERE id=? AND status='active'").get(pid)
    : db.prepare("SELECT * FROM parcours WHERE status='active' ORDER BY id LIMIT 1").get();
  if (!parcours) return res.status(400).json({ error: 'Aucun parcours disponible.' });
  const order = parcoursOrder(parcours.id);
  if (!order.length) return res.status(400).json({ error: 'Parcours vide.' });
  const now = new Date().toISOString();
  const r = db.prepare("INSERT INTO parties(user_id, parcours_id, statut, situation_courante_id, config_editoriale_id, created_at, updated_at) VALUES (?, ?, 'en_cours', ?, ?, ?, ?)").run(me ? me.id : null, parcours.id, order[0].situation_id, configEditorialeCourante(), now, now);
  res.json({ ok: true, partie: partieState(db.prepare('SELECT * FROM parties WHERE id=?').get(Number(r.lastInsertRowid))) });
});
app.get('/api/parties', (req, res) => {
  const me = authOptional(req);
  if (!me) return res.json([]); // anonyme : reprise via ids conservés côté client, rien d'exposé en liste
  res.json(db.prepare('SELECT * FROM parties WHERE user_id=? ORDER BY id DESC').all(me.id).map(partieState));
});
app.get('/api/parties/:id', (req, res) => {
  const p = partieAccess(req, res, Number(req.params.id));
  if (!p) return;
  res.json({ ok: true, partie: partieState(p) });
});
app.post('/api/parties/:id/choisir', (req, res) => {
  const p = partieAccess(req, res, Number(req.params.id));
  if (!p) return;
  if (p.statut !== 'en_cours') return res.status(409).json({ error: p.statut === 'terminee' ? 'Partie terminée.' : 'Partie en pause : reprends-la pour continuer.' });
  const c = db.prepare('SELECT * FROM choix WHERE id=?').get(req.body?.choix_id);
  const cur = situationPayload(p.situation_courante_id);
  if (!c || !cur || c.situation_id !== cur.id || c.status !== 'active') return res.status(400).json({ error: 'Choix invalide pour cette situation.' });
  const pos = db.prepare('SELECT COUNT(*) v FROM reponses WHERE partie_id=?').get(p.id).v + 1;
  const now = new Date().toISOString();
  db.prepare('INSERT INTO reponses(partie_id, position, espace_id, situation_id, choix_id, situation_titre, situation_texte, choix_texte, fragment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(p.id, pos, cur.espace_id, cur.id, c.id, cur.titre, cur.texte, c.texte, c.fragment || '', now);
  // Bloc 6.2 : la réponse est aussi un événement, avec snapshot (la partie reste intelligible si le contenu évolue).
  try {
    journaliser({ partie_id: p.id, type: 'reponse', position: pos, details: { espace: cur.espace, situation_titre: cur.titre, situation_texte: cur.texte, choix_texte: c.texte, fragment: c.fragment || '' }, config_editoriale_id: p.config_editoriale_id ?? null });
  } catch {}
  const order = parcoursOrder(p.parcours_id).map(o => o.situation_id);
  const next = order[order.indexOf(cur.id) + 1] ?? null;
  db.prepare('UPDATE parties SET situation_courante_id=?, statut=?, updated_at=? WHERE id=?').run(next, next ? 'en_cours' : 'terminee', now, p.id);
  const np = db.prepare('SELECT * FROM parties WHERE id=?').get(p.id);
  res.json({ ok: true, enregistre: { position: pos, espace: cur.espace, situation: cur.titre, choix: c.texte, fragment: c.fragment || '', created_at: now }, partie: partieState(np) });
});
app.post('/api/parties/:id/interrompre', (req, res) => {
  const p = partieAccess(req, res, Number(req.params.id));
  if (!p) return;
  if (p.statut !== 'en_cours') return res.status(409).json({ error: 'Partie non en cours.' });
  db.prepare("UPDATE parties SET statut='en_pause', updated_at=? WHERE id=?").run(new Date().toISOString(), p.id);
  res.json({ ok: true, partie: partieState(db.prepare('SELECT * FROM parties WHERE id=?').get(p.id)) });
});
app.post('/api/parties/:id/reprendre', (req, res) => {
  const p = partieAccess(req, res, Number(req.params.id));
  if (!p) return;
  if (p.statut === 'terminee') return res.status(409).json({ error: 'Partie terminée.' });
  if (p.statut === 'en_pause') db.prepare("UPDATE parties SET statut='en_cours', updated_at=? WHERE id=?").run(new Date().toISOString(), p.id);
  res.json({ ok: true, partie: partieState(db.prepare('SELECT * FROM parties WHERE id=?').get(p.id)) });
});
function memoireRows(me) {
  // Mémoire du parcours : passé uniquement (choix + fragments), jamais le futur.
  const parties = me
    ? db.prepare('SELECT p.*, pa.name AS parcours FROM parties p JOIN parcours pa ON pa.id=p.parcours_id WHERE p.user_id=? ORDER BY p.id DESC').all(me.id)
    : db.prepare('SELECT p.*, pa.name AS parcours FROM parties p JOIN parcours pa ON pa.id=p.parcours_id WHERE p.user_id IS NULL ORDER BY p.id DESC').all();
  return parties.map(p => ({ ...partieState(p), parcours: p.parcours, reponses: db.prepare('SELECT position, espace_id, situation_id, choix_id, situation_titre, situation_texte, choix_texte, fragment, created_at FROM reponses WHERE partie_id=? ORDER BY position').all(p.id) }));
}
app.get('/api/memoire', (req, res) => {
  res.json(memoireRows(authOptional(req)));
});
function carnetRows(me) {
  // Privé : utilisateur -> ses séquences ; anonyme -> anonymes historiques uniquement. Aucune fuite.
  const seqs = me
    ? db.prepare('SELECT s.*, t.content AS text_content, t.family AS text_family FROM sequences s LEFT JOIN texts t ON t.id=s.text_id WHERE s.user_id=? ORDER BY s.id DESC').all(me.id)
    : db.prepare('SELECT s.*, t.content AS text_content, t.family AS text_family FROM sequences s LEFT JOIN texts t ON t.id=s.text_id WHERE s.user_id IS NULL ORDER BY s.id DESC').all();
  return seqs.map(s => {
    const imgs = db.prepare('SELECT i.*, si.status, si.position, si.is_ghost FROM sequence_images si JOIN images i ON i.id=si.image_id WHERE si.seq_id=? ORDER BY si.position').all(s.id);
    const exps = db.prepare('SELECT * FROM expressions WHERE seq_id=?').all(s.id);
    return {
      ...s,
      images: imgs.map(i => ({ ...withUrl(i), category: i.category_id ? db.prepare('SELECT id, name FROM categories WHERE id=?').get(i.category_id) : null, tags: imageTags(i.id) })),
      expressions: exps
    };
  });
}
app.get('/api/carnet', (req, res) => {
  res.json(carnetRows(authOptional(req)));
});
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function carnetHTML(pseudo, rows, me) {
  const cards = rows.map(s => {
    const imgs = (s.images || []).map(i => `<figure><img src="${esc(i.url)}" alt="${esc(i.title)}" loading="lazy"><figcaption>${esc(i.title)}${i.status === 'choisie' ? ' · choisie' : i.status === 'rejetee' ? ' · écartée' : ''}</figcaption></figure>`).join('');
    const exps = (s.expressions || []).map(e => e.silence ? '<p><em>Silence gardé.</em></p>' : `<p>Voir : ${esc(e.voir)}</p><p>Ressenti : ${esc(e.ressentir)}</p><p>Évoque : ${esc(e.evoque)}</p>`).join('');
    return `<article><header>#${s.id} — ${esc(new Date(s.created_at).toLocaleString())} — ${esc(s.consigne || '')}</header>${s.question ? `<p class="q">« ${esc(s.question)} »</p>` : ''}<p class="t">${esc(s.text_content)}</p><div class="imgs">${imgs}</div>${exps}</article>`;
  }).join('\n');
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RÉSONANCE — carnet de ${esc(pseudo)}</title><style>body{background:#121014;color:#efe9e3;font-family:Georgia,serif;max-width:760px;margin:0 auto;padding:32px 20px}header.brand{text-align:center;letter-spacing:.4em;color:#d8b4fe;font-size:13px}article{background:#1c191f;border:1px solid #2c2830;border-radius:14px;padding:18px;margin:16px 0}article>header{color:#a89fa8;font-size:13px}.q{font-style:italic}.t{font-size:20px;line-height:1.5}.imgs{display:flex;gap:8px;flex-wrap:wrap}figure{margin:0}img{width:220px;max-width:100%;border-radius:8px}@media print{body{background:#fff;color:#000}article{border-color:#ccc;break-inside:avoid}}</style></head><body><header class="brand">RÉSONANCE</header><h1>Carnet de ${esc(pseudo)}</h1><p>Exporté le ${esc(new Date().toLocaleString())} — ${rows.length} séquence(s). Le joueur donne du sens à ce qu'il choisit.</p>${cards || '<p>Carnet vide.</p>'}${parcoursHTMLSection(me)}</body></html>`;
}
function parcoursHTMLSection(me) {
  const parts = memoireRows(me);
  if (!parts.length) return '';
  const html = parts.map(p => {
    const reps = (p.reponses || []).map(r => `<p><strong>${esc(r.situation_titre)}</strong> — ${esc(r.choix_texte)}${r.fragment ? `<br><em>${esc(r.fragment)}</em>` : ''}</p>`).join('');
    return `<article><header>Parcours « ${esc(p.parcours)} » — partie #${p.id} (${esc(p.statut)})</header>${reps || '<p>Aucun choix encore.</p>'}</article>`;
  }).join('\n');
  return `<h2>Parcours</h2>${html}`;
}
app.get('/api/carnet/export', (req, res) => {
  const me = authOptional(req);
  const rows = carnetRows(me);
  const format = String(req.query.format || 'json');
  if (format === 'html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="carnet-resonance.html"');
    return res.send(carnetHTML(me ? me.pseudo : 'anonyme', rows, me));
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="carnet-resonance.json"');
  res.json({ pseudo: me ? me.pseudo : 'anonyme', exported_at: new Date().toISOString(), version: loadConfig().version, sequences: rows, parcours: memoireRows(me) });
});
function effacerDonneesUtilisateur(userId) {
  // Nécessité Bloc 4 : sans ceci, parties/réponses survivraient à la suppression (données accessibles).
  const pseqs = db.prepare('SELECT id FROM sequences WHERE user_id=?').all(userId).map(r => r.id);
  for (const id of pseqs) {
    db.prepare('DELETE FROM expressions WHERE seq_id=?').run(id);
    db.prepare('DELETE FROM sequence_images WHERE seq_id=?').run(id);
    db.prepare('DELETE FROM evenements WHERE sequence_id=?').run(id); // Bloc 6.2 : le journal suit les séquences
    db.prepare('DELETE FROM sequences WHERE id=?').run(id);
  }
  const parts = db.prepare('SELECT id FROM parties WHERE user_id=?').all(userId).map(r => r.id);
  for (const id of parts) {
    db.prepare('DELETE FROM reponses WHERE partie_id=?').run(id);
    db.prepare('DELETE FROM evenements WHERE partie_id=?').run(id); // Bloc 6.2 : le journal suit les parties
    db.prepare('DELETE FROM parties WHERE id=?').run(id);
  }
  return { sequences: pseqs.length, parties: parts.length };
}
app.delete('/api/me/data', (req, res) => {
  const u = requireAuth(req, res);
  if (!u) return;
  const n = effacerDonneesUtilisateur(u.id);
  res.json({ ok: true, sequences_supprimees: n.sequences, parties_supprimees: n.parties });
});
app.delete('/api/me', (req, res) => {
  const u = requireAuth(req, res);
  if (!u) return;
  effacerDonneesUtilisateur(u.id);
  db.prepare('DELETE FROM tokens WHERE user_id=?').run(u.id); // toutes sessions invalidées
  db.prepare('DELETE FROM users WHERE id=?').run(u.id);
  res.json({ ok: true });
});

// --- Bloc 6.1 : modèle éditorial (matière structurée pour le futur moteur ; aucune logique de sélection ici) ---
// Conventions reprises : statuts 'active'/'archived', référentiel insensible à la casse (norm),
// erreurs nommées -> 400, migrations additives compatibles Bloc 5 (try/catch ALTER, NULL par défaut).
// Vocabulaire volontairement non psychologique : intensité = dosage éditorial, jamais un score du joueur.
db.exec(`
CREATE TABLE IF NOT EXISTS phases(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE COLLATE NOCASE, status TEXT DEFAULT 'active');
CREATE TABLE IF NOT EXISTS questions(id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, formulation TEXT, intensite INTEGER NULL CHECK (intensite IS NULL OR (intensite >= 1 AND intensite <= 3)), variante_de INTEGER NULL REFERENCES questions(id), statut TEXT DEFAULT 'active', ordre INTEGER DEFAULT 0, version INTEGER DEFAULT 1, created_at TEXT);
CREATE TABLE IF NOT EXISTS stimuli(id INTEGER PRIMARY KEY AUTOINCREMENT, cle TEXT UNIQUE, type TEXT, image_id INTEGER NULL, texte_id INTEGER NULL REFERENCES texts(id), question_id INTEGER NULL REFERENCES questions(id), intensite INTEGER NULL CHECK (intensite IS NULL OR (intensite >= 1 AND intensite <= 3)), variante_de INTEGER NULL REFERENCES stimuli(id), statut TEXT DEFAULT 'active', version INTEGER DEFAULT 1, created_at TEXT, CHECK ((image_id IS NOT NULL) + (texte_id IS NOT NULL) + (question_id IS NOT NULL) = 1));
CREATE TABLE IF NOT EXISTS stimulus_phases(stimulus_id INTEGER, phase_id INTEGER, PRIMARY KEY(stimulus_id, phase_id));
CREATE TABLE IF NOT EXISTS configs_editoriales(id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, version INTEGER DEFAULT 1, parametres TEXT DEFAULT '{}', statut TEXT DEFAULT 'active', created_at TEXT, UNIQUE(nom, version));
`);
for (const sql of [
  `ALTER TABLE texts ADD COLUMN statut TEXT DEFAULT 'active'`,
  `ALTER TABLE texts ADD COLUMN intensite INTEGER NULL`,
  `ALTER TABLE texts ADD COLUMN version INTEGER DEFAULT 1`,
  `ALTER TABLE texts ADD COLUMN variante_de INTEGER NULL`,
  `ALTER TABLE images ADD COLUMN intensite INTEGER NULL`,
  `ALTER TABLE sequences ADD COLUMN config_editoriale_id INTEGER NULL`,
  `ALTER TABLE parties ADD COLUMN config_editoriale_id INTEGER NULL`,
]) { try { db.exec(sql); } catch {} }
// Phases = moments éditoriaux neutres, extensibles comme categories/tags (jamais de sens imposé au joueur).
for (const p of ['accueil', 'exploration', 'expression', 'cloture']) {
  try { db.prepare('INSERT INTO phases(name) VALUES (?)').run(p); } catch {}
}
// Config par défaut : miroir des réglages config.json, versionnée en base pour traçabilité future.
if (!db.prepare('SELECT id FROM configs_editoriales WHERE nom=? AND version=1').get('defaut')) {
  const cfg0 = loadConfig();
  db.prepare('INSERT INTO configs_editoriales(nom, version, parametres, created_at) VALUES (?, 1, ?, ?)').run('defaut', JSON.stringify({ nombre_stimuli: cfg0.tirage?.nombre_images ?? 6, fantomes: cfg0.tirage?.fantomes ?? 1, hasard: cfg0.tirage?.hasard ?? 100, diversite_minimale: cfg0.tirage?.diversite_minimale ?? 3 }), new Date().toISOString());
}
const TYPES_STIMULI = ['image', 'texte', 'question']; // extensible : ajouter un type ici, sans toucher au schéma
function asStatut(v, cur = 'active') {
  if (v === undefined) return cur;
  if (v === 'active' || v === 'archived') return v;
  throw new Error('STATUT_INVALIDE');
}
function asIntensite(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  if (![1, 2, 3].includes(n)) throw new Error('INTENSITE_INVALIDE');
  return n;
}
function resolvePhase(id, currentId = null) {
  if (id == null || id === '') return currentId;
  const p = activeById('phases', Number(id));
  if (!p) throw new Error('PHASE_INCONNUE');
  if (p.status !== 'active' && p.id !== currentId) throw new Error('PHASE_DESACTIVEE');
  return p.id;
}
function resolvePhaseIds(ids) {
  if (ids === undefined) return null;
  const arr = Array.isArray(ids) ? ids : JSON.parse(ids);
  return [...new Set(arr.map((id) => resolvePhase(id)))];
}
function contenuStimulus(s) {
  if (s.image_id) { const r = db.prepare('SELECT * FROM images WHERE id=?').get(s.image_id); return r ? { kind: 'image', ...withUrl(r) } : null; }
  if (s.texte_id) { const r = db.prepare('SELECT * FROM texts WHERE id=?').get(s.texte_id); return r ? { kind: 'texte', ...r } : null; }
  if (s.question_id) { const r = db.prepare('SELECT * FROM questions WHERE id=?').get(s.question_id); return r ? { kind: 'question', ...r } : null; }
  return null;
}
function phasesStimulus(id) {
  return db.prepare('SELECT p.id, p.name, p.status FROM stimulus_phases sp JOIN phases p ON p.id=sp.phase_id WHERE sp.stimulus_id=? ORDER BY p.name').all(id);
}
function stimulusPayload(s) {
  return { id: s.id, cle: s.cle, type: s.type, statut: s.statut, intensite: s.intensite, version: s.version, variante_de: s.variante_de, contenu: contenuStimulus(s), phases: phasesStimulus(s.id) };
}
function stimulusDisponible(s) {
  // Disponible = enveloppe active + contenu actif + aucune phase liée archivée. Sans phase = compatible partout.
  if (s.statut !== 'active') return false;
  const c = contenuStimulus(s);
  if (!c) return false;
  if (c.kind === 'image' && (c.status ?? 'active') !== 'active') return false;
  if (c.kind === 'texte' && (c.statut ?? 'active') !== 'active') return false;
  if (c.kind === 'question' && c.statut !== 'active') return false;
  if (phasesStimulus(s.id).some((p) => p.status !== 'active')) return false;
  return true;
}
const EDITO_ERR = { STATUT_INVALIDE: 'Statut invalide (active|archived).', INTENSITE_INVALIDE: 'Intensité invalide (1, 2, 3 ou vide).', PHASE_INCONNUE: 'Phase inconnue.', PHASE_DESACTIVEE: 'Phase désactivée.', REFERENCE_INCONNUE: 'Contenu référencé inconnu.', TYPE_INCONNU: 'Type inconnu (image|texte|question).', VARIANTE_INCOHERENTE: 'Variante incohérente (inexistante ou de type différent).' };
// Phases : référentiel administrable, même esprit que categories/tags.
app.get('/api/admin/phases', (req, res) => {
  res.json(db.prepare('SELECT * FROM phases ORDER BY name').all().map((r) => ({ ...r, stimuli: db.prepare('SELECT COUNT(*) v FROM stimulus_phases WHERE phase_id=?').get(r.id).v })));
});
app.post('/api/admin/phases', (req, res) => {
  const name = norm(req.body?.name);
  if (!name) return res.status(400).json({ error: 'Nom requis.' });
  try {
    const r = db.prepare('INSERT INTO phases(name) VALUES (?)').run(name);
    res.json({ ok: true, id: Number(r.lastInsertRowid) });
  } catch { res.status(400).json({ error: 'Doublon refuse (insensible a la casse).' }); }
});
app.patch('/api/admin/phases/:id', (req, res) => {
  const rid = Number(req.params.id);
  if (!db.prepare('SELECT id FROM phases WHERE id=?').get(rid)) return res.status(404).json({ error: 'Phase inconnue.' });
  try {
    if (req.body.name !== undefined) {
      const name = norm(req.body.name);
      if (!name) return res.status(400).json({ error: 'Nom requis.' });
      db.prepare('UPDATE phases SET name=? WHERE id=?').run(name, rid);
    }
    if (req.body.status !== undefined) {
      db.prepare('UPDATE phases SET status=? WHERE id=?').run(req.body.status === 'archived' ? 'archived' : 'active', rid);
    }
    res.json({ ok: true });
  } catch { res.status(400).json({ error: 'Doublon refuse.' }); }
});
// Questions : caractérisation éditoriale, types extensibles (texte libre non vide).
app.get('/api/admin/questions', (req, res) => {
  res.json(db.prepare('SELECT * FROM questions ORDER BY ordre, id').all());
});
app.post('/api/admin/questions', (req, res) => {
  try {
    const type = norm(req.body?.type);
    const formulation = String(req.body?.formulation ?? '').trim();
    if (!type) return res.status(400).json({ error: 'Type requis.' });
    if (!formulation) return res.status(400).json({ error: 'Formulation requise.' });
    const intensite = asIntensite(req.body?.intensite);
    const ordre = req.body?.ordre === undefined ? 0 : Number(req.body.ordre) || 0;
    let variante = null;
    if (req.body?.variante_de != null && req.body.variante_de !== '') {
      variante = db.prepare('SELECT id FROM questions WHERE id=?').get(Number(req.body.variante_de));
      if (!variante) return res.status(400).json({ error: EDITO_ERR.VARIANTE_INCOHERENTE });
      variante = variante.id;
    }
    const r = db.prepare('INSERT INTO questions(type, formulation, intensite, variante_de, statut, ordre, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(type, formulation.slice(0, 2000), intensite, variante, asStatut(req.body?.statut), ordre, new Date().toISOString());
    res.json({ ok: true, id: Number(r.lastInsertRowid) });
  } catch (e) { res.status(400).json({ error: EDITO_ERR[e.message] ?? 'Question impossible.' }); }
});
app.patch('/api/admin/questions/:id', (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare('SELECT * FROM questions WHERE id=?').get(id);
  if (!cur) return res.status(404).json({ error: 'Question inconnue.' });
  try {
    const formulation = req.body.formulation === undefined ? cur.formulation : String(req.body.formulation).trim();
    if (!formulation) return res.status(400).json({ error: 'Formulation requise.' });
    let variante = cur.variante_de;
    if (req.body.variante_de !== undefined) {
      if (req.body.variante_de == null || req.body.variante_de === '') variante = null;
      else {
        const b = db.prepare('SELECT id FROM questions WHERE id=?').get(Number(req.body.variante_de));
        if (!b || b.id === id) return res.status(400).json({ error: EDITO_ERR.VARIANTE_INCOHERENTE });
        variante = b.id;
      }
    }
    db.prepare('UPDATE questions SET type=?, formulation=?, intensite=?, variante_de=?, statut=?, ordre=?, version=version+1 WHERE id=?')
      .run(norm(req.body.type ?? cur.type) || cur.type, formulation.slice(0, 2000), req.body.intensite === undefined ? cur.intensite : asIntensite(req.body.intensite), variante, asStatut(req.body.statut, cur.statut), req.body.ordre === undefined ? cur.ordre : Number(req.body.ordre) || 0, id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: EDITO_ERR[e.message] ?? 'Modification impossible.' }); }
});
// Stimuli : enveloppe éditoriale stable (cle) autour d'un contenu existant. Type/référence immuables.
function lireReferenceStimulus(body) {
  const refs = [['image', body?.image_id, 'images'], ['texte', body?.texte_id, 'texts'], ['question', body?.question_id, 'questions']].filter(([, v]) => v != null && v !== '');
  if (refs.length !== 1) throw new Error('REFERENCE_INCONNUE');
  const [kind, val, table] = refs[0];
  const row = db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(Number(val));
  if (!row) throw new Error('REFERENCE_INCONNUE');
  return { kind, id: row.id };
}
app.get('/api/admin/stimuli', (req, res) => {
  res.json(db.prepare('SELECT * FROM stimuli ORDER BY id').all().map(stimulusPayload));
});
app.post('/api/admin/stimuli', (req, res) => {
  try {
    const type = norm(req.body?.type);
    if (!TYPES_STIMULI.includes(type)) return res.status(400).json({ error: EDITO_ERR.TYPE_INCONNU });
    const ref = lireReferenceStimulus(req.body);
    if (ref.kind !== type) return res.status(400).json({ error: EDITO_ERR.REFERENCE_INCONNUE });
    const intensite = asIntensite(req.body?.intensite);
    const phaseIds = resolvePhaseIds(req.body?.phase_ids ?? []);
    let variante = null;
    if (req.body?.variante_de != null && req.body.variante_de !== '') {
      const b = db.prepare('SELECT * FROM stimuli WHERE id=?').get(Number(req.body.variante_de));
      if (!b || b.type !== type) return res.status(400).json({ error: EDITO_ERR.VARIANTE_INCOHERENTE });
      variante = b.id;
    }
    const col = ref.kind === 'image' ? 'image_id' : ref.kind === 'texte' ? 'texte_id' : 'question_id';
    const nul = { image_id: null, texte_id: null, question_id: null, [col]: ref.id };
    const r = db.prepare('INSERT INTO stimuli(cle, type, image_id, texte_id, question_id, intensite, variante_de, statut, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(`${type}-${ref.id}`, type, nul.image_id, nul.texte_id, nul.question_id, intensite, variante, asStatut(req.body?.statut), new Date().toISOString());
    const id = Number(r.lastInsertRowid);
    for (const p of phaseIds) db.prepare('INSERT INTO stimulus_phases(stimulus_id, phase_id) VALUES (?, ?)').run(id, p);
    res.json({ ok: true, id });
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return res.status(400).json({ error: 'Contenu déjà enveloppé (un stimulus par contenu).' });
    res.status(400).json({ error: EDITO_ERR[e.message] ?? 'Stimulus impossible.' });
  }
});
app.patch('/api/admin/stimuli/:id', (req, res) => {
  const id = Number(req.params.id);
  const cur = db.prepare('SELECT * FROM stimuli WHERE id=?').get(id);
  if (!cur) return res.status(404).json({ error: 'Stimulus inconnu.' });
  try {
    let variante = cur.variante_de;
    if (req.body.variante_de !== undefined) {
      if (req.body.variante_de == null || req.body.variante_de === '') variante = null;
      else {
        const b = db.prepare('SELECT * FROM stimuli WHERE id=?').get(Number(req.body.variante_de));
        if (!b || b.id === id || b.type !== cur.type) return res.status(400).json({ error: EDITO_ERR.VARIANTE_INCOHERENTE });
        variante = b.id;
      }
    }
    db.prepare('UPDATE stimuli SET intensite=?, variante_de=?, statut=?, version=version+1 WHERE id=?')
      .run(req.body.intensite === undefined ? cur.intensite : asIntensite(req.body.intensite), variante, asStatut(req.body.statut, cur.statut), id);
    if (req.body.phase_ids !== undefined) {
      const phaseIds = resolvePhaseIds(req.body.phase_ids);
      db.prepare('DELETE FROM stimulus_phases WHERE stimulus_id=?').run(id);
      for (const p of phaseIds) db.prepare('INSERT INTO stimulus_phases(stimulus_id, phase_id) VALUES (?, ?)').run(id, p);
    }
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: EDITO_ERR[e.message] ?? 'Modification impossible.' }); }
});
// Configs éditoriales : stockage versionné (UNIQUE nom+version), versions immuables (PATCH = statut seul).
app.get('/api/admin/configs', (req, res) => {
  res.json(db.prepare('SELECT * FROM configs_editoriales ORDER BY nom, version').all().map((r) => ({ ...r, parametres: JSON.parse(r.parametres || '{}') })));
});
app.post('/api/admin/configs', (req, res) => {
  const nom = norm(req.body?.nom);
  if (!nom) return res.status(400).json({ error: 'Nom requis.' });
  const params = req.body?.parametres;
  if (!params || typeof params !== 'object' || Array.isArray(params)) return res.status(400).json({ error: 'Parametres requis (objet JSON).' });
  try {
    const version = req.body?.version === undefined || req.body.version === null || req.body.version === ''
      ? (db.prepare('SELECT COALESCE(MAX(version), 0) v FROM configs_editoriales WHERE nom=?').get(nom).v + 1)
      : Number(req.body.version);
    if (!Number.isInteger(version) || version < 1) return res.status(400).json({ error: 'Version invalide.' });
    const r = db.prepare('INSERT INTO configs_editoriales(nom, version, parametres, statut, created_at) VALUES (?, ?, ?, ?, ?)').run(nom, version, JSON.stringify(params), asStatut(req.body?.statut), new Date().toISOString());
    res.json({ ok: true, id: Number(r.lastInsertRowid), version });
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return res.status(400).json({ error: 'Version déjà existante pour ce nom.' });
    res.status(400).json({ error: EDITO_ERR[e.message] ?? 'Config impossible.' });
  }
});
app.patch('/api/admin/configs/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT id FROM configs_editoriales WHERE id=?').get(id)) return res.status(404).json({ error: 'Config inconnue.' });
  try {
    db.prepare('UPDATE configs_editoriales SET statut=? WHERE id=?').run(asStatut(req.body?.statut), id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: EDITO_ERR[e.message] ?? 'Modification impossible.' }); }
});
// Lecture publique : matière disponible pour le futur moteur (actifs uniquement, jamais d'inactif).
app.get('/api/editorial/disponibles', (req, res) => {
  const type = req.query.type ? norm(req.query.type) : null;
  const phase = req.query.phase ? norm(req.query.phase) : null;
  let rows = db.prepare('SELECT * FROM stimuli ORDER BY id').all().filter(stimulusDisponible);
  if (type) rows = rows.filter((s) => s.type === type);
  if (phase) rows = rows.filter((s) => phasesStimulus(s.id).some((p) => p.name === phase && p.status === 'active'));
  res.json(rows.map(stimulusPayload));
});

// --- Bloc 6.3 : paramètres moteur (config « defaut » active max ; clés inconnues ignorées, extensible) ---
function configMoteurParams() {
  try {
    const r = db.prepare("SELECT parametres FROM configs_editoriales WHERE nom='defaut' AND statut='active' ORDER BY version DESC LIMIT 1").get();
    if (!r) return {};
    const p = JSON.parse(r.parametres || '{}');
    return (p && typeof p === 'object' && !Array.isArray(p)) ? p : {};
  } catch { return {}; }
}
// --- Bloc 6.2 : historique & mémoire (faits Niveau 1 uniquement, jamais d'interprétation) ---
// Journal append-only : on ajoute des événements, on ne réécrit jamais le passé.
// Les statuts « ignoré / choisi ultérieurement » se dérivent plus tard (présenté sans suite,
// choisie après une présentation antérieure) : le futur moteur les calculera, pas ce bloc.
db.exec(`
CREATE TABLE IF NOT EXISTS evenements(id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT, partie_id INTEGER NULL REFERENCES parties(id), sequence_id INTEGER NULL REFERENCES sequences(id), type TEXT, image_id INTEGER NULL, stimulus_id INTEGER NULL REFERENCES stimuli(id), position INTEGER NULL, details TEXT DEFAULT '{}', config_version TEXT NULL, config_editoriale_id INTEGER NULL);
`);
const TYPES_EVENEMENTS = ['presente', 'vue', 'choisie', 'choix_retire', 'rejetee', 'expression', 'reponse']; // extensible : ajouter un type ici
function configEditorialeCourante() {
  // Snapshot discret : la config « defaut » active la plus récente, ou NULL si aucune.
  try {
    const r = db.prepare("SELECT id FROM configs_editoriales WHERE nom='defaut' AND statut='active' ORDER BY version DESC LIMIT 1").get();
    return r ? r.id : null;
  } catch { return null; }
}
function stimulusDeImage(imageId) {
  try {
    const r = db.prepare("SELECT id FROM stimuli WHERE image_id=?").get(imageId);
    return r ? r.id : null;
  } catch { return null; }
}
function dejaVue(imageId, seqId) {
  // Rencontre antérieure dans une autre séquence (lignes historiques + événements).
  const lig = db.prepare('SELECT COUNT(*) v FROM sequence_images WHERE image_id=? AND seq_id<>?').get(imageId, seqId).v;
  if (lig > 0) return true;
  return db.prepare("SELECT COUNT(*) v FROM evenements WHERE image_id=? AND type='presente' AND (sequence_id IS NULL OR sequence_id<>?)").get(imageId, seqId).v > 0;
}
function journaliser(evt) {
  if (!TYPES_EVENEMENTS.includes(evt.type)) throw new Error('TYPE_EVENEMENT_INCONNU');
  const now = new Date().toISOString();
  const r = db.prepare('INSERT INTO evenements(created_at, partie_id, sequence_id, type, image_id, stimulus_id, position, details, config_version, config_editoriale_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(now, evt.partie_id ?? null, evt.sequence_id ?? null, evt.type, evt.image_id ?? null, evt.stimulus_id ?? null, evt.position ?? null, JSON.stringify(evt.details ?? {}), evt.config_version ?? null, evt.config_editoriale_id ?? null);
  return Number(r.lastInsertRowid);
}
// Lecture : événements d'une séquence (même contrôle d'accès que le carnet).
app.get('/api/session/:id/evenements', (req, res) => {
  const seqId = Number(req.params.id);
  if (!checkOwnership(req, res, seqId)) return;
  res.json(db.prepare('SELECT * FROM evenements WHERE sequence_id=? ORDER BY id').all(seqId));
});
// Lecture : historique d'une partie (événements + réponses déjà snapshotées en Bloc 5).
app.get('/api/parties/:id/historique', (req, res) => {
  const p = partieAccess(req, res, Number(req.params.id));
  if (!p) return;
  res.json({
    partie: partieState(p),
    evenements: db.prepare('SELECT * FROM evenements WHERE partie_id=? ORDER BY id').all(p.id),
    reponses: db.prepare('SELECT position, espace_id, situation_id, choix_id, situation_titre, situation_texte, choix_texte, fragment, created_at FROM reponses WHERE partie_id=? ORDER BY position').all(p.id)
  });
});
// Lecture : rencontres d'une image (agrégats publics, même esprit que les stats /api/images ; aucune donnée joueur).
app.get('/api/editorial/rencontres', (req, res) => {
  const imageId = Number(req.query.image_id);
  if (!imageId) return res.status(400).json({ error: 'image_id requis.' });
  if (!db.prepare('SELECT id FROM images WHERE id=?').get(imageId)) return res.status(404).json({ error: 'Image inconnue.' });
  const lignes = db.prepare('SELECT si.*, s.created_at FROM sequence_images si JOIN sequences s ON s.id=si.seq_id WHERE si.image_id=? ORDER BY s.id').all(imageId);
  let revisites = 0;
  try {
    revisites = db.prepare("SELECT COUNT(*) v FROM evenements WHERE image_id=? AND type='presente' AND json_extract(details, '$.deja_vue')=1").get(imageId).v;
  } catch {}
  const premier = lignes.length ? lignes[0].created_at : null;
  const dernier = lignes.length ? lignes[lignes.length - 1].created_at : null;
  res.json({
    image_id: imageId,
    vues: lignes.length,
    choix: lignes.filter((l) => l.status === 'choisie').length,
    rejets: lignes.filter((l) => l.status === 'rejetee').length,
    revisites,
    premier, dernier,
    sequences: lignes.map((l) => ({ seq_id: l.seq_id, date: l.created_at, statut: l.status, fantome: !!l.is_ghost }))
  });
});

// --- Bloc 6.4 : signaux (lecture seule, mêmes contrôles d'accès que l'historique) ---
app.get('/api/session/:id/signaux', (req, res) => {
  const seqId = Number(req.params.id);
  if (!checkOwnership(req, res, seqId)) return;
  const seq = db.prepare('SELECT created_at FROM sequences WHERE id=?').get(seqId);
  res.json(calculerSignaux(db.prepare('SELECT * FROM evenements WHERE sequence_id=? ORDER BY id').all(seqId), seq?.created_at ?? null));
});
app.get('/api/parties/:id/signaux', (req, res) => {
  const p = partieAccess(req, res, Number(req.params.id));
  if (!p) return;
  res.json(calculerSignaux(db.prepare('SELECT * FROM evenements WHERE partie_id=? ORDER BY id').all(p.id), p.created_at ?? null));
});

// --- Bloc 6.5 : récurrences observées (agrégats publics, traçabilité cahier-IA §36) ---
function seuilsRecurrenceCourants() {
  try {
    const p = configMoteurParams();
    const s = p.seuils_recurrence;
    if (s && typeof s === 'object' && !Array.isArray(s)) return s;
  } catch {}
  return {};
}
app.get('/api/editorial/recurrences', (req, res) => {
  const lignes = db.prepare('SELECT si.image_id, si.seq_id, si.status AS statut, si.is_ghost AS fantome FROM sequence_images si').all();
  res.json(analyserRecurrences(lignes, seuilsRecurrenceCourants()));
});

// --- Bloc 6.6 : progression (avancement = séquences traversées, règles §16) ---
function paliersPhaseCourants() {
  try {
    const p = configMoteurParams();
    if (Array.isArray(p.paliers_phase)) return p.paliers_phase;
  } catch {}
  return undefined; // → défauts techniques du module (à valider humainement)
}
app.get('/api/progression', (req, res) => {
  const me = authOptional(req);
  const n = me
    ? db.prepare('SELECT COUNT(*) v FROM sequences WHERE user_id=?').get(me.id).v
    : db.prepare('SELECT COUNT(*) v FROM sequences WHERE user_id IS NULL').get().v;
  res.json(etatProgression(n, paliersPhaseCourants()));
});

// --- Bloc 6.7 : carnet complet (3 niveaux règles §32, sans réécrire le carnet existant) ---
app.get('/api/carnet/complet', (req, res) => {
  const me = authOptional(req);
  const entrees = carnetRows(me); // existant, inchangé (ordre et contenu conservés)
  const seqIds = new Set(entrees.map((s) => s.id));
  const lignes = db.prepare('SELECT si.image_id, si.seq_id, si.status AS statut, si.is_ghost AS fantome FROM sequence_images si').all()
    .filter((l) => seqIds.has(l.seq_id));
  const recurrences = analyserRecurrences(lignes, seuilsRecurrenceCourants()).filter((o) => o.niveau !== 'ponctuel');
  res.json({
    entrees,
    niveaux: {
      faits: entrees.map((s) => ({ seq_id: s.id, created_at: s.created_at, texte: s.text_content, images: (s.images || []).map((i) => ({ id: i.id, titre: i.title, statut: i.status })) })),
      parole_joueur: entrees.map((s) => ({ seq_id: s.id, question: s.question, availability: s.availability, expressions: s.expressions })),
      propositions_systeme: { recurrences, note: 'Observations traçables, jamais des conclusions.' }
    },
    questions_ouvertes: entrees.filter((s) => s.question).map((s) => ({ seq_id: s.id, question: s.question, created_at: s.created_at }))
  });
});

// --- Bloc 6.8 : IA hors socle (transparence ; niveau configurable cahier-IA §38 ; génération = à spécifier) ---
app.get('/api/ia/statut', (req, res) => {
  res.json({ socle: false, niveau: niveauIACourant(configMoteurParams()), note: 'Aucune génération dans le socle. Fonctions IA à spécifier.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`RESONANCE api :${PORT} db=${DB_PATH}`));
