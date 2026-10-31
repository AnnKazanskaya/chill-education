// Движок хэллоуин-квизов: страница задаёт QUIZ = {questions, results, order, gaName, title, cta}
const $ = id => document.getElementById(id);
function track(name, params) { try { gtag('event', name, params || {}); } catch (e) {} }

const LEAD_URL = 'https://nixvpftdqevecjdqyuwv.supabase.co/functions/v1/site-lead';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
(function () {
  try {
    const q = new URLSearchParams(location.search);
    if (UTM_KEYS.some(k => q.get(k))) {
      const utm = {};
      UTM_KEYS.forEach(k => { const v = q.get(k); if (v) utm[k] = v; });
      localStorage.setItem('chill_utm', JSON.stringify({ utm, ts: Date.now() }));
    }
  } catch (e) {}
})();
function utmLines() {
  try {
    const saved = JSON.parse(localStorage.getItem('chill_utm') || 'null');
    if (saved && Date.now() - saved.ts < 7 * 24 * 3600 * 1000) {
      return UTM_KEYS.filter(k => saved.utm[k]).map(k => 'UTM ' + k.slice(4) + ': ' + saved.utm[k]).join('\n');
    }
  } catch (e) {}
  try {
    if (document.referrer && new URL(document.referrer).host !== location.host) return 'Переход с: ' + document.referrer;
  } catch (e) {}
  return '';
}

// вариант оформления экрана результата: ?layout=1..4, основной — 3 (герой внутри блока записи)
const LAYOUT = new URLSearchParams(location.search).get('layout') || '3';
document.documentElement.dataset.layout = LAYOUT;
const firstSentence = html => {
  const t = html.replace(/<[^>]+>/g, '');
  const m = t.match(/^.+?[.!?](\s|$)/);
  return (m ? m[0] : t).trim();
};

let qi = 0, best = null;
const scores = {};

function start() {
  qi = 0;
  Object.keys(scores).forEach(k => delete scores[k]);
  $('intro').style.display = 'none';
  $('result').style.display = 'none';
  document.body.classList.remove('has-result');
  $('quiz').style.display = '';
  track(QUIZ.gaName + '_start');
  // пока человек отвечает, подгружаем картинки героев, чтобы результат открылся сразу
  Object.values(QUIZ.results).forEach(r => { const i = new Image(); i.src = r.img; });
  renderQ();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderQ() {
  const q = QUIZ.questions[qi];
  $('prog-n').textContent = 'Вопрос ' + (qi + 1) + ' из ' + QUIZ.questions.length;
  $('bar-i').style.width = Math.round(qi / QUIZ.questions.length * 100) + '%';
  $('q-text').textContent = q.t;
  $('q-opts').innerHTML = q.o.map((o, i) =>
    `<button class="opt" data-i="${i}"><span class="em">${o.e}</span><span>${o.t}</span></button>`).join('');
  document.querySelectorAll('#q-opts .opt').forEach(b => b.addEventListener('click', () => {
    const key = q.o[+b.dataset.i].k;
    scores[key] = (scores[key] || 0) + 1;
    qi++;
    if (qi < QUIZ.questions.length) renderQ();
    else showResult();
  }));
}

function renderCta(r) {
  const c = QUIZ.cta;
  $('cta').innerHTML = `
    <div class="cta-hero"><img src="${r.img}" alt=""><div><span class="res-tag">${r.tag}</span><div class="cta-name">${r.name}</div><p class="cta-lead">${firstSentence(r.text)}</p></div></div>
    <img class="cta-pic" src="${c.pic}" alt="">
    <span class="kicker">${c.kicker}</span>
    <h2>${c.title}</h2>
    <p>${c.text}</p>
    <form id="lead-form" novalidate>
      <div class="row">
        <input name="name" type="text" autocomplete="name" placeholder="Имя" required>
        <input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Телефон" required>
      </div>
      <select name="messenger" required>
        <option value="" disabled selected>Где тебя найти по этому номеру?</option>
        <option>Telegram</option><option>WhatsApp</option><option>Telegram и WhatsApp</option><option value="Ни в какой">Ни в какой, лучше позвонить</option>
      </select>
      <label class="consent"><input type="checkbox" name="consent" required>
        <span>Я соглашаюсь с <a href="https://chill.education/policy.html" target="_blank" rel="noopener">политикой конфиденциальности</a> и даю <a href="https://chill.education/consent.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a></span></label>
      <button class="btn" type="submit">${c.button}</button>
    </form>
    <ul>${c.bullets.map(b => `<li><span>${b[0]}</span>${b[1]}</li>`).join('')}</ul>`;
  const form = $('lead-form');
  const sel = form.elements.namedItem('messenger');
  sel.addEventListener('change', () => sel.classList.add('filled'));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.elements.namedItem('name').value.trim();
    const phone = form.elements.namedItem('phone').value.trim();
    const messenger = sel.value;
    const utm = utmLines();
    const text = '🎃 Заявка с хэллоуин-теста\n👤 Имя: ' + (name || '—') + '\n📞 Телефон: ' + phone +
      '\n💬 Соцсеть: ' + messenger + '\n📍 Тест: ' + QUIZ.title + ' · результат «' + r.name.replace(/^Ты — /, '').replace(/!$/, '') + '»' +
      (utm ? '\n' + utm : '');
    fetch(LEAD_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, src: 'Хэллоуин', name, phone })
    }).catch(() => {});
    track(QUIZ.gaName + '_lead', { character: best });
    form.outerHTML = `<div class="done"><i>${c.doneIcon}</i><div><b>${c.doneTitle}</b><span>Преподаватель напишет тебе в течение дня</span></div></div>`;
  });
}

function showResult() {
  best = null; let bestN = -1;
  QUIZ.order.forEach(k => { if ((scores[k] || 0) > bestN) { bestN = scores[k] || 0; best = k; } });
  const r = QUIZ.results[best];
  $('quiz').style.display = 'none';
  $('result').style.display = '';
  document.body.classList.add('has-result');
  $('res-lead').textContent = firstSentence(r.text);
  $('res-img').src = r.img;
  $('res-img').alt = r.name;
  $('res-tag').textContent = r.tag;
  $('res-name').textContent = r.name;
  $('res-text').innerHTML = r.text;
  $('res-vocab').innerHTML = '<b>🎃 Твои хэллоуин-слова</b>' + r.vocab.map(v => `<span>${v}</span>`).join('');
  renderCta(r);
  track(QUIZ.gaName + '_result', { character: best });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  $('start-btn').addEventListener('click', start);
  $('again').addEventListener('click', start);
  // ?skip=1 сразу показывает случайный результат, чтобы быстро сравнить варианты оформления
  if (new URLSearchParams(location.search).get('skip')) {
    const k = QUIZ.order[Math.floor(Math.random() * QUIZ.order.length)];
    scores[k] = 1;
    $('intro').style.display = 'none';
    showResult();
  }
});
