/**
 * Fills the /@handle shell from the backend.
 *
 * The handle comes out of the path rather than a query string because the address IS the
 * product here — somebody types diwche.com/@theirname into an Instagram bio and it has to look
 * like an address, not like a search. nginx maps every /@… onto the one built page, so this
 * script is the only thing that knows which page it is.
 *
 * Nothing here trusts the payload as markup: every value is written with textContent, and the
 * only attributes set from it are hrefs the backend built (all of them same-origin paths on
 * /api/public/bio/) and image sources on the same prefix. A link-in-bio page renders text
 * somebody else typed, so this rule is the whole security model of the page.
 */
import { fetchBioPage, type BioPage } from '../lib/publicApi';

function slugFromPath(): string | null {
  // "/@name" and "/@name/" — nothing deeper is a page.
  const match = /^\/@([A-Za-z0-9._]{2,30})\/?$/.exec(window.location.pathname);
  return match ? match[1] : null;
}

function show(id: string) {
  document.getElementById(id)?.removeAttribute('hidden');
}

function hide(id: string) {
  document.getElementById(id)?.setAttribute('hidden', '');
}

function text(id: string, value: string | null | undefined): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  if (value == null || value.trim() === '') {
    el.setAttribute('hidden', '');
    return false;
  }
  el.textContent = value;
  el.removeAttribute('hidden');
  return true;
}

function render(page: BioPage) {
  // The page's own language decides its direction, not the site's. See src/lib/direction.ts —
  // this is the same rule the backend and the app both keep, applied to a document whose
  // language is a property of the account being shown.
  const root = document.documentElement;
  if (page.language) root.setAttribute('lang', page.language);
  if (page.dir === 'rtl' || page.dir === 'ltr') root.setAttribute('dir', page.dir);
  if (page.theme) root.dataset.bioTheme = page.theme;

  document.title = page.name ? `${page.name} · Diwche` : 'Diwche';

  const avatar = document.getElementById('bio-avatar') as HTMLImageElement | null;
  if (avatar && page.avatarUrl) {
    avatar.src = page.avatarUrl;
    avatar.alt = page.name ?? '';
    avatar.removeAttribute('hidden');
  }

  text('bio-name', page.name);
  text('bio-handle', page.handle ? `@${page.handle}` : null);
  text('bio-headline', page.headline);
  text('bio-about', page.biography);

  const links = document.getElementById('bio-links');
  if (links) {
    links.replaceChildren(
      ...(page.links ?? []).map((link) => {
        const a = document.createElement('a');
        a.className = 'bio-link';
        a.href = link.href;
        // The redirect counts the click and then leaves the site; it is not a same-tab
        // navigation the visitor should be able to come back from with the back button.
        a.rel = 'noopener nofollow';
        const title = document.createElement('strong');
        title.textContent = link.title;
        a.appendChild(title);
        if (link.subtitle) {
          const sub = document.createElement('span');
          sub.textContent = link.subtitle;
          a.appendChild(sub);
        }
        return a;
      }),
    );
  }

  const posts = document.getElementById('bio-posts');
  if (posts && page.posts?.length) {
    posts.replaceChildren(
      ...page.posts.map((post) => {
        const a = document.createElement('a');
        a.className = 'bio-post';
        a.href = post.permalink;
        a.target = '_blank';
        a.rel = 'noopener';
        const img = document.createElement('img');
        img.src = post.thumbUrl;
        img.alt = post.caption ?? '';
        img.loading = 'lazy';
        a.appendChild(img);
        return a;
      }),
    );
    posts.removeAttribute('hidden');
  }

  hide('bio-loading');
  show('bio');
}

export async function loadBioPage(): Promise<void> {
  const slug = slugFromPath();
  if (!slug) {
    hide('bio-loading');
    show('bio-missing');
    return;
  }
  try {
    const page = await fetchBioPage(slug);
    if (!page) {
      hide('bio-loading');
      show('bio-missing');
      return;
    }
    render(page);
  } catch {
    hide('bio-loading');
    show('bio-missing');
  }
}
