import { useCallback, useEffect, useState } from 'react';

const definitions = {
  projects: { title: 'My Projects', path: '/api/projects', fields: ['title','firstname','lastname','email','completion','description'] },
  education: { title: 'My Education', path: '/api/qualifications', fields: ['title','firstname','lastname','email','completion','description'] },
  contacts: { title: 'Contact submissions', path: '/api/contacts', fields: ['firstname','lastname','email','phone','message'] },
};
const empty = (fields) => Object.fromEntries(fields.map(key => [key, '']));

export default function ResourcePage({ type }) {
  const config = definitions[type];
  const [items, setItems] = useState([]), [form, setForm] = useState(null), [editing, setEditing] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const session = (() => { try { return JSON.parse(localStorage.getItem('portfolioSession') || 'null'); } catch { return null; } })();
  const admin = session?.user?.role === 'admin';
  const api = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}) } });
    const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Request failed.'); return result;
  }, [session?.token]);
  const load = useCallback(async () => { setLoading(true); try { setItems(await api(config.path)); setError(''); } catch (e) { setError(e.message); } finally { setLoading(false); } }, [api,config.path]);
  useEffect(() => { load(); }, [load]);
  function open(item = null) { setEditing(item?._id || null); setForm(item ? Object.fromEntries(config.fields.map(key => [key, key === 'completion' ? item[key]?.slice(0,10) || '' : item[key] || ''])) : empty(config.fields)); }
  async function save(event) { event.preventDefault(); try { await api(editing ? `${config.path}/${editing}` : config.path, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) }); setForm(null); await load(); } catch (e) { setError(e.message); } }
  async function remove(id) { if (!window.confirm('Delete this record?')) return; try { await api(`${config.path}/${id}`, { method: 'DELETE' }); await load(); } catch (e) { setError(e.message); } }
  const label = type === 'projects' ? 'project' : type === 'education' ? 'education record' : 'contact record';
  return <><p className="eyebrow">Portfolio</p><h1>{config.title}</h1>{error && <p role="alert">{error}</p>}{admin && <button onClick={() => open()}>Add {label}</button>}
    {form && <form className="panel" onSubmit={save}><h2>{editing ? 'Edit' : 'Add'} {label}</h2>{config.fields.map(key=><label key={key}>{key}<input required value={form[key]} type={key === 'completion' ? 'date' : key === 'email' ? 'email' : 'text'} maxLength={key === 'description' ? 5000 : 254} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}<button>{editing ? 'Save changes' : 'Create record'}</button> <button type="button" className="link-button" onClick={()=>setForm(null)}>Cancel</button></form>}
    {loading ? <p>Loading records…</p> : items.length ? <div className="cards">{items.map(item=><article className="panel" key={item._id}><h2>{item.title || `${item.firstname} ${item.lastname}`}</h2><p>{item.email}</p><p>{item.completion?.slice(0,10)}</p><p>{item.description || item.message}</p>{admin && <><button onClick={()=>open(item)}>Edit</button> <button className="danger" onClick={()=>remove(item._id)}>Delete</button></>}</article>)}</div> : <p>No {type === 'projects' ? 'projects' : type === 'education' ? 'education records' : 'contact submissions'} have been added yet.</p>}
  </>;
}
