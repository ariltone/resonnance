// Tests Bloc 6.8 — IA hors socle : garde-fous du cahier-IA, aucune génération.
// Partie unitaire (sans serveur) + partie HTTP (serveur :3001).
// Usage : serveur démarré puis `node tests/bloc6-8.test.js`
import { controlerFormulation, verifierSouvenir, niveauIACourant } from '../src/garde-fous-ia.js';

const BASE = process.env.BASE || 'http://localhost:3001';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };

// --- unitaire : interdictions explicites des cahiers ---
const refuse = (t) => !controlerFormulation(t).accepte;
ok('§15 peur abandon', refuse('Tu as peur de l\u2019abandon.'));
ok('§15 confiance', refuse('Tu manques de confiance en toi.'));
ok('§15 anxieuse', refuse('Tu es une personne anxieuse.'));
ok('§15 enfance', refuse('Ton enfance explique probablement cela.'));
ok('§17 rouge/impulsif', refuse('Choisir le rouge signifie que tu es impulsif.'));
ok('§13 jugement instable', refuse('Tu es instable.'));
ok('§22 profil %', refuse('Anxiété : 64 %'));
ok('§23 score soi', refuse('87 % de connaissance de soi'));
ok('§37 certitude', refuse('Cela prouve que tu fuis.'));
const sain = (t) => controlerFormulation(t).accepte;
ok('observation permise', sain('Cette image revient plusieurs fois dans ton parcours.'));
ok('question ouverte permise', sain('Est-ce que ces deux choses s\u2019opposent vraiment pour toi ?'));
ok('fait permis', sain('Tu as choisi cette image.'));
ok('vide accepté (rien à contrôler)', sain(''));
const sauv = verifierSouvenir('Tu avais choisi cette image auparavant (#12).', { images_choisies: [12] });
ok('souvenir fondé accepté', sauv.concerne && sauv.fonde);
const faux = verifierSouvenir('Tu avais choisi cette image auparavant.', { images_choisies: [5] });
ok('souvenir inventé détecté (§35)', faux.concerne && !faux.fonde);
ok('niveau défaut 0 (absente)', niveauIACourant({}) === 0 && niveauIACourant({ niveau_ia: 99 }) === 0);
ok('niveau configurable', niveauIACourant({ niveau_ia: 3 }) === 3);

// --- HTTP : statut hors socle ---
const st = await (await fetch(BASE + '/api/ia/statut')).json().catch(() => ({}));
ok('IA hors socle, niveau 0', st.socle === false && st.niveau === 0);

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
