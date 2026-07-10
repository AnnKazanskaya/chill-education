// Wraps app.jsx into a self-contained standalone HTML (React via CDN, Babel in-browser).
const fs = require('fs');
const path = require('path');
const dir = __dirname;

let code = fs.readFileSync(path.join(dir, 'app.jsx'), 'utf8');
code = code.replace(/^\s*import React[^\n]*\n/, '');            // React comes from UMD global
code = code.replace('export default function PlacementTest', 'function PlacementTest');

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Тест на уровень английского — Chat &amp; Chill</title>
<meta name="description" content="Бесплатный тест на уровень английского (A1–C1) от школы Chat & Chill. Результат сразу и бесплатный пробный урок.">
<style>
  html,body{margin:0;padding:0;background:#EEF0FB}
  #boot{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-family:-apple-system,BlinkMacSystemFont,'Manrope',sans-serif;background:#EEF0FB;z-index:9999}
  #boot img{height:60px;width:auto}
  #boot .b-dots{display:flex;gap:9px}
  #boot .b-dots span{width:12px;height:12px;border-radius:50%;background:#2440D9;animation:bb 1.1s ease-in-out infinite}
  #boot .b-dots span:nth-child(2){animation-delay:.15s;background:#FF7A1A}
  #boot .b-dots span:nth-child(3){animation-delay:.3s}
  #boot .b-t{font-size:14px;color:#5A5F7D;font-weight:600}
  @keyframes bb{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-9px);opacity:1}}
</style>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
</head>
<body>
<div id="boot">
  <img src="https://annkazanskaya.github.io/chill-education/img/logo.png" alt="Chat and Chill">
  <div class="b-dots"><span></span><span></span><span></span></div>
  <div class="b-t">Загружаем тест…</div>
</div>
<div id="root"></div>
<script type="text/babel" data-presets="react">
const { useState, useEffect, useRef, useMemo } = React;

${code}

const boot = document.getElementById('boot');
if (boot) boot.remove();
ReactDOM.createRoot(document.getElementById('root')).render(<PlacementTest/>);
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log('Built index.html:', (html.length/1024).toFixed(1) + ' KB');
