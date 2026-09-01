/**
 * The confirmation link's landing.
 *
 * The work happens on the backend; this only reports what it said. Written as a
 * page rather than a bare JSON response because the link is clicked by a person
 * out of an email, and a wall of JSON is a dead end even when it says ok.
 */
interface Copy {
  okTitle: string;
  okBody: string;
  badTitle: string;
  badBody: string;
  [key: string]: string;
}

const root = document.querySelector<HTMLElement>('[data-confirm]');
if (root) run(root);

async function run(root: HTMLElement) {
  const copy = JSON.parse(
    root.querySelector<HTMLElement>('[data-confirm-copy]')?.textContent ?? '{}'
  ) as Copy;
  const title = root.querySelector<HTMLElement>('[data-title]')!;
  const body = root.querySelector<HTMLElement>('[data-body]')!;
  const again = root.querySelector<HTMLElement>('[data-again]')!;

  const token = new URLSearchParams(location.search).get('t') ?? '';
  const fail = () => {
    title.textContent = copy.badTitle;
    body.textContent = copy.badBody;
    again.hidden = false;
  };

  if (!token) return fail();

  try {
    const res = await fetch(`/api/public/lead/confirm?t=${encodeURIComponent(token)}`);
    if (!res.ok) return fail();
    title.textContent = copy.okTitle;
    body.textContent = copy.okBody;
  } catch {
    fail();
  }
}
