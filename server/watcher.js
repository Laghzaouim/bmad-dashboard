import chokidar from 'chokidar';

// Watch only the specific sprint-status.yaml files we already found.
// This avoids scanning massive build directories (Rust target/, node_modules, etc.)
// and prevents EMFILE errors on large codebases.
export function createWatcher(filePaths, onChange) {
  if (!filePaths || filePaths.length === 0) return null;

  const watcher = chokidar.watch(filePaths, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 400, pollInterval: 100 },
  });

  watcher.on('change', p => { console.log(`[watcher] changed: ${p}`); onChange(p); });
  watcher.on('add', p => { console.log(`[watcher] added: ${p}`); onChange(p); });
  watcher.on('error', err => console.error('[watcher] error:', err.message));

  return watcher;
}
