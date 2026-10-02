// Движок хэллоуин-квизов: страница задаёт QUIZ = {questions, results, gaName}
const $ = id => document.getElementById(id);
function track(name, params) { try { gtag('event', name, params || {}); } catch (e) {} }

let qi = 0;
const scores = {};

function start() {
  qi = 0;
  Object.keys(scores).forEach(k => delete scores[k]);
  $('intro').style.display = 'none';
  $('result').style.display = 'none';
  $('quiz').style.display = '';
  track(QUIZ.gaName + '_start');
  renderQ();
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

function showResult() {
  let best = null, bestN = -1;
  QUIZ.order.forEach(k => { if ((scores[k] || 0) > bestN) { bestN = scores[k] || 0; best = k; } });
  const r = QUIZ.results[best];
  $('quiz').style.display = 'none';
  $('result').style.display = '';
  $('res-img').style.display = '';
  $('res-img').src = r.img || QUIZ.resultImg;
  $('res-tag').textContent = r.tag;
  $('res-name').textContent = r.name;
  $('res-text').innerHTML = r.text;
  $('res-vocab').innerHTML = '<b>🎃 Твои хэллоуин-слова</b>' + r.vocab.map(v => `<span>${v}</span>`).join('');
  track(QUIZ.gaName + '_result', { character: best });
}

document.addEventListener('DOMContentLoaded', () => {
  $('start-btn').addEventListener('click', start);
  $('again').addEventListener('click', start);
});
