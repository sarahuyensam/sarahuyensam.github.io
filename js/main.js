(() => {
  if (location.search.includes('shot')) document.documentElement.classList.add('shot');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) scrollTo(0, 0);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = window.gsap && window.ScrollTrigger;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.1 });
    window.__lenis = lenis;
    lenis.on('scroll', () => hasGsap && ScrollTrigger.update());
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60 }); }
    }));
  }

  /* ledger grid that draws itself */
  document.querySelectorAll('svg.grid').forEach(svg => {
    const build = () => {
      const w = svg.clientWidth, h = svg.clientHeight, step = 48;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.innerHTML = '';
      const lines = [];
      for (let y = step; y < h; y += step) lines.push([0, y, w, y, '']);
      for (let x = step * 3; x < w; x += step * 4) lines.push([x, 0, x, h, '']);
      if (!svg.classList.contains('grid--dark')) lines.push([step * 2, 0, step * 2, h, 'red']);
      lines.forEach(([x1, y1, x2, y2, c], i) => {
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        Object.entries({ x1, y1, x2, y2 }).forEach(([k, v]) => l.setAttribute(k, v));
        if (c) l.setAttribute('class', c);
        const len = Math.hypot(x2 - x1, y2 - y1);
        l.style.strokeDasharray = len;
        l.style.strokeDashoffset = reduce ? 0 : len;
        svg.appendChild(l);
        if (!reduce && hasGsap) gsap.to(l, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out', delay: 0.2 + i * 0.03,
          scrollTrigger: svg.closest('.contact') ? { trigger: svg, start: 'top 80%' } : undefined });
      });
    };
    build();
    let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 200); });
  });

  if (hasGsap && !reduce) {
    /* hero entrance */
    gsap.from('.hero__name .line > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
    gsap.from('.slogan__a, .slogan__b', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.25, delay: 0.75 });
    gsap.from('.slogan__tag', { scale: 0, rotate: -40, duration: 0.6, ease: 'back.out(2.4)', delay: 1.6 });
    gsap.from('.hero__kick, .hero__meta', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.5 });
    gsap.from('.card-photo', { y: 80, rotate: 14, opacity: 0, duration: 1.4, ease: 'expo.out', delay: 0.35 });
    gsap.from('.award', { yPercent: -160, opacity: 0, duration: 1.6, ease: 'bounce.out', delay: 0.9, clearProps: 'transform' });
    gsap.from('.stamp', { scale: 2.4, opacity: 0, duration: 0.5, ease: 'back.out(2)', delay: 1.5 });

    /* section headings */
    gsap.utils.toArray('.reveal').forEach(el => gsap.from(el, {
      y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));

    /* ledger rows write in */
    gsap.utils.toArray('.row').forEach(r => gsap.from(r.children, {
      y: 26, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: r, start: 'top 85%' } }));

    /* logo tiles */
    gsap.from('.logos li', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: '.logos', start: 'top 80%' } });

    /* stacked project cards shrink as the next arrives */
    const cards = gsap.utils.toArray('.pcard');
    if (matchMedia('(min-width: 861px)').matches) cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      gsap.to(c, { scale: 0.94, opacity: 0.55, ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top 85%', end: 'top 110px', scrub: true } });
    });

    /* photo tilt + parallax */
    gsap.to('.card-photo', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* hover tilt on the photo card */
  const tilt = document.querySelector('[data-tilt]');
  if (tilt && !reduce && matchMedia('(hover:hover)').matches) {
    tilt.addEventListener('mousemove', e => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) rotate(1deg)`;
    });
    tilt.addEventListener('mouseleave', () => tilt.style.transform = '');
  }

  /* highlighter marks */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { setTimeout(() => e.target.classList.add('on'), 900 + [...document.querySelectorAll('mark.hl')].indexOf(e.target) * 350); io.unobserve(e.target); }
  }), { threshold: 0.6 });
  document.querySelectorAll('mark.hl').forEach(m => io.observe(m));

  /* counters */
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, dur = 1600, t0 = performance.now();
    const step = t => { const p = Math.min(1, (t - t0) / dur), v = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * v); if (p < 1) requestAnimationFrame(step); };
    reduce ? (el.textContent = end) : requestAnimationFrame(step);
    co.unobserve(el);
  }), { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(c => co.observe(c));

  /* drag-to-scroll strip; sideways wheel stays native */
  document.querySelectorAll('[data-drag]').forEach(s => {
    let down = false, x0 = 0, s0 = 0, moved = false;
    s.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = s.scrollLeft; s.classList.add('dragging'); });
    addEventListener('pointermove', e => { if (!down) return; const d = e.clientX - x0; if (Math.abs(d) > 4) moved = true; s.scrollLeft = s0 - d; });
    addEventListener('pointerup', () => { down = false; s.classList.remove('dragging'); });
    s.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
    s.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation(); }, { passive: true });
  });

  /* lightbox */
  const lb = document.querySelector('.lightbox'), lbImg = lb.querySelector('img');
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-full]');
    if (t) { lbImg.src = t.dataset.full; lbImg.alt = t.alt || ''; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); }
  });
  const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); };
  lb.addEventListener('click', e => { if (e.target !== lbImg) close(); });
  addEventListener('keydown', e => e.key === 'Escape' && close());

  /* cursor */
  const cur = document.querySelector('.cursor');
  if (cur && matchMedia('(hover:hover)').matches) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cur.classList.add('live'); });
    const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
    loop();
    document.querySelectorAll('a, button, [data-full], .pcard, .logos li').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
  }
})();
