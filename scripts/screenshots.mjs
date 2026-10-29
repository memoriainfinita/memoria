// Capturas para docs/guide, con `python -m http.server 4186` en la raíz del repositorio.
// Chrome (la app usa la File System Access API, que Firefox no tiene), en español y sin sonido.
// Se lanza a mano al cambiar la interfaz: `node scripts/screenshots.mjs`.
// Necesita Playwright (no es dependencia del proyecto): PLAYWRIGHT apunta a su index.mjs.
// El selector de carpetas no se puede manejar desde fuera: se sustituye `showDirectoryPicker` por una
// carpeta de ejemplo escrita en el sistema de archivos privado de la página (OPFS).

const { chromium } = await import(process.env.PLAYWRIGHT ?? '@playwright/test');

const url = process.env.URL ?? 'http://127.0.0.1:4186/';
const out = 'docs/guide/img/';
const browser = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'es-ES' })).newPage();

await page.addInitScript(() => {
  const notes = {
    'Bienvenida.md': '---\ntags: [inicio]\n---\n# Bienvenida\n\nEsta es una carpeta de notas. Cada archivo es un `.md` de verdad, en tu disco.\n\n- Enlaza otras notas con [[Ideas]]\n- Mira los **backlinks** al pie de cada nota\n\n| Atajo | Acción |\n|---|---|\n| Ctrl+S | Guardar |\n| Ctrl+E | Editar o ver |\n\n```js\nconsole.log("hola");\n```\n',
    'Ideas.md': '# Ideas\n\nUna lista de ideas que enlaza de vuelta a [[Bienvenida]].\n\n1. Probar la búsqueda\n2. Cambiar el tema en Ajustes\n',
    'diario/2026-10-28.md': '# Martes\n\nHoy: ensayo a las 18:00. Ver [[Ideas]].\n',
    'notas.txt': 'Texto plano, sin procesar.\n',
  };
  window.showDirectoryPicker = async () => {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle('ejemplo', { create: true });
    for (const [path, text] of Object.entries(notes)) {
      const parts = path.split('/');
      let d = dir;
      for (const p of parts.slice(0, -1)) d = await d.getDirectoryHandle(p, { create: true });
      const f = await d.getFileHandle(parts.at(-1), { create: true });
      const w = await f.createWritable();
      await w.write(text);
      await w.close();
    }
    return dir;
  };
});

await page.goto(url);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}inicio.png` });

await page.getByRole('button', { name: 'Abrir carpeta' }).click();
await page.waitForTimeout(1500);
await page.getByText('Bienvenida', { exact: true }).first().click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${out}carpeta.png` });

await page.getByRole('button', { name: 'Editar' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}editor.png` });

await page.getByRole('textbox', { name: /Buscar/ }).fill('ensayo');
await page.waitForTimeout(1000);
await page.screenshot({ path: `${out}busqueda.png` });
await page.getByRole('textbox', { name: /Buscar/ }).fill('');

await page.getByRole('button', { name: 'Ajustes' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}ajustes.png` });

await browser.close();
