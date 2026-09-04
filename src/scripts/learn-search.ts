/**
 * The search palette's behaviour.
 *
 * Scoring is deliberately small and legible rather than clever: a reader looking
 * for "transition" wants the article called "Change the transition between two
 * clips" first, and no amount of TF-IDF beats simply weighting the title above
 * the body. Every weight is one line and can be argued with.
 */
import { normalize, tokenize } from '../lib/normalize';

interface IndexEntry {
  s: string;
  o: number;
  u: string;
  t: string;
  d: string;
  g: string;
  n: { t: string; d: string; k: string; h: string; g: string; b: string };
}

const RECENT_KEY = 'diwche-learn-recent';
const MAX_PER_GROUP = 6;
const MAX_TOTAL = 20;

const dialog = document.querySelector<HTMLDialogElement>('[data-learn-search]');
const trigger = document.querySelector<HTMLAnchorElement>('[data-learn-search-open]');

if (dialog && trigger) {
  const input = dialog.querySelector<HTMLInputElement>('.lsd__input')!;
  const list = dialog.querySelector<HTMLUListElement>('.lsd__list')!;
  const hint = dialog.querySelector<HTMLElement>('[data-lsd-hint]')!;
  const empty = dialog.querySelector<HTMLElement>('[data-lsd-empty]')!;
  const indexUrl = trigger.dataset.index!;

  let index: IndexEntry[] | null = null;
  let loading: Promise<IndexEntry[]> | null = null;
  let hits: IndexEntry[] = [];
  let active = -1;

  /** Fetched on the first open, never on page load. */
  function load(): Promise<IndexEntry[]> {
    if (index) return Promise.resolve(index);
    loading ??= fetch(indexUrl)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: IndexEntry[]) => (index = data))
      .catch(() => (index = []));
    return loading;
  }

  /** Prefix, not equality, so `transi` finds `transition`. */
  const hasPrefix = (haystack: string, token: string) =>
    haystack === token ||
    haystack.startsWith(token + ' ') ||
    haystack.includes(' ' + token) ||
    haystack.includes(token);

  function score(e: IndexEntry, tokens: string[], whole: string): number {
    let total = 0;

    if (e.n.t === whole) {
      total += 100;
    } else if (e.n.t.startsWith(whole)) {
      /*
       * Scaled by how much of the title the query actually covers.
       *
       * A flat bonus here meant a title that merely *began* with a common word
       * beat everything: "instagram" put "Instagram says it is disconnected"
       * above "Connect your Instagram account", because one title happened to
       * start with the word and the other did not. Typing most of a title is a
       * strong signal; typing its first word is barely one.
       */
      total += Math.round(60 * (whole.length / e.n.t.length));
    }

    for (const tok of tokens) {
      if (e.n.t.includes(tok)) total += 24;
      if (hasPrefix(e.n.k, tok)) total += 18;
      if (e.n.h.includes(tok)) total += 12;
      if (e.n.d.includes(tok)) total += 8;
      /* The section this article lives in. Worth more than a passing mention in
         someone else's body: an article filed under "Ideas and Performance" is
         about performance in a way that a troubleshooting page naming it once
         is not. */
      if (e.n.g.includes(tok)) total += 6;
      if (e.n.b.includes(tok)) total += 3;
    }

    // Every token has to appear somewhere, or a two-word query degenerates into
    // "anything containing the commonest of the two".
    const all = tokens.every(
      (tok) =>
        e.n.t.includes(tok) ||
        e.n.k.includes(tok) ||
        e.n.h.includes(tok) ||
        e.n.d.includes(tok) ||
        e.n.g.includes(tok) ||
        e.n.b.includes(tok)
    );

    return all ? total : 0;
  }

  /**
   * Highlighting, built from DOM nodes.
   *
   * Never `innerHTML`: the strings being marked up are an article title and a
   * description, which are ours — but the *query* is the visitor's, and building
   * markup out of a value someone typed is the exact shape of the bug that gets
   * a documentation site turned into an XSS demo.
   */
  function mark(text: string, tokens: string[]): DocumentFragment {
    const frag = document.createDocumentFragment();
    const folded = normalize(text);
    if (!tokens.length) {
      frag.append(text);
      return frag;
    }

    // Work on the folded string, then map back by index — folding is 1:1 for
    // everything except removed marks, which is close enough for a highlight and
    // never produces an offset outside the source.
    const ranges: [number, number][] = [];
    for (const tok of tokens) {
      let from = 0;
      for (;;) {
        const at = folded.indexOf(tok, from);
        if (at === -1) break;
        ranges.push([at, at + tok.length]);
        from = at + tok.length;
      }
    }
    if (!ranges.length) {
      frag.append(text);
      return frag;
    }

    ranges.sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const r of ranges) {
      const last = merged[merged.length - 1];
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
      else merged.push([...r] as [number, number]);
    }

    let cursor = 0;
    for (const [from, to] of merged) {
      if (from > text.length) break;
      if (from > cursor) frag.append(text.slice(cursor, from));
      const el = document.createElement('mark');
      el.append(text.slice(from, Math.min(to, text.length)));
      frag.append(el);
      cursor = to;
    }
    if (cursor < text.length) frag.append(text.slice(cursor));
    return frag;
  }

  function recent(): string[] {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? (JSON.parse(raw) as string[]).slice(0, 5) : [];
    } catch {
      return []; // Private mode throws on read. A search box still works.
    }
  }

  function remember(q: string) {
    if (!q.trim()) return;
    try {
      const next = [q, ...recent().filter((r) => r !== q)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* The history just won't outlive the tab. */
    }
  }

  function render(entries: IndexEntry[], tokens: string[]) {
    list.replaceChildren();
    hits = entries;
    active = entries.length ? 0 : -1;

    let group = '';
    entries.forEach((e, i) => {
      if (e.g !== group) {
        group = e.g;
        const li = document.createElement('li');
        li.className = 'lsd__group';
        li.setAttribute('role', 'presentation');
        li.append(group);
        list.append(li);
      }

      const li = document.createElement('li');
      li.setAttribute('role', 'presentation');

      const a = document.createElement('a');
      a.className = 'lsd__hit';
      a.href = e.u;
      a.id = `lsd-hit-${i}`;
      a.setAttribute('role', 'option');
      a.setAttribute('aria-selected', String(i === active));

      const t = document.createElement('span');
      t.className = 'lsd__t';
      t.append(mark(e.t, tokens));

      const d = document.createElement('span');
      d.className = 'lsd__d';
      d.append(mark(e.d, tokens));

      a.append(t, d);
      a.addEventListener('mousemove', () => select(i));
      li.append(a);
      list.append(li);
    });

    syncActive();
  }

  function syncActive() {
    const options = list.querySelectorAll<HTMLAnchorElement>('.lsd__hit');
    options.forEach((o, i) => o.setAttribute('aria-selected', String(i === active)));
    const current = options[active];
    if (current) {
      input.setAttribute('aria-activedescendant', current.id);
      current.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function select(i: number) {
    active = i;
    syncActive();
  }

  function search(raw: string) {
    const whole = normalize(raw);
    const tokens = tokenize(raw);
    const data = index ?? [];

    if (!tokens.length) {
      const rec = recent();
      hint.hidden = false;
      empty.hidden = true;
      // Recent searches first when there are any, then the starters.
      hint.textContent = rec.length ? rec.join(' · ') : hint.dataset.starters ?? hint.textContent;
      render(data.slice(0, MAX_TOTAL), []);
      return;
    }

    hint.hidden = true;

    const scored = data
      .map((e) => ({ e, n: score(e, tokens, whole) }))
      .filter((r) => r.n > 0)
      /* Score first, then position in the guide. Without the tie-break, "How do
         I fix X" outranked "How X works" whenever both had the word in their
         title — and someone searching a feature usually wants the feature. */
      .sort((a, b) => b.n - a.n || a.e.o - b.e.o);

    const perGroup = new Map<string, number>();
    const kept: IndexEntry[] = [];
    for (const { e } of scored) {
      const used = perGroup.get(e.g) ?? 0;
      if (used >= MAX_PER_GROUP || kept.length >= MAX_TOTAL) continue;
      perGroup.set(e.g, used + 1);
      kept.push(e);
    }

    if (!kept.length) {
      list.replaceChildren();
      hits = [];
      active = -1;
      empty.hidden = false;
      empty.textContent = `${empty.dataset.nomatch ?? 'Nothing matched'} “${raw.trim()}”.`;
      return;
    }

    empty.hidden = true;
    render(kept, tokens);
  }

  async function open() {
    if (dialog.open) return;
    dialog.showModal();
    input.value = '';
    await load();
    search('');
    input.focus();
  }

  trigger.addEventListener('click', (e) => {
    // Let a modified click do what the reader asked — open /learn/all/ in a tab.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    void open();
  });

  input.addEventListener('input', () => search(input.value));

  input.addEventListener('keydown', (e) => {
    /*
     * Escape, explicitly.
     *
     * `<input type="search">` swallows the first Escape to clear itself, so the
     * dialog's own Esc-to-close never fires and the reader has to press it
     * twice — on a control whose footer says one press closes it.
     */
    if (e.key === 'Escape') {
      e.preventDefault();
      dialog.close();
      return;
    }

    if (!hits.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      select((active + 1) % hits.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      select((active - 1 + hits.length) % hits.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      select(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      select(hits.length - 1);
    } else if (e.key === 'Enter') {
      const hit = hits[active];
      if (!hit) return;
      e.preventDefault();
      remember(input.value);
      location.href = hit.u;
    }
  });

  addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement | null;
    const typing =
      !!target &&
      (target.isContentEditable ||
        /^(input|textarea|select)$/i.test(target.tagName));

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      void open();
    } else if (e.key === '/' && !typing && !dialog.open) {
      e.preventDefault();
      void open();
    }
  });
}
