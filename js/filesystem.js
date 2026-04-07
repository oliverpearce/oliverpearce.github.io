/**
 * js/filesystem.js
 *
 * Virtual filesystem logic: path resolution, directory listing, and file reading.
 * All actual data lives in data/filesystem.js (FILESYSTEM global) and
 * data/files.js (FILES global) — this module just provides the query functions.
 *
 * Keeping path logic here (not scattered across command handlers) means:
 *   - One place to fix a path-resolution bug
 *   - Commands stay focused on output, not path arithmetic
 *   - Easy to unit-test in isolation if tests are ever added
 *
 * Public API:
 *   Filesystem.resolve(arg, cwd) → string
 *   Filesystem.isDir(path)       → boolean
 *   Filesystem.isFile(path)      → boolean
 *   Filesystem.listDir(path)     → string[] | null
 *   Filesystem.readFile(path)    → Array<[string, string, string?]> | null
 */

const Filesystem = (() => {

  /**
   * Resolve a path argument (from a user command) into a normalised absolute path.
   *
   * All paths in FILESYSTEM and FILES use ~ as the home root and never have
   * a trailing slash. This function ensures every lookup key is in that form.
   *
   * Resolution rules (evaluated in order):
   *   1. Empty string or '~'     → '~'  (home)
   *   2. Starts with '~/'        → strip trailing slash, return as-is (already absolute)
   *   3. '..' or '../'           → go up one level from cwd
   *   4. Everything else         → append to cwd as a relative path
   *
   * Examples:
   *   resolve('projects/',    '~')              → '~/projects'
   *   resolve('..',           '~/projects/llm') → '~/projects'
   *   resolve('~/resume.txt', '~/projects')     → '~/resume.txt'
   *   resolve('README.md',    '~/projects/llm') → '~/projects/llm/README.md'
   *
   * @param {string} arg - the path argument from a user command (may be relative)
   * @param {string} cwd - current working directory (always a normalised absolute path)
   * @returns {string}   - normalised absolute path, no trailing slash
   */
  function resolve(arg, cwd) {
    if (!arg || arg === '~') return '~';

    /* Already an absolute path from home — just clean the trailing slash */
    if (arg.startsWith('~/')) return arg.replace(/\/$/, '');

    /* Go up one level: split on '/', drop the last segment, rejoin */
    if (arg === '..' || arg === '../') {
      const parts = cwd.split('/');
      /*
        If cwd is '~' it has only one segment so splitting gives ['~'].
        Dropping the last element of a single-element array would give an
        empty string — we guard against that by returning '~' directly.
      */
      return parts.length > 1 ? parts.slice(0, -1).join('/') : '~';
    }

    /* Relative path: append to cwd, then strip any trailing slash */
    const base = cwd;
    return (base + '/' + arg).replace(/\/$/, '');
  }

  /**
   * Return true if path is a known directory in FILESYSTEM.
   *
   * Uses hasOwnProperty rather than `path in FILESYSTEM` because `in` also
   * checks the prototype chain — a key like "constructor" would match
   * Object.prototype.constructor otherwise.
   *
   * @param {string} path - normalised absolute path (no trailing slash)
   * @returns {boolean}
   */
  function isDir(path) {
    return Object.prototype.hasOwnProperty.call(FILESYSTEM, path);
  }

  /**
   * Return true if path is a known file in FILES.
   *
   * @param {string} path - normalised absolute path (no trailing slash)
   * @returns {boolean}
   */
  function isFile(path) {
    return Object.prototype.hasOwnProperty.call(FILES, path);
  }

  /**
   * Return the list of entries in a directory, or null if not found.
   * Each entry is a string: files have no trailing slash, directories do.
   *
   * @param {string} path - normalised absolute path
   * @returns {string[] | null}
   */
  function listDir(path) {
    return FILESYSTEM[path] || null;
  }

  /**
   * Return the content rows for a file, or null if not found.
   * Each row is a [colorClass, text] or [colorClass, text, url] tuple,
   * matching the format defined in data/files.js.
   *
   * @param {string} path - normalised absolute path
   * @returns {Array<[string, string, string?]> | null}
   */
  function readFile(path) {
    return FILES[path] || null;
  }

  /* ── Public API ─────────────────────────────────────────────────── */

  return { resolve, isDir, isFile, listDir, readFile };

})();
