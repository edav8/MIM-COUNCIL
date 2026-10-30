'use client';
import { useEffect, useState } from 'react';
import { votingState } from './voting-time.mjs';
export default function VotingNotice() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  const state = now === null ? null : votingState(now);
  const phase = state?.phase;
  return <section className={'reps-voting-notice'+(phase === 'closed' ? ' is-closed' : '')} aria-label="Election voting status">
    <div className="reps-voting-message"><strong>{phase === 'open' ? 'Voting open now · until 4 p.m.' : phase === 'before' ? 'Voting opens at 7:54 a.m.' : phase === 'closed' ? 'Voting is now closed' : 'Voting closes at 4 p.m.'}</strong><span>18 September · Fontainebleau time</span></div>
    {state && phase !== 'closed' && <div className="reps-countdown"><span>{phase === 'before' ? 'Opens in' : 'Time left to vote'}</span><time role="timer" aria-live="off" aria-label={phase === 'before' ? 'Time until voting opens' : 'Time until voting closes'}>{state.countdown}</time></div>}
    <a href="https://learn.insead.edu/courses/9890/assignments/82984">{phase === 'open' ? 'Vote on Canvas' : 'View election on Canvas'} <span aria-hidden="true">↗</span></a>
  </section>;
}
