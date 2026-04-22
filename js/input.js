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
  let _getCwd   = null; /* Callback to get current working directory */

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
    'ls /',
    'ls ~',
    'ls projects/',
    'ls projects/llm-ctf/',
    'ls projects/llm-ctf/benchmark/',
    'ls projects/llm-ctf/walkthroughs/',
    'ls projects/scmac-ios/',
    'ls projects/study-buddy/',
    'ls projects/acm-ai-lab/',
    'ls projects/silvered-bot/',
    'cd',
    'cd ~',
    'cd /',
    'cd projects/',
    'cd projects/llm-ctf/',
    'cd projects/llm-ctf/benchmark/',
    'cd projects/llm-ctf/walkthroughs/',
    'cd projects/scmac-ios/',
    'cd projects/study-buddy/',
    'cd projects/acm-ai-lab/',
    'cd projects/silvered-bot/',
    'cat',
    'cat resume.txt',
    'cat skills.txt',
    'cat contact.txt',
    'cat projects/llm-ctf/README.md',
    'cat projects/llm-ctf/benchmark/challenges.json',
    'cat projects/llm-ctf/benchmark/scoring.py',
    'cat projects/llm-ctf/walkthroughs/chall-01.md',
    'cat projects/llm-ctf/walkthroughs/chall-02.md',
    'cat projects/scmac-ios/README.md',
    'cat projects/scmac-ios/AppStore.url',
    'cat projects/study-buddy/README.md',
    'cat projects/study-buddy/devpost.url',
    'cat projects/acm-ai-lab/README.md',
    'cat projects/acm-ai-lab/research-manuscript.url',
    'cat projects/silvered-bot/README.md',
    'cat projects/silvered-bot/source.url',
    'file',
    'file resume.txt',
    'file skills.txt',
    'file contact.txt',
    'file projects/llm-ctf/README.md',
    'file projects/scmac-ios/AppStore.url',
    'file projects/study-buddy/devpost.url',
    'file projects/acm-ai-lab/research-manuscript.url',
    'file projects/silvered-bot/source.url',
    'find -name',
    'find -name "resume.txt"',
    'find -name "skills.txt"',
    'find -name "contact.txt"',
    'find -name "README.md"',
    'find -name "AppStore.url"',
    'find -name "devpost.url"',
    'echo',
    'echo hello',
    'echo hello world',
    'cowsay',
    'cowsay Oliver is cool',
    'cowsay moo',
    'uname -a',
    'date',
    'man',
    'man help',
    'man whoami',
    'man ls',
    'man cd',
    'man cat',
    'man echo',
    'man pwd',
    'man uname',
    'man date',
    'man file',
    'man find',
    'man cowsay',
    'man clear',
    'man hint',
    'man sudo',
    'man man',
    'clear',
  ];

  /*
    updateCursorPosition() measures the width of typed text and moves the cursor
    to follow it smoothly. This creates the vim-style effect where the cursor
    appears to move as you type.
  */
  function updateCursorPosition() {
    const cursorEl = document.querySelector('.cursor');
    if (!cursorEl) return;

    const text = _inputEl.value;
    if (text.length === 0) {
      /* No text typed, cursor stays at the beginning */
      cursorEl.style.transform = 'translateX(0px)';
    } else {
      /*
        Create a temporary span with identical styling to measure text width.
        This span is never visible — we just use it for measurements.
      */
      const measurer = document.createElement('span');
      measurer.style.position = 'absolute';
      measurer.style.visibility = 'hidden';
      measurer.style.whiteSpace = 'pre';
      measurer.style.font = window.getComputedStyle(_inputEl).font;
      measurer.textContent = text;
      document.body.appendChild(measurer);

      const textWidth = measurer.offsetWidth;
      document.body.removeChild(measurer);

      /* Move cursor to the right of all typed text, plus one character forward (8px) */
      cursorEl.style.transform = `translateX(${textWidth + 8}px)`;
    }
  }

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

    let matches = [];

    /*
      Parse the input to see if it's a command (first word) or includes arguments.
      For simple commands like "whoami", autocomplete from AUTOCOMPLETE_COMMANDS.
      For path commands like "ls projects", generate suggestions from the filesystem.
    */
    const parts = val.split(/\s+/);
    const cmd = parts[0];

    if (parts.length === 1) {
      /*
        User is still typing just the command (no arguments yet).
        Autocomplete from the full list of static commands.
      */
      matches = AUTOCOMPLETE_COMMANDS.filter(
        c => c.startsWith(val) && c !== val
      );
    } else if (['ls', 'cd', 'cat'].includes(cmd) && _getCwd) {
      /*
        User is typing a path argument for ls/cd/cat.
        Generate suggestions from the filesystem based on current directory.
      */
      const cwd = _getCwd();
      const partialPath = parts.slice(1).join(' ');
      matches = _generatePathSuggestions(cmd, partialPath, cwd);
    } else if (cmd === 'file' && _getCwd) {
      /*
        User is typing a file argument for the file command.
        Generate suggestions from the filesystem.
      */
      const cwd = _getCwd();
      const partialPath = parts.slice(1).join(' ');
      matches = _generatePathSuggestions(cmd, partialPath, cwd);
    } else if (cmd === 'find') {
      /*
        For find command: handle "find -name" patterns
      */
      if (parts.length === 2 && parts[1].startsWith('-')) {
        /* User is typing the flag, complete to "-name" */
        matches = AUTOCOMPLETE_COMMANDS.filter(
          c => c.startsWith(val) && c !== val && c.startsWith('find')
        );
      } else if (parts.length >= 3 && parts[1] === '-name') {
        /* User is typing the filename argument for -name */
        const searchTerm = parts.slice(2).join(' ');
        matches = _generateFileSuggestions(searchTerm);
      }
    }

    if (matches.length === 1) {
      /* Only one match — complete it */
      _inputEl.value = matches[0];
      updateCursorPosition();
    } else if (matches.length > 1) {
      /*
        Multiple matches: find the longest common prefix and autocomplete to it.
        This mimics shell behavior where Tab expands as much as possible.
      */
      let prefix = val;
      const maxLen = Math.max(...matches.map(m => m.length));
      
      for (let i = val.length; i < maxLen; i++) {
        const char = matches[0][i];
        /* Check if all matches have the same character at position i */
        if (char !== undefined && matches.every(m => m[i] === char)) {
          prefix += char;
        } else {
          /* Different characters or end of string reached */
          break;
        }
      }
      
      if (prefix.length > val.length) {
        _inputEl.value = prefix;
        updateCursorPosition();
      }
    }
  }

  /*
    _generatePathSuggestions() generates autocomplete matches for filesystem paths.
    It handles relative paths, looks up entries in the Filesystem, and returns
    matching files/directories with proper formatting.
    
    Example: typing "ls pro" in ~/ generates ["ls projects/"]
    Example: typing "cat README" in ~/projects/llm-ctf/ generates ["cat README.md"]
  */
  function _generatePathSuggestions(cmd, partialPath, cwd) {
    if (!Filesystem) return [];
    
    /* Resolve the directory we're listing relative to cwd */
    let targetDir = cwd;
    let lastSlashIdx = partialPath.lastIndexOf('/');
    
    let prefix = '';
    if (lastSlashIdx > -1) {
      /* User typed a path with slashes, resolve it */
      prefix = partialPath.substring(0, lastSlashIdx + 1);
      const relPath = partialPath.substring(0, lastSlashIdx);
      
      /* Resolve the relative path to an absolute path */
      targetDir = Filesystem.resolve(relPath, cwd);
      if (!targetDir) return [];
    }
    
    const entries = Filesystem.listDir(targetDir);
    if (!entries) return [];
    
    /* Filter entries that match what the user has typed so far */
    const needle = partialPath.substring(lastSlashIdx + 1);
    const matches = entries
      .filter(entry => entry.startsWith(needle))
      .map(entry => {
        /* Return the full command with the completed path */
        const fullPath = `${cmd} ${prefix}${entry}`;
        return fullPath;
      });
    
    return matches;
  }

  /*
    _generateFileSuggestions() generates autocomplete matches for the find -name command.
    It collects all files from the entire filesystem and returns matching filenames.
    
    Example: typing "find -name README" generates ["find -name \"README.md\""]
  */
  function _generateFileSuggestions(partialFileName) {
    const matches = [];
    const seen = new Set(); /* Avoid duplicates */

    /* Helper to recursively collect all files */
    function collectFiles(dirPath) {
      const entries = Filesystem.listDir(dirPath);
      if (!entries) return;

      entries.forEach(entry => {
        if (entry.endsWith('/')) {
          /* Directory — recurse into it */
          const dirName = entry.slice(0, -1);
          const fullDirPath = dirPath === '~' ? `~/${dirName}` : `${dirPath}/${dirName}`;
          collectFiles(fullDirPath);
        } else {
          /* File — check if it matches the partial search term */
          if (entry.startsWith(partialFileName) && !seen.has(entry)) {
            seen.add(entry);
            /* Return with quotes around the filename and the "find -name" prefix */
            matches.push(`find -name "${entry}"`);
          }
        }
      });
    }

    collectFiles('~');
    return matches;
  }

  /*
    init() wires up all the event listeners. It's called by main.js after
    the shell section is revealed — we need the DOM elements to exist first.
    
    @param onSubmit — callback when user presses Enter
    @param getCwd   — callback that returns the current working directory
  */
  function init(onSubmit, getCwd) {
    _onSubmit = onSubmit;
    _getCwd   = getCwd;
    _inputEl  = document.getElementById('cmd-input');

    _inputEl.addEventListener('keydown', _onKeydown);
    _inputEl.addEventListener('input', updateCursorPosition);
    _inputEl.addEventListener('keyup', updateCursorPosition);

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
      trigger this listener. However, button clicks will be prevented from
      bubbling with stopPropagation() so they don't trigger focus.
    */
    document.getElementById('terminal').addEventListener('click', (e) => {
      // Don't focus input if clicking on buttons or links
      if (!e.target.closest('button') && !e.target.closest('a')) {
        _inputEl.focus();
      }
    });

    /*
      Specifically allow clicking the cursor to focus the input on mobile.
    */
    document.querySelector('.cursor').addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling to terminal
      _inputEl.focus();
    });

    /*
      Mobile floating button to focus input.
    */
    const focusBtn = document.getElementById('focus-input-btn');
    if (focusBtn) {
      focusBtn.addEventListener('click', () => _inputEl.focus());
    }
  }

  function focus() {
    _inputEl.focus();
  }

  return { init, focus };

})();
