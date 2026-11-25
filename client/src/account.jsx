import { useState } from 'react';

const stored = () => { try { return JSON.parse(localStorage.getItem('portfolioSession') || 'null'); } catch { return null; } };

export default function Account() {
  const [session, setSession] = useState(stored);
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function request(path, options = {}) {
    const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}) } });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Request failed.');
    return body;
  }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      if (mode === 'signup') await request('/api/users', { method: 'POST', body: JSON.stringify(form) });
      const result = await request('/auth/signin', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) });
      localStorage.setItem('portfolioSession', JSON.stringify(result)); setSession(result); setMessage('Signed in successfully.');
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  async function signout() {
    try { await request('/auth/signout', { method: 'POST' }); setMessage('Signed out.'); }
    catch { setMessage('The server could not revoke this session.'); }
    localStorage.removeItem('portfolioSession'); setSession(null);
  }
  if (!session) return <section className="panel account-panel"><p className="eyebrow">Portfolio account</p><h1>{mode === 'signup' ? 'Create account' : 'Sign in'}</h1><form onSubmit={submit}>
    {mode === 'signup' && <><label htmlFor="account-name">Name</label><input id="account-name" required maxLength="100" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></>}
    <label htmlFor="account-email">Email</label><input id="account-email" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
    <label htmlFor="account-password">Password</label><input id="account-password" type="password" minLength="8" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
    <button disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Sign up and sign in' : 'Sign in'}</button>
  </form><p>{mode === 'signup' ? 'Already registered?' : 'New here?'} <button type="button" className="link-button" onClick={()=>setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</button></p>{message && <p role="status">{message}</p>}</section>;
  return <section className="panel account-panel"><p className="eyebrow">Signed in</p><h1>Welcome, {session.user?.name}</h1><p>Account: {session.user?.email}</p><p>Role: <strong>{session.user?.role}</strong></p><p>{session.user?.role === 'admin' ? 'Use Projects and Education to manage portfolio entries. Use Contact Me to review and manage submitted messages.' : 'You can view portfolio information. Only an administrator can change portfolio entries.'}</p><button onClick={signout}>Sign out</button>{message && <p role="status">{message}</p>}</section>;
}
