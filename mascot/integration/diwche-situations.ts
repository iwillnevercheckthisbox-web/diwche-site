import type { JobTag } from '../core/job-tracker.service';

/** The twelve scenes. Slugs match the built files in `public/mascot/`. */
export const DIWCHE_SCENES = [
  '01-writing', '02-editing', '03-illustrating', '04-brainstorming',
  '05-pitching', '06-layout-design', '07-coloring', '08-submitting',
  '09-final-review', '10-correcting-proofs', '11-approval', '12-print-check',
] as const;

export type DiwcheScene = (typeof DIWCHE_SCENES)[number];

/**
 * Which Diwche to show while a tracked job is running.
 *
 * The mapping is by what the user is waiting *for*, not by which service does the work — the
 * point of the mascot is to make the wait legible, so a job that rewrites a script shows him
 * writing even though nothing is literally being written on paper.
 */
const BY_JOB: Record<JobTag, DiwcheScene> = {
  'rss': '04-brainstorming',
  'step-init': '04-brainstorming',
  'step-rewrite': '01-writing',
  'step-voice': '02-editing',
  'step-assemble': '06-layout-design',
  'subtitle': '02-editing',
  'infographic': '03-illustrating',
  'data-infographic': '03-illustrating',
  'video-project': '06-layout-design',
  'reel': '07-coloring',
  'footage': '09-final-review',
  'footage-prepare': '09-final-review',
  'footage-assemble': '06-layout-design',
};

export function sceneForJob(tag: JobTag): DiwcheScene {
  return BY_JOB[tag] ?? '01-writing';
}

/**
 * The four outcome states, for anything that finishes, fails or needs a decision.
 */
export const DIWCHE_OUTCOME = {
  done: '11-approval',
  published: '08-submitting',
  invalid: '10-correcting-proofs',
  failed: '12-print-check',
} as const satisfies Record<string, DiwcheScene>;

/**
 * Empty states, keyed by the page they belong to. An empty page is the one place a mascot
 * genuinely earns its keep: there is nothing else on screen and something has to carry the
 * explanation of what to do next.
 */
export const DIWCHE_EMPTY = {
  'visual-studio': '07-coloring',
  'reels-studio': '06-layout-design',
  'rss': '04-brainstorming',
  'dashboard': '05-pitching',
  'suggestions': '04-brainstorming',
  'templates': '06-layout-design',
} as const satisfies Record<string, DiwcheScene>;
