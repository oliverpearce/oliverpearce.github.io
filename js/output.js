/**
 * js/output.js
 *
 * All DOM rendering for the terminal output area (#output).
 * Every other module calls functions from this module instead of touching
 * the DOM directly — keeping DOM manipulation in one place makes it easy
 * to change how output is rendered without hunting through other files.
 *
 * Public API (exposed via the returned object):
 *   Output.init()                        — must be called before anything else
 *   Output.addLine(colorClass, text, url?) — append a single styled line
 *   Output.addLines(tuples[])            — append multiple lines at once
 *   Output.addPromptEcho(cmd, cwd)       — append the "oliver@kali:~$ cmd" line
 *   Output.addHTML(html)                 — append a line of pre-built safe HTML
 *   Output.clear()                       — wipe all output
 *   Output.scroll()                      — scroll output to the bottom
 *   Output.esc(str)                      — HTML-escape a string (utility)
 *
 * The module is written as an IIFE (Immediately Invoked Function Expression)
 * returning a plain object. This keeps _outputEl and helper functions private
 * while exposing only what other modules need.
 */

const Output = (() => {

  /* ── Private state ──────────────────────────────────────────────── */

  /**
   * Cached reference to the #output DOM element.
   * Set by init() so we don't query the DOM on every single addLine() call.
   * @type {HTMLElement}
   */
  let _outputEl = null;


  /* ── Private helpers ────────────────────────────────────────────── */

  /**
   * Normalise a raw URL string into a full, openable href.
   *
   * We store display-friendly URLs in data/files.js (e.g. "github.com/oliverpearce"
   * rather than "https://github.com/oliverpearce") because they look cleaner in the
   * terminal. This function adds the https:// prefix when needed so the link works.
   *
   * Rules:
   *   - Already has a scheme (http:// or https://) → return as-is
   *   - Looks like an email address (contains @ but no leading www) → mailto:
   *   - Anything else → prepend https://
   *
   * @param {string} raw - the URL or bare domain from the data file
   * @returns {string}   - a fully qualified href
   */
  function _toHref(raw) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.includes('@') && !trimmed.startsWith('www')) return `mailto:${trimmed}`;
    return `https://${trimmed}`;
  }


  /* ── Public functions ───────────────────────────────────────────── */

  /**
   * Cache the #output element reference.
   * Must be called once before any other Output function.
   * Called by js/main.js after the shell section becomes visible.
   */
  function init() {
    _outputEl = document.getElementById('output');
  }

  /**
   * Scroll the output area to the bottom so the latest line is always visible.
   * Called after every command finishes producing output.
   */
  function scroll() {
    _outputEl.scrollTop = _outputEl.scrollHeight;
  }

  /**
   * Escape HTML special characters in a string.
   * Used before inserting user-supplied text into innerHTML to prevent
   * accidental HTML injection. All user input passes through this before
   * appearing in addPromptEcho() or addHTML().
   *
   * @param {string} str
   * @returns {string}
   */
  function esc(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Append a single styled line to the output area.
   *
   * @param {string}  colorClass - determines the CSS class (.line--{colorClass})
   *                               and therefore the text color; use 'blank' for
   *                               empty vertical space
   * @param {string}  text       - the content to display
   * @param {string}  [url]      - optional; if provided, wraps the line in an
   *                               <a> tag that opens the URL in a new tab
   *
   * When colorClass is 'link', the line always renders as an anchor.
   * If no url is provided for a 'link' line, _toHref() normalises the
   * text itself into a usable href (e.g. "github.com/..." → "https://github.com/...").
   */
  function addLine(colorClass, text, url) {
    const div = document.createElement('div');

    /* Blank lines are empty spacers — no text content needed */
    if (colorClass === 'blank') {
      div.className = 'line line--blank';
      _outputEl.appendChild(div);
      return;
    }

    /*
      'link' is a shorthand class that means "blue + clickable".
      It maps to .line--blue in terminal.css; the anchor element handles
      the underline and cursor via the .terminal-link rule.
    */
    div.className = `line line--${colorClass === 'link' ? 'blue' : colorClass}`;

    if (url || colorClass === 'link') {
      /* Render as a clickable anchor */
      const href = _toHref(url || text);
      const anchor = document.createElement('a');
      anchor.href       = href;
      anchor.target     = '_blank';             /* open in new tab */
      anchor.rel        = 'noopener noreferrer'; /* security: prevent the new tab from
                                                    accessing window.opener */
      anchor.className  = 'terminal-link';
      anchor.textContent = text;
      div.appendChild(anchor);
    } else {
      /* Plain text — use textContent (not innerHTML) to prevent injection */
      div.textContent = text;
    }

    _outputEl.appendChild(div);
  }

  /**
   * Append multiple lines from an array of tuples.
   * Accepts 2-element [colorClass, text] or 3-element [colorClass, text, url] tuples,
   * matching the format used throughout data/files.js and data/easter-eggs.js.
   *
   * @param {Array<[string, string, string?]>} lines
   */
  function addLines(lines) {
    lines.forEach(([cls, txt, url]) => addLine(cls, txt, url));
  }

  /**
   * Append the coloured prompt echo that appears above every command's output.
   * Renders: oliver@kali:~/path$ command
   *
   * Uses innerHTML (not textContent) so the prompt spans get their CSS classes,
   * but both cwd and cmd are passed through esc() first to prevent injection.
   *
   * @param {string} cmd - the raw command string the user submitted
   * @param {string} cwd - the current working directory at time of submission
   */
  function addPromptEcho(cmd, cwd) {
    const div = document.createElement('div');
    div.className = 'prompt-echo';
    div.innerHTML =
      `<span class="prompt__user">oliver</span>` +
      `<span class="prompt__at">@</span>` +
      `<span class="prompt__host">kali</span>` +
      `<span class="prompt__sep">:</span>` +
      `<span class="prompt__path">${esc(cwd)}</span>` +
      `<span class="prompt__dollar">$</span>` +
      `&nbsp;<span class="prompt-echo__cmd">${esc(cmd)}</span>`;
    _outputEl.appendChild(div);
  }

  /**
   * Append a line containing pre-built HTML.
   * Used by cmdLs() in js/commands.js to render directory entries with
   * per-entry colour coding using inline <span> elements.
   *
   * CAUTION: Only call this with HTML you have constructed yourself —
   * never pass unsanitised user input here.
   *
   * @param {string} html - safe HTML string
   */
  function addHTML(html) {
    const div = document.createElement('div');
    div.className = 'line line--default';
    div.innerHTML = html;
    _outputEl.appendChild(div);
  }

  /**
   * Remove all output lines from the terminal.
   * Called by the `clear` command in js/commands.js.
   */
  function clear() {
    _outputEl.innerHTML = '';
  }

  /* ── Public API ─────────────────────────────────────────────────── */

  return { init, scroll, esc, addLine, addLines, addPromptEcho, addHTML, clear };

})();
