export type VoteState = { count: number; voted: boolean };
type PendingVote = { confirmed: VoteState; desired: boolean; running: boolean };

// Keep the latest tap visible while serialising writes for each idea. Different
// ideas can save independently; rapid like/undo taps never race on the server.
export function createVoteQueue(options: {
  read: (id: string) => VoteState;
  render: (id: string, state: VoteState) => void;
  save: (id: string, voted: boolean) => Promise<VoteState>;
  pending: (id: string, saving: boolean) => void;
  failed: (id: string) => void;
}) {
  const entries = new Map<string, PendingVote>();
  function render(id: string, entry: PendingVote) {
    options.render(id, {
      voted: entry.desired,
      count: Math.max(
        0,
        entry.confirmed.count +
          Number(entry.desired) -
          Number(entry.confirmed.voted),
      ),
    });
  }
  async function flush(id: string, entry: PendingVote) {
    entry.running = true;
    options.pending(id, true);
    try {
      while (entry.desired !== entry.confirmed.voted) {
        entry.confirmed = await options.save(id, entry.desired);
        render(id, entry);
      }
    } catch {
      entry.desired = entry.confirmed.voted;
      render(id, entry);
      options.failed(id);
    } finally {
      entries.delete(id);
      options.pending(id, false);
    }
  }
  return {
    isPending: () => entries.size > 0,
    toggle(id: string) {
      let entry = entries.get(id);
      if (!entry) {
        const confirmed = options.read(id);
        entry = { confirmed, desired: confirmed.voted, running: false };
        entries.set(id, entry);
      }
      entry.desired = !entry.desired;
      render(id, entry);
      if (!entry.running) void flush(id, entry);
    },
  };
}

export function rankIdeas<T extends { id: string }>(
  ideas: T[],
  counts: Record<string, number>,
): T[] {
  // Stable ties retain the catalog/submission order instead of jumping randomly.
  return [...ideas].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
}
