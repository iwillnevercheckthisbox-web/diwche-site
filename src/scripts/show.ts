/**
 * The show's clock and state machine.
 *
 * One rule shapes everything here: the visitor's attention is the scarce thing,
 * not the server's time. The scenes are not a loading spinner dressed up — they
 * are the introduction, and the read happens underneath them. So the sequence
 * has its own pace, and the result adapts to the sequence rather than
 * interrupting it: if the read lands early the remaining scenes shorten, if it
 * runs long the scenes keep cycling. Neither case ever shows a stalled frame.
 */
import {
  ApiError,
  getTopics,
  makePost,
  requestProof,
  saveLead,
  saveWaitingLead,
  startAudit,
  startIdea,
  watchAudit,
  type AuditResult,
  type AuditErrorKind,
  type Fact,
  type Topic,
} from '../lib/publicApi';

interface SceneState {
  /** The work behind the scenes has finished. */
  done: boolean;
  /** The player has reached a clean boundary and the walk may move on. */
  settled?: boolean;
  /** Set by the waiter, called by the player at that boundary. */
  resolve?: () => void;
}

type Act = 'read' | 'reveal' | 'branch' | 'topics' | 'post' | 'behalf' | 'projection' | 'offer' | 'error';

/** How long a scene holds once it is fully in. */
const HOLD = 4600;
/** The same, once the read is already done and we are heading for the reveal. */
const HOLD_HURRIED = 1500;
/** Nobody sees the product if the read is instant, so this many scenes play regardless. */
const MIN_SCENES = 2;
const TIP_EVERY = 6800;

const HANDLE = /^@?[A-Za-z0-9._]{1,30}$/;
const STORE = 'diwche-show';

const stage = document.querySelector<HTMLElement>('#stage');
const form = document.querySelector<HTMLFormElement>('[data-handle-form]');

if (stage && form) {
  run(stage, form);
}

