const textarea = document.getElementById('note-content');
const preview = document.getElementById('preview');
const toggleBtn = document.getElementById('toggle-view');

export function openInEditor(content) {
  textarea.value = content;
  showPreview();
}

export function getContent() {
  return textarea.value;
}

export function showEditor() {
  textarea.hidden = false;
  preview.style.display = 'none';
  toggleBtn.textContent = 'Vista previa';
  textarea.focus();
}

export function showPreview() {
  textarea.hidden = true;
  preview.style.display = '';
  toggleBtn.textContent = 'Editar';
}

export function jumpToLine(targetText) {
  showEditor();
  if (!targetText) return;
  const lines = textarea.value.split('\n');
  const idx = lines.findIndex(l => l.trim() === targetText.trim());
  if (idx >= 0) {
    const pos = lines.slice(0, idx).reduce((s, l) => s + l.length + 1, 0);
    textarea.setSelectionRange(pos, pos);
  }
}
