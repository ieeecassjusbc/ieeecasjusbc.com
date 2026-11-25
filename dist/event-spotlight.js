const photoInterval = 5500;
const fadeTiming = { duration: 1200, easing: 'ease-in-out', fill: 'both' };

for (const gallery of document.querySelectorAll('[data-spotlight]')) {
  const photos = Array.from(gallery.children);
  if (photos.length < 2) continue;

  const dimmer = document.createElement('div');
  dimmer.className = 'event-photo-dimmer';
  dimmer.setAttribute('aria-hidden', 'true');
  gallery.append(dimmer);

  let current = 0;
  let focused = false;
  let inView = !('IntersectionObserver' in window);
  let transitioning = false;
  let timer;

  function canAdvance() {
    return inView && !focused && !document.hidden;
  }

  function schedule() {
    window.clearTimeout(timer);
    if (canAdvance() && !transitioning) {
      timer = window.setTimeout(advance, photoInterval);
    }
  }

  function showPhoto(next) {
    photos[current].classList.remove('is-current');
    photos[current].inert = true;
    current = next;
    photos[current].classList.add('is-current');
    photos[current].inert = false;
  }

  async function advance() {
    transitioning = true;
    const next = (current + 1) % photos.length;
    const image = photos[next].querySelector('img');
    image.loading = 'eager';
    await image.decode().catch(() => {});

    if (canAdvance() && image.naturalWidth) {
      const fade = dimmer.animate([{ opacity: 0 }, { opacity: 1 }], fadeTiming);
      await fade.finished;
      if (canAdvance()) showPhoto(next);
      fade.reverse();
      await fade.finished;
      fade.cancel();
    }

    transitioning = false;
    schedule();
  }

  gallery.addEventListener('focusin', () => {
    focused = true;
    schedule();
  });
  gallery.addEventListener('focusout', (event) => {
    focused = gallery.contains(event.relatedTarget);
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      schedule();
    }, { threshold: 0.25 });
    observer.observe(gallery);
  }
  schedule();
}
