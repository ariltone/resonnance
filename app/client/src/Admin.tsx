import { useEffect, useMemo, useState } from 'react';
import { api } from './lib/api';

export default function Admin() {
  const [tab, setTab] = useState<'photos' | 'ref'>('photos');
  const [list, setList] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  // form import local
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [catId, setCatId] = useState<string>('');
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  // form URL externe secondaire
  const [extUrl, setExtUrl] = useState('');
  const [extTitle, setExtTitle] = useState('');
  // référentiel
  const [newCat, setNewCat] = useState('');
  const [newTag, setNewTag] = useState('');

  const reload = async () => {
    try {
      const [l, c, t] = await Promise.all([api.adminList(), api.cats(), api.tags()]);
      setList(l); setCats(c); setTags(t);
    } catch (e: any) { setMsg(e.message); }
  };
  useEffect(() => { reload(); }, []);

  const activeCats = useMemo(() => cats.filter(c => c.status === 'active'), [cats]);
  const activeTags = useMemo(() => {
    const s = search.trim().toLowerCase();
    return tags.filter(t => t.status === 'active' && (!s || t.name.includes(s)));
  }, [tags, search]);

  const toggleTag = (id: number) => setTagIds(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));

  const doImport = async () => {
    setMsg('');
    if (!file) { setMsg('Choisis un fichier JPG / PNG / WEBP.'); return; }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title || file.name);
    if (catId) fd.append('category_id', catId);
    fd.append('tag_ids', JSON.stringify(tagIds));
    try {
      await api.adminImport(fd);
      setFile(null); setTitle(''); setTagIds([]);
      setMsg('Image importée, visible dans la photothèque.');
      reload();
    } catch (e: any) { setMsg(e.message); }
  };

  const addUrl = async () => {
    setMsg('');
    try {
      await api.adminAddUrl({ title: extTitle || 'Sans titre', url: extUrl, category_id: catId || null, tag_ids: tagIds });
      setExtUrl(''); setExtTitle(''); setTagIds([]);
      setMsg('URL externe enregistrée (secondaire).');
      reload();
    } catch (e: any) { setMsg(e.message); }
  };

  const saveRow = async (im: any) => {
    setMsg('');
    try {
      await api.adminPatch(im.id, { title: im.title, category_id: im.category?.id ?? im.category_id ?? null, tag_ids: (im.tags ?? []).map((t: any) => t.id) });
      setMsg('Fiche enregistrée.');
      reload();
    } catch (e: any) { setMsg(e.message); }
  };

  return (
    <section className="card">
      <h2>Photothèque — admin</h2>
      <div className="row">
        <button className={tab === 'photos' ? 'primary' : 'ghost'} onClick={() => setTab('photos')}>Photothèque</button>
        <button className={tab === 'ref' ? 'primary' : 'ghost'} onClick={() => setTab('ref')}>Référentiel</button>
      </div>
      {msg && <p className="hint">{msg}</p>}

      {tab === 'photos' && (
        <>
          <h3>Ajouter une image (fichier)</h3>
          <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          <input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
          <label>Catégorie : <select value={catId} onChange={e => setCatId(e.target.value)}>
            <option value="">— sélectionner —</option>
            {activeCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
          <label>Tags <span className="hint">— Sélectionner un ou plusieurs tags. Les tags se gèrent dans Référentiel.</span><input placeholder="rechercher…" value={search} onChange={e => setSearch(e.target.value)} /></label>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {activeTags.map(t => <button key={t.id} className={tagIds.includes(t.id) ? 'primary' : 'ghost'} onClick={() => toggleTag(t.id)}>{t.name}</button>)}
          </div>
          <button className="primary" onClick={doImport}>Importer</button>

          <h3>URL externe (secondaire)</h3>
          <input placeholder="https://…" value={extUrl} onChange={e => setExtUrl(e.target.value)} />
          <input placeholder="Titre" value={extTitle} onChange={e => setExtTitle(e.target.value)} />
          <button className="ghost" onClick={addUrl}>Ajouter l'URL</button>

          <h3>Images ({list.length})</h3>
          <div className="admin-list">
            {list.map((im: any) => (
              <Row key={im.id} im={im} cats={activeCats} tags={tags.filter(t => t.status === 'active')} reload={reload} onSave={saveRow} />
            ))}
          </div>
        </>
      )}

      {tab === 'ref' && (
        <>
          <h3>Catégories</h3>
          <div className="row">
            <input placeholder="nouvelle catégorie" value={newCat} onChange={e => setNewCat(e.target.value)} />
            <button className="primary" onClick={async () => { try { await api.addCat(newCat); setNewCat(''); reload(); } catch (e: any) { setMsg(e.message); } }}>Créer</button>
          </div>
          {cats.map(c => (
            <div key={c.id} className="row">
              <span>{c.name} ({c.images}) [{c.status}]</span>
              <button className="ghost" onClick={async () => { await api.patchRef('categories', c.id, { status: c.status === 'active' ? 'archived' : 'active' }); reload(); }}>{c.status === 'active' ? 'Désactiver' : 'Réactiver'}</button>
            </div>
          ))}
          <h3>Tags</h3>
          <div className="row">
            <input placeholder="nouveau tag" value={newTag} onChange={e => setNewTag(e.target.value)} />
            <button className="primary" onClick={async () => { try { await api.addTag(newTag); setNewTag(''); reload(); } catch (e: any) { setMsg(e.message); } }}>Créer (ici uniquement)</button>
          </div>
          {tags.map(t => (
            <div key={t.id} className="row">
              <span>{t.name} ({t.images}) [{t.status}]</span>
              <button className="ghost" onClick={async () => { await api.patchRef('tags', t.id, { status: t.status === 'active' ? 'archived' : 'active' }); reload(); }}>{t.status === 'active' ? 'Désactiver' : 'Réactiver'}</button>
            </div>
          ))}
          <p className="hint">Création de tags uniquement ici. La fiche image ne propose que la sélection.</p>
        </>
      )}
    </section>
  );
}

