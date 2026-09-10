import { useEffect, useState } from 'react';
import { api } from './lib/api';

export default function Auth({ onChange }: { onChange: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [me, setMe] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [confirm, setConfirm] = useState<'data' | 'account' | null>(null);

  const refresh = () => api.me().then(d => setMe(d.user)).catch(() => setMe(null));
  useEffect(() => { refresh(); }, []);

  const submit = async () => {
    setMsg('');
    try {
      const d = mode === 'login' ? await api.login(pseudo, password) : await api.register(pseudo, password);
      setMe(d.user); setPassword(''); onChange();
    } catch (e: any) { setMsg(e.message); }
  };
  const out = async () => { await api.logout().catch(() => {}); setMe(null); onChange(); };
  const delData = async () => { await api.deleteData(); setConfirm(null); setMsg('Données supprimées.'); onChange(); };
  const delAccount = async () => { await api.deleteAccount().catch(() => {}); setMe(null); setConfirm(null); onChange(); };

  if (!me) {
    return (
      <section className="card">
        <h2>Compte — garder ton parcours</h2>
        <p className="hint">Simple et invisible : retrouver ton cheminement plus tard. Pas d'e-mail, pas de réseau social.</p>
        <div className="row">
          <button className={mode === 'login' ? 'primary' : 'ghost'} onClick={() => setMode('login')}>Connexion</button>
          <button className={mode === 'register' ? 'primary' : 'ghost'} onClick={() => setMode('register')}>Créer un compte</button>
        </div>
        <input placeholder="Pseudo" value={pseudo} onChange={e => setPseudo(e.target.value)} />
        <input placeholder="Mot de passe (8 caractères min)" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        {msg && <p className="hint">{msg}</p>}
        <button className="primary big" onClick={submit}>{mode === 'login' ? 'Entrer' : 'Créer mon compte'}</button>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Bon retour, {me.pseudo}</h2>
      <p className="hint">Ton carnet est privé : lui seul conserve ton parcours. Session longue (1 an, renouvelée à l'usage).</p>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="ghost" onClick={() => api.downloadExport('html')}>Exporter HTML</button>
        <button className="ghost" onClick={() => api.downloadExport('json')}>Exporter JSON</button>
        <button className="ghost" onClick={out}>Déconnexion</button>
      </div>
      {msg && <p className="hint">{msg}</p>}
      <h3>Suppression</h3>
      {confirm === null && (
        <div className="row">
          <button className="danger" onClick={() => setConfirm('data')}>Supprimer mes données</button>
          <button className="danger" onClick={() => setConfirm('account')}>Supprimer mon compte</button>
        </div>
      )}
      {confirm && (
        <>
          <p className="hint">{confirm === 'data' ? 'Supprimer définitivement ton parcours ? Irréversible, compte conservé.' : 'Supprimer définitivement ton compte et tout ton parcours ? Irréversible.'}</p>
          <div className="row">
            <button className="ghost" onClick={() => setConfirm(null)}>Annuler</button>
            <button className="danger" onClick={confirm === 'data' ? delData : delAccount}>Confirmer</button>
          </div>
        </>
      )}
    </section>
  );
}
