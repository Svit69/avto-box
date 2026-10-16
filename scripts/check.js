import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

async function validateDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', '.capture'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { await validateDirectory(path); continue; }
    if (!/\.(js|json|html|css|md)$/.test(path) || /initial\./.test(path)) continue;
    const content = await readFile(path, 'utf8');
    if (content.includes('\uFFFD')) throw new Error(`Повреждённый Unicode: ${path}`);
    if (!path.endsWith('package-lock.json') && content.trimEnd().split(/\r?\n/).length > 50) {
      throw new Error(`Больше 50 строк: ${path}`);
    }
    if (path.endsWith('.js')) execFileSync(process.execPath, ['--check', path]);
  }
}
await validateDirectory('.');
console.log('Синтаксис, UTF-8 и ограничение 50 строк: OK');
