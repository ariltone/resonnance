import { useEffect, useState } from 'react';
import { api } from './lib/api';
import Admin from './Admin';

// Menu Réglages (spec docs/spec-traversee-reglages.md) : Rythme (jeu), Phrases (textes),
// Photothèque (admin existante, déménagée ici). Les versions de config sont immuables :
// chaque enregistrement crée une nouvelle version (retour possible), jamais de réécriture.

const FAMILLES = ['evocation', 'tension', 'choix', 'deplacement', 'projection'];
const FABLE = /\b(renard|lièvre|lievre|loup|loups|roi|reine|mendiant|prince|princesse|berger|chevalier)\b/i;
const ADRESSE = /\b(tu|te|toi|ton|ta|tes)\b|t['’]/i;

function avertissements(contenu: string): string[] {
  const a: string[] = [];
  const mots = contenu.trim().split(/\s+/).filter(Boolean).length;
  if (contenu && (mots < 8 || mots > 22)) a.push(`Longueur : ${mots} mots (8–22 recommandés).`);
  if (ADRESSE.test(contenu)) a.push('Adresse directe (« tu ») : la phrase devrait parler du monde, pas au joueur.');
  if (FABLE.test(contenu)) a.push('Personnage-fable détecté : risque de récit interprétant à la place du joueur.');
  return a;
}

export default function Reglages() {
  const [onglet, setOnglet] = useState<'rythme' | 'phrases' | 'photos'>('rythme');
  const [msg, setMsg] = useState('');

  // Rythme
  const [rythme, setRythme] = useState({ taille_tirage: 6, nombre_tours: 3, decalage: 1 });
  const [version, setVersion] = useState('');
  const chargerRythme = async () => {
    const r = await api.rythme().catch(() => null);
    if (r) setRythme({ taille_tirage: r.taille_tirage ?? 6, nombre_tours: r.nombre_tours ?? 3, decalage: r.decalage ?? 1 });
    const cfgs = await api.configs().catch(() => []);
    const def = cfgs.filter((c: any) => c.nom === 'defaut' && c.statut === 'active').sort((a: any, b: any) => b.version - a.version)[0];
    if (def) setVersion(`« defaut » v${def.version}`);
  };
  useEffect(() => { chargerRythme(); }, []);
  const sauverRythme = async () => {
    setMsg('');
    try {
      const cfgs = await api.configs().catch(() => []);
      const def = cfgs.filter((c: any) => c.nom === 'defaut').sort((a: any, b: any) => b.version - a.version)[0];
      const base = def?.parametres ?? {};
      const r = await api.configAdd({ nom: 'defaut', parametres: { ...base, ...rythme } });
      setVersion(`« defaut » v${r.version}`);
      setMsg(`Rythme enregistré (${`« defaut » v${r.version}`}). S'applique aux nouvelles traversées.`);
    } catch (e: any) {
      setMsg(e.message || 'Enregistrement impossible.');
    }
  };

  // Phrases
  const [phrases, setPhrases] = useState<any[]>([]);
  const [nouveau, setNouveau] = useState('');
  const [nouvelleFam, setNouvelleFam] = useState('evocation');
  const [edition, setEdition] = useState<Record<number, { content: string; family: string }>>({});
  const chargerPhrases = async () => {
    setPhrases(await api.textes().catch(() => []));
  };
  useEffect(() => { chargerPhrases(); }, []);
  const ajouterPhrase = async () => {
    setMsg('');
    try {
      await api.texteAdd({ family: nouvelleFam, content: nouveau });
      setNouveau('');
      await chargerPhrases();
    } catch (e: any) {
      setMsg(e.message || 'Ajout impossible.');
    }
  };

  return (
    <section className="card">
      <h2>Réglages</h2>
      <div className="row">
        <button className={onglet === 'rythme' ? 'primary' : 'ghost'} onClick={() => setOnglet('rythme')}>Rythme</button>
        <button className={onglet === 'phrases' ? 'primary' : 'ghost'} onClick={() => setOnglet('phrases')}>Phrases</button>
        <button className={onglet === 'photos' ? 'primary' : 'ghost'} onClick={() => setOnglet('photos')}>Photothèque</button>
      </div>
      {msg && <p className="hint">{msg}</p>}

      {onglet === 'rythme' && (
        <>
          <p className="hint">Config active : {version || '…'} — chaque enregistrement crée une nouvelle version (retour possible).</p>
          <label>Taille du tirage (photos par tour)<input type="number" min={1} max={12} value={rythme.taille_tirage} onChange={e => setRythme({ ...rythme, taille_tirage: Number(e.target.value) })} /></label>
          <label>Nombre de tours par traversée<input type="number" min={1} max={6} value={rythme.nombre_tours} onChange={e => setRythme({ ...rythme, nombre_tours: Number(e.target.value) })} /></label>
          <label>Part de décalage (photos hors résonance, par tour)<input type="number" min={0} max={6} value={rythme.decalage} onChange={e => setRythme({ ...rythme, decalage: Number(e.target.value) })} /></label>
          <button className="primary" onClick={sauverRythme}>Enregistrer le rythme</button>
        </>
      )}

      {onglet === 'phrases' && (
        <>
          <label>Nouvelle phrase d'ouverture<textarea value={nouveau} onChange={e => setNouveau(e.target.value)} rows={2} /></label>
          {avertissements(nouveau).map((a, i) => <p key={i} className="hint">⚠ {a}</p>)}
          <div className="row">
            <select value={nouvelleFam} onChange={e => setNouvelleFam(e.target.value)}>
              {FAMILLES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <button className="primary" onClick={ajouterPhrase}>Ajouter</button>
          </div>
          {phrases.map((t: any) => {
            const ed = edition[t.id] ?? { content: t.content, family: t.family };
            return (
              <article key={t.id} className="entry">
                <div className="date">#{t.id} — {t.family} — {t.statut}{t.sequences > 0 ? ` — citée (${t.sequences})` : ''}</div>
                <textarea value={ed.content} rows={2} onChange={e => setEdition({ ...edition, [t.id]: { ...ed, content: e.target.value } })} />
                {avertissements(ed.content).map((a, i) => <p key={i} className="hint">⚠ {a}</p>)}
                <div className="row">
                  <select value={ed.family} onChange={e => setEdition({ ...edition, [t.id]: { ...ed, family: e.target.value } })}>
                    {FAMILLES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <button className="mini-btn" onClick={async () => { setMsg(''); try { await api.textePatch(t.id, ed); await chargerPhrases(); } catch (e: any) { setMsg(e.message); } }}>Enregistrer</button>
                  <button className="mini-btn" onClick={async () => { setMsg(''); try { await api.textePatch(t.id, { statut: t.statut === 'archived' ? 'active' : 'archived' }); await chargerPhrases(); } catch (e: any) { setMsg(e.message); } }}>{t.statut === 'archived' ? 'Réactiver' : 'Archiver'}</button>
                  <button className="mini-btn" onClick={async () => { setMsg(''); try { await api.texteDelete(t.id); await chargerPhrases(); } catch (e: any) { setMsg(e.message || 'Suppression refusée (citée : archive-la).'); } }}>Supprimer</button>
                </div>
              </article>
            );
          })}
        </>
      )}

      {onglet === 'photos' && <Admin />}
    </section>
  );
}
