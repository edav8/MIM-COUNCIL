'use client';
/* oxlint-disable next/no-html-link-for-pages -- Full-page navigation avoids a live Vinext router failure. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Heart,
  Plus,
  Search,
  Send,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { matchingIdeas, normalizeIdeaTitle } from '@/lib/idea-matches';
import { createVoteQueue, rankIdeas, type VoteState } from '@/lib/vote-queue';
import { catalog, categories, type BoardIdea } from '@/lib/idea-catalog';
import { upcoming } from '@/lib/events';
import { current as mimOfWeek, initialsOf } from '@/lib/mim-of-the-week';
type LiveBoard = {
  ideas: { id: string; title: string; idea: string; created_at: number }[];
  counts: Record<string, number>;
  voted: string[];
};
const tone: Record<string, string> = {
  Academic: 'blue',
  Careers: 'yellow',
  Community: 'orange',
  Wellbeing: 'pink',
  'From the cohort': 'mint',
};
export default function Home() {
  const [live, setLive] = useState<LiveBoard>({
    ideas: [],
    counts: {},
    voted: [],
  });
  const [ready, setReady] = useState(false),
    [boardError, setBoardError] = useState('');
  const [category, setCategory] = useState('All'),
    [query, setQuery] = useState(''),
    [sort, setSort] = useState('popular');
  const [voting, setVoting] = useState<string[]>([]),
    [notice, setNotice] = useState('');
  const [detail, setDetail] = useState<BoardIdea | null>(null),
    [formOpen, setFormOpen] = useState(false),
    [source, setSource] = useState<BoardIdea | null>(null);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState(''), [privacy, setPrivacy] = useState('public');
  const [resultMessage, setResultMessage] = useState('');
  const [serverMatch, setServerMatch] = useState<BoardIdea | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
      'idle',
    ),
    [error, setError] = useState('');
  const requestId = useRef(''),
    lastPayload = useRef('');
  const liveRef = useRef(live),
    revision = useRef(0),
    loadSequence = useRef(0);
  const queue = useRef<ReturnType<typeof createVoteQueue> | null>(null);
  const voteScrollTop = useRef<number | null>(null);
  function updateLive(next: LiveBoard) {
    liveRef.current = next;
    setLive(next);
  }
  if (!queue.current)
    queue.current = createVoteQueue({
      read: (id) => ({
        count: liveRef.current.counts[id] ?? 0,
        voted: liveRef.current.voted.includes(id),
      }),
      render: (id, value) => {
        const current = liveRef.current;
        updateLive({
          ...current,
          counts: { ...current.counts, [id]: value.count },
          voted: value.voted
            ? [...new Set([...current.voted, id])]
            : current.voted.filter((v) => v !== id),
        });
      },
      save: async (id, voted) => {
        const r = await fetch('/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ideaId: id,
            action: voted ? 'vote' : 'remove',
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!r.ok) throw new Error();
        const data = (await r.json()) as VoteState;
        if (
          !Number.isFinite(data.count) ||
          data.count < 0 ||
          typeof data.voted !== 'boolean' ||
          data.voted !== voted
        )
          throw new Error();
        return data;
      },
      pending: (id, saving) => {
        revision.current++;
        setVoting((v) => (saving ? [...v, id] : v.filter((x) => x !== id)));
      },
      failed: (id) => {
        const item =
          catalog.find((i) => i.id === id) ??
          liveRef.current.ideas.find((i) => i.id === id);
        setNotice(
          `We couldn’t confirm your like for “${item?.title ?? 'this idea'}”. Check your connection and try again.`,
        );
      },
    });
  const ideas: BoardIdea[] = [...catalog, ...live.ideas.map(i => ({
    id: i.id, title: i.title, category: 'From the cohort' as const,
    description: i.idea.length > 180 ? i.idea.slice(0, 177) + '…' : i.idea,
    detail: i.idea, progress: '', nextStep: '', community: true,
    question: 'How would you build on this idea?',
  }))];
  const suggestions = privacy === 'public' && !source ? matchingIdeas(title, ideas) : [];
  const suggestedMatches = serverMatch ? [serverMatch, ...suggestions.filter(i=>i.id!==serverMatch.id)] : suggestions;
  async function loadBoard() {
    const request = ++loadSequence.current,
      started = revision.current;
    try {
      const r = await fetch('/api/board', {
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok) throw new Error();
      const data = (await r.json()) as LiveBoard;
      if (request !== loadSequence.current) return;
      if (started === revision.current && !queue.current?.isPending())
        updateLive(data);
      else updateLive({ ...liveRef.current, ideas: data.ideas });
      setReady(true);
      setBoardError('');
    } catch {
      if (request === loadSequence.current)
        setBoardError(
          'Live likes aren’t available right now. You can still explore the ideas.',
        );
    }
  }
  useEffect(() => {
    void loadBoard();
    function refresh() {
      if (document.visibilityState === 'visible' && !queue.current?.isPending())
        void loadBoard();
    }
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, []);
  useEffect(() => {
    function warn(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    if (voting.length) window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [voting.length]);
  useLayoutEffect(() => {
    if (voteScrollTop.current === null) return;
    const top = voteScrollTop.current;
    voteScrollTop.current = null;
    window.scrollTo(0, top);
  }, [live]);
  function vote(id: string) {
    if (!ready) return;
    voteScrollTop.current = window.scrollY;
    revision.current++;
    setNotice('');
    queue.current?.toggle(id);
  }
  function openForm(item: BoardIdea | null = null) {
    setDetail(null);
    setSource(item);
    setPrivacy(item ? 'private' : 'public');
    setTitle('');
    setResultMessage('');
    setServerMatch(null);
    setBody('');
    setStatus('idle');
    setError('');
    requestId.current = '';
    lastPayload.current = '';
    setFormOpen(true);
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;
    const exactMatch = privacy === 'public' && !source
      ? ideas.find(item => normalizeIdeaTitle(item.title) === normalizeIdeaTitle(title))
      : undefined;
    if (exactMatch) {
      setServerMatch(exactMatch);
      setError('This idea is already on the board. Like it to show your support. If your proposal is different, give it a distinct title.');
      setStatus('idle');
      return;
    }
    const form = e.currentTarget;
    const f = new FormData(form);
    const payload = {
      idea: body,
      title: privacy === 'public' ? title : '',
      sourceIdea: source?.id ?? '',
      name: String(f.get('name') ?? ''),
      contact: String(f.get('contact') ?? ''),
      website: String(f.get('website') ?? ''),
      isPublic: privacy === 'public' && !source,
    };
    const serialized = JSON.stringify(payload);
    if (lastPayload.current !== serialized) {
      requestId.current = crypto.randomUUID();
      lastPayload.current = serialized;
    }
    setStatus('sending');
    setError('');
    try {
      const r = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: requestId.current }),
      });
      if (!r.ok) {
        const d = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error || 'We couldn’t save this. Please try again.');
      }
      const result = await r.json() as {message?: string; duplicate?: {id:string;title:string}};
      if(result.duplicate){
        const match=ideas.find(i=>i.id===result.duplicate!.id) ?? {id:result.duplicate.id,title:result.duplicate.title,category:'From the cohort' as const,description:'',detail:'',progress:'',nextStep:'',question:'How would you build on this?',community:true};
        setServerMatch(match);setError(result.message ?? 'This idea already exists.');setStatus('idle');await loadBoard();return;
      }
      setResultMessage(result.message ?? 'Your message has been saved for the team.');
      setStatus('sent');
      form.reset();
      await loadBoard();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Please try again.');
    }
  }
  function filterIdeas(cat: string) {
    let list = ideas.filter(
      (i) =>
        (cat === 'All' || i.category === cat) &&
        `${i.title} ${i.description} ${i.detail}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
    );
    if (sort === 'popular') list = rankIdeas(list, live.counts);
    else
      list = [...list].sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
      );
    return list;
  }
  const likedCount = ideas.filter((i) => live.voted.includes(i.id)).length;
  const ranked = rankIdeas(ideas, live.counts);
  const rankFor = (id: string) => ranked.findIndex((i) => i.id === id) + 1;
  function voteButton(item: BoardIdea, large = false) {
    const voted = live.voted.includes(item.id),
      saving = voting.includes(item.id);
    return (
      <Button
        className={`vote-button ${voted ? 'voted' : ''} ${saving ? 'saving' : ''} ${large ? 'large' : ''}`}
        variant="outline"
        disabled={!ready}
        aria-pressed={voted}
        aria-label={`${voted ? 'Unlike' : 'Like'} ${item.title}, ${ready ? (live.counts[item.id] ?? 0) : 'loading'} likes`}
        onClick={() => vote(item.id)}
      >
        <Heart size={19} fill={voted ? 'currentColor' : 'none'} />
        <span>{voted ? 'Liked' : 'Like'}</span>
        <b key={String(live.counts[item.id] ?? 0)}>
          {ready ? (live.counts[item.id] ?? 0) : '–'}
        </b>
      </Button>
    );
  }
  function cards(cat: string) {
    const list = filterIdeas(cat);
    return (
      <>
        <p className="result-count" aria-live="polite">
          {list.length} {list.length === 1 ? 'idea' : 'ideas'}
          {query
            ? ` matching “${query}”`
            : cat === 'All'
              ? ' to explore'
              : ` in ${cat.toLowerCase()}`}
          <span>
            {sort === 'popular' ? 'Most liked first' : 'Team picks first'}
          </span>
        </p>
        {list.length ? (
          <div className="idea-grid">
            {list.map((item) => (
              <article
                className={`idea-card ${tone[item.category]} ${ready && sort === 'popular' && (live.counts[item.id] ?? 0) > 0 && rankFor(item.id) <= 3 ? 'top-idea' : ''} ${live.voted.includes(item.id) ? 'is-liked' : ''}`}
                key={item.id}
              >
                <div className="card-category">
                  <span>{item.category}</span>
                  {ready &&
                  sort === 'popular' &&
                  (live.counts[item.id] ?? 0) > 0 ? (
                    <span
                      className={`rank-badge ${rankFor(item.id) <= 3 ? 'podium' : ''}`}
                    >
                      {rankFor(item.id) === 1 && <Trophy size={14} />}#
                      {rankFor(item.id)}
                      {rankFor(item.id) === 1 ? ' Most wanted' : ''}
                    </span>
                  ) : null}
                </div>
                <button className="idea-title" onClick={() => setDetail(item)}>
                  <h3>{item.title}</h3>
                  <ArrowUpRight size={20} />
                </button>
                {item.description && (
                  <p className="idea-description">{item.description}</p>
                )}
                <div className="card-bottom">
                  {voteButton(item)}
                  <Button
                    variant="ghost"
                    className="build-on"
                    onClick={() => openForm(item)}
                  >
                    <span>Add a thought</span> <Plus size={16} />
                  </Button>
                </div>
              </article>
            ))}
            <button className="add-card" onClick={() => openForm()}>
              <Plus size={30} />
              <h3>What’s missing?</h3>
              <p>Suggest an event, a service or a change.</p>
              <span>
                Add an idea <ArrowUpRight size={20} />
              </span>
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <h3>
              No ideas match that yet.
            </h3>
            <p>
              Try another search, or send the team your suggestion.
            </p>
            <Button onClick={() => openForm()}>
              Add an idea <Plus size={18} />
            </Button>
          </div>
        )}
      </>
    );
  }
  return (
    <main>
      <a href="#ideas" className="skip-link">
        Skip to the idea board
      </a>
      <header className="site-header">
        <a href="/" className="wordmark">
          <img src="/images/insead-logo.webp" alt="INSEAD" width={58} height={58} /><span>MIM’28 Student Council candidates</span>
        </a>
        <nav>
          <a href="https://edav8.github.io/MIM28/" target="_blank" rel="noreferrer">Course Hub</a>
          <a href="https://edav8.github.io/insead-ski-trip/" target="_blank" rel="noreferrer">Ski trip</a>
          <a href="/team">Meet the team</a>
          <Button className="header-add" onClick={() => openForm()}>
            Add your idea <Plus size={17} />
          </Button>
        </nav>
      </header>
      <section className="campaign-intro" aria-labelledby="campaign-title">
        <div className="campaign-copy">
          <h1 id="campaign-title">The Salamanders</h1>
          <p className="campaign-mission">We <em>listen</em> to your concerns and turn <em>your ideas</em> into action, bridging our cohort with Student Life to make the most of MIM’28.</p>
        </div>
        <figure className="campaign-photo">
          <img src="/images/team-september-2026-v2.jpg" alt="The four Salamanders team members together at the INSEAD sign in Fontainebleau" width={2000} height={982} fetchPriority="high" />
          <figcaption><span>The Salamanders</span><a href="/team">Meet the team <ArrowUpRight size={17} /></a></figcaption>
        </figure>
      </section>
      <section className="mim-week" aria-labelledby="mim-week-title">
        <div className="mim-week-inner">
          <p className="eyebrow" id="mim-week-title">MIM of the Week{mimOfWeek?.placeholder ? ' · placeholder' : ''}</p>
          <div className="mim-week-card">
            <div className="mim-week-face" aria-hidden="true">
              {mimOfWeek?.photo
                ? <img src={mimOfWeek.photo} alt="" />
                : <span>{mimOfWeek ? initialsOf(mimOfWeek.name) : '??'}</span>}
            </div>
            <div className="mim-week-body">
              <strong>{mimOfWeek?.name}</strong>
              <span className="mim-week-when">{mimOfWeek?.week}</span>
              <p>{mimOfWeek?.why}</p>
              {mimOfWeek?.nominatedBy ? <p className="mim-week-by">Nominated by {mimOfWeek.nominatedBy}</p> : null}
            </div>
          </div>
        </div>
      </section>
      <section className="whats-on" id="whats-on" aria-labelledby="whats-on-title">
        <div className="whats-on-heading">
          <p className="eyebrow">WHAT’S ON</p>
          <h2 id="whats-on-title">Next up for the cohort</h2>
          <p className="whats-on-intro">
            Everything coming up that everyone can join. Dates move — where
            something is not yet confirmed, it says so.
          </p>
        </div>
        <ul className="event-list">
          {upcoming('cohort').map((event) => (
            <li className="event-row" key={event.title}>
              <span className="event-when">{event.when}</span>
                  {event.repeats ? <span className="event-repeats">{event.repeats}</span> : null}
              <div className="event-body">
                <h3>{event.title}</h3>
                {event.where && <p className="event-where">{event.where}</p>}
                {event.note && <p className="event-note">{event.note}</p>}
              </div>
              {event.href && (
                <a
                  className="event-cta"
                  href={event.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {event.cta} <ArrowUpRight size={16} />
                </a>
              )}
            </li>
          ))}
        </ul>
        {upcoming('careers').length > 0 && (
          <div className="event-careers">
            <p className="eyebrow">CAREERS &amp; CDC</p>
            <ul className="event-list">
              {upcoming('careers').map((event) => (
                <li className="event-row" key={event.title}>
                  <span className="event-when">{event.when}</span>
                  {event.repeats ? <span className="event-repeats">{event.repeats}</span> : null}
                  <div className="event-body">
                    <h3>{event.title}</h3>
                    {event.where && <p className="event-where">{event.where}</p>}
                    {event.note && <p className="event-note">{event.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section className="board" id="ideas" aria-labelledby="board-title">
        <div className="board-heading">
          <div><p className="eyebrow">OUR PLANNED INITIATIVES & YOUR IDEAS</p>
          <h2 id="board-title">What do you want to make happen?</h2>
          <p className="board-intro">Explore our initiatives. Like your favourites, or add an event, a service or a change.</p></div>
        </div>
        <div className="board-tools">
          <label className="search-box">
            <Search size={19} />
            <span className="sr-only">Search ideas</span>
            <Input
              type="search"
              placeholder="Find an idea…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <Select
            value={sort}
            onValueChange={(v) => setSort(String(v))}
            items={[
              { value: 'suggested', label: 'Team picks' },
              { value: 'popular', label: 'Most wanted' },
            ]}
          >
            <SelectTrigger aria-label="Sort ideas" className="sort-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="suggested">Team picks</SelectItem>
              <SelectItem value="popular">Most wanted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs value={category} onValueChange={(v) => setCategory(String(v))}>
          <TabsList className="category-tabs" aria-label="Idea categories">
            {['All', ...categories].map((c) => (
              <TabsTrigger value={c} key={c}>
                {c}
                {c === 'All' ? <span>{ideas.length}</span> : null}
              </TabsTrigger>
            ))}
          </TabsList>
          {boardError && (
            <div className="board-message" role="status">
              {boardError}
              <Button variant="link" onClick={() => loadBoard()}>
                Try again
              </Button>
            </div>
          )}
          <div className="participation-note">
            <span>
              <Heart size={16} fill={likedCount ? 'currentColor' : 'none'} />
              {ready
                ? likedCount
                  ? `${likedCount} ${likedCount === 1 ? 'idea' : 'ideas'} liked by you`
                  : 'What gets your vote?'
                : 'Loading live likes…'}
              {voting.length > 0 && (
                <small className="save-status">Saving…</small>
              )}
            </span>
            <span>Like as many as you want. Tap again to undo.</span>
          </div>
          <p
            className={`vote-notice ${notice ? 'has-notice' : ''}`}
            role="status"
            aria-live="polite"
          >
            {notice}
          </p>
          {['All', ...categories].map((c) => (
            <TabsContent value={c} key={c}>
              {cards(c)}
            </TabsContent>
          ))}
        </Tabs>
        <p className="board-footnote">
          Open an initiative to see the plan, the conversations already held and
          the next steps. Dates, bookings and costs will be shared as they are agreed.
          Likes are counted per browser, not verified individual students.
        </p>
      </section>
      <section className="closing">
        <div>
          <p className="eyebrow">YOUR SUGGESTIONS</p>
          <h2>What would you add?</h2>
          <p>
            Suggest an initiative, raise an issue or offer to help organise
            something.
          </p>
        </div>
        <Button onClick={() => openForm()}>
          Submit an idea <ArrowUpRight size={24} />
        </Button>
      </section>
      <footer>
        <strong>We <u>listen.</u> We <u>serve.</u> We <u>execute.</u></strong>
        <a href="/team" className="footer-team-link">
          Meet the team <ArrowUpRight size={20} />
        </a>
        <nav className="footer-links">
          <a href="https://edav8.github.io/MIM28/" target="_blank" rel="noreferrer">
            Course Hub <ArrowUpRight size={16} />
          </a>
          <a href="https://edav8.github.io/insead-ski-trip/" target="_blank" rel="noreferrer">
            Ski trip <ArrowUpRight size={16} />
          </a>
        </nav>
      </footer>
      <Dialog
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent className="idea-dialog">
          {detail && (
            <>
              <DialogHeader>
                <p className={`dialog-category ${tone[detail.category]}`}>
                  {detail.category}
                </p>
                <DialogTitle>{detail.title}</DialogTitle>
                <DialogDescription>
                  {detail.description || 'An idea from the cohort.'}
                </DialogDescription>
              </DialogHeader>
              <div className="detail-body">
                <h3>
                  {detail.community ? 'From the cohort' : 'Our plan'}
                </h3>
                <p>{detail.detail}</p>
                {!detail.community && <>
                  <h3>Where we are now</h3><p>{detail.progress}</p>
                  <h3>Next steps</h3><p>{detail.nextStep}</p>
                </>}
                {detail.question && <div className="detail-question">{detail.question}</div>}
              </div>
              <div className="dialog-actions">
                {voteButton(detail, true)}
                <Button onClick={() => openForm(detail)}>
                  Add a thought <Plus size={18} />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (status !== 'sending') setFormOpen(open);
        }}
      >
        <DialogContent className="contribution-dialog">
          <DialogHeader>
            <p className="eyebrow">CONTACT THE TEAM</p>
            <DialogTitle>
              {status === 'sent'
                ? 'Thanks for contributing.'
                : source
                  ? 'Add a comment'
                  : 'Submit an idea'}
            </DialogTitle>
            <DialogDescription>
              {status === 'sent'
                ? resultMessage
                : source
                  ? source.question || 'Share a thought or offer to help.'
                  : 'Suggest an event, a service or a change.'}
            </DialogDescription>
          </DialogHeader>
          {status === 'sent' ? (
            <div className="success">
              <span className="success-mark">
                <Check size={30} />
              </span>
              <p>
                Your optional name and contact details remain private. If you left a way to reach you, we can follow up.
              </p>
              <Button
                onClick={() => {
                  setFormOpen(false);
                  document
                    .getElementById('ideas')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Back to the ideas <ArrowUpRight size={18} />
              </Button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <fieldset
                disabled={status === 'sending'}
                style={{ border: 0, padding: 0, margin: 0 }}
              >
                {!source && (
                  <RadioGroup value={privacy} onValueChange={v => setPrivacy(String(v))} className="privacy-options" aria-label="Who can see your idea">
                    <label><RadioGroupItem value="public" />Suggest a public idea</label>
                    <label><RadioGroupItem value="private" />Just tell the team</label>
                  </RadioGroup>
                )}
                {privacy === 'public' && (
                  <div className="form-field">
                    <label htmlFor="idea-title">Idea title</label>
                    <Input id="idea-title" value={title} onChange={e => {setTitle(e.target.value);setServerMatch(null);setError('');}} required minLength={5} maxLength={100} placeholder="e.g. Sunday football" />
                  </div>
                )}
                {source && (
                  <p className="source-note">Building on: <strong>{source.title}</strong></p>
                )}
                {privacy === 'public' && suggestedMatches.length > 0 && (
                  <div className="similar-ideas" aria-live="polite">
                    <h3>{serverMatch ? 'This idea is already here' : 'Is this what you had in mind?'}</h3>
                    <p>Like an existing idea to keep the votes together. If yours is different, use a distinct title and carry on.</p>
                    {suggestedMatches.map(item=><div className="similar-idea" key={item.id}><strong>{item.title}</strong>{voteButton(item)}</div>)}
                    {serverMatch && <p className="duplicate-note">{error}</p>}
                  </div>
                )}
                <div className="form-field">
                  <label htmlFor="idea-details">
                    {source ? 'Your thought, question or offer to help' : privacy === 'public' ? 'Add details (optional)' : 'Your message'}
                  </label>
                  <Textarea
                    id="idea-details"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required={privacy !== 'public'}
                    minLength={privacy !== 'public' ? 5 : undefined}
                    maxLength={2000}
                    placeholder={
                      source
                        ? source.question || 'Anything you would like us to know?'
                        : privacy === 'public' ? 'Anything else you’d like to add? A title alone is fine.' : 'One thing that would make MIM better is…'
                    }
                    className="idea-field"
                  />
                </div>
                <div className="optional-grid">
                  <div>
                    <label htmlFor="name">
                      Name <span>(optional)</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      maxLength={100}
                      autoComplete="name"
                      placeholder="You can leave this blank"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact">
                      Contact <span>(optional)</span>
                    </label>
                    <Input
                      id="contact"
                      name="contact"
                      maxLength={200}
                      placeholder="Email or WhatsApp"
                    />
                  </div>
                </div>
                <div className="honey" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <p className="privacy-note">
                  {privacy === 'public'
                    ? 'Your title and description are sent to OpenAI for an automated spam and relevance check. Approved ideas appear publicly. Keep personal information out of them. Your optional name and contact details stay private and are not sent for the AI check.'
                    : 'Your message and optional contact details stay private and reach the team by email. Private messages are not sent for an AI check.'}
                </p>
                {status === 'error' && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="submit-idea"
                  disabled={status === 'sending'}
                >
                  {status === 'sending'
                    ? (privacy === 'public' ? 'Checking your idea…' : 'Saving…')
                    : (privacy === 'public' ? 'Submit for a quick check' : 'Send privately to the team')}
                  <Send size={18} />
                </Button>
              </fieldset>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
