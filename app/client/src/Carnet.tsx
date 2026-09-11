import { useEffect, useState } from 'react';
import { api } from './lib/api';

// Carnet visible sans téléchargement : toutes les traversées + paroles + écrits.
// Lecture seule (l'écriture différée vit dans la Traversée) ; les exports restent disponibles à côté.
export default function Carnet({ titre = 'Toutes mes traversées' }: { titre?: string }) {
  const [entrees, setEntrees] = useState<any[]>([]);
  const [ecrits, setEcrits] = useState<Record<string, any>>({});

  useEffect(() => {
    api.carnet().then(async (rows: any[]) => {
      setEntrees(rows);
      const cles: string[] = [...new Set(rows.map((s: any) => s.traversee).filter((t: unknown): t is string => typeof t === 'string'))];
      const rec: Record<string, any> = {};
      for (const c of cles) {
        const e = await api.ecritGet(c).catch(() => null);
        if (e) rec[c] = e;
      }
      setEcrits(rec);
    }).catch(() => {});
  }, []);

  if (!entrees.length) return <p className="hint">Carnet vide pour le moment.</p>;

  return (
    <>
      <h3>{titre}</h3>
      <div className="carnet">
      {entrees.map((s: any) => (
        <article key={s.id} className="entry">
          <div className="date">#{s.id} — {new Date(s.created_at).toLocaleString()} — {s.consigne ?? ''}</div>
          {s.text_content && <div className="t">{s.text_content}</div>}
          <div className="mini">
            {(s.images ?? []).map((im: any) => (
              <span key={im.id} className="thumb">
                <img src={im.url} alt="" className={im.status === 'choisie' ? 'is-chosen' : im.status === 'rejetee' ? 'is-rej' : ''} title={im.status + (im.is_ghost ? ' + fantôme' : '')} />
                {im.is_ghost ? <em className="g">fantôme</em> : null}
              </span>
            ))}
          </div>
          {(s.expressions ?? []).map((ex: any, i: number) => (
            <div key={i} className="exp">
              {ex.silence ? <em>Silence gardé.</em> : <>{ex.voir && <p>Voir : {ex.voir}</p>}{ex.ressentir && <p>Ressenti : {ex.ressentir}</p>}{ex.evoque && <p>Évoque : {ex.evoque}</p>}</>}
            </div>
          ))}
          {s.traversee && ecrits[s.traversee] && (
            <div className="exp">
              {ecrits[s.traversee].silence
                ? <em>Silence gardé pour cette traversée.</em>
                : <>{ecrits[s.traversee].mot && <p>Mot : {ecrits[s.traversee].mot}</p>}{ecrits[s.traversee].enchainement && <p>{ecrits[s.traversee].enchainement}</p>}{ecrits[s.traversee].eveil && <p>Éveille : {ecrits[s.traversee].eveil}</p>}</>}
            </div>
          )}
        </article>
      ))}
      </div>
    </>
  );
}
