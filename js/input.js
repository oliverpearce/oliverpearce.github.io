/**
 * js/input.js
 *
 * Handles all user input: keyboard events, command history (arrow keys),
 * Tab autocomplete, and quick-bar button clicks.
 *
 * This module is intentionally kept simple — it just captures input and
 * calls the onSubmit callback. It doesn't know what cwd is or what any
 * command does. That logic lives in commands.js. Keeping responsibilities
 * separate like this is called "separation of concerns."
 */

const Input = (() => {

  /*
    Command history is stored as an array, most-recent-first (newest at index 0).
    We use unshift() to prepend new commands instead of push() so that index 0
    always gives the last command typed — which is what ArrowUp should show first.

    _histIdx tracks which history entry we're currently viewing while the user
    is navigating. -1 means they're at the "live" input (not browsing history).
  */
  const _history = [];
  let   _histIdx  = -1;

  let _inputEl  = null;
  let _onSubmit = null;

  /*
    The autocomplete candidates are all the commands we know about.
    Tab completion does prefix matching: if what you've typed so far is a
    prefix of exactly one item in this list, it completes to that item.

    This list should stay in sync with the COMMANDS map in commands.js
    so users can Tab-complete every available command.
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
  ];

  /*
    _submit() is called whenever a command should be executed — either from
    Enter being pressed or a button being clicked. It adds the command to
    history (if non-empty), resets the history cursor back to -1 (so the
    next ArrowUp starts from the most recent command), then calls onSubmit.
  */
  function _submit(cmd) {
    const trimmed = cmd.trim();
    if (trimmed) {
      _history.unshift(trimmed);
      _histIdx = -1;
    }
    _onSubmit(cmd);
  }

  function _onKeydown(e) {
    switch (e.key) {

      case 'Enter': {
        const val = _inputEl.value;
        _inputEl.value = '';
        _submit(val);
        break;
      }

      case 'ArrowUp': {
        /*
          preventDefault() stops the browser's default ArrowUp behaviour,
          which is to move the text cursor to the beginning of the input.
          We want ArrowUp to navigate history instead.
        */
        e.preventDefault();
        if (_histIdx < _history.length - 1) {
          _histIdx++;
          _inputEl.value = _history[_histIdx];
          /*
            setTimeout with delay 0 defers this code until the current
            event has finished processing. Without it, some browsers reset
            the cursor position after we set it, because the keydown event
            handler runs before the browser moves the cursor.
            Wrapping in setTimeout(fn, 0) schedules it for the next "tick".
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
        /*
          preventDefault() stops the browser's default Tab behaviour,
          which is to move keyboard focus to the next focusable element.
          We want Tab to autocomplete instead.
        */
        e.preventDefault();
        _autocomplete();
        break;
      }
    }
  }

  function _autocomplete() {
    const val = _inputEl.value;
    if (!val) return;

    /*
      filter() returns a new array containing only items where the callback
      returns true. startsWith() checks if a string begins with another string.
      We exclude the exact match (c !== val) so Tab on a complete command
      doesn't do anything — only partial matches get completed.
    */
    const matches = AUTOCOMPLETE_COMMANDS.filter(
      c => c.startsWith(val) && c !== val
    );

    if (matches.length === 1) {
      /* Only one match — complete it */
      _inputEl.value = matches[0];
    }
    /* Multiple matches: we could print options to the output in the future.
       For now, we do nothing, which is what bash does when there's ambiguity. */
  }

  /*
    init() wires up all the event listeners. It's called by main.js after
    the shell section is revealed — we need the DOM elements to exist first.
  */
  function init(onSubmit) {
    _onSubmit = onSubmit;
    _inputEl  = document.getElementById('cmd-input');

    _inputEl.addEventListener('keydown', _onKeydown);

    /*
      querySelectorAll() returns a NodeList of all matching elements.
      We loop over it with forEach to attach a click listener to each button.
      Each button stores its command in a data-cmd HTML attribute,
      which JavaScript reads as btn.dataset.cmd.
    */
    document.querySelectorAll('.quickbar__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        if (cmd) _submit(cmd);
      });
    });

    /*
      Clicking anywhere inside #terminal re-focuses the input field.
      We attach this to #terminal (not to document) so that clicking on
      .terminal-link anchor tags doesn't get caught here — the link's
      default action (opening the URL) should still happen normally.
      Event bubbling means a click anywhere inside #terminal will
      trigger this listener.
    */
    document.getElementById('terminal').addEventListener('click', () => {
      _inputEl.focus();
    });
  }

  function focus() {
    _inputEl.focus();
  }

  return { init, focus };

})();
