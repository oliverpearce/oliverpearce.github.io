/**
 * js/filesystem.js
 *
 * Path resolution and queries against the FILESYSTEM and FILES globals.
 *
 * All the path arithmetic (joining paths, going up a level with .., etc.)
 * is centralised here so command handlers in commands.js never have to do
 * string manipulation themselves. This follows the "separation of concerns"
 * principle — each file has one job.
 *
 * The FILESYSTEM and FILES variables are not defined here — they come from
 * data/filesystem.js and data/files.js, which load before this file
 * (see the script load order at the bottom of index.html).
 */

const Filesystem = (() => {

  /*
    resolve() converts a path argument from a user command into the normalised
    absolute path format used as keys in FILESYSTEM and FILES.

    All keys in those objects start with ~ and never have a trailing slash.
    For example: '~', '~/projects', '~/projects/llm-ctf/README.md'

    The function handles four cases:
      1. Empty string or '~' → always means home
      2. Starts with '~/'   → already absolute, just clean the trailing slash
      3. '..' or '../'      → go up one directory level
      4. Anything else      → treat as a relative path and join with cwd

    Examples of what resolve() does:
      resolve('projects/',    '~')                  → '~/projects'
      resolve('..',           '~/projects/llm-ctf') → '~/projects'
      resolve('~/resume.txt', '~/projects')         → '~/resume.txt'
      resolve('README.md',    '~/projects/llm-ctf') → '~/projects/llm-ctf/README.md'
  */
  function resolve(arg, cwd) {
    if (!arg || arg === '~') return '~';

    if (arg.startsWith('~/')) return arg.replace(/\/$/, '');

    if (arg === '..' || arg === '../') {
      /*
        split('/') breaks the path into an array of segments.
        For '~/projects/llm-ctf', that gives ['~', 'projects', 'llm-ctf'].
        slice(0, -1) removes the last element: ['~', 'projects'].
        join('/') reassembles it: '~/projects'.
        If we're already at '~', splitting gives ['~'] (length 1), and
        removing the last element would give an empty array — so we return '~'.
      */
      const parts = cwd.split('/');
      return parts.length > 1 ? parts.slice(0, -1).join('/') : '~';
    }

    /* Relative path: join cwd + '/' + arg, then strip any trailing slash */
    return (cwd + '/' + arg).replace(/\/$/, '');
  }

  /*
    We use Object.prototype.hasOwnProperty.call() instead of the simpler
    (path in FILESYSTEM) because the `in` operator also checks the object's
    prototype chain. This means a path like "constructor" or "toString" would
    incorrectly return true. hasOwnProperty only checks the object's own keys.
  */
  function isDir(path) {
    return Object.prototype.hasOwnProperty.call(FILESYSTEM, path);
  }

  function isFile(path) {
    return Object.prototype.hasOwnProperty.call(FILES, path);
  }

  /*
    Returns the array of entries for a directory, or null if not found.
    The || null means "return null instead of undefined" if the key doesn't
    exist — null is a more explicit signal of "not found" than undefined.
  */
  function listDir(path) {
    return FILESYSTEM[path] || null;
  }

  function readFile(path) {
    return FILES[path] || null;
  }

  return { resolve, isDir, isFile, listDir, readFile };

})();
