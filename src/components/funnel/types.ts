/**
 * The shape of a funnel, independent of the language it is written in.
 *
 * The funnel used to be thirteen hardcoded sections with its English inline, in
 * two places — the Astro literal and, for the start screen, a second copy in the
 * script. That worked exactly as long as there was one language and a fixed
 * number of steps. There is now neither: the walk is 7–10 screens depending on
 * what someone admits to, and it has to exist in Persian.
 *
 * So the funnel is data, and this is the contract. `copy.en.ts` and `copy.fa.ts`
 * both implement `FunnelCopy`, which means a missing Persian string is a
 * compile error rather than an English word on a Persian screen.
 */
import type { ICONS } from './icons';

export type IconKey = keyof typeof ICONS;

/** The four things someone can say is stopping them. Order here is screen order. */
export const BLOCKERS = ['ideas', 'editing', 'script', 'dm'] as const;
export type Blocker = (typeof BLOCKERS)[number];

/** Where they are on Q1. `active` has a page to read; `new` has only an idea. */
export type Stage = 'active' | 'new';

export interface Option {
  value: string;
  label: string;
  /** The second line, in their words rather than ours. */
  sub?: string;
  icon: IconKey;
}

/**
 * When a screen is part of the walk.
 *
 * Absent means always. Every screen is rendered into the DOM at build time
 * either way — the script decides which are in the active set, so nothing has to
 * be fetched or cloned mid-walk.
 */
export interface ShowIf {
  /** The screen whose answer decides this. */
  screen: string;
  /** Shown when that answer equals, or contains, this value. */
  is: string;
}

export interface Shot {
  /** File stem under /shots, with its extension — SVG placeholders today, PNG captures later. */
  src: string;
  /** The title in the window frame. */
  label: string;
  alt: string;
}

interface Base {
  id: string;
  showIf?: ShowIf;
}

export type Screen =
  | (Base & {
      kind: 'question';
      eyebrow: string;
      title: string;
      /**
       * A second wording of the same question.
       *
       * Q2 asks what is stopping someone, which reads oddly to a person who
       * already posts daily. Same four options, same insights — only the
       * question changes, keyed by their answer to Q1.
       */
      titleWhen?: Partial<Record<Stage, string>>;
      hint?: string;
      /** Several answers allowed, so it needs a button rather than advancing on tap. */
      multi?: boolean;
      options: Option[];
      shot?: Shot;
    })
  | (Base & {
      kind: 'insight';
      eyebrow: string;
      /** Their own selection, quoted back at them. */
      quote?: string;
      /** The joke. It goes first, and it is the reason anyone reads the rest. */
      hook: string;
      title: string;
      lead: string;
      shot: Shot;
    })
  | (Base & {
      kind: 'start';
      /** A handle to read, or an idea to build from. */
      field: 'handle' | 'idea';
      eyebrow: string;
      hook: string;
      title: string;
      lead: string;
      cta: string;
      placeholder: string;
      shot: Shot;
    })
  | (Base & {
      /**
       * Who they measure themselves against.
       *
       * Optional, and skippable in one tap. The finder can only propose pages a visitor already
       * mentions in their own captions, which finds nothing at all for a page that tags nobody —
       * and a comparison the reader chose themselves is the one they believe, because they know
       * their own scene better than any heuristic does.
       */
      kind: 'rivals';
      eyebrow: string;
      title: string;
      lead: string;
      placeholder: string;
      cta: string;
      skip: string;
    })
  | (Base & { kind: 'verify' | 'analyzing' | 'result' | 'plan' | 'error' });

/** One of the things he also does, shown while the read runs. */
export interface FeatureCard {
  label: string;
  title: string;
  text: string;
}

export interface FunnelCopy {
  locale: string;
  meta: { title: string; description: string };
  preview: string;
  bar: { back: string };
  screens: Screen[];

  /**
   * The cards shown during the wait.
   *
   * Whatever someone did NOT pick on Q2, plus the two nobody is asked about.
   * The wait is the only place left to say these things, and it is long enough
   * now that the handle is asked at the end rather than the beginning.
   */
  features: Record<Blocker | 'identity' | 'scheduling', FeatureCard>;
  /**
   * The proof step between the handle and the read.
   *
   * A page is read only for the person who can send its code from that very
   * account — and who follows Diwche while doing it. The status lines are
   * rendered as hidden elements and toggled by the script, so they live here
   * with the rest of the screen rather than in `runtime`.
   */
  verify: {
    eyebrow: string;
    title: string;
    lead: string;
    steps: { follow: string; send: string; wait: string };
    /** The button that opens the conversation in Instagram. */
    open: string;
    waiting: string;
    verified: string;
    /** `{handle}` is the page named, `{sentBy}` who actually sent it. */
    wrongAccount: string;
    notFollowing: string;
    expired: string;
    unavailable: string;
    again: string;
    change: string;
  };
  analyzing: { line: string; lead: string; shot: Shot };

