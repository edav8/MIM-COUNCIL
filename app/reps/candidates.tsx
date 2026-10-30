'use client';
import { useEffect, useState } from 'react';
import candidates from './candidates.json';
const KEY = 'mim28-reps-order-2026-v1';
const roles = ['Academic', 'Brand', 'Careers', 'Student Life'];
function shuffledIds() {
  const ids = candidates.map(c => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}
export default function Candidates() {
  const [order, setOrder] = useState(candidates.map(c => c.id));
  useEffect(() => {
    let ids = shuffledIds();
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (Array.isArray(saved) && saved.length === candidates.length && new Set(saved).size === candidates.length && saved.every(id => candidates.some(c => c.id === id))) ids = saved;
      else localStorage.setItem(KEY, JSON.stringify(ids));
    } catch { /* Storage can be unavailable in private browsing. */ }
    setOrder(ids);
  }, []);
  return <div className="reps-roles">{roles.map((role, i) => <section className="reps-role" key={role} id={role.toLowerCase().replace(' ', '-')} aria-labelledby={'role-'+i}>
    <div className="reps-role-heading"><h2 id={'role-'+i}>{role}</h2><span>{candidates.filter(c => c.role === role).length} candidates · 1 position</span></div>
    <div className="reps-grid">{order.map(id => candidates.find(c => c.id === id)!).filter(c => c.role === role).map(candidate => <a className="reps-card" href={candidate.url} key={candidate.id} target="_blank" rel="noopener noreferrer" aria-label={'Watch '+candidate.name+'’s video on INSEAD (opens in a new tab)'}>
      <div className="reps-thumbnail"><span className="reps-initials" aria-hidden="true">{candidate.name.split(' ').map(n => n[0]).slice(0,2).join('')}</span>{candidate.thumbnail && <img src={candidate.thumbnail} style={{ objectPosition: candidate.thumbnailPosition, transform: candidate.thumbnailTransform }} alt="" width="400" height="225" loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />}<span className="reps-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" focusable="false"><path d="M8 5.5a.75.75 0 0 1 1.13-.65l10 6.5a.75.75 0 0 1 0 1.3l-10 6.5A.75.75 0 0 1 8 18.5z" /></svg></span></div>
      <div className="reps-card-body"><h3>{candidate.name}</h3><span>Watch video <span aria-hidden="true">↗</span></span></div>
    </a>)}</div>
  </section>)}</div>;
}
