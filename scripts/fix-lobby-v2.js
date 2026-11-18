const fs = require('fs');
const p = 'scripts/install-lobby-v2.js';
let s = fs.readFileSync(p, 'utf8');

const start = s.indexOf("once('      if (!state.isPlaying) return;");
const end = s.indexOf('const animateAnchor', start);

if (start < 0 || end < 0) {
  throw new Error('Bagian pemeriksaan kamera tidak ditemukan. File tidak diubah.');
}

const replacement = String.raw`
function replaceRegexOnce(regex, replacement, label) {
  const matches = [...html.matchAll(regex)];
  if (matches.length !== 1) {
    throw new Error(label + ': ditemukan ' + matches.length + ' pola.');
  }
  html = html.replace(regex, replacement);
}

replaceRegexOnce(
  /(canvas\.addEventListener\('touchstart', \(e\) => \{\s*)if\s*\(!state\.isPlaying\)\s*return;/,
  '$1if (!state.isPlaying && !state.isLobby) return;',
  'Touch look start'
);

replaceRegexOnce(
  /(canvas\.addEventListener\('touchmove', \(e\) => \{\s*)if\s*\(!state\.isPlaying\s*\|\|\s*!state\.touchLook\.active\)\s*return;/,
  '$1if ((!state.isPlaying && !state.isLobby) || !state.touchLook.active) return;',
  'Touch look move'
);

replaceRegexOnce(
  /(document\.addEventListener\('mousemove', \(e\) => \{\s*)if\s*\(!state\.isPlaying\s*\|\|\s*document\.pointerLockElement !== canvas\)\s*return;/,
  '$1if ((!state.isPlaying && !state.isLobby) || document.pointerLockElement !== canvas) return;',
  'Mouse look'
);

`;

s = s.slice(0, start) + replacement + s.slice(end);
fs.writeFileSync(p, s);
console.log('Pola kamera berhasil diperbaiki.');
