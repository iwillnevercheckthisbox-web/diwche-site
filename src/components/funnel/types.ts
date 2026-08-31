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
  | (Base & { kind: 'analyzing' | 'result' | 'plan' | 'error' });

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
  };
  plan: {
    eyebrow: string;
    headline: string;
    body: string;
    /** Shown to the starter branch, which has no read behind it. */
    starterHeadline: string;
    starterBody: string;
    working: string;
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
