export function searchFull(q, index) {
  const lq = q.toLowerCase();
  return index.filter(e =>
    e.name.toLowerCase().includes(lq) || e.content.toLowerCase().includes(lq)
  );
}

export function renderResults(results, container, onResultClick) {
  container.innerHTML = '';
  if (!results.length) {
    const li = document.createElement('li');
    li.style.cssText = 'padding:.3em .4em;font-size:.8em;color:var(--text-dim)';
    li.textContent = 'Sin resultados';
    const ul = document.createElement('ul');
    ul.appendChild(li);
    container.appendChild(ul);
    return;
  }
  const ul = document.createElement('ul');
  results.forEach(({ name }) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'file-item';
    span.textContent = name;
    span.dataset.filename = name + '.md';
    span.onclick = () => onResultClick(name);
    li.appendChild(span);
    ul.appendChild(li);
  });
  container.appendChild(ul);
}
