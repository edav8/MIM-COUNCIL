/* oxlint-disable next/no-html-link-for-pages -- Full-page navigation avoids a live Vinext router failure. */
import type { Metadata } from 'next';
import Image from 'next/image';
import { council, initials } from '@/lib/council';

export const metadata: Metadata = {
  title: 'Meet the team · The Salamanders',
  description:
    'Meet The Salamanders, the MIM’28 Student Council at INSEAD.',
};

export default function TeamPage() {
  return (
    <main className="team-page">
      <a href="#team" className="skip-link">
        Skip to the team
      </a>
      <header className="site-header">
        <a href="/" className="wordmark">
          <Image
            src="/images/insead-logo.webp"
            alt="INSEAD"
            width={58}
            height={58}
          />
          <span>MIM’28 Student Council</span>
        </a>
        <nav>
          <a href="/">Back to the ideas</a>
        </nav>
      </header>

      <section className="team-page-intro" aria-labelledby="team-page-title">
        <div>
          <p className="eyebrow">THE SALAMANDERS</p>
          <h1 id="team-page-title">Meet our team</h1>
        </div>
        <figure className="team-page-photo">
          <Image
            src="/images/team-september-2026-v2.jpg"
            alt="Members of the MIM’28 Student Council together at the INSEAD sign in Fontainebleau"
            width={2000}
            height={982}
          />
          <figcaption>The Salamanders · MIM’28</figcaption>
        </figure>
      </section>

      <section className="about-team team-page-details" id="team">
        <div>
          <p className="eyebrow">
            THE SALAMANDERS · YOUR MIM’28 STUDENT COUNCIL
          </p>
          <h2>
            A MIM community where everyone belongs and has the opportunity to
            contribute.
          </h2>
          <p>
            <strong>Our VALUE</strong> — We listen, collaborate with your
            representatives and help turn your ideas into action.
          </p>
        </div>
        <ul className="council-roster">
          {council.map((person) => (
            <li className="council-member" key={person.name}>
              {person.photo ? (
                <Image
                  className="council-avatar"
                  src={person.photo}
                  alt=""
                  width={96}
                  height={96}
                />
              ) : (
                <span className="council-avatar council-initials" aria-hidden="true">
                  {initials(person.name)}
                </span>
              )}
              <div className="council-text">
                <strong>{person.name}</strong>
                <span className="council-role">{person.role}</span>
                {person.email && (
                  <a className="council-email" href={`mailto:${person.email}`}>
                    {person.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer>
        <strong>
          We <u>listen.</u> We <u>serve.</u> We <u>execute.</u>
        </strong>
      </footer>
    </main>
  );
}
