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

/** The widget's own size in its normal rendering; the host is cut to it. */
const WIDTH = 300;
const HEIGHT = 65;
const GAP = 8;

let widget: { id: string; api: TurnstileApi; minted: boolean } | null = null;
let host: HTMLElement | null = null;
let pending: ((token: string | null) => void) | null = null;
let silentNulls = 0;

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
  if (host) host.style.pointerEvents = 'none';
  waiting?.(token);
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
  if (host) host.textContent = '';
}

/**
 * Where the widget sits: just above the button being pressed, so that if a
 * challenge does have to be shown it appears where the visitor is looking.
 * Without a button to measure, or with one that is off screen, it goes to the
 * bottom centre of the viewport.
 */
function place(anchor: HTMLElement | null | undefined) {
  if (!host) {
    host = document.createElement('div');
    host.setAttribute('data-turnstile-host', '');
    host.style.cssText =
      `position:fixed;width:${WIDTH}px;height:${HEIGHT}px;z-index:2147483000;` +
      'pointer-events:none;background:transparent;';
    document.body.append(host);
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = (vw - WIDTH) / 2;
  let top = vh - HEIGHT - GAP;

  const rect = anchor?.getBoundingClientRect();
  if (rect && rect.width > 0 && rect.bottom > 0 && rect.top < vh) {
    left = rect.left + rect.width / 2 - WIDTH / 2;
    top = rect.top - HEIGHT - GAP;
    if (top < GAP) top = Math.min(rect.bottom + GAP, vh - HEIGHT - GAP);
  }
  left = Math.max(GAP, Math.min(vw - WIDTH - GAP, left));
  top = Math.max(GAP, Math.min(vh - HEIGHT - GAP, top));
  host.style.left = `${Math.round(left)}px`;
  host.style.top = `${Math.round(top)}px`;
  host.style.pointerEvents = 'auto';
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
  if (!key) return { token: null, failed: false };

  const api = await waitForTurnstile();
  if (!api) return { token: null, failed: false };

  const token = await new Promise<string | null>((resolve) => {
    // One outstanding request at a time. Handing an old caller a new token
    // would be a lie about which call it belongs to.
    settle(null);

    const bail = window.setTimeout(() => {
      if (pending === answer) settle(null);
    }, 8000);
    const answer = (value: string | null) => {
      window.clearTimeout(bail);
      resolve(value);
    };
    pending = answer;

    try {
      place(anchor);
      if (widget && widget.api !== api) dropWidget();

      if (!widget) {
        const id = api.render(host!, {
          sitekey: key,
          appearance: 'interaction-only',
          execution: 'execute',
          callback: (value: string) => {
            if (widget) widget.minted = true;
            settle(value);
          },
          'error-callback': () => {
            // A widget that has errored does not recover by being asked
            // again. Drop it so the next call starts from a clean render.
            dropWidget();
            settle(null);
            return true;
          },
          'timeout-callback': () => settle(null),
          'expired-callback': () => settle(null),
        });
        widget = { id, api, minted: false };
      } else if (widget.minted) {
        // A token is single-use. In execute mode a solved widget is reset
        // first, then asked again — reset alone would leave it idle.
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
