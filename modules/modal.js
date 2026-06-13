const overlay = document.getElementById('modal-overlay');
const msgEl   = document.getElementById('modal-message');
const inputEl = document.getElementById('modal-input');
const btn1El  = document.getElementById('modal-btn1');
const btn2El  = document.getElementById('modal-btn2');
const cancelEl= document.getElementById('modal-cancel');

let _resolve = null;

function _open(msg, { input = false, placeholder = '', btn1 = 'Aceptar', btn2 = null, cancel = true } = {}) {
  msgEl.textContent  = msg;
  inputEl.hidden     = !input;
  inputEl.placeholder = placeholder;
  inputEl.value      = '';
  btn1El.textContent = btn1;
  btn2El.textContent = btn2 || '';
  btn2El.hidden      = !btn2;
  cancelEl.hidden    = !cancel;
  overlay.hidden     = false;
  if (input) setTimeout(() => inputEl.focus(), 0);
  else btn1El.focus();
  return new Promise(r => { _resolve = r; });
}

function _close(val) {
  overlay.hidden = true;
  if (_resolve) { _resolve(val); _resolve = null; }
}

btn1El.onclick  = () => _close(inputEl.hidden ? 'ok' : inputEl.value);
btn2El.onclick  = () => _close('btn2');
cancelEl.onclick= () => _close(null);
overlay.onclick = (e) => { if (e.target === overlay) _close(null); };

document.addEventListener('keydown', (e) => {
  if (overlay.hidden) return;
  if (e.key === 'Escape') _close(null);
  if (e.key === 'Enter') {
    if (!inputEl.hidden) { e.preventDefault(); _close(inputEl.value); }
    else if (e.target !== btn2El && e.target !== cancelEl) _close('ok');
  }
});

export const showAlert = (msg) =>
  _open(msg, { cancel: false });

export const showConfirm = async (msg) =>
  (await _open(msg, { btn1: 'Aceptar', cancel: true })) === 'ok';

export const showPrompt = async (msg, placeholder = '') => {
  const r = await _open(msg, { input: true, placeholder, cancel: true });
  return r === null ? null : r;
};
