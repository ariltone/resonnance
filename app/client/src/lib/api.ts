export type RImage = { id: number; seed: string; title: string; meta: string; url: string; fantome?: boolean; is_ghost?: number; status?: string };
export type RText = { id: number; family: string; content: string };

const token = {
  get: () => localStorage.getItem('resonance_token') || '',
  set: (t: string) => (t ? localStorage.setItem('resonance_token', t) : localStorage.removeItem('resonance_token')),
};

function headers(extra: Record<string, string> = {}) {
  const h: Record<string, string> = { ...extra };
  const t = token.get();
  if (t) h.Authorization = 'Bearer ' + t;
  return h;
}

async function j(r: Response) {
  if (r.status === 401) { token.set(''); }
  if (!r.ok) {
    const b = await r.json().catch(() => ({}));
    throw new Error(b.error || ('API ' + r.status));
  }
  return r.json();
}

export const api = {
  token,
  register: (pseudo: string, password: string) =>
    fetch('/api/register', { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ pseudo, password }) }).then(j).then(d => { token.set(d.token); return d; }),
  login: (pseudo: string, password: string) =>
    fetch('/api/login', { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ pseudo, password }) }).then(j).then(d => { token.set(d.token); return d; }),
  logout: () => fetch('/api/logout', { method: 'POST', headers: headers() }).then(j).finally(() => token.set('')),
  me: () => fetch('/api/me', { headers: headers() }).then(j),
  newSession: (availability: string, question: string) =>
    fetch('/api/session/new', { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ availability, question }) }).then(j),
  choix: (seqId: number, imageId: number) =>
    fetch(`/api/session/${seqId}/choix`, { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ imageId }) }).then(j),
  statut: (seqId: number, imageId: number, status: 'vue' | 'choisie' | 'rejetee') =>
    fetch(`/api/session/${seqId}/statut`, { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ imageId, status }) }).then(j),
  expression: (seqId: number, payload: object) =>
    fetch(`/api/session/${seqId}/expression`, { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload) }).then(j),
  carnet: () => fetch('/api/carnet', { headers: headers() }).then(j),
  exportUrl: (format: 'html' | 'json') => '/api/carnet/export?format=' + format,
  downloadExport: async (format: 'html' | 'json') => {
    const r = await fetch('/api/carnet/export?format=' + format, { headers: headers() });
    if (!r.ok) throw new Error('Export impossible');
    const blob = await r.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = format === 'html' ? 'carnet-resonance.html' : 'carnet-resonance.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  },
  deleteData: () => fetch('/api/me/data', { method: 'DELETE', headers: headers() }).then(j),
  deleteAccount: () => fetch('/api/me', { method: 'DELETE', headers: headers() }).then(j).finally(() => token.set('')),
  // Bloc 5 : moteur de parcours
  partieNew: () => fetch('/api/parties', { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: '{}' }).then(j),
  parties: () => fetch('/api/parties', { headers: headers() }).then(j),
  partie: (id: number) => fetch(`/api/parties/${id}`, { headers: headers() }).then(j),
  choisir: (id: number, choix_id: number) =>
    fetch(`/api/parties/${id}/choisir`, { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ choix_id }) }).then(j),
  interrompre: (id: number) => fetch(`/api/parties/${id}/interrompre`, { method: 'POST', headers: headers() }).then(j),
  reprendre: (id: number) => fetch(`/api/parties/${id}/reprendre`, { method: 'POST', headers: headers() }).then(j),
  memoire: () => fetch('/api/memoire', { headers: headers() }).then(j),
  adminList: () => fetch('/api/admin/images', { headers: headers() }).then(j),
  adminAddUrl: (p: object) => fetch('/api/admin/images', { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(p) }).then(j),
  adminImport: (fd: FormData) => fetch('/api/admin/images/import', { method: 'POST', headers: headers(), body: fd }).then(j),
  adminPatch: (id: number, p: object) => fetch(`/api/admin/images/${id}`, { method: 'PATCH', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(p) }).then(j),
  adminDelete: (id: number) => fetch(`/api/admin/images/${id}`, { method: 'DELETE', headers: headers() }).then(j),
  cats: () => fetch('/api/admin/categories', { headers: headers() }).then(j),
  tags: () => fetch('/api/admin/tags', { headers: headers() }).then(j),
  addCat: (name: string) => fetch('/api/admin/categories', { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ name }) }).then(j),
  addTag: (name: string) => fetch('/api/admin/tags', { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ name }) }).then(j),
  patchRef: (kind: 'categories' | 'tags', id: number, p: object) => fetch(`/api/admin/${kind}/${id}`, { method: 'PATCH', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(p) }).then(j),
};
