history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lenis
const isMobile = window.innerWidth <= 768;
const lenis = new Lenis({
  duration:        isMobile ? 2.2 : 1.2,
  easing:          t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel:     true,
  smoothTouch:     isMobile,
  touchMultiplier: isMobile ? 0.4 : 2,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.scrollTo(0, { immediate: true });
lenis.stop();

// Loader
const loaderTl = gsap.timeline({ onComplete: initPage });

if (!reduced) {
  loaderTl
    .fromTo('#loaderTitle',
      { opacity: 0, filter: 'blur(24px)', letterSpacing: '1em' },
      { opacity: 1, filter: 'blur(0px)', letterSpacing: '0.5em', duration: 1.3, ease: 'power3.out' }
    )
    .to('#loaderBar', {
      width: '100%', duration: 1.4, ease: 'power2.inOut',
      onUpdate() {
        document.getElementById('loaderPct').textContent =
          Math.round(this.progress() * 100) + '%';
      }
    }, '-=0.5')
    .to('#loaderTitle', { scale: 1.06, opacity: 0, filter: 'blur(20px)', duration: 0.8, ease: 'power2.in' }, '+=0.2')
    .to('#loader', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=0.3');
} else {
  loaderTl
    .to('#loaderBar', { width: '100%', duration: 0.3 })
    .set('#loader', { display: 'none' });
}

// Hero
function initPage() {
  lenis.start();
  gsap.to('.orb', { opacity: 1, duration: 3, stagger: 0.4, ease: 'power2.out' });

  if (!reduced) {
    gsap.to('.orb-1', { x: 50, y: 40,   duration: 9,  repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.orb-2', { x: -40, y: -50, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.orb-3', { x: 30, y: 35,   duration: 7,  repeat: -1, yoyo: true, ease: 'sine.inOut' });

    gsap.fromTo('.hero-title span',
      { opacity: 0, y: 90, rotateX: -90, filter: 'blur(8px)' },
      { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)',
        duration: 1, stagger: 0.07, ease: 'back.out(1.4)', delay: 0.1,
        transformPerspective: 800 }
    );

    gsap.to('.hero-desc', { opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.75 });
    gsap.to('.hero-sub', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.9 });
    gsap.to('.hero-cta', { opacity: 1,        duration: 0.8, ease: 'power2.out', delay: 1.3 });
    gsap.to('.hero-cta', {
      boxShadow: '0 0 35px #c4880a2a', duration: 2.2,
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2
    });

    // mouse parallax
    const hero = document.querySelector('.hero');
    const qTx = gsap.quickTo('.hero-title', 'x', { duration: 0.9, ease: 'power3.out' });
    const qTy = gsap.quickTo('.hero-title', 'y', { duration: 0.9, ease: 'power3.out' });
    const qSx = gsap.quickTo('.hero-sub',   'x', { duration: 1.3, ease: 'power3.out' });
    const qSy = gsap.quickTo('.hero-sub',   'y', { duration: 1.3, ease: 'power3.out' });
    const qCx = gsap.quickTo('#seqCanvas', 'x', { duration: 2.0, ease: 'power2.out' });
    const qCy = gsap.quickTo('#seqCanvas', 'y', { duration: 2.0, ease: 'power2.out' });

    hero.addEventListener('mousemove', e => {
      const r  = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5;
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      qTx(nx * 48);  qTy(ny * 26);
      qSx(nx * 22);  qSy(ny * 12);
      qCx(nx * -16); qCy(ny * -9);
    });
    hero.addEventListener('mouseleave', () => { qTx(0); qTy(0); qSx(0); qSy(0); qCx(0); qCy(0); });
  }
}

// Section label — per-char reveal
(function () {
  const label = document.querySelector('.section-label');
  if (!label) return;
  label.innerHTML = [...label.textContent].map(c =>
    `<span class="sl-c" style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');

  gsap.fromTo('.sl-c',
    { opacity: 0, y: 10, filter: 'blur(5px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.05, ease: 'power2.out',
      scrollTrigger: { trigger: '.cards-section', start: 'top 80%', once: true } }
  );
  gsap.fromTo('.section-title',
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 1.5, ease: 'power3.out', delay: 0.25,
      scrollTrigger: { trigger: '.cards-section', start: 'top 78%', once: true } }
  );
  gsap.to('.section-desc', {
    opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.9,
    scrollTrigger: { trigger: '.cards-section', start: 'top 76%', once: true }
  });
})();

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(card, { rotateY: x * 7, rotateX: -y * 7, transformPerspective: 900, duration: 0.4, ease: 'power2.out' });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1,0.5)' });
  });
});

// Counter — scan line + stagger reveal
ScrollTrigger.create({
  trigger: '.counter-section', start: 'top 72%', once: true,
  onEnter() {
    gsap.timeline()
      .to('#counterScan',    { scaleX: 1, opacity: 0.7, duration: 1.3, ease: 'power3.inOut' })
      .to('#counterScan',    { opacity: 0, duration: 0.5, ease: 'power2.in' })
      .to('.counters > div', { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '-=0.3');
  }
});

document.querySelectorAll('.counter-num').forEach(el => {
  const target = parseInt(el.dataset.target);
  ScrollTrigger.create({
    trigger: el, start: 'top 88%', once: true,
    onEnter() {
      gsap.to({ val: 0 }, {
        val: target, duration: 2.5, ease: 'power2.out',
        onUpdate() {
          const v = Math.round(this.targets()[0].val);
          el.textContent = target >= 1000000
            ? (v / 1000000).toFixed(1) + 'M'
            : v.toLocaleString();
        }
      });
    }
  });
});

// Marquee
(function () {
  const track  = document.getElementById('marqueeTrack');
  const totalW = track.scrollWidth / 2;
  gsap.to(track, { x: -totalW, duration: 35, ease: 'none', repeat: -1 });
})();

// Big lines + amber underline
gsap.fromTo('.big-line-inner',
  { y: '110%', filter: 'blur(16px)', opacity: 0 },
  { y: '0%', filter: 'blur(0px)', opacity: 1,
    duration: 1.5, stagger: 0.25, ease: 'power4.out',
    scrollTrigger: { trigger: '.lines-section', start: 'top 80%', once: true } }
);

gsap.to('#linesUnderline', {
  width: '100%', duration: 1.8, ease: 'power3.inOut', delay: 0.7,
  scrollTrigger: { trigger: '.lines-section', start: 'top 65%', once: true }
});


// Image Sequence
const FRAME_COUNT = 241;
(function () {
  const canvas     = document.getElementById('seqCanvas');
  const ctx        = canvas.getContext('2d');
  const frameCount = FRAME_COUNT;
  const images     = new Array(frameCount);
  const state      = { frame: 0 };

  function pad(n) { return String(n).padStart(3, '0'); }

  function renderFrame(index) {
    const img = images[Math.round(index)];
    if (!img || !img.complete || !img.naturalWidth) return;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(canvas.width / iw, canvas.height / ih);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img,
      (canvas.width  - iw * scale) / 2,
      (canvas.height - ih * scale) / 2,
      iw * scale, ih * scale
    );
  }

  function setSize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    renderFrame(state.frame);
  }

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = `sequence/seq${pad(i)}.webp`;
    if (i === 0) img.onload = setSize;
    images[i] = img;
  }

  window.addEventListener('resize', setSize);
  setSize();

  gsap.to(state, {
    frame: frameCount - 1, ease: 'none',
    onUpdate() { renderFrame(state.frame); },
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '+=' + (frameCount - 100) * (isMobile ? 22 : 10),
      scrub: isMobile ? 12 : 5,
      pin: true,
    }
  });
})();

// Scroll parallax on hero text during sequence pin
const pinDist = (FRAME_COUNT - 100) * (isMobile ? 22 : 10);
const heroParallaxST = { trigger: '.hero', start: 'top top', end: '+=' + pinDist, scrub: 1.5 };
gsap.to('.hero-title',  { yPercent: -55, ease: 'none', scrollTrigger: heroParallaxST });
gsap.to('.hero-desc',   { yPercent: -40, ease: 'none', scrollTrigger: { ...heroParallaxST, scrub: 1.8 } });
gsap.to('.hero-sub',    { yPercent: -28, ease: 'none', scrollTrigger: { ...heroParallaxST, scrub: 2 } });
gsap.to('.hero-cta',    { yPercent: -14, ease: 'none', scrollTrigger: { ...heroParallaxST, scrub: 2.5 } });
gsap.to('.hero-glow-a', { yPercent: -38, ease: 'none', scrollTrigger: { ...heroParallaxST, scrub: 1.8 } });
gsap.to('.hero-glow-b', { yPercent: -20, ease: 'none', scrollTrigger: { ...heroParallaxST, scrub: 2.2 } });
gsap.to('.hero-glow-c', { yPercent: -10, ease: 'none', scrollTrigger: { ...heroParallaxST, scrub: 3 } });

// Section entrances
ScrollTrigger.refresh();

const mStart  = isMobile ? 'top 115%' : 'top 88%';
const mStart2 = isMobile ? 'top 115%' : 'top 85%';
const mDur    = isMobile ? 0.7 : 1;

// Cards — 3D perspective rise + skew correction
gsap.fromTo('.cards-section',
  { y: 180, rotateX: 14, skewY: -2, filter: 'blur(36px)', scale: 0.88, transformPerspective: 1000, transformOrigin: 'center bottom' },
  { y: 0, rotateX: 0, skewY: 0, filter: 'blur(0px)', scale: 1,
    duration: mDur * 1.8, ease: 'expo.out',
    scrollTrigger: { trigger: '.cards-section', start: mStart, once: true } }
);

// Cards stagger — 3D flip from below
gsap.fromTo('.card',
  { opacity: 0, y: 100, rotateX: -22, scale: 0.86, filter: 'blur(10px)', transformPerspective: 1200, transformOrigin: 'top center' },
  { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: 'blur(0px)',
    duration: mDur * 1.2, stagger: { amount: isMobile ? 0.3 : 0.55, from: 'start' }, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '.cards-grid', start: mStart2, once: true } }
);

// Counter — clip-path bottom wipe
gsap.fromTo('.counter-section',
  { clipPath: 'inset(0 0 100% 0)', filter: 'blur(12px)' },
  { clipPath: 'inset(0 0 0% 0)', filter: 'blur(0px)',
    duration: mDur * 1.5, ease: 'power4.inOut',
    scrollTrigger: { trigger: '.counter-section', start: mStart2, once: true } }
);

// Marquee — cinematic zoom-out from oversized
gsap.fromTo('.marquee-section',
  { scale: 1.22, filter: 'blur(28px)', opacity: 0 },
  { scale: 1, filter: 'blur(0px)', opacity: 1,
    duration: mDur * 1.4, ease: 'expo.out',
    scrollTrigger: { trigger: '.marquee-section', start: mStart, once: true } }
);

// Lines — container dramatic blur drop
gsap.fromTo('.lines-section',
  { y: 120, filter: 'blur(50px)', scale: 0.92, transformOrigin: 'center top' },
  { y: 0, filter: 'blur(0px)', scale: 1,
    duration: mDur * 2, ease: 'expo.out',
    scrollTrigger: { trigger: '.lines-section', start: mStart, once: true } }
);

// Section atmosphere glows — scroll fade-in
gsap.to('.cg-a',  { opacity: 1,   duration: mDur * 2,   ease: 'power2.out', scrollTrigger: { trigger: '.cards-section',   start: mStart,  once: true } });
gsap.to('.cg-b',  { opacity: 0.8, duration: mDur * 2.5, ease: 'power2.out', scrollTrigger: { trigger: '.cards-section',   start: mStart2, once: true } });
gsap.to('.cng-a', { opacity: 1,   duration: mDur * 2,   ease: 'power2.out', scrollTrigger: { trigger: '.counter-section', start: mStart,  once: true } });
gsap.to('.mqg-a', { opacity: 1,   duration: mDur * 1.5, ease: 'power2.out', scrollTrigger: { trigger: '.marquee-section', start: mStart,  once: true } });
gsap.to('.lg-a',  { opacity: 1,   duration: mDur * 2.5, ease: 'power2.out', scrollTrigger: { trigger: '.lines-section',   start: mStart,  once: true } });
gsap.to('.lg-b',  { opacity: 0.7, duration: mDur * 3,   ease: 'power2.out', scrollTrigger: { trigger: '.lines-section',   start: mStart2, once: true } });
