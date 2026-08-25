import {
  Directive, DestroyRef, ElementRef, NgZone, PLATFORM_ID, effect, inject, input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { AnimationItem } from 'lottie-web';

import { DiwcheScene } from './diwche-situations';

/**
 * Plays one Diwche animation.
 *
 *   <div [diwche]="'writing'"></div>
 *   <div [diwche]="sceneForJob(job.tag)"></div>
 *
 * Deliberately a directive over `lottie-web/build/player/lottie_light` rather than a wrapper
 * library. Four things it has to get right, none of which a wrapper does for you:
 *
 *  - **It must not be in the initial bundle.** The player is ~46 KB gzipped and most routes
 *    never show a mascot, so it is loaded with a dynamic `import()` at the moment one is
 *    actually needed.
 *  - **It must not drive change detection.** Lottie runs a requestAnimationFrame loop; inside
 *    the Angular zone that is a change-detection pass thirty times a second, per animation.
 *  - **It must respect reduced motion.** Not by pausing — by never loading the player at all
 *    and showing the static poster instead. Someone who asked for less motion should not pay
 *    to download an animation they will not see.
 *  - **It must stop when off screen.** A dozen of these on one page would otherwise all
 *    animate continuously while scrolled out of view.
 */
@Directive({ selector: '[diwche]' })
export class DiwcheDirective {
  /** Scene slug — see `diwche-situations.ts`. */
  readonly diwche = input.required<DiwcheScene>();

  /** Where the built assets are served from. */
  readonly diwcheBase = input('/mascot');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private anim?: AnimationItem;
  private observer?: IntersectionObserver;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.teardown());

    effect(() => {
      const scene = this.diwche();
      const base = this.diwcheBase();
      if (!this.isBrowser) return;

      this.teardown();
      const el = this.host.nativeElement;

      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.style.backgroundImage = `url(${base}/fallback/${scene}-poster.webp)`;
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center';
        return;
      }

      void this.load(scene, base, el);
    });
  }

  private async load(scene: DiwcheScene, base: string, el: HTMLElement) {
    const lottie = (await import('lottie-web/build/player/lottie_light')).default;
    if (this.diwche() !== scene) return; // the scene changed while we were loading

    this.anim = this.zone.runOutsideAngular(() =>
      lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: true,
        autoplay: false, // the IntersectionObserver below decides
        path: `${base}/lottie/${scene}.json`,
        // The layer images are external files, and every asset in the JSON carries an empty
        // `u` on purpose. lottie-web resolves a non-empty `u` against the *document* URL
        // rather than the JSON's own location, so on any route deeper than the root a
        // relative path would quietly 404 and the layer would render blank rather than throw.
        // Setting assetsPath here overrides `u` entirely and sidesteps that.
        assetsPath: `${base}/assets/${scene}/`,
        rendererSettings: { progressiveLoad: true, preserveAspectRatio: 'xMidYMid meet' },
      }),
    );

    // A missing layer image is not an error in lottie-web — it renders an invisible layer.
    // Worth saying so out loud rather than shipping a mascot with no head.
    this.anim.addEventListener('data_failed', () =>
      console.error(`[diwche] could not load scene "${scene}"`),
    );

    // Start partway into the loop, at an offset derived from the scene name. Without this,
    // several mascots mounted together — a grid of empty states, a tray of running jobs —
    // breathe and blink in perfect unison, which reads as obviously mechanical. Derived from
    // the name rather than random so a given scene always looks the same.
    this.anim.addEventListener('DOMLoaded', () => {
      const seed = [...scene].reduce((a, c) => a + c.charCodeAt(0), 0);
      this.anim?.goToAndPlay(seed % (this.anim?.totalFrames || 1), true);
    });

    this.observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? this.anim?.play() : this.anim?.pause()),
      { rootMargin: '200px' },
    );
    this.observer.observe(el);
  }

  private teardown() {
    this.observer?.disconnect();
    this.observer = undefined;
    this.anim?.destroy();
    this.anim = undefined;
  }
}
