import { useState } from 'react';
import { api, type RImage } from './lib/api';

// Traversée en 3 temps (spec docs/spec-traversee-reglages.md) :
// phrase d'ouverture -> tirage -> 1 image marquée -> pause -> x N tours -> carnet (marquées seules)
// -> écrit unique (3 questions ouvertes + silence) -> nouveau tirage / nouvelle partie.
// Comptes configurables (rythme), jamais codés en dur ici.

type Phase = 'accueil' | 'phrase' | 'tirage' | 'pause' | 'carnet';

export default function Traversee() {
  const [rythme, setRythme] = useState({ taille_tirage: 6, nombre_tours: 3, decalage: 1 });
  const [cle, setCle] = useState<string | null>(null);
  const [tour, setTour] = useState(1);
  const [phase, setPhase] = useState<Phase>('accueil');
  const [seqId, setSeqId] = useState<number | null>(null);
  const [texte, setTexte] = useState('');
  const [consigne, setConsigne] = useState('');
  const [consigneType, setConsigneType] = useState('attraction');
  const [images, setImages] = useState<RImage[]>([]);
  const [marquees, setMarquees] = useState<number[]>([]);
  const [entrees, setEntrees] = useState<any[]>([]);
  const [mot, setMot] = useState('');
  const [eveil, setEveil] = useState('');
  const [enchainement, setEnchainement] = useState('');
  const [silence, setSilence] = useState(false);
  const [etape, setEtape] = useState(0); // 1-3 une question à la fois, 4 dépôt + navigation
  const [depot, setDepot] = useState<boolean | null>(null); // écrit déposé ? (null = pas encore choisi)
  const [apercu, setApercu] = useState<number | null>(null); // tactile : premier toucher = voir
  const [msg, setMsg] = useState('');
  const tactile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const demarrer = async (nouvelle: boolean) => {
    setMsg('');
    try {
      const r = await api.rythme();
      setRythme({ taille_tirage: r.taille_tirage ?? 6, nombre_tours: r.nombre_tours ?? 3, decalage: r.decalage ?? 1 });
      const k = nouvelle || !cle ? `T-${Date.now()}` : cle;
      setCle(k);
      setTour(1);
      await tirer(k);
    } catch {
      setMsg('Serveur API injoignable.');
    }
  };

  const tirer = async (k: string) => {
    const s = await api.newSession('', '', k);
    setSeqId(s.sequence.id);
    setTexte(s.text?.content ?? '');
    setConsigne(s.consigne);
    setConsigneType(s.consigne_type ?? 'attraction');
    setImages(s.images);
    setMarquees([]);
    setPhase('phrase');
  };

  const toucher = async (img: RImage) => {
    // Tactile : premier toucher = voir en grand, second = choisir (pas de modification après).
    // Souris : survol pour voir, clic direct pour choisir.
    if (tactile && apercu !== img.id) {
      setApercu(img.id);
      return;
    }
    setApercu(null);
    await marquer(img);
  };

  const marquer = async (img: RImage) => {
    // Choix définitif : une seule impulsion par tour, aucun retour en arrière (parti-pris intuitif).
    if (!seqId || marquees.includes(img.id)) return;
    if (consigneType !== 'repulsion' && marquees.length > 0) return;
    const statut = consigneType === 'repulsion' ? 'rejetee' : 'choisie';
    setMarquees(m => [...m, img.id]);
    await api.statut(seqId, img.id, statut).catch(() => {});
    setPhase('pause'); // « Garde-la un instant. » — aucune question à chaud
  };

  const continuer = async () => {
    if (!cle) return;
    if (tour < rythme.nombre_tours) {
      setTour(tour + 1);
      await tirer(cle);
    } else {
      await voirCarnet(cle);
    }
  };

  const voirCarnet = async (k: string) => {
    const t = await api.traverse(k);
    setEntrees(t.sequences ?? []);
    const e = await api.ecritGet(k).catch(() => null);
    setMot(e?.mot ?? '');
    setEveil(e?.eveil ?? '');
    setEnchainement(e?.enchainement ?? '');
    setSilence(!!e?.silence);
    setEtape(1); // entrée directe sur la première question (photos déjà visibles)
    setDepot(null);
    setPhase('carnet');
  };

  const points = (n: number) => '●'.repeat(n) + '○'.repeat(Math.max(0, rythme.nombre_tours - n));

  const deposer = async (oui: boolean) => {
    if (!cle) return;
    setMsg('');
    if (!oui) {
      setDepot(false);
      setMsg('Non déposé. Tes images restent visibles ci-contre.');
      return;
    }
    try {
      await api.ecritPost(cle, { mot, eveil, enchainement, silence });
      setDepot(true);
      setMsg('Déposé au carnet.');
    } catch {
      setMsg('Dépôt impossible pour le moment.');
    }
  };

  const peutContinuer = marquees.length > 0;

  return (
    <section className="card">
      {phase === 'accueil' && (
        <>
          <h1>Commencer</h1>
          <button className="primary big" onClick={() => demarrer(true)}>Entrer dans l'expérience</button>
          <p className="hint">Le joueur donne du sens à ce qu'il choisit. L'application ne donne pas de sens à sa place.</p>
        </>
      )}

      {phase === 'phrase' && (
        <>
          <p className="label">Tour {tour} / {rythme.nombre_tours}</p>
          <p className="texte">{texte}</p>
          <div className="row">
            <button className="primary big" onClick={() => setPhase('tirage')}>Voir les images</button>
          </div>
        </>
      )}

      {phase === 'tirage' && (
        <>
          <p className="label">{points(tour)} · Tour {tour} / {rythme.nombre_tours}</p>
          <p className="hint">« {texte} »</p>
          <div className="row">
            <button className="ghost" onClick={() => setPhase('phrase')}>← Revenir à la phrase</button>
          </div>
          <h2>{consigne}</h2>
          <p className="hint">
            {tactile
              ? 'Touche une image pour la voir en grand, retouche-la pour choisir. Premier geste, sans retour.'
              : consigneType === 'repulsion'
                ? 'Clique pour écarter. Premier geste, sans retour. Aucune bonne réponse.'
                : 'Clique pour choisir. Premier geste, sans retour. Aucune bonne réponse.'}
          </p>
          <div className="grid">
            {images.map(img => {
              const mq = marquees.includes(img.id);
              return (
                <div key={img.id} className="cell">
                  <button className={'img' + (mq ? ' sel' : '')} onClick={() => toucher(img)}>
                    <img src={img.url} alt={img.title} loading="lazy" />
                  </button>
                  <div className="under">
                    {(img.fantome || img.is_ghost) && <span className="badge">déjà rencontrée — veux-tu la regarder autrement ?</span>}
                    {mq && <span className="badge">{consigneType === 'repulsion' ? 'écartée' : 'choisie'}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {!peutContinuer && <button className="primary big" onClick={continuer}>Continuer</button>}
          {apercu !== null && (() => {
            const im = images.find(i => i.id === apercu);
            return im ? (
              <div className="apercu-fond" onClick={() => setApercu(null)}>
                <img src={im.url} alt={im.title} onClick={(e) => { e.stopPropagation(); setApercu(null); marquer(im); }} />
                <p className="hint">Retouche l'image pour choisir · touche à côté pour revenir</p>
              </div>
            ) : null;
          })()}
        </>
      )}

      {phase === 'pause' && (
        <div className="pause-cliquable" onClick={continuer}>
          <p className="label">{points(tour)} · Tour {tour} / {rythme.nombre_tours}</p>
          <p className="texte">Garde-la un instant.</p>
          {images.filter(i => marquees.includes(i.id)).map(img => (
            <figure key={img.id} className="pause-fig">
              <img className="chosen" src={img.url} alt={img.title} />
              <figcaption>{img.title}</figcaption>
            </figure>
          ))}
          <button className="primary big" onClick={(e) => { e.stopPropagation(); continuer(); }}>Continuer</button>
        </div>
      )}

      {phase === 'carnet' && (
        <>
          <h2>Cette traversée</h2>
          <div className="trav-carnet">
            <div className="trav-photos">
              {entrees.flatMap((s: any) => (s.images ?? [])
                .filter((im: any) => im.status === 'choisie' || im.status === 'rejetee')
                .map((im: any) => (
                  <img key={`${s.id}-${im.id}`} src={im.url} alt="" className={im.status === 'choisie' ? 'is-chosen' : 'is-rej'} />
                )))}
            </div>
            <div className="trav-questions">
              {etape === 1 && (
                <>
                  <label>Qu'est-ce que cet enchaînement d'images te dit ?<textarea value={enchainement} onChange={e => setEnchainement(e.target.value)} rows={4} /></label>
                  <div className="row">
                    <button className="ghost" onClick={() => setPhase('pause')}>← Revoir l'image</button>
                    <button className="primary" onClick={() => setEtape(2)}>Question suivante</button>
                  </div>
                </>
              )}
              {etape === 2 && (
                <>
                  <label>Quel mot mettrais-tu dessus ?<textarea value={mot} onChange={e => setMot(e.target.value)} rows={2} /></label>
                  <div className="row">
                    <button className="ghost" onClick={() => setEtape(1)}>← Retour</button>
                    <button className="primary" onClick={() => setEtape(3)}>Question suivante</button>
                  </div>
                </>
              )}
              {etape === 3 && (
                <>
                  <label>Qu'est-ce que cela éveille ?<textarea value={eveil} onChange={e => setEveil(e.target.value)} rows={4} /></label>
                  <div className="row">
                    <button className="ghost" onClick={() => setEtape(2)}>← Retour</button>
                    <button className="primary" onClick={() => setEtape(4)}>Continuer</button>
                  </div>
                </>
              )}
              {etape === 4 && depot === null && (
                <>
                  <label className="check"><input type="checkbox" checked={silence} onChange={e => setSilence(e.target.checked)} /> Rien à dire — garder le silence</label>
                  <p className="hint">Déposer cet écrit au carnet ?</p>
                  <div className="row">
                    <button className="ghost" onClick={() => setEtape(3)}>← Retour</button>
                    <button className="primary" onClick={() => deposer(true)}>Oui, déposer</button>
                    <button className="ghost" onClick={() => deposer(false)}>Non</button>
                  </div>
                </>
              )}
              {etape === 4 && depot !== null && (
                <>
                  <button className="primary big" onClick={() => demarrer(true)}>Nouvelle traversée</button>
                  <p className="hint">Les traversées précédentes restent au carnet (onglet Compte).</p>
                </>
              )}
            </div>
          </div>
          {msg && <p className="hint">{msg}</p>}
        </>
      )}
      {msg && phase !== 'carnet' && <p className="hint">{msg}</p>}
    </section>
  );
}
