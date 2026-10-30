import type { Metadata } from 'next';
import Candidates from './candidates';
import VotingNotice from './voting-notice';
import './reps.css';
export const metadata: Metadata = {
  title: 'Meet your representative candidates · MIM28 Council',
  description: 'All 13 MIM28 representative candidates and their official pitch videos, organised by role. Voting takes place on Canvas.',
  robots: { index: false, follow: false },
  icons: { icon: [{ url: '/reps-icon.svg', type: 'image/svg+xml' }] },
};
export default function Representatives() {
  return <main className="reps-page">
    <header className="reps-header"><span className="reps-brand">MIM28 <span>Council</span></span><a href="https://learn.insead.edu/courses/9890/assignments/82984" className="reps-vote">Voting on Canvas <span aria-hidden="true">↗</span></a></header>
    <div className="reps-content">
      <section className="reps-intro"><p className="reps-eyebrow">REPRESENTATIVE ELECTION · 18 SEPTEMBER 2026</p><h1>Meet your candidates.</h1><p>Four roles. Thirteen candidates. Watch their official pitch videos and make your choice on Canvas.</p></section>
      <VotingNotice />
      <nav className="reps-nav" aria-label="Representative roles">{['Academic','Brand','Careers','Student Life'].map(role=><a key={role} href={'#'+role.toLowerCase().replace(' ','-')}>{role}<span aria-hidden="true">↓</span></a>)}</nav>
      <Candidates />
      <aside className="reps-note"><h2>Every candidate, equally represented.</h2><p>This directory is maintained by the MIM28 Student Council and does not endorse any candidate. Names, roles and videos come from the programme’s candidate announcement. Candidate order is randomized within each role and saved in this browser.</p><p>Videos open on INSEAD’s video platform; you may need to sign in. The official election is hosted on Canvas.</p><a href="https://learn.insead.edu/courses/9890/announcements/44196">View the original Canvas announcement ↗</a></aside>
      <footer className="reps-footer"><span>MIM28 Council</span><span>Student-run directory · Official voting on Canvas</span></footer>
    </div>
  </main>;
}
