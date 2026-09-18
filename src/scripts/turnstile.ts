/**
 * Proof-of-human, shared by the funnel and the consent page.
 *
 * Nothing third-party is loaded until a site key exists on the document, and
 * the backend — never this — decides whether a missing token is acceptable.
 * That split matters: a page can always be made to say it has a token, so this
 * is a way to give one, never a gate.
 *
 * Two things here were learned the hard way, in production:
 *
 * 1. **The widget needs a laid-out host.** It used to be rendered into a
 *    `display:none` div, which Cloudflare answers with error 300010 and no
 *    token — the site then posted `turnstile: null` and the backend said "he
 *    could not tell that you were a person". The host is now a real box on
 *    `document.body`, placed just above whichever button is being pressed (or
 *    fixed bottom-centre when there is no button to measure), with
 *    `appearance: 'interaction-only'` so it stays invisible unless a challenge
 *    actually has to be shown.
 * 2. **Tokens are minted with `execute`, not `reset`.** The widget is rendered
 *    once in `execution: 'execute'` mode and asked for a token per call. A
 *    widget that errored is dropped, so the next call renders a fresh one
 *    rather than resetting a broken one forever.
 */
interface TurnstileApi {
  render: (el: HTMLElement, params: Record<string, unknown>) => string;
  execute: (id: string, params?: Record<string, unknown>) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

export interface HumanToken {
  token: string | null;
  /**
   * True when a key is configured, no token could be produced, and this is not
   * the first time. One silent null is allowed — the backend may accept it, or
   * may not need it at all. A second means the check is broken for this
   * visitor and the page should say so rather than keep posting nulls.
   */
  failed: boolean;
}

/** The widget's own size in its normal rendering; its mount inside the card is cut to it. */
const WIDTH = 300;
const HEIGHT = 65;

let widget: { id: string; api: TurnstileApi; minted: boolean } | null = null;
let host: HTMLElement | null = null;
/** The 300x65 box the widget itself is rendered into, inside the card. */
let mount: HTMLElement | null = null;
let pending: ((token: string | null) => void) | null = null;
let silentNulls = 0;
/** The tail of the queue described in `turnstileToken`. Nothing asks the widget out of turn. */
let queue: Promise<unknown> = Promise.resolve();

/**
 * Hand whatever the widget produced to whoever is waiting.
 *
 * Module-level rather than a closure inside the render call on purpose: the
 * widget is rendered once and executed for every later token, so its
 * callbacks belong to the first request forever. Routing through here means
 * each execute answers the call that asked for it.
 */
function settle(token: string | null) {
  const waiting = pending;
  pending = null;
  conceal();
  waiting?.(token);
}

/**
 * Out of the way the moment the answer is in.
 *
 * The widget is not only a challenge, it is a result: a Managed widget that a
 * visitor ticked stays on screen afterwards saying it succeeded, and since the
 * host is a fixed box on `document.body` it sat over the page for the rest of
 * the visit — a Cloudflare badge floating on the funnel with nothing left to
 * ask. Hiding it rather than removing it keeps the rendered widget alive for
 * the next `execute`, which is the whole reason it is rendered once.
 *
 * Hidden with visibility, never `display:none`: the widget is only re-shown by
 * `place()` before an execute, and a widget rendered into a box with no layout
 * is what Cloudflare answers with error 300010 and no token.
 */
function conceal() {
  if (!host) return;
  host.style.visibility = 'hidden';
  host.style.opacity = '0';
  host.style.pointerEvents = 'none';
  const card = host.firstElementChild as HTMLElement | null;
  if (card) card.style.transform = 'translateY(6px) scale(.98)';
}

function reveal() {
  if (!host) return;
  host.style.visibility = 'visible';
  host.style.opacity = '1';
  // The scrim itself never takes the pointer — only the card does. A full-viewport overlay that
  // swallowed clicks would take the page with it if conceal() ever failed to run.
  host.style.pointerEvents = 'none';
  const card = host.firstElementChild as HTMLElement | null;
  // Two frames, so the transition has a start to run from rather than being set in the same tick.
  if (card) requestAnimationFrame(() => requestAnimationFrame(() => {
    card.style.transform = 'translateY(0) scale(1)';
  }));
}

function dropWidget() {
  if (widget) {
    try {
      widget.api.remove(widget.id);
    } catch {
      /* Already gone, which is what we wanted. */
    }
  }
  widget = null;
  if (mount) mount.textContent = '';
}

/**
 * Where the widget sits: just above the button being pressed, so that if a
 * challenge does have to be shown it appears where the visitor is looking.
 * Without a button to measure, or with one that is off screen, it goes to the
 * bottom centre of the viewport.
 */
function place(anchor: HTMLElement | null | undefined) {
  build();
  // Centred, over a scrim, rather than pinned above whichever button was pressed (Trello #379).
  // The old box was 300x65 of transparent nothing dropped on top of the page wherever the
  // pointer happened to be — a Cloudflare widget with no frame, no background and no sentence,
  // which is what "it feels like it has simply been dropped onto the page" describes. Anchoring
  // it to the button was meant to put it where the visitor was looking; a centred card with the
  // page dimmed behind it does that better and cannot land half off the screen on a phone.
  void anchor;
  reveal();
}

/**
 * The card the widget sits in: the site's own panel, a scrim behind it, and a line saying what
 * is happening. Built once, kept for the life of the page — the widget inside it is rendered
 * once and executed per token, so tearing the card down would take the widget with it.
 *
 * The mount the widget is given keeps its exact 300x65: Cloudflare answers a host with no layout
 * with error 300010 and no token, and that is a lesson this file already paid for once.
 */
function build() {
  if (host) return;
  host = document.createElement('div');
  host.setAttribute('data-turnstile-host', '');
  host.style.cssText =
    'position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;' +
    'pointer-events:none;visibility:hidden;opacity:0;' +
    'background:color-mix(in srgb, var(--paper, #0b0e14) 72%, transparent);' +
    '-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);' +
    'transition:opacity 180ms ease;';

  const card = document.createElement('div');
  card.setAttribute('data-turnstile-card', '');
  card.style.cssText =
    'pointer-events:auto;display:grid;gap:12px;justify-items:center;' +
    'padding:20px;border-radius:14px;' +
    'background:var(--paper-2, #12151d);border:1px solid var(--rule, rgba(255,255,255,.12));' +
    'box-shadow:0 18px 50px rgba(0,0,0,.45);' +
    'transform:translateY(6px) scale(.98);transition:transform 180ms ease;';

  const label = document.createElement('p');
  label.textContent = document.documentElement.dataset.turnstileLabel || '';
  label.style.cssText =
    'margin:0;font-size:13px;line-height:1.4;text-align:center;color:var(--ink-2, #aab);max-width:300px;';
  if (label.textContent) card.append(label);

  mount = document.createElement('div');
  mount.style.cssText = `width:${WIDTH}px;height:${HEIGHT}px;`;
  card.append(mount);

  host.append(card);
  document.body.append(host);
}

/** The script is async, so it may not have arrived by the time the button is pressed. */
async function waitForTurnstile(): Promise<TurnstileApi | null> {
  const has = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile ?? null;
  for (let i = 0; i < 40 && !has(); i++) {
    await new Promise((r) => setTimeout(r, 100));
  }
  return has();
}

/**
 * A token, or an honest null.
 *
 * `anchor` is the submit button this token is for; the widget is placed above
 * it. Nothing waits forever on a third party: after eight seconds the call
 * gives up, and the backend decides what a missing token means.
 */
export async function turnstileToken(anchor?: HTMLElement | null): Promise<HumanToken> {
  const key = document.documentElement.dataset.turnstileKey;
  if (!key) {
    // A page that asks for a token and was never given a key cannot get one, and the
    // backend will refuse what it posts with a sentence about not being able to tell
    // the visitor was a person. That is what the consent page did for its whole life,
    // on a layout that never loaded any of this — no consent was ever recorded, and
    // nothing anywhere said why. Say why.
    console.error(
      'Turnstile: this page asked for a token but carries no site key. ' +
        'The layout it uses has to opt in, or every post from it will be refused.'
    );
    return { token: null, failed: true };
  }

  const api = await waitForTurnstile();
  if (!api) return { token: null, failed: false };

  // Asked one at a time, and queued rather than overlapped.
  //
  // The widget answers one challenge at a time. Asking it again while it is still
  // working on the last one is refused outright — "already executing" — and both
  // callers then wait out the timeout and get nothing, which is the same empty
  // token, and the same "he could not tell that you were a person", that the
  // hidden host used to produce. Two requests at once is not a strange case: the
  // walk mints one as the start screen opens and another when the button is
  // pressed, and anybody who clicks twice because nothing visibly happened makes
  // a third. So each waits for the one before it and then asks on its own.
  const mine = queue.catch(() => undefined).then(() => mint(api, key, anchor));
  queue = mine.catch(() => undefined);
  return mine;
}

async function mint(
  api: TurnstileApi,
  key: string,
  anchor?: HTMLElement | null
): Promise<HumanToken> {
  const token = await new Promise<string | null>((resolve) => {
    let bail = 0;
    const stopWaiting = () => window.clearTimeout(bail);
    const answer = (value: string | null) => {
      stopWaiting();
      resolve(value);
    };

    // Two clocks, because there are two situations and one number cannot serve both.
    //
    // Cloudflare decides silently most of the time, and a wait of a few seconds is
    // the right amount to give a third party we cannot see. But when it decides a
    // visitor has to click something, eight seconds is an insult: the widget has
    // only just appeared and they have not finished reading it. So the moment it
    // says it needs a person, the short clock is thrown away and a patient one
    // takes over.
    const waitQuietly = () => {
      stopWaiting();
      bail = window.setTimeout(() => giveUp(), 8000);
    };
    const waitForAPerson = () => {
      stopWaiting();
      bail = window.setTimeout(() => giveUp(), 60000);
    };

    /**
     * Giving up has to leave the widget idle.
     *
     * This is what was broken live. A widget that was asked to run and never
     * finished is still running, and asking it again is refused outright —
     * "already executing" — so every later request on that page failed too,
     * for as long as the tab was open. Whoever abandons the wait resets it.
     */
    const giveUp = () => {
      if (pending !== answer) return;
      if (widget) {
        try {
          widget.api.reset(widget.id);
          widget.minted = false;
        } catch {
          dropWidget();
        }
      }
      settle(null);
    };

    pending = answer;
    waitQuietly();

    try {
      place(anchor);
      if (widget && widget.api !== api) dropWidget();

      if (!widget) {
        const id = api.render(mount!, {
          sitekey: key,
          appearance: 'interaction-only',
          execution: 'execute',
          callback: (value: string) => {
            if (widget) widget.minted = true;
            settle(value);
          },
          'before-interactive-callback': () => waitForAPerson(),
          'after-interactive-callback': () => waitQuietly(),
          'error-callback': () => {
            // A widget that has errored does not recover by being asked
            // again. Drop it so the next call starts from a clean render.
            dropWidget();
            settle(null);
            return true;
          },
          'timeout-callback': () => giveUp(),
          'expired-callback': () => giveUp(),
        });
        widget = { id, api, minted: false };
      } else {
        // Always, not only after a token was minted. A widget can be left
        // part-way through by a timeout as easily as it can be left solved,
        // and from the outside those look identical — both refuse execute().
        // Cloudflare's own warning for this says exactly that: reset first.
        widget.api.reset(widget.id);
        widget.minted = false;
      }
      api.execute(widget.id);
    } catch {
      dropWidget();
      settle(null);
    }
  });

  if (token) {
    silentNulls = 0;
    return { token, failed: false };
  }
  silentNulls += 1;
  return { token: null, failed: silentNulls > 1 };
}