function run(stage: HTMLElement, form: HTMLFormElement) {
  const input = form.querySelector<HTMLInputElement>('input[name="handle"]')!;
  const formError = form.querySelector<HTMLElement>('[data-handle-error]');
  const acts = new Map<Act, HTMLElement>();
  for (const el of stage.querySelectorAll<HTMLElement>('[data-act]')) {
    acts.set(el.dataset.act as Act, el);
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let auditId: string | null = null;
  let result: AuditResult | null = null;
  let branch: 'page' | 'idea' = 'page';
  let cancelScenes: (() => void) | null = null;

  // ---- Act switching -------------------------------------------------------

  function show(act: Act) {
    for (const [name, el] of acts) {
      const live = name === act;
      el.hidden = !live;
      el.toggleAttribute('data-live', live);
    }
    stage.dataset.state = act;
    const el = acts.get(act);
    if (!el) return;
    // Every act brings itself into view. The first one especially: submitting
    // the handle and being left looking at the field, with the whole show
    // happening below the fold, reads as nothing having happened at all.
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  /**
   * The reading header belongs to whatever is being waited on, not to the
   * audit. Topics generated from a fresh idea run behind the same scenes, and
   * leaving "Reading @handle" above them describes work that finished minutes
   * ago.
   */
  function setReader(verb: string, subject: string, line: string, percent: number) {
    const v = stage.querySelector<HTMLElement>('[data-reader-verb]');
    const who = stage.querySelector<HTMLElement>('[data-handle-out]');
    const l = stage.querySelector<HTMLElement>('[data-progress-line]');
    const bar = stage.querySelector<HTMLElement>('[data-progress-bar]');
    if (v) v.textContent = verb;
    if (who) who.textContent = subject;
    if (l) l.textContent = line;
    if (bar) bar.style.width = `${percent}%`;
  }

  function fail(message: string, kind: AuditErrorKind = 'error') {
    const el = stage.querySelector<HTMLElement>('[data-error-message]');
    if (el) el.textContent = message;
    // A private or unknown page is the visitor's to fix; the day's cap is ours,
    // and losing the lead over it would be our mistake twice.
    const waiting = stage.querySelector<HTMLElement>('[data-waiting]');
    if (waiting) waiting.hidden = kind !== 'limit';
    show('error');
  }

  // ---- The scene player ----------------------------------------------------

  function playScenes(readState: SceneState) {
    const scenes = Array.from(stage.querySelectorAll<HTMLElement>('[data-scene]'));
    if (!scenes.length) return () => {};

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    (async () => {
      let played = 0;
      let i = 0;

      while (!stopped) {
        const scene = scenes[i % scenes.length];
        scene.removeAttribute('data-out');
        scene.setAttribute('data-in', '');
        scene.setAttribute('aria-hidden', 'false');

        await wait(readState.done ? HOLD_HURRIED : HOLD);
        if (stopped) return;

        scene.removeAttribute('data-in');
        scene.setAttribute('data-out', '');
        scene.setAttribute('aria-hidden', 'true');
        played++;

        // The exit has to finish before the next scene starts, or two captures
        // are on screen at once and the cross-fade reads as a glitch.
        await wait(reduced ? 60 : 420);
        if (stopped) return;

        // Enough of the product has been shown and the work is in: go. The
        // resolver is what lets the awaiting caller move on exactly here, on a
        // scene boundary, rather than mid-fade.
        if (readState.done && played >= MIN_SCENES) {
          readState.settled = true;
          readState.resolve?.();
          return;
        }
        i++;
      }
    })();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      for (const s of scenes) {
        s.removeAttribute('data-in');
        s.removeAttribute('data-out');
        s.setAttribute('aria-hidden', 'true');
      }
    };
  }

  function playTips() {
    const el = stage.querySelector<HTMLElement>('[data-tip]');
    const payload = stage.querySelector<HTMLElement>('[data-tips]');
    if (!el || !payload) return () => {};

    let tips: string[] = [];
    try {
      tips = JSON.parse(payload.textContent ?? '[]') as string[];
    } catch {
      return () => {};
    }
    if (tips.length < 2) return () => {};

    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % tips.length;
      el.setAttribute('data-fading', '');
      setTimeout(() => {
        el.textContent = tips[i];
        el.removeAttribute('data-fading');
      }, reduced ? 0 : 220);
    }, TIP_EVERY);

    return () => clearInterval(id);
  }

  // ---- Rendering the visitor's own numbers ---------------------------------

  function tpl(name: string): HTMLElement {
    const t = stage.querySelector<HTMLTemplateElement>(`[data-tpl="${name}"]`);
    if (!t) throw new Error(`missing template ${name}`);
    return t.content.firstElementChild!.cloneNode(true) as HTMLElement;
  }

  function field(root: HTMLElement, name: string) {
    return root.querySelector<HTMLElement>(`[data-f="${name}"]`);
  }

  function renderFacts(facts: Fact[]) {
    const host = stage.querySelector<HTMLElement>('[data-facts]');
    if (!host) return;
    host.textContent = '';

    facts.forEach((fact, index) => {
      const el = tpl('fact');
      el.toggleAttribute('data-locked', Boolean(fact.locked));
      field(el, 'label')!.textContent = fact.label;
      field(el, 'value')!.textContent = fact.value;
      field(el, 'text')!.textContent = fact.text;

      const meter = field(el, 'meter');
      if (fact.meter && meter) {
        meter.hidden = false;
        const pct = Math.max(0, Math.min(100, (fact.meter.value / fact.meter.max) * 100));
        const fill = field(el, 'meter-fill');
        // Next frame, so the bar animates from zero instead of being born full.
        requestAnimationFrame(() => {
          if (fill) fill.style.width = `${pct}%`;
        });
        const mark = field(el, 'meter-mark');
        if (mark && typeof fact.meter.benchmark === 'number') {
          mark.style.left = `${Math.max(0, Math.min(100, (fact.meter.benchmark / fact.meter.max) * 100))}%`;
        } else if (mark) {
          mark.hidden = true;
        }
        const legend = field(el, 'meter-legend');
        if (legend) {
          legend.textContent = fact.meter.benchmarkLabel
            ? `The mark is the ${fact.meter.benchmarkLabel} for pages your size.`
            : '';
        }
      }

      el.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 50}ms`);
      el.classList.add('reveal');
      host.append(el);
      requestAnimationFrame(() => el.classList.add('is-in'));
    });

    const unlock = stage.querySelector<HTMLElement>('[data-unlock]');
    const next = stage.querySelector<HTMLElement>('[data-next="branch"]');
    const anyLocked = facts.some((f) => f.locked);
    if (unlock) unlock.hidden = !anyLocked;
    if (next) next.hidden = anyLocked;
  }

  function renderTopics(topics: Topic[]) {
    const host = stage.querySelector<HTMLElement>('[data-topics]');
    if (!host) return;
    host.textContent = '';

    topics.forEach((topic, index) => {
      const el = tpl('topic');
      field(el, 'format')!.textContent = topic.format;
      field(el, 'title')!.textContent = topic.title;
      field(el, 'hook')!.textContent = topic.hook;
      field(el, 'why')!.textContent = topic.why;
      el.style.setProperty('--reveal-delay', `${index * 50}ms`);
      el.classList.add('reveal');
      el.addEventListener('click', () => {
        for (const other of host.querySelectorAll('[data-chosen]')) {
          other.removeAttribute('data-chosen');
        }
        el.setAttribute('data-chosen', '');
        void toPost(topic);
      });
      host.append(el);
      requestAnimationFrame(() => el.classList.add('is-in'));
    });
  }

  function renderProjection(res: AuditResult) {
    const head = stage.querySelector<HTMLElement>('[data-projection-headline]');
    const rows = stage.querySelector<HTMLElement>('[data-projection-rows]');
    const assumption = stage.querySelector<HTMLElement>('[data-projection-assumption]');
    const act = acts.get('projection');
    if (!res.projection) {
      // No projection is a legitimate answer — too few posts to say anything
      // honest. Skipping the act is better than printing a number we do not have.
      if (act) act.dataset.skip = 'true';
      return;
    }
    if (act) delete act.dataset.skip;
    if (head) head.textContent = res.projection.headline;
    if (assumption) assumption.textContent = res.projection.assumption;
    if (rows) {
      rows.textContent = '';
      for (const row of res.projection.rows) {
        const el = tpl('proj-row');
        field(el, 'label')!.textContent = row.label;
        field(el, 'now')!.textContent = row.now;
        field(el, 'then')!.textContent = row.then;
        rows.append(el);
      }
    }
  }

  // ---- The walk ------------------------------------------------------------

  /**
   * Runs `work` behind the introduction.
   *
   * Every wait on this page is covered by the scenes rather than a spinner, and
   * they all obey the same contract: play at least MIN_SCENES, shorten once the
   * work is in, and never cut mid-scene. The audit is the long one; generating
   * topics from a fresh idea is the short one, and it gets the same treatment
   * because the alternative is a blank panel and a wait.
   */
  async function withScenes<T>(work: Promise<T>): Promise<T> {
    const readState: SceneState = { done: false };
    const stopScenes = playScenes(readState);
    const stopTips = playTips();
    cancelScenes = () => {
      stopScenes();
      stopTips();
    };
    show('read');

    let value: T;
    try {
      value = await work;
    } catch (err) {
      cancelScenes?.();
      cancelScenes = null;
      throw err;
    }

    readState.done = true;

    // Let the scene that is on screen finish rather than cutting it off. The
    // ceiling stops a dropped timer from stranding the visitor here.
    await new Promise<void>((resolve) => {
      const started = Date.now();
      const id = setInterval(() => {
        if (readState.settled || Date.now() - started > HOLD + 1600) {
          clearInterval(id);
          resolve();
        }
      }, 120);
      readState.resolve = () => {
        clearInterval(id);
        resolve();
      };
    });

    cancelScenes?.();
    cancelScenes = null;
    return value;
  }

  async function begin(handle: string) {
    const clean = handle.replace(/^@/, '').trim();

    stage.hidden = false;
    document.body.dataset.showing = 'true';
    setReader('Reading', `@${clean}`, 'Finding the page…', 0);

    const line = stage.querySelector<HTMLElement>('[data-progress-line]');
    const bar = stage.querySelector<HTMLElement>('[data-progress-bar]');

    const read = (async () => {
      const started = await startAudit(clean, await turnstileToken());
      auditId = started.id;
      sessionStorage.setItem(STORE, JSON.stringify({ id: auditId, handle: clean }));

      const watch = watchAudit(auditId, (p) => {
        if (line && p.message) line.textContent = p.message;
        if (bar) bar.style.width = `${Math.round(p.progress * 100)}%`;
      });
      const value = await watch.done;
      if (bar) bar.style.width = '100%';
      return value;
    })();

    try {
      result = await withScenes(read);
    } catch (err) {
      fail(messageFor(err), kindFor(err));
      return;
    }

    toReveal();
  }

  /** The no-page door: no scrape, no facts, straight to thinking about it. */
  async function beginIdea(idea: string) {
    stage.hidden = false;
    document.body.dataset.showing = 'true';
    branch = 'idea';
    setReader('Thinking about', 'what you told him', 'Turning it over…', 30);

    const bar = stage.querySelector<HTMLElement>('[data-progress-bar]');

    const work = (async () => {
      const started = await startIdea(idea, await turnstileToken());
      auditId = started.id;
      if (bar) bar.style.width = '70%';
      const { topics } = await getTopics(auditId, 'idea', idea);
      if (bar) bar.style.width = '100%';
      return topics;
    })();

    try {
      const topics = await withScenes(work);
      show('topics');
      renderTopics(topics);
    } catch (err) {
      fail(messageFor(err), kindFor(err));
    }
  }

  function toReveal() {
    if (!result) return;
    const head = stage.querySelector<HTMLElement>('[data-reveal-headline]');
    if (head) head.textContent = result.headline;
    renderFacts(result.facts);
    renderProjection(result);
    show('reveal');
  }

  async function toTopics() {
    if (!auditId) return;
    const idea = stage.querySelector<HTMLTextAreaElement>('#idea-text')?.value.trim() ?? '';
    setReader(
      'Thinking about',
      branch === 'idea' ? 'what you told him' : 'your page',
      'Looking for what has not been made yet…',
      55
    );
    try {
      const { topics } = await withScenes(getTopics(auditId, branch, idea || undefined));
      show('topics');
      renderTopics(topics);
    } catch (err) {
      fail(messageFor(err), kindFor(err));
    }
  }

  async function toPost(topic: Topic) {
    if (!auditId) return;
    const title = stage.querySelector<HTMLElement>('[data-post-title]');
    const body = stage.querySelector<HTMLElement>('[data-post]');
    const wait = stage.querySelector<HTMLElement>('[data-post-wait]');
    if (title) title.textContent = topic.title;
    if (body) body.hidden = true;
    if (wait) wait.hidden = false;
    show('post');

    try {
      const post = await makePost(auditId, topic.id);
      const script = stage.querySelector<HTMLElement>('[data-post-script]');
      if (script) {
        script.textContent = '';
        for (const beat of post.script) {
          const li = document.createElement('li');
          li.textContent = beat;
          script.append(li);
        }
      }
      const slides = stage.querySelector<HTMLElement>('[data-post-slides]');
      if (slides) {
        slides.textContent = '';
        for (const slide of post.slides) {
          const el = tpl('slide');
          field(el, 'title')!.textContent = slide.title;
          field(el, 'body')!.textContent = slide.body;
          slides.append(el);
        }
      }
      const caption = stage.querySelector<HTMLElement>('[data-post-caption]');
      if (caption) caption.textContent = post.caption;

      if (wait) wait.hidden = true;
      if (body) body.hidden = false;
    } catch (err) {
      fail(messageFor(err), kindFor(err));
    }
  }

  async function toOffer() {
    if (!auditId) return;
    show('offer');
    try {
      const proof = await requestProof(auditId);
      const code = stage.querySelector<HTMLElement>('[data-proof-code]');
      const account = stage.querySelector<HTMLElement>('[data-proof-account]');
      if (code) code.textContent = proof.code;
      if (account) account.textContent = `@${proof.account}`;
      const link = stage.querySelector<HTMLAnchorElement>('[data-proof-link]');
      if (link) link.href = `https://ig.me/m/${proof.account}`;
    } catch {
      // The offer still stands without a code on screen; the email carries it.
      const code = stage.querySelector<HTMLElement>('[data-proof-code]');
      if (code) code.textContent = '—';
    }
  }

  // ---- Wiring --------------------------------------------------------------

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const value = input.value.trim();
    if (!HANDLE.test(value)) {
      if (formError) {
        formError.textContent = 'That is not an Instagram handle — letters, numbers, dots.';
        formError.hidden = false;
      }
      input.focus();
      return;
    }
    if (formError) formError.hidden = true;
    void begin(value);
  });

  input.addEventListener('input', () => {
    if (formError) formError.hidden = true;
  });

  // The other door. It opens the same stage at the branch act with the idea
  // field already focused — no handle, so nothing is read and nothing is
  // claimed about a page that does not exist yet.
  document.querySelector<HTMLElement>('[data-no-page]')?.addEventListener('click', () => {
    stage.hidden = false;
    document.body.dataset.showing = 'true';
    branch = 'idea';
    const ideaForm = stage.querySelector<HTMLElement>('[data-idea-form]');
    if (ideaForm) ideaForm.hidden = false;
    for (const card of stage.querySelectorAll<HTMLElement>('[data-branch]')) {
      card.toggleAttribute('data-chosen', card.dataset.branch === 'idea');
    }
    show('branch');
    stage.querySelector<HTMLTextAreaElement>('#idea-text')?.focus();
  });

  const leadForm = stage.querySelector<HTMLFormElement>('[data-lead-form]');
  leadForm?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!auditId || !result) return;
    const email = leadForm.querySelector<HTMLInputElement>('input[name="email"]')!.value.trim();
    const consent = leadForm.querySelector<HTMLInputElement>('[data-lead-consent]')!.checked;
    const error = leadForm.querySelector<HTMLElement>('[data-lead-error]');
    const submit = leadForm.querySelector<HTMLButtonElement>('[data-lead-submit]')!;

    if (!email.includes('@') || email.length < 5) {
      if (error) {
        error.textContent = 'That address does not look right.';
        error.hidden = false;
      }
      return;
    }
    if (!consent) {
      if (error) {
        error.textContent = 'Tick the box and he will know he may write to you.';
        error.hidden = false;
      }
      return;
    }

    if (error) error.hidden = true;
    submit.disabled = true;
    submit.textContent = 'Unlocking…';

    try {
      await saveLead(auditId, email, consent);
      result.facts = result.facts.map((f) => ({ ...f, locked: false }));
      renderFacts(result.facts);
    } catch (err) {
      if (error) {
        error.textContent = messageFor(err);
        error.hidden = false;
      }
      submit.disabled = false;
      submit.textContent = 'Finish the read';
    }
  });

  const waitingForm = stage.querySelector<HTMLFormElement>('[data-waiting-form]');
  waitingForm?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = waitingForm.querySelector<HTMLInputElement>('input[name="email"]')!.value.trim();
    const consent = waitingForm.querySelector<HTMLInputElement>('[data-waiting-consent]')!.checked;
    const error = waitingForm.querySelector<HTMLElement>('[data-waiting-error]');
    const submit = waitingForm.querySelector<HTMLButtonElement>('[data-waiting-submit]')!;

    if (!email.includes('@') || email.length < 5) {
      if (error) {
        error.textContent = 'That address does not look right.';
        error.hidden = false;
      }
      return;
    }
    if (!consent) {
      if (error) {
        error.textContent = 'Tick the box and he will know he may write to you.';
        error.hidden = false;
      }
      return;
    }

    if (error) error.hidden = true;
    submit.disabled = true;
    try {
      await saveWaitingLead(input.value.trim().replace(/^@/, ''), email, consent);
      submit.textContent = 'He has it';
    } catch (err) {
      if (error) {
        error.textContent = messageFor(err);
        error.hidden = false;
      }
      submit.disabled = false;
    }
  });

  for (const button of stage.querySelectorAll<HTMLElement>('[data-go]')) {
    button.addEventListener('click', () => {
      const target = button.dataset.go as Act;
      // A projection with nothing honest to say is skipped rather than faked.
      if (target === 'projection' && acts.get('projection')?.dataset.skip === 'true') {
        void toOffer();
        return;
      }
      if (target === 'offer') {
        void toOffer();
        return;
      }
      show(target);
    });
  }

  for (const card of stage.querySelectorAll<HTMLElement>('[data-branch]')) {
    card.addEventListener('click', () => {
      branch = card.dataset.branch === 'idea' ? 'idea' : 'page';
      for (const other of stage.querySelectorAll('[data-branch][data-chosen]')) {
        other.removeAttribute('data-chosen');
      }
      card.setAttribute('data-chosen', '');
      const ideaForm = stage.querySelector<HTMLElement>('[data-idea-form]');
      if (branch === 'idea') {
        if (ideaForm) ideaForm.hidden = false;
        stage.querySelector<HTMLTextAreaElement>('#idea-text')?.focus();
      } else {
        if (ideaForm) ideaForm.hidden = true;
        void toTopics();
      }
    });
  }

  stage.querySelector<HTMLFormElement>('[data-idea-form]')?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const idea = stage.querySelector<HTMLTextAreaElement>('#idea-text')?.value.trim() ?? '';
    if (idea.length < 3) {
      stage.querySelector<HTMLTextAreaElement>('#idea-text')?.focus();
      return;
    }
    // With a page behind us the topics hang off the audit; without one they
    // need a session of their own first.
    if (auditId) void toTopics();
    else void beginIdea(idea);
  });

  stage.querySelector<HTMLElement>('[data-copy-code]')?.addEventListener('click', async (ev) => {
    const button = ev.currentTarget as HTMLButtonElement;
    const code = stage.querySelector<HTMLElement>('[data-proof-code]')?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'Copied';
      setTimeout(() => (button.textContent = 'Copy the code'), 1800);
    } catch {
      button.textContent = 'Copy it by hand';
    }
  });

  stage.querySelector<HTMLElement>('[data-retry]')?.addEventListener('click', () => {
    cancelScenes?.();
    sessionStorage.removeItem(STORE);
    auditId = null;
    result = null;
    stage.hidden = true;
    delete document.body.dataset.showing;
    input.value = '';
    input.focus();
    form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
}

/**
 * Proof-of-human, when it is switched on.
 *
 * The widget is only loaded if a site key is present, so the site runs with no
 * third-party script at all until the key exists. The backend is the thing that
 * decides whether a missing token is acceptable — never this.
 */
async function turnstileToken(): Promise<string | null> {
  const key = document.documentElement.dataset.turnstileKey;
  const turnstile = (window as unknown as { turnstile?: { execute: (o: unknown) => Promise<string> } })
    .turnstile;
  if (!key || !turnstile) return null;
  try {
    return await turnstile.execute({ sitekey: key });
  } catch {
    return null;
  }
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return 'Something went wrong on our side, not yours.';
}

function kindFor(err: unknown): AuditErrorKind {
  return err instanceof ApiError ? err.kind : 'error';
}
