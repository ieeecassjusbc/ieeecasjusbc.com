const menu = document.querySelector('.resource-menu');
const summary = menu.querySelector('summary');
let openedByHover = false;

menu.addEventListener('pointerenter', (event) => {
  if (event.pointerType !== 'mouse' || menu.open) return;
  menu.open = true;
  openedByHover = true;
});
menu.addEventListener('pointerleave', () => {
  if (openedByHover && !menu.contains(document.activeElement)) menu.open = false;
  openedByHover = false;
});
summary.addEventListener('click', (event) => {
  if (event.detail > 0 && openedByHover) event.preventDefault();
  openedByHover = false;
});
document.addEventListener('pointerdown', (event) => {
  if (!menu.contains(event.target)) {
    menu.open = false;
    openedByHover = false;
  }
});
menu.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    openedByHover = false;
    summary.focus();
  }
});
menu.addEventListener('focusout', (event) => {
  if (!menu.contains(event.relatedTarget)) menu.open = false;
});

const aboutPhotos = document.querySelector('.about-photos');
if (aboutPhotos) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      aboutPhotos.classList.toggle('is-playing', entry.intersectionRatio >= 0.1);
    }, { threshold: 0.1 });
    observer.observe(aboutPhotos);
  } else {
    aboutPhotos.classList.add('is-playing');
  }
}

const projectBackground = document.querySelector('.project-backdrop video');
if (projectBackground) {
  const backdrop = projectBackground.parentElement;
  let inView = !('IntersectionObserver' in window);
  let fallbackTimer;

  function showAnimatedFallback() {
    if (inView && (projectBackground.paused || projectBackground.readyState < 2 || projectBackground.currentTime === 0)) {
      backdrop.classList.add('use-animated-fallback');
    }
  }

  function checkProjectAutoplay() {
    window.clearTimeout(fallbackTimer);
    if (!inView || (!projectBackground.paused && projectBackground.currentTime > 0)) return;
    fallbackTimer = window.setTimeout(showAnimatedFallback, 1500);
    projectBackground.play().catch(showAnimatedFallback);
  }

  projectBackground.addEventListener('playing', () => {
    window.clearTimeout(fallbackTimer);
    backdrop.classList.remove('use-animated-fallback');
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      checkProjectAutoplay();
    });
    observer.observe(backdrop);
  } else {
    checkProjectAutoplay();
  }
}
