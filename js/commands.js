/**
 * js/commands.js
 *
 * Command router and all built-in command handler implementations.
 *
 * How it works:
 *   Commands.execute(rawCmd, cwd, setCwd) is called by js/main.js on every
 *   submission. It trims whitespace, checks for easter eggs, then routes to
 *   the appropriate handler function based on the first word (the "verb").
 *
 * Adding a new command:
 *   1. Write a handler function following the ctx pattern below.
 *   2. Add it to the COMMANDS map.
 *   3. Add it to the help text in cmdHelp().
 *   4. Optionally add it to the autocomplete list in js/input.js.
 *
 * Handler contract:
 *   - Receives a context object: { args, rawCmd, cwd, setCwd }
 *       args    — array of space-separated arguments after the verb
 *       rawCmd  — the full original command string (useful for error messages)
 *       cwd     — current working directory string
 *       setCwd  — function(newPath) to update the cwd (used only by cmdCd)
 *   - Uses Output.* to write output lines
 *   - Returns nothing
 *
 * Public API:
 *   Commands.execute(rawCmd, cwd, setCwd)
 */

const Commands = (() => {

  /* ── Command handlers ───────────────────────────────────────────── */

  /**
   * help — list all available commands.
   * Keep this in sync with the COMMANDS map below and js/input.js autocomplete.
   */
  function cmdHelp() {
    Output.addLines([
      ['green',   '╔══════════════════════════════════════════════════════╗'],
      ['green',   '║               AVAILABLE COMMANDS                    ║'],
      ['green',   '╚══════════════════════════════════════════════════════╝'],
      ['blank',   ''],
      ['gold',    '  whoami              Who is Oliver?'],
      ['gold',    '  ls [path]           List directory contents'],
      ['gold',    '  cd [path]           Change directory'],
      ['gold',    '  cat [file]          Read a file'],
      ['gold',    '  uname [-a]          System info'],
      ['gold',    '  date                Current date & time'],
      ['gold',    '  pwd                 Print working directory'],
      ['gold',    '  clear               Clear terminal'],
      ['blank',   ''],
      ['default', '  Hint: there are hidden easter egg commands 👀'],
      ['default', '        try: matrix, fortune, cowsay, ping oliverjpearce.com'],
    ]);
  }

  /**
   * whoami — print a short bio of Oliver.
   * This is the first thing most visitors will run, so it should be
   * concise, personal, and tell them the most important things quickly.
   */
  function cmdWhoami() {
    Output.addLines([
      ['green',   'Oliver Pearce — Software Engineer & Security Researcher'],
      ['default', 'Location:  Santa Cruz, CA'],
      ['default', 'Degree:    B.S. Computer Science — UC Santa Cruz'],
      ['blue',    'Focus:     Offensive Security · iOS Dev · AI/ML Research'],
      ['gold',    'Status:    Open to opportunities 🟢'],
    ]);
  }

  /**
   * uname — print system information.
   * Matches the real `uname -a` output format from a Kali Linux machine
   * to reinforce the terminal aesthetic. The flag value (-a) is ignored
   * because it always returns the same string; we handle any `uname` call here.
   */
  function cmdUname() {
    Output.addLine(
      'default',
      'Linux kali 6.6.9-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.6.9-1kali1 x86_64 GNU/Linux'
    );
  }

  /**
   * date — print the current date and time.
   * Uses the real system clock via new Date() so the output is always accurate.
   * Also registered as an easter egg in data/easter-eggs.js (value: null) so
   * handleEasterEgg() routes it here rather than looking it up in the static map.
   */
  function cmdDate() {
    Output.addLine('white', new Date().toString());
  }

  /**
   * ls [path] — list the contents of a directory.
   *
   * Directories are rendered in blue, files in green — matching the default
   * color scheme most Linux terminals use for `ls --color=auto`.
   *
   * We use Output.addHTML() here because we need per-entry <span> coloring
   * on a single line, which addLine() can't express as a single tuple.
   *
   * @param {{ args: string[], cwd: string }} ctx
   */
  function cmdLs({ args, cwd }) {
    /* Default to the current directory if no path argument was given */
    const arg       = args[0] || null;
    const targetPath = arg ? Filesystem.resolve(arg, cwd) : cwd;
    const entries   = Filesystem.listDir(targetPath);

    if (entries) {
      /*
        Build a single HTML string with colour-coded spans.
        Directories (entries ending in '/') get --blue, files get --green.
        Output.esc() is called on each entry name to prevent accidental
        HTML injection if an entry name ever contains special characters.
      */
      const html = entries
        .map(entry =>
          entry.endsWith('/')
            ? `<span class="line--blue">${Output.esc(entry)}</span>`
            : `<span class="line--green">${Output.esc(entry)}</span>`
        )
        .join('    ');  /* four spaces between entries, like `ls` */
      Output.addHTML(html);

    } else if (Filesystem.isFile(targetPath)) {
      /* User tried to ls a file rather than a directory */
      Output.addLine('red', `ls: cannot access '${arg}': Not a directory`);

    } else {
      /* Path doesn't exist at all */
      Output.addLine('red', `ls: cannot access '${arg || '.'}': No such file or directory`);
    }
  }

  /**
   * cd [path] — change the current working directory.
   *
   * setCwd is a function provided by main.js that updates both the internal
   * cwd variable and the visible path in the prompt and title bar.
   * We call it only on success — on failure we just print an error and leave
   * cwd unchanged.
   *
   * @param {{ args: string[], cwd: string, setCwd: function }} ctx
   */
  function cmdCd({ args, cwd, setCwd }) {
    /* cd with no argument goes home, matching standard shell behaviour */
    const arg    = args[0] || '~';
    const target = Filesystem.resolve(arg, cwd);

    if (Filesystem.isDir(target)) {
      setCwd(target);
    } else if (Filesystem.isFile(target)) {
      Output.addLine('red', `bash: cd: ${arg}: Not a directory`);
    } else {
      Output.addLine('red', `bash: cd: ${arg}: No such file or directory`);
    }
  }

  /**
   * cat [file] — display the contents of a file.
   *
   * File content is stored as line tuples in data/files.js and rendered
   * by Output.addLines(). Clickable links are handled transparently by
   * Output.addLine() when a tuple has a third (url) element.
   *
   * @param {{ args: string[], cwd: string }} ctx
   */
  function cmdCat({ args, cwd }) {
    if (!args[0]) {
      /* Real cat with no args reads from stdin. We just explain why we can't. */
      Output.addLine('default', '(reading from stdin — press Ctrl+C to cancel)');
      return;
    }

    const arg     = args[0];
    const target  = Filesystem.resolve(arg, cwd);
    const content = Filesystem.readFile(target);

    if (content) {
      Output.addLines(content);
    } else if (Filesystem.isDir(target)) {
      Output.addLine('red', `cat: ${arg}: Is a directory`);
    } else {
      Output.addLine('red', `cat: ${arg}: No such file or directory`);
    }
  }


  /* ── Easter egg handler ─────────────────────────────────────────── */

  /**
   * Check whether rawCmd is an easter egg and handle it if so.
   *
   * Checked before the normal command router so easter eggs can shadow
   * real commands (e.g. 'history' returns the curated fake history from
   * EASTER_EGGS rather than the live Input._history array).
   *
   * Returns true if the command was handled (so the router can stop),
   * false if it wasn't (so the router continues normally).
   *
   * @param {string} rawCmd
   * @returns {boolean}
   */
  function _handleEasterEgg(rawCmd) {
    /* 'date' is dynamic — its output depends on the current time — so it
       can't be a static string in EASTER_EGGS. We handle it here instead. */
    if (rawCmd === 'date') {
      cmdDate();
      return true;
    }

    const entry = EASTER_EGGS[rawCmd];

    /* Not in the map at all → not an easter egg */
    if (entry === undefined) return false;

    /* null is the sentinel value for "handled dynamically elsewhere" — if
       we reach this with null it means we forgot to add a dynamic handler above */
    if (entry === null) return false;

    /* Static output array → render it */
    Output.addLines(entry);
    return true;
  }


  /* ── Command router ─────────────────────────────────────────────── */

  /**
   * Map of verb strings to handler functions.
   * All handler functions follow the ctx = { args, rawCmd, cwd, setCwd } pattern.
   *
   * To add a new command: add a handler function above, then add it here.
   * The key must be the exact string the user types as the first word.
   */
  const COMMANDS = {
    help:   cmdHelp,
    whoami: cmdWhoami,
    uname:  cmdUname,
    date:   cmdDate,
    ls:     cmdLs,
    cd:     cmdCd,
    cat:    cmdCat,
  };

  /**
   * Parse and execute a raw command string.
   * Called by js/main.js on every user submission (keypress or button click).
   *
   * Execution order:
   *   1. Trim and bail on empty input
   *   2. Handle `clear` specially (no prompt echo, just wipe output)
   *   3. Echo the prompt + command to the output log
   *   4. Check easter eggs (may short-circuit here)
   *   5. Parse verb and args; dispatch to the matching handler
   *   6. If no handler found, print "command not found"
   *   7. Scroll to the bottom
   *
   * @param {string}   rawCmd - the full command string from the input field
   * @param {string}   cwd    - current working directory
   * @param {function} setCwd - callback to update the cwd in main.js
   */
  function execute(rawCmd, cwd, setCwd) {
    const trimmed = rawCmd.trim();
    if (!trimmed) return; /* ignore empty submissions */

    /*
      `clear` is handled before the prompt echo because clearing the output
      and then immediately printing a prompt echo would be pointless.
      It also doesn't go through the easter-egg or router paths.
    */
    if (trimmed === 'clear') {
      Output.clear();
      return;
    }

    /* Print "oliver@kali:~/path$ command" above this command's output */
    Output.addPromptEcho(trimmed, cwd);

    /* Easter eggs take priority over the normal command map */
    if (_handleEasterEgg(trimmed)) {
      Output.scroll();
      return;
    }

    /* Split "verb arg1 arg2 ..." into verb + args array */
    const parts = trimmed.split(/\s+/);
    const verb  = parts[0];
    const args  = parts.slice(1);

    /*
      Build the context object passed to every handler.
      Passing cwd and setCwd through ctx (rather than closing over them)
      makes each handler independently testable without needing module state.
    */
    const ctx = { args, rawCmd: trimmed, cwd, setCwd };

    /*
      `uname` accepts optional flags (e.g. `-a`) but we always show the
      same output regardless, so we route any `uname` call to cmdUname.
      This is simpler than adding uname as a key in COMMANDS and handling
      the flag there.
    */
    if (verb === 'uname') {
      cmdUname();
      Output.scroll();
      return;
    }

    const handler = COMMANDS[verb];

    if (handler) {
      handler(ctx);
    } else {
      /*
        Replicate the real bash error message format so it feels authentic.
        Output.esc() prevents a verb like "<script>" from injecting HTML.
      */
      Output.addLine('red',     `bash: ${Output.esc(verb)}: command not found`);
      Output.addLine('default', `Type 'help' to list available commands.`);
    }

    Output.scroll();
  }

  /* ── Public API ─────────────────────────────────────────────────── */

  return { execute };

})();