  result: {
    eyebrow: string;
    teaser: string;
    emailLabel: string;
    placeholder: string;
    consent: string;
    cta: string;
    /**
     * The starter branch has no read behind it.
     *
     * Promising a blurred report to someone whose page we have never seen would
     * be the one dishonesty this whole funnel is built to avoid, so that branch
     * is asked for an address on a different footing.
     */
    starterTeaser: string;
    starterEyebrow: string;
    /** Under the profile card. Plain nouns, because the numbers do the talking. */
    followers: string;
    posts: string;
    /** After a locked card's label. The card keeps its label; only the figure is withheld. */
    heldBack: string;
    /**
     * The starter branch's result screen.
     *
     * No page was read, so the headline is about the field the idea is walking
     * into: pages already doing this, and what waiting costs in posts.
     */
    starterHeadline: string;
    fieldTitle: string;
    fieldFollowers: string;
    fieldPace: string;
    fieldRate: string;
    fieldFormat: string;
    /** One line with `{perWeek}`, `{byNextYear}` and `{ifThreeMonths}` in it. */
    waiting: string;
    /** After unlock: what the subject rewards, with `{format}` and `{pace}`. */
    rewards: string;

    /**
     * The chart: every post the read ran on, by date and by how it did.
     *
     * The evidence the rest of the report is drawn from, and the one part of the page a reader
     * can check against their own grid — which is why it is never held back.
     */
    chartTitle: string;
    chartNote: string;
    chartEmpty: string;

    /**
     * The report's sections, in the order the backend sends them.
     *
     * The headings live here rather than arriving with the findings because they are words. The
     * backend used to send an English label per card, which is how a Persian page came to be
     * headed in uppercase English — the figures are the arithmetic's, the words are the locale's.
     */
    sections: Record<'rhythm' | 'format' | 'audience' | 'peers' | 'words', string>;

    /**
     * One word for how a section is doing.
     *
     * Deliberately blunt in every language. A verdict that hedges is worth less than none: the
     * reader handed over a handle precisely because they cannot tell whether their own numbers
     * are good.
     */
    verdicts: Record<'good' | 'weak' | 'bad' | 'dead' | 'neutral', string>;

    /**
     * The heading on each card, keyed by the finding's key.
     *
     * A key the backend sends and this map has no entry for falls back to the English label that
     * travelled with it, so a new finding shows up in English rather than blank.
     */
    labels: Record<string, string>;

    peersTitle: string;
    peersNamed: string;
    peersFound: string;
  };
  plan: {
    eyebrow: string;
    headline: string;
    body: string;
    /** Shown to the starter branch, which has no read behind it. */
    starterHeadline: string;
    starterBody: string;
    working: string;
    /** Heads the three windows. The per-month figure is honest but easy to shrug at. */
    horizonsTitle: string;
    /** Sits under each total: how much of it would not have arrived anyway. */
    horizonsNew: string;
    /**
     * The names of the two bars and the three windows.
     *
     * These live here rather than arriving with the figures because they are words, and the
     * read is published in three languages while the arithmetic is published in none. The
     * backend sends the numbers and the month counts; the locale supplies what to call them.
     */
    horizonsWhen: { month: string; sixMonths: string; year: string };
    sides: { now: string; then: string };
    /**
     * Heads the size block, keyed by the tier the backend put the page in. A
     * page under a thousand is talked to differently from one over a hundred
     * thousand, and the tier is the only word the backend sends about it.
     */
    sizeTitle: { under1k: string; '1k': string; '10k': string; '100k': string };
    ways: { again: string; home: string };
  };

  ui: {
    continue: string;
    next: string;
    retry: string;
    of: string;
    /** Button labels the script swaps in while, and after, something is in flight. */
    working: string;
    sent: string;
    copy: string;
    copied: string;
    copyByHand: string;
    /** The word on the closed language control. */
    language: string;
  };

  /** Everything the script writes at runtime. Was hardcoded English in funnel.ts. */
  runtime: {
    reading: string;
    thinking: string;
    handleInvalid: string;
    ideaTooShort: string;
    emailInvalid: string;
    consentMissing: string;
    generic: string;
    noProjection: string;
    errorEyebrow: string;
    waitingTitle: string;
    waitingCta: string;
  };
}
