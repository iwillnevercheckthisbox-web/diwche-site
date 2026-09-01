/**
 * The consent page's clock.
 *
 * Small on purpose. It fetches the wording from the backend, renders it,
 * prefills whatever the emailed link carried, and posts one object back.
 *
 * The one rule worth stating: **this page never invents the wording.** It shows
 * what `/api/public/consent/terms` returns and nothing else, because the row
 * that gets written stores the hash of what the backend served. If this page
 * rendered its own text, the hash would describe something nobody read.
 */

interface Terms {
  version: string;
  locale: string;
  title: string;
  clauses: string[];
  hash: string;
}

interface Copy {
  working: string;
  submit: string;
  missing: string;
  [key: string]: string;
}

const root = document.querySelector<HTMLElement>('[data-consent]');
if (root) run(root);

function run(root: HTMLElement) {
  const copy = JSON.parse(
    root.querySelector<HTMLElement>('[data-consent-copy]')?.textContent ?? '{}'
  ) as Copy;

  const form = root.querySelector<HTMLFormElement>('[data-consent-form]')!;
  const list = root.querySelector<HTMLOListElement>('[data-clauses]')!;
  const title = root.querySelector<HTMLElement>('[data-terms-title]')!;
  const version = root.querySelector<HTMLElement>('[data-version]')!;
  const error = root.querySelector<HTMLElement>('[data-error]')!;
  const done = root.querySelector<HTMLElement>('[data-done]')!;
  const submit = root.querySelector<HTMLButtonElement>('[data-submit]')!;
  const handleInput = root.querySelector<HTMLInputElement>('[data-handle]')!;
  const emailInput = root.querySelector<HTMLInputElement>('[data-email]')!;
  const agreed = root.querySelector<HTMLInputElement>('[data-agreed]')!;

  const locale = root.dataset.locale ?? 'en';
  const params = new URLSearchParams(location.search);

  // The emailed link carries these, so nobody has to retype what we already
  // know. Both stay editable: a link can be forwarded, and the person who ends
  // up agreeing has to be able to correct the handle it was addressed to.
  handleInput.value = (params.get('handle') ?? '').replace(/^@/, '');
  emailInput.value = params.get('email') ?? '';
  const auditId = params.get('audit') ?? '';

  let terms: Terms | null = null;

  void (async () => {
    try {
      const res = await fetch(`/api/public/consent/terms?locale=${encodeURIComponent(locale)}`);
      terms = (await res.json()) as Terms;
      title.textContent = terms.title;
      version.textContent = terms.version;
      list.textContent = '';
      for (const clause of terms.clauses) {
        const li = document.createElement('li');
        li.textContent = clause;
        list.append(li);
      }
    } catch {
      // Without the wording there is nothing to agree to, so the form is not
      // offered. Better an honest dead end than a button that records
      // agreement to a blank list.
      show(copy.missing);
      form.hidden = true;
    }
  })();

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!terms) return;

    const handle = handleInput.value.trim().replace(/^@/, '');
    if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) return show(copy.handleInvalid);
    if (!emailInput.value.includes('@')) return show(copy.emailInvalid);
    if (!agreed.checked) return show(copy.agreeFirst);

    error.hidden = true;
    submit.disabled = true;
    submit.textContent = copy.working;

    try {
      const res = await fetch('/api/public/consent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          handle,
          email: emailInput.value.trim(),
          locale,
          agreed: true,
          auditId,
          termsVersion: terms.version,
          turnstile: await turnstileToken(),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? copy.failed);
      }
      form.hidden = true;
      done.hidden = false;
    } catch (err) {
      show(err instanceof Error ? err.message : copy.failed);
      submit.disabled = false;
      submit.textContent = copy.submit;
    }
  });

  function show(message: string) {
    error.textContent = message;
    error.hidden = false;
  }
}

/**
 * Proof-of-human, when there is a key for it.
 *
 * Same shape as the funnel's: nothing third-party loads without a site key, and
 * the backend — never this — decides whether a missing token is acceptable.
 */
async function turnstileToken(): Promise<string | null> {
  const key = document.documentElement.dataset.turnstileKey;
  if (!key) return null;
  const api = (window as unknown as { turnstile?: { render: (el: HTMLElement, o: unknown) => string } })
    .turnstile;
  if (!api) return null;

  return new Promise<string | null>((resolve) => {
    const bail = window.setTimeout(() => resolve(null), 8000);
    const settle = (token: string | null) => {
      window.clearTimeout(bail);
      resolve(token);
    };
    try {
      const host = document.createElement('div');
      host.style.display = 'none';
      document.body.append(host);
      api.render(host, {
        sitekey: key,
        callback: (token: string) => settle(token),
        'error-callback': () => settle(null),
        'timeout-callback': () => settle(null),
      });
    } catch {
      settle(null);
    }
  });
}
