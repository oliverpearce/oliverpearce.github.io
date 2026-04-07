/**
 * js/output.js
 *
 * This module is the only place that writes to the #output DOM element.
 * Every other module calls functions from here instead of touching the DOM
 * directly — this is called "encapsulation", a pattern where you hide the
 * implementation details and expose only a clean interface.
 *
 * The benefit: if we ever want to change how output is rendered (e.g. add
 * a per-line animation), we only change it in this one file, not everywhere.
 *
 * This module is written as an IIFE (Immediately Invoked Function Expression)
 * — a function that calls itself immediately. The pattern looks like:
 *   const Module = (() => { ... return { publicThings }; })();
 *
 * The reason for this pattern is scope isolation. Variables defined inside
 * the IIFE (like _outputEl) are private — nothing outside can access them
 * directly. Only the object returned at the end is publicly accessible.
 * This prevents other files from accidentally overwriting internal state.
 */

const Output = (() => {

  /*
    This variable stores a reference to the #output DOM element.
    It's prefixed with _ by convention to signal "this is private, don't
    touch it from outside this module". The init() function sets it once
    after the element becomes available in the DOM.
  */
  let _outputEl = null;

  /*
    init() must be called before any other Output function.
    We can't just do document.getElementById('output') at the top of this file
    because this script loads before the shell section is visible, and some
    browsers won't find elements inside a `hidden` parent. So we wait until
    main.js calls init() after removing the `hidden` attribute.
  */
  function init() {
    _outputEl = document.getElementById('output');
  }

  /* Scrolls the output area to the bottom — called after every command */
  function scroll() {
    _outputEl.scrollTop = _outputEl.scrollHeight;
  }

  /*
    HTML escaping: when we insert user-typed text into innerHTML, we need to
    convert special HTML characters (&, <, >) into their "entity" equivalents
    (&amp;, &lt;, &gt;). This is called "sanitisation" — it prevents a user
    typing something like "<script>alert('xss')</script>" from actually running
    as code. Always escape user input before putting it in innerHTML.
  */
  function esc(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /*
    Links in data/files.js are stored as bare domains like "github.com/oliverpearce"
    because they look cleaner in the terminal output. But for an <a> tag to work,
    the href needs a full URL. This function adds the missing scheme (https://)
    or mailto: prefix as needed.
  */
  function _toHref(raw) {
    const s = raw.trim();
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    /* An @ sign without a leading www means it's an email address */
    if (s.includes('@') && !s.startsWith('www')) return `mailto:${s}`;
    return `https://${s}`;
  }

  /*
    The main function for adding content to the terminal output.

    @param colorClass  — determines the CSS class applied: .line--{colorClass}
                         'blank' creates an empty spacer with no text
                         'link' is shorthand for blue text that's always clickable
    @param text        — the string content to display
    @param url         — optional; if given, wraps the line in a clickable <a> tag

    We use createElement + textContent (not innerHTML + a string) for plain text
    lines because textContent automatically handles any special characters safely.
    innerHTML is only used when we intentionally need HTML markup (links).
  */
  function addLine(colorClass, text, url) {
    const div = document.createElement('div');

    if (colorClass === 'blank') {
      div.className = 'line line--blank';
      _outputEl.appendChild(div);
      return;
    }

    /* 'link' maps to the blue colour class in terminal.css */
    div.className = `line line--${colorClass === 'link' ? 'blue' : colorClass}`;

    if (url || colorClass === 'link') {
      /*
        rel="noopener noreferrer" is a security measure for links that open in
        a new tab. Without it, the new tab can access window.opener and potentially
        redirect the original page. This is a standard best practice for target="_blank".
      */
      const a = document.createElement('a');
      a.href        = _toHref(url || text);
      a.target      = '_blank';
      a.rel         = 'noopener noreferrer';
      a.className   = 'terminal-link';
      a.textContent = text;
      div.appendChild(a);
    } else {
      div.textContent = text;
    }

    _outputEl.appendChild(div);
  }

  /*
    Convenience wrapper that accepts the same tuple format used in data/files.js.
    Array destructuring ([cls, txt, url]) unpacks each inner array into named
    variables, making it much more readable than lines[0], lines[1], lines[2].
  */
  function addLines(lines) {
    lines.forEach(([cls, txt, url]) => addLine(cls, txt, url));
  }

  /*
    Prints the "root@oliver:~# command" line that appears above each command's output.
    We use innerHTML here (not textContent) because we need actual HTML elements
    with CSS classes for the colour-coded prompt segments.
    User input (cmd and cwd) is passed through esc() first to prevent injection.
  */
  function addPromptEcho(cmd, cwd) {
    const div = document.createElement('div');
    div.className = 'prompt-echo';
    div.innerHTML =
      `<span class="prompt__user">root</span>` +
      `<span class="prompt__at">@</span>` +
      `<span class="prompt__host">oliver</span>` +
      `<span class="prompt__sep">:</span>` +
      `<span class="prompt__path">${esc(cwd)}</span>` +
      `<span class="prompt__dollar">#</span>` +
      `&nbsp;<span class="prompt-echo__cmd">${esc(cmd)}</span>`;
    _outputEl.appendChild(div);
  }

  /*
    For cases where we need to inject pre-built HTML — specifically:
      - cmdLs() uses it to render directory entries with per-entry colour spans
      - cmdHelp() uses it to render the clickable command bubble buttons
    The caller is responsible for making sure the HTML is safe (no user input).
  */
  function addHTML(html) {
    const div = document.createElement('div');
    div.className = 'line line--default';
    div.innerHTML = html;
    _outputEl.appendChild(div);
  }

  /* Wipes all output — used by the `clear` command */
  function clear() {
    _outputEl.innerHTML = '';
  }

  /*
    The return statement is what makes these functions "public".
    Only the functions listed here are accessible from outside this module.
    _outputEl and _toHref are not returned, so they stay private.
  */
  return { init, scroll, esc, addLine, addLines, addPromptEcho, addHTML, clear };

})();
