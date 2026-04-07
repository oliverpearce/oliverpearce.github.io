/**
 * js/input.js
 *
 * Handles all user input: keyboard events on the text field, command history
 * navigation with arrow keys, Tab autocomplete, and quick-bar button clicks.
 *
 * Deliberately stateless with respect to the terminal's cwd and command
 * output — it only knows how to capture input and call the onSubmit callback.
 * All command logic lives in js/commands.js.
 *
 * Public API:
 *   Input.init(onSubmit) — wire up all event listeners; call once after DOM is ready
 *   Input.focus()        — focus the text input field
 *
 * To add a command to Tab autocomplete:
 *   Add it to the AUTOCOMPLETE_COMMANDS array below.
 */

const Input = (() => {

  /* ── Private state ──────────────────────────────────────────────── */

  /**
   * Command history — most recent command first.
   * Commands are prepended (unshift) rather than appended so that
   * ArrowUp always retrieves the most recent command at index 0.
   * @type {string[]}
   */
  const _history = [];

  /**
   * Current position in the history array while the user is navigating.
   * -1 means the user is at the "live" position (not browsing history).
   * @type {number}
   */
  let _histIdx = -1;

  /** @type {HTMLInputElement} */
  let _inputEl = null;

  /** @type {function(string): void} */
  let _onSubmit = null;

  /* ── Autocomplete candidates ────────────────────────────────────── */

  /**
   * Known commands and paths for Tab completion.
   * Matched by prefix: if the current input is a prefix of exactly one
   * entry, the input is replaced with the full entry. If multiple entries
   * match, they are printed to the output (not yet implemented — see _autocomplete).
   *
   * Keep this in sync with the COMMANDS map in js/commands.js and the
   * quick-bar buttons in index.html.
   */
  const AUTOCOMPLETE_COMMANDS = [
    'help',
    'whoami',
    'ls',
    'ls projects/',
    'cd',
    'cd projects/',
    'cat',
    'cat resume.txt',
    'cat skills.txt',
    'cat contact.txt',
    'cat projects/llm-ctf/README.md',
    'cat projects/scmac-ios/README.md',
    'cat projects/study-buddy/README.md',
    'cat projects/acm-ai-lab/README.md',
    'cat projects/silvered-bot/README.md',
    'uname -a',
    'date',
    'clear',
    /* Easter eggs are intentionally excluded — they're meant to be discovered */
  ];


  /* ── Private functions ──────────────────────────────────────────── */

  /**
   * Submit a command: add it to history, reset the history cursor,
   * and call the onSubmit callback with the raw (untrimmed) string.
   *
   * We only add non-empty, non-whitespace commands to history — submitting
   * an empty Enter press shouldn't push a blank entry.
   *
   * @param {string} cmd - the raw string from the input field
   */
  function _submit(cmd) {
    const trimmed = cmd.trim();
    if (trimmed) {
      _history.unshift(trimmed); /* prepend so index 0 is always most recent */
      _histIdx = -1;             /* reset cursor to "live" position */
    }
    _onSubmit(cmd);
  }

  /**
   * Handle all relevant keyboard events on the input field.
   *
   * Arrow keys navigate command history. preventDefault() on ArrowUp/Down
   * stops the browser from moving the text cursor to the start/end of the field.
   *
   * Tab triggers prefix autocomplete. preventDefault() stops the browser from
   * moving focus to the next focusable element (standard Tab behaviour).
   *
   * @param {KeyboardEvent} e
   */
  function _onKeydown(e) {
    switch (e.key) {

      case 'Enter': {
        const val = _inputEl.value;
        _inputEl.value = '';
        _submit(val);
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        /*
          Walk back through history (higher index = older command).
          Stop at the oldest entry (length - 1) to avoid going out of bounds.
        */
        if (_histIdx < _history.length - 1) {
          _histIdx++;
          _inputEl.value = _history[_histIdx];
          /*
            setTimeout 0 defers the selection change until after the browser
            has finished processing the keydown event. Without this, some
            browsers reset the cursor position after we set it.
          */
          setTimeout(() => _inputEl.setSelectionRange(
            _inputEl.value.length,
            _inputEl.value.length
          ), 0);
        }
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        if (_histIdx > 0) {
          /* Walk forward through history */
          _histIdx--;
          _inputEl.value = _history[_histIdx];
        } else {
          /* Reached the "live" position — clear the field */
          _histIdx       = -1;
          _inputEl.value = '';
        }
        break;
      }

      case 'Tab': {
        e.preventDefault();
        _autocomplete();
        break;
      }
    }
  }

  /**
   * Attempt to autocomplete the current input using AUTOCOMPLETE_COMMANDS.
   *
   * Single match  → replace the input with the full command.
   * Multiple matches → (future enhancement) could print the options to output.
   * No match      → do nothing.
   *
   * Matching is case-sensitive and prefix-based (startsWith), mirroring how
   * bash Tab completion works.
   */
  function _autocomplete() {
    const val = _inputEl.value;
    if (!val) return; /* nothing to complete */

    const matches = AUTOCOMPLETE_COMMANDS.filter(
      candidate => candidate.startsWith(val) && candidate !== val
    );

    if (matches.length === 1) {
      /* Unambiguous match — complete it */
      _inputEl.value = matches[0];
    }
    /*
      If matches.length > 1, we could show options — left as a future enhancement.
      If matches.length === 0, we do nothing (standard shell behaviour).
    */
  }


  /* ── Public functions ───────────────────────────────────────────── */

  /**
   * Wire up all event listeners. Must be called once after the shell section
   * becomes visible (because the #cmd-input and .quickbar__btn elements must
   * exist in the DOM before we can query them).
   *
   * @param {function(string): void} onSubmit - called with the raw command string
   *                                            whenever the user submits a command
   */
  function init(onSubmit) {
    _onSubmit = onSubmit;
    _inputEl  = document.getElementById('cmd-input');

    /* Main keyboard handler */
    _inputEl.addEventListener('keydown', _onKeydown);

    /*
      Quick-bar buttons: clicking a button fires the command stored in its
      data-cmd attribute, exactly as if the user had typed it and pressed Enter.
      querySelectorAll returns a static NodeList; forEach is available on it
      in all modern browsers without conversion.
    */
    document.querySelectorAll('.quickbar__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        if (cmd) _submit(cmd);
      });
    });

    /*
      Click anywhere inside the terminal to re-focus the input field.
      Without this, clicking on output text or the quick bar would pull focus
      away from the input and the user would have to click the field manually.

      The terminal element is used (not document) to avoid stealing focus from
      links — clicks on .terminal-link anchors bubble up to terminal but the
      link's default action (opening the URL) still fires first.
    */
    document.getElementById('terminal').addEventListener('click', () => {
      _inputEl.focus();
    });
  }

  /**
   * Programmatically focus the input field.
   * Called by js/main.js immediately after the shell becomes visible
   * so the user can start typing without clicking first.
   */
  function focus() {
    _inputEl.focus();
  }

  /* ── Public API ─────────────────────────────────────────────────── */

  return { init, focus };

})();
