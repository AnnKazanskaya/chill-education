// Ночной интерактивный фон хэллоуин-страниц: звёзды, луна, туман, парящие фигурки и летучие мыши от касания
(function () {
  const IMG = new URL('img/', document.currentScript.src).href;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.innerWidth < 600;

  const night = document.createElement('div');
  night.id = 'night';
  night.setAttribute('aria-hidden', 'true');
  night.innerHTML = '<canvas id="stars"></canvas><div class="moon"></div><div class="fog"></div><div class="fog f2"></div>';
  document.body.prepend(night);

  // звёзды
  const cv = night.querySelector('#stars'), ctx = cv.getContext('2d');
  let stars = [], W = 0, H = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(220, Math.round(W * H / 5200));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H * .75, r: Math.random() * 1.3 + .3,
      a: Math.random() * Math.PI * 2, s: .6 + Math.random() * 1.6
    }));
  }
  resize();
  window.addEventListener('resize', resize);

  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#FFF6DA';
    for (const s of stars) {
      ctx.globalAlpha = reduce ? .8 : .45 + .55 * Math.abs(Math.sin(s.a + t / 1000 * s.s));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // парящие фигурки по краям, за карточкой
  const k = mobile ? .62 : 1;
  [
    { img: 'deco-ghost.webp',   x: 5,  y: 20, w: 82 },
    { img: 'deco-bat.webp',     x: 80, y: 30, w: 104 },
    { img: 'deco-pumpkin.webp', x: 3,  y: 70, w: 92 },
    { img: 'deco-bat.webp',     x: 66, y: 9,  w: 64 },
    { img: 'deco-ghost.webp',   x: 86, y: 72, w: 62 },
  ].forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'sprite';
    const x = mobile ? (c.x < 50 ? -5 : 85) : c.x;
    el.style.left = x + 'vw'; el.style.top = c.y + 'vh'; el.style.width = Math.round(c.w * k) + 'px';
    el.innerHTML = `<img src="${IMG + c.img}" alt="" style="animation-delay:${-i * 1.3}s;animation-duration:${5 + i * .8}s">`;
    night.appendChild(el);
  });

  // касание по фону: из точки вылетает стайка летучих мышей
  let flying = 0;
  function bats(x, y) {
    const n = mobile ? 5 : 7;
    for (let i = 0; i < n && flying < 24; i++) {
      const el = document.createElement('div');
      el.className = 'flyer';
      const w = 30 + Math.random() * 26;
      el.style.width = w + 'px'; el.style.left = (x - w / 2) + 'px'; el.style.top = (y - w / 3) + 'px';
      el.innerHTML = `<img src="${IMG}deco-bat.webp" alt="">`;
      document.body.appendChild(el); flying++;
      const ang = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.3;
      const dist = 160 + Math.random() * 220;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
      el.animate([
        { transform: 'translate(0,0) scale(.3)', opacity: 0 },
        { transform: `translate(${dx * .35}px,${dy * .35}px) scale(1,.75)`, opacity: 1, offset: .25 },
        { transform: `translate(${dx * .6}px,${dy * .6}px) scale(1,1)`, opacity: 1, offset: .5 },
        { transform: `translate(${dx * .85}px,${dy * .85}px) scale(.9,.7)`, opacity: .8, offset: .75 },
        { transform: `translate(${dx}px,${dy}px) scale(.7)`, opacity: 0 }
      ], { duration: 1200 + Math.random() * 700, easing: 'cubic-bezier(.25,.7,.4,1)' }).onfinish = () => { el.remove(); flying--; };
    }
  }
  if (!reduce) {
    document.addEventListener('pointerdown', e => {
      if (!e.target.closest('button,a,input,select,label,textarea,.opt,.card,.cta')) bats(e.clientX, e.clientY);
    }, { passive: true });
  }

  // мерцание звёзд, пауза в фоновой вкладке
  let last = 0;
  function loop(t) {
    if (!document.hidden && t - last > 33) { drawStars(t); last = t; }
    requestAnimationFrame(loop);
  }
  if (reduce) drawStars(0); else requestAnimationFrame(loop);
})();
