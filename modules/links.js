export function renderLinks(md, allNames, container, onLinkClick, onDblClick) {
  const processed = md.replace(/\[\[(.+?)\]\]/g, (_, name) => {
    const exists = allNames.includes(name);
    const cls = exists ? 'wiki-link' : 'wiki-link broken';
    // Los corchetes los dibuja el CSS (::before/::after). No van en el texto:
    // si van en ambos sitios se pintan duplicados.
    return `<a href="#" class="${cls}" data-note="${name}">${name}</a>`;
  });
  const noFront = processed.replace(/^---\n[\s\S]*?\n---\n?/, '');
  container.innerHTML = marked.parse(noFront);
  container.querySelectorAll('a.wiki-link:not(.broken)').forEach(a => {
    a.onclick = (e) => { e.preventDefault(); onLinkClick(a.dataset.note); };
  });
  container.ondblclick = (e) => {
    // innerText no incluye los pseudo-elementos, así que en un wiki-link hay que
    // reconstruir la sintaxis para buscar la línea original en el editor
    const link = e.target.closest && e.target.closest('a.wiki-link');
    const text = link
      ? `[[${link.dataset.note}]]`
      : (e.target.innerText || e.target.textContent || '').trim();
    onDblClick(text);
  };
}

export function findBacklinks(name, index) {
  const re = new RegExp('\\[\\[' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\]\\]');
  return index.filter(e => e.name !== name && re.test(e.content)).map(e => e.name);
}

export function renderBacklinks(refs, container, onLinkClick) {
  if (!refs.length) { container.innerHTML = ''; return; }
  container.innerHTML = 'Referencias entrantes: ' + refs.map(n =>
    `<a data-note="${n}">[[${n}]]</a>`
  ).join(' ');
  container.querySelectorAll('a').forEach(a => {
    a.onclick = () => onLinkClick(a.dataset.note);
  });
}