function Row({ im, cats, tags, reload, onSave }: any) {
  const [broken, setBroken] = useState(false);
  const [local, setLocal] = useState(im);
  const [confirmDel, setConfirmDel] = useState(false);
  const [delMsg, setDelMsg] = useState('');
  useEffect(() => { setLocal(im); setConfirmDel(false); setDelMsg(''); }, [im]);
  const toggleTag = (id: number) => {
    const cur = (local.tags ?? []).map((t: any) => t.id);
    const next = cur.includes(id) ? cur.filter((x: number) => x !== id) : [...cur, id];
    setLocal({ ...local, tags: tags.filter((t: any) => next.includes(t.id)) });
  };
  return (
    <div className={'admin-row' + (local.status === 'archived' ? ' archived' : '')}>
      {broken
        ? <div className="img-broken">Aperçu indisponible — source externe à corriger.</div>
        : <img src={local.url} alt="" onError={() => setBroken(true)} />}
      <div className="admin-main">
        <input value={local.title} onChange={e => setLocal({ ...local, title: e.target.value })} />
        <label>Catégorie : <select value={local.category?.id ?? ''} onChange={e => {
          const c = cats.find((x: any) => x.id === Number(e.target.value));
          setLocal({ ...local, category: c ?? null });
        }}>
          <option value="">—</option>
          {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select></label>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {tags.map((t: any) => {
            const on = (local.tags ?? []).some((x: any) => x.id === t.id);
            return <button key={t.id} className={on ? 'primary' : 'ghost'} style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => toggleTag(t.id)}>{t.name}</button>;
          })}
        </div>
        <small>{local.storage === 'local' ? 'fichier importé' : 'externe'} · vues {local.stats.apparitions} · choisies {local.stats.selections} · rejetées {local.stats.rejets} · {local.stats.taux}% · {local.status}</small>
      </div>
      <div className="admin-actions">
        <button className="ghost" onClick={() => onSave(local)}>Modifier</button>
        <button className="ghost" onClick={async () => { await api.adminPatch(local.id, { status: local.status === 'archived' ? 'active' : 'archived' }); reload(); }}>{local.status === 'archived' ? 'Désarchiver' : 'Archiver'}</button>
        {!confirmDel
          ? <button className="danger" onClick={() => { setConfirmDel(true); setDelMsg(''); }}>Supprimer</button>
          : <>
            <p className="hint">Supprimer définitivement cette photo ? Cette action est irréversible.</p>
            {delMsg && <p className="hint">{delMsg}</p>}
            <button className="ghost" onClick={() => { setConfirmDel(false); setDelMsg(''); }}>Annuler</button>
            <button className="danger" onClick={async () => {
              try { await api.adminDelete(local.id); reload(); }
              catch (e: any) { setDelMsg(e.message + (e.message.includes('Archive') ? '' : '')); }
            }}>Supprimer définitivement</button>
          </>}
      </div>
    </div>
  );
}
