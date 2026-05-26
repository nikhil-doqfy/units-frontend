/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { register as registerSwiperElements } from 'swiper/element/bundle';

registerSwiperElements();

function initDualScroll() {
  const attached = new WeakSet<Element>();

  function makeCustomBar(position: 'top' | 'bottom'): [HTMLElement, HTMLElement] {
    const track = document.createElement('div');
    track.className = `dual-scroll-${position}`;
    const thumb = document.createElement('div');
    thumb.className = 'dual-scroll-thumb';
    track.appendChild(thumb);
    return [track, thumb];
  }

  function wire(el: HTMLElement) {
    if (attached.has(el)) return;
    attached.add(el);

    const [topTrack, topThumb] = makeCustomBar('top');
    const [bottomTrack, bottomThumb] = makeCustomBar('bottom');

    el.parentNode!.insertBefore(topTrack, el);
    el.parentNode!.insertBefore(bottomTrack, el.nextSibling);

    function updateThumb() {
      const ratio = el.clientWidth / el.scrollWidth;
      const thumbW = Math.max(ratio * el.clientWidth, 40);
      const maxScroll = el.scrollWidth - el.clientWidth;
      const thumbLeft = maxScroll > 0 ? (el.scrollLeft / maxScroll) * (el.clientWidth - thumbW) : 0;
      [topThumb, bottomThumb].forEach(t => {
        t.style.width = thumbW + 'px';
        t.style.transform = `translateX(${thumbLeft}px)`;
        t.style.display = ratio >= 1 ? 'none' : 'block';
      });
    }

    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    const table = el.querySelector('table');
    if (table) ro.observe(table);

    el.addEventListener('scroll', updateThumb);
    updateThumb();

    function attachDrag(thumb: HTMLElement) {
      thumb.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startScroll = el.scrollLeft;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const thumbW = thumb.offsetWidth;
        const trackW = el.clientWidth;

        const onMove = (e: MouseEvent) => {
          const dx = e.clientX - startX;
          const scrollRatio = dx / (trackW - thumbW);
          el.scrollLeft = Math.min(Math.max(startScroll + scrollRatio * maxScroll, 0), maxScroll);
          updateThumb();
        };
        const onUp = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      thumb.addEventListener('touchstart', (e: TouchEvent) => {
        const startX = e.touches[0].clientX;
        const startScroll = el.scrollLeft;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const thumbW = thumb.offsetWidth;
        const trackW = el.clientWidth;

        const onMove = (e: TouchEvent) => {
          const dx = e.touches[0].clientX - startX;
          const scrollRatio = dx / (trackW - thumbW);
          el.scrollLeft = Math.min(Math.max(startScroll + scrollRatio * maxScroll, 0), maxScroll);
          updateThumb();
        };
        const onEnd = () => {
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', onEnd);
        };
        document.addEventListener('touchmove', onMove, { passive: true });
        document.addEventListener('touchend', onEnd);
      });
    }

    attachDrag(topThumb);
    attachDrag(bottomThumb);
  }

  document.querySelectorAll<HTMLElement>('.table-responsive').forEach(wire);

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches('.table-responsive')) wire(node);
        node.querySelectorAll<HTMLElement>('.table-responsive').forEach(wire);
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
}

bootstrapApplication(AppComponent, appConfig)
  .then(() => initDualScroll())
  .catch((err) => console.error(err));
