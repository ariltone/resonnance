// Tests unitaires du moteur de tirage — Bloc 6.3 (aucun serveur requis, déterministes).
// Usage : `node tests/moteur-tirage.test.js`
import { composerTirage, hasardControle, melanger, DEFAUT_CONFIG_TIRAGE } from '../src/moteur-tirage.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name} ${extra}`); } };
const SANS_SCORE = (o) => !/score|diagnostic|personnalit|classement|signifi|bonne.?r[eé]ponse|recommand|profil/i.test(JSON.stringify(o));
// 12 candidats, 3 catégories éditoriales (A/B/C), intensités 1-2.
const biblio = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, categorie: 'ABC'[i % 3], intensite: (i % 2) + 1, actif: true }));
const sig = (r) => r.choix.map((c) => c.id).join(',');

const r1 = composerTirage({ candidats: biblio, nombre: 6, random: hasardControle(7) });
const r2 = composerTirage({ candidats: biblio, nombre: 6, random: hasardControle(7) });
ok('graine identique = tirage identique', sig(r1) === sig(r2));
const variantes = new Set([1, 2, 3].map((s) => sig(composerTirage({ candidats: biblio, nombre: 6, random: hasardControle(s) }))));
ok('graines différentes = scénarios distincts possibles', variantes.size >= 2);
const prod = new Set(Array.from({ length: 15 }, () => sig(composerTirage({ candidats: biblio, nombre: 6 }))));
ok('hasard réel variable', prod.size > 1);

const avecInactifs = [...biblio, { id: 99, categorie: 'A', actif: false }];
const rIn = composerTirage({ candidats: avecInactifs, nombre: 6, random: hasardControle(3) });
ok('inactifs jamais sélectionnés', !rIn.choix.some((c) => c.id === 99) && rIn.choix.length === 6);

const rInt = composerTirage({ candidats: biblio, nombre: 6, config: { hasard: 0, intensite_max: 1 }, random: hasardControle(5) });
ok('intensité max respectée', rInt.choix.length === 6 && rInt.choix.every((c) => (c.intensite ?? 1) <= 1));

const rExc = composerTirage({ candidats: biblio, nombre: 6, compatibilites: { 1: 'exclue', 2: 'exclue' }, random: hasardControle(5) });
ok('contexte exclue écarté', !rExc.choix.some((c) => c.id === 1 || c.id === 2) && rExc.infos.exclus_contexte === 2);

const imposes = [biblio[0], biblio[1]];
const rImp = composerTirage({ candidats: biblio, nombre: 6, imposes, random: hasardControle(5) });
ok('imposés comptés sans doublons', rImp.choix.length === 4 && !rImp.choix.some((c) => c.id === 1 || c.id === 2) && rImp.infos.imposes === 2);

const rRed = composerTirage({ candidats: biblio.slice(0, 2), nombre: 6, random: hasardControle(5) });
ok('bibliothèque réduite : repli sans crash', rRed.choix.length === 2);
ok('bibliothèque vide : pas de crash', composerTirage({ candidats: [], nombre: 6 }).choix.length === 0);
ok('nombre 0 : rien', composerTirage({ candidats: biblio, nombre: 0 }).choix.length === 0);

const rDiv = composerTirage({ candidats: biblio, nombre: 6, config: { hasard: 0, diversite_minimale: 3 }, random: hasardControle(11) });
ok('diversité pilotée par métadonnées', rDiv.infos.diversite_atteinte >= 3);

const rHist = composerTirage({ candidats: biblio, nombre: 6, recents: [1, 2, 3, 4], config: { hasard: 0 }, random: hasardControle(5) });
ok('récents exclus par défaut', !rHist.choix.some((c) => [1, 2, 3, 4].includes(c.id)));
const rRepli = composerTirage({ candidats: biblio.slice(0, 3), nombre: 3, recents: [1, 2, 3], random: hasardControle(5) });
ok('repli : exclusion levée plutôt que panne', rRepli.choix.length === 3 && rRepli.infos.exclusion_levee === true);

const tous = composerTirage({ candidats: biblio, nombre: 6, random: hasardControle(5) });
const ids = tous.choix.map((c) => c.id);
ok('aucun doublon', new Set(ids).size === ids.length);
ok('aucun score ni signification exposés', SANS_SCORE(tous) && Object.keys(tous).join() === 'choix,infos' && !('poids' in tous.infos) && !('score' in tous.infos));
ok('melanger ne mute pas', (() => { const a = [1, 2, 3]; melanger(a, hasardControle(1)); return a.join() === '1,2,3'; })());
ok('config par défaut saine', DEFAUT_CONFIG_TIRAGE.hasard === 100 && DEFAUT_CONFIG_TIRAGE.diversite_minimale === 3);

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
