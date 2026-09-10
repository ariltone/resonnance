import { useEffect, useState } from 'react';
import { api } from './lib/api';

const LS = 'resonance_parties';

function idsAnonymes(): number[] {
  try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch { return []; }
}
function garderId(id: number) {
  const l = idsAnonymes();
  if (!l.includes(id)) localStorage.setItem(LS, JSON.stringify([...l, id]));
}

export default function Parcours() {
  const [partie, setPartie] = useState<any>(null);
  const [choisi, setChoisi] = useState<any>(null);
  const [liste, setListe] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const chargerListe = () => {
    if (api.token.get()) { api.parties().then(setListe).catch(() => {}); return; }
    Promise.all(idsAnonymes().map(id => api.partie(id).then(d => d.partie).catch(() => null))).then(l => setListe(l.filter(Boolean)));
  };
  useEffect(() => { chargerListe(); }, []);

  const demarrer = async () => {
    setMsg(''); setChoisi(null);
    try {
      const d = await api.partieNew();
      setPartie(d.partie);
      if (!api.token.get()) garderId(d.partie.id);
      chargerListe();
    } catch (e: any) { setMsg(e.message); }
  };
  const ouvrir = async (id: number) => {
    setMsg(''); setChoisi(null);
    try { setPartie((await api.partie(id)).partie); } catch (e: any) { setMsg(e.message); }
  };
  const choisir = async (choixId: number) => {
    if (!partie) return;
    try {
      const d = await api.choisir(partie.id, choixId);
      setChoisi(d.enregistre);
      setPartie(d.partie);
      chargerListe();
    } catch (e: any) { setMsg(e.message); }
  };

  return (
    <section className="card">
      <h2>Parcours</h2>
      {!partie && (
        <>
          <button className="primary big" onClick={demarrer}>Nouvelle partie</button>
          {liste.filter(p => p.statut !== 'terminee').map(p => (
            <button key={p.id} className="ghost" onClick={() => ouvrir(p.id)}>
              Reprendre — {p.espace_courant ?? '…'} ({p.statut === 'en_pause' ? 'en pause' : 'en cours'})
            </button>
          ))}
        </>
      )}
      {partie && !partie.terminee && partie.situation && (
        <>
          <p className="label">{partie.espace_courant}</p>
          <p className="texte">{partie.situation.titre}</p>
          <p>{partie.situation.texte}</p>
          {!choisi && partie.situation.choix.map((c: any) => (
            <button key={c.id} className="ghost" onClick={() => choisir(c.id)}>{c.texte}</button>
          ))}
          {choisi && (
            <>
              <p className="hint">Choix enregistré : « {choisi.choix} »{choisi.fragment ? ` — ${choisi.fragment}` : ''}</p>
              <div className="row">
                <button className="primary" onClick={() => setChoisi(null)}>Continuer</button>
                <button className="ghost" onClick={async () => { await api.interrompre(partie.id); setPartie(null); setChoisi(null); chargerListe(); }}>Interrompre</button>
              </div>
            </>
          )}
          {!choisi && (
            <button className="ghost" onClick={async () => { await api.interrompre(partie.id).catch((e: any) => setMsg(e.message)); setPartie(null); chargerListe(); }}>Interrompre</button>
          )}
        </>
      )}
      {partie && partie.terminee && (
        <>
          <p className="hint">Partie terminée. Elle reste dans ta mémoire.</p>
          <button className="ghost" onClick={() => { setPartie(null); setChoisi(null); }}>Retour</button>
        </>
      )}
      {msg && <p className="hint">{msg}</p>}
    </section>
  );
}
