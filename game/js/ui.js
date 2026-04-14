// =============================================
//  ANDRIOTTI — ui.js
//  Modal, Toast e helpers de UI
// =============================================

// ── TOAST ──
const Toast = (() => {
  let timer = null;
  function show(msg, type = 'default', duration = 3000) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast' + (type !== 'default' ? ' ' + type : '');
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { el.classList.add('hidden'); }, duration);
  }
  return { show };
})();

// ── MODAL ──
const Modal = (() => {
  function open(title, bodyHtml, opts = {}) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML    = bodyHtml;
    document.getElementById('modal-bg').classList.remove('hidden');
    const box = document.getElementById('modal-box');
    box.style.maxWidth = opts.wide ? '720px' : '560px';
    if (opts.onOpen) opts.onOpen();
  }
  function close() {
    document.getElementById('modal-bg').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
  }
  function closeOnBg(e) {
    if (e.target === document.getElementById('modal-bg')) close();
  }
  return { open, close, closeOnBg };
})();

// ── FORMS ──
function colorPickerHtml(selected) {
  const colors = DB.getColors();
  return `
    <div class="color-picker" id="color-picker">
      ${colors.map(c => `
        <div class="color-swatch ${c === selected ? 'selected' : ''}"
          style="background:${c}"
          data-color="${c}"
          onclick="selectColor('${c}')">
        </div>`).join('')}
    </div>
    <input type="hidden" id="selected-color" value="${selected || colors[0]}" />
  `;
}

function selectColor(c) {
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('selected', s.dataset.color === c);
  });
  const inp = document.getElementById('selected-color');
  if (inp) inp.value = c;
}

// ── BADGES ──
function horarioBadge(h) {
  if (!h) return '<span class="badge badge-gray">—</span>';
  return `<span class="badge badge-blue">${h}</span>`;
}
function margemBadge(m) {
  if (!m) return '—';
  return `<span class="badge badge-green">${m}</span>`;
}

// ── FORMAT ──
function fmtDate(str) {
  if (!str) return '—';
  return str.replace(/\//g,'-').slice(0,10);
}
function initials(nome) {
  if (!nome) return '?';
  const parts = nome.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

// ── CONFIRM ──
function confirmDelete(msg, onConfirm) {
  const html = `
    <p style="color:var(--text2);font-size:0.9rem;margin-bottom:1.5rem">${msg}</p>
    <div class="form-actions">
      <button class="btn-secondary" onclick="Modal.close()">Cancelar</button>
      <button class="btn-danger" onclick="(${onConfirm.toString()})();Modal.close();">Sim, excluir</button>
    </div>`;
  Modal.open('Confirmar exclusão', html);
}

// ── SEARCH HIGHLIGHT ──
function highlight(text, term) {
  if (!term || !text) return text || '';
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return String(text).replace(re, '<mark style="background:#FEF08A;border-radius:2px;padding:0 2px">$1</mark>');
}

// ── AVATAR DIV ──
function avatarDiv(nome, cor, size = 44) {
  return `<div class="team-avatar" style="background:${cor};width:${size}px;height:${size}px;font-size:${size*0.35}px">${initials(nome)}</div>`;
}