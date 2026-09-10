import { useEffect, useState } from 'react';
import { api, type RImage, type RText } from './lib/api';
import Admin from './Admin';
import Auth from './Auth';
import Parcours from './Parcours';
import './App.css';

type Step = 'accueil' | 'texte' | 'tirage' | 'expression' | 'carnet';

export default function App() {
  const [view, setView] = useState<'jeu' | 'parcours' | 'admin' | 'compte'>('jeu');
  const reloadCarnet = () => { api.carnet().then(setCarnet).catch(() => {}); api.memoire().then(setMemoire).catch(() => {}); };
  const [memoire, setMemoire] = useState<any[]>([]);
  const [step, setStep] = useState<Step>('accueil');
  const [availability, setAvailability] = useState('');
  const [question, setQuestion] = useState('');
  const [hasQuestion, setHasQuestion] = useState(false);
  const [seqId, setSeqId] = useState<number | null>(null);
  const [text, setText] = useState<RText | null>(null);
  const [consigne, setConsigne] = useState('Laquelle t’attire ?');
  const [consigneType, setConsigneType] = useState('attraction');
  const [images, setImages] = useState<RImage[]>([]);
  const [choisie, setChoisie] = useState<RImage | null>(null);
  const [rejetees, setRejetees] = useState<number[]>([]);
  const [voir, setVoir] = useState('');
  const [ressentir, setRessentir] = useState('');
  const [evoque, setEvoque] = useState('');
  const [silence, setSilence] = useState(false);
  const [carnet, setCarnet] = useState<any[]>([]);
  const [err, setErr] = useState('');

  const demarrer = async () => {
    setErr('');
    try {
      const s = await api.newSession(availability, hasQuestion ? question : '');
      setSeqId(s.sequence.id);
      setText(s.text);
      setConsigne(s.consigne);
      setConsigneType(s.consigne_type ?? 'attraction');
      setImages(s.images);
      setChoisie(null);
      setRejetees([]);
      setStep('texte');
    } catch {
      setErr('Serveur API injoignable. Lance app/server (npm run dev) puis recharge.');
    }
  };

  const choisir = async (img: RImage) => {
    if (!seqId) return;
    setChoisie(img);
    await api.statut(seqId, img.id, 'choisie').catch(() => {});
  };

  const ecarter = async (img: RImage) => {
    if (!seqId) return;
    const deja = rejetees.includes(img.id);
    const next = deja ? rejetees.filter(id => id !== img.id) : [...rejetees, img.id];
    setRejetees(next);
    if (choisie?.id === img.id) setChoisie(null);
    await api.statut(seqId, img.id, deja ? 'vue' : 'rejetee').catch(() => {});
  };

  const peutContinuer = consigneType === 'repulsion' ? rejetees.length > 0 : !!choisie;
  // En répulsion, l'expression porte sur la première image écartée (modifiable dans carnet ensuite)
  const imageExpression = consigneType === 'repulsion'
    ? images.find(i => i.id === rejetees[0]) ?? null
    : choisie;

  const enregistrer = async () => {
    if (!seqId || !imageExpression) return;
    await api.expression(seqId, { imageId: imageExpression.id, voir, ressentir, evoque, silence });
    const c = await api.carnet();
    setCarnet(c);
    setStep('carnet');
  };

  useEffect(() => {
    reloadCarnet();
  }, []);

  return (
    <div className="res">
      <header>
        <div className="brand">RÉSONANCE</div>
        <div className="motto">Tu choisis une image. Puis tu découvres pourquoi tu l'as choisie.</div>
        <nav className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
          <button className={view === 'jeu' ? 'primary' : 'ghost'} onClick={() => setView('jeu')}>Jeu</button>
          <button className={view === 'parcours' ? 'primary' : 'ghost'} onClick={() => setView('parcours')}>Parcours</button>
          <button className={view === 'admin' ? 'primary' : 'ghost'} onClick={() => setView('admin')}>Photothèque</button>
          <button className={view === 'compte' ? 'primary' : 'ghost'} onClick={() => { setView('compte'); }}>Compte</button>
        </nav>
      </header>

      {view === 'admin' ? <Admin /> : view === 'compte' ? <Auth onChange={reloadCarnet} /> : view === 'parcours' ? <Parcours /> : <>
      {err && <p className="err">{err}</p>}

      {step === 'accueil' && (
        <section className="card">
          <h1>Comment arrives-tu aujourd'hui ?</h1>
          <input value={availability} onChange={e => setAvailability(e.target.value)} placeholder="Un mot, une humeur, un silence..." />
          <div className="row">
            <button className={hasQuestion ? 'ghost' : 'primary'} onClick={() => setHasQuestion(false)}>Je ne sais pas</button>
            <button className={hasQuestion ? 'primary' : 'ghost'} onClick={() => setHasQuestion(true)}>J'ai une question</button>
          </div>
          {hasQuestion && <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Qu'est-ce qui te traverse ?" rows={3} />}
          <button className="primary big" onClick={demarrer}>Entrer dans l'expérience</button>
          <p className="hint">Le joueur donne du sens à ce qu'il choisit. L'application ne donne pas de sens à sa place.</p>
        </section>
      )}

      {step === 'texte' && text && (
        <section className="card">
          <p className="label">Texte</p>
          <p className="texte">{text.content}</p>
          <button className="primary big" onClick={() => setStep('tirage')}>Voir les images</button>
        </section>
      )}

      {step === 'tirage' && (
        <section>
          <h2>{consigne}</h2>
          <p className="hint">
            {consigneType === 'repulsion'
              ? 'Clique pour écarter (plusieurs possibles). Re-clique pour annuler. Aucune bonne réponse.'
              : 'Clique pour choisir (modifiable). Second clic sur une autre image pour changer. Survol long autorisé.'}
          </p>
          <div className="grid">
            {images.map(img => {
              const sel = choisie?.id === img.id;
              const rej = rejetees.includes(img.id);
              return (
                <div key={img.id} className="cell">
                  <button className={'img' + (sel ? ' sel' : '') + (rej ? ' rej' : '')} onClick={() => (consigneType === 'repulsion' ? ecarter(img) : choisir(img))}>
                    <img src={img.url} alt={img.title} loading="lazy" />
                  </button>
                  <div className="under">
                    {(img.fantome || img.is_ghost) && <span className="badge">déjà rencontrée — veux-tu la regarder autrement ?</span>}
                    {consigneType !== 'repulsion' && <button className="mini-btn" onClick={() => ecarter(img)}>{rej ? 'Revenir' : 'Écarter'}</button>}
                    {consigneType === 'repulsion' && rej && <span className="badge rej-b">écartée</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {peutContinuer && <button className="primary big" onClick={() => setStep('expression')}>Continuer</button>}
        </section>
      )}

      {step === 'expression' && imageExpression && (
        <section className="card">
          <p className="label">{consigneType === 'repulsion' ? 'Ton image écartée' : 'Ton image'}</p>
          <img className="chosen" src={imageExpression.url} alt="" />
          <label>Qu'est-ce que tu vois ?<textarea value={voir} onChange={e => setVoir(e.target.value)} rows={2} /></label>
          <label>Qu'est-ce que tu ressens ?<textarea value={ressentir} onChange={e => setRessentir(e.target.value)} rows={2} /></label>
          <label>Si cette image racontait quelque chose de toi ?<textarea value={evoque} onChange={e => setEvoque(e.target.value)} rows={3} /></label>
          <label className="check"><input type="checkbox" checked={silence} onChange={e => setSilence(e.target.checked)} /> Je préfère garder le silence</label>
          <button className="primary big" onClick={enregistrer}>Déposer dans le carnet</button>
        </section>
      )}

      {step === 'carnet' && (
        <section>
          <h2>Carnet</h2>
          <div className="row">
            <button className="ghost" onClick={() => api.downloadExport('html')}>Exporter HTML</button>
            <button className="ghost" onClick={() => api.downloadExport('json')}>Exporter JSON</button>
          </div>
          <p className="hint">Mémoire de ton cheminement. Rien n'est interprété.</p>
          <div className="carnet">
            {carnet.map((s: any) => (
              <article key={s.id} className="entry">
                <div className="date">#{s.id} — {new Date(s.created_at).toLocaleString()} — {s.consigne ?? ''}</div>
                {s.question && <div className="q">« {s.question} »</div>}
                <div className="t">{s.text_content}</div>
                <div className="mini">
                  {s.images?.map((im: any) => (
                    <span key={im.id} className="thumb">
                      <img src={im.url} alt="" className={im.status === 'choisie' ? 'is-chosen' : im.status === 'rejetee' ? 'is-rej' : ''} title={im.status + (im.is_ghost ? ' + fantôme' : '')} />
                      {im.is_ghost ? <em className="g">fantôme</em> : null}
                    </span>
                  ))}
                </div>
                {s.expressions?.map((ex: any, i: number) => (
                  <div key={i} className="exp">
                    {ex.silence ? <em>Silence gardé.</em> : <>{ex.voir && <p>Voir : {ex.voir}</p>}{ex.ressentir && <p>Ressenti : {ex.ressentir}</p>}{ex.evoque && <p>Évoque : {ex.evoque}</p>}</>}
                  </div>
                ))}
              </article>
            ))}
          </div>
          <button className="ghost" onClick={() => { setStep('accueil'); setVoir(''); setRessentir(''); setEvoque(''); setSilence(false); }}>Nouvelle séquence</button>
          {memoire.length > 0 && (
            <>
              <h2>Mémoire du parcours</h2>
              <div className="carnet">
                {memoire.map((p: any) => (
                  <article key={p.id} className="entry">
                    <div className="date">Partie #{p.id} — {p.parcours} ({p.statut})</div>
                    {(p.reponses ?? []).map((r: any) => (
                      <div key={r.position} className="exp">
                        <p><strong>{r.situation_titre}</strong> — {r.choix_texte}</p>
                        {r.fragment && <p><em>{r.fragment}</em></p>}
                      </div>
                    ))}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}
      </>}

      <footer>Si je t'ai perdu, ce n'est pas grave. Moi, j'arrive à me suivre. — Bloc 5, sans IA.</footer>
    </div>
  );
}
