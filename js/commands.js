/**
 * js/commands.js
 *
 * The command router and all command handler implementations.
 *
 * How it works:
 *   When the user types a command and presses Enter, main.js calls
 *   Commands.execute(). That function splits the input into a verb ("ls")
 *   and arguments (["projects/"]), then looks up the verb in the COMMANDS
 *   map to find the right handler function and calls it.
 *
 * Adding a new command:
 *   1. Write a handler function below (follow the ctx pattern)
 *   2. Add it to the COMMANDS map
 *   3. Add it to the bubbles list in cmdHelp()
 *   4. Add it to AUTOCOMPLETE_COMMANDS in input.js
 *   5. Add a button in the quickbar in index.html (optional)
 *
 * Handler pattern:
 *   Every handler receives a context object with:
 *     args    — array of words after the command (e.g. ['resume.txt'])
 *     rawCmd  — the full original string (useful for error messages)
 *     cwd     — the current directory path (e.g. '~/projects')
 *     setCwd  — function to change directory (only used by cd)
 *   Handlers use Output.* to write output and return nothing.
 */

const Commands = (() => {

  // Flag decoded from base64 for immediate availability
  const _flag = atob('U0xWUkR7TjB0LXQwZGF5LXRoNG5rLXkwdSF9');

  /* ── Command handlers ─────────────────────────────────────────── */

  function cmdHelp() {
    Output.addLine('default', 'Available commands — click to run:');
    Output.addLine('blank', '');

    /*
      Each entry is [commandString, displayLabel].
      They're the same here, but keeping them separate means you could
      show a friendlier label like "read resume" while running "cat resume.txt".
    */
    const bubbles = [
      ['help',                                'help'],
      ['whoami',                              'whoami'],
      ['ls',                                  'ls'],
      ['cat resume.txt',                      'cat resume.txt'],
      ['cat skills.txt',                      'cat skills.txt'],
      ['cat contact.txt',                     'cat contact.txt'],
      ['ls projects/',                        'ls projects/'],
      ['cd projects/',                        'cd projects/'],
      ['cat projects/llm-ctf/README.md',      'cat projects/llm-ctf/README.md'],
      ['cat projects/scmac-ios/README.md',    'cat projects/scmac-ios/README.md'],
      ['cat projects/study-buddy/README.md',  'cat projects/study-buddy/README.md'],
      ['cat projects/acm-ai-lab/README.md',   'cat projects/acm-ai-lab/README.md'],
      ['cat projects/silvered-bot/README.md', 'cat projects/silvered-bot/README.md'],
      ['cat projects/scmac-ios/AppStore.url', 'cat projects/scmac-ios/AppStore.url'],
      ['echo hello world',                    'echo hello world'],
      ['cowsay moo',               'cowsay moo'],
      ['file resume.txt',                     'file resume.txt'],
      ['file projects/scmac-ios/AppStore.url','file projects/scmac-ios/AppStore.url'],
      ['find -name "README"',                 'find -name "README"'],
      ['find -name "devpost.url"',            'find -name "devpost.url"'],
      ['pwd',                                 'pwd'],
      ['uname -a',                            'uname -a'],
      ['date',                                'date'],
      ['hint',                                'hint'],
      ['clear',                               'clear'],
    ];

    /*
      We render bubbles in rows of 4 using a simple loop.
      i starts at 0, jumps by ROW_SIZE each iteration.
      slice(i, i + ROW_SIZE) extracts the next chunk of up to 4 items.
      This is a common pattern for chunking an array into rows.
    */
    const ROW_SIZE = 4;
    for (let i = 0; i < bubbles.length; i += ROW_SIZE) {
      const row  = bubbles.slice(i, i + ROW_SIZE);
      /*
        Template literals (backtick strings) let us embed JavaScript expressions
        inside strings using ${expression} syntax. We're building an HTML string
        here rather than creating DOM elements one by one because it's more
        readable when constructing many similar elements at once.
        Output.esc() sanitises the command strings before inserting them.
      */
      const html = row
        .map(([cmd, label]) =>
          `<button class="cmd-bubble" data-cmd="${Output.esc(cmd)}">${Output.esc(label)}</button>`
        )
        .join('');
      Output.addHTML(html);
    }

    /* Wire click listeners to the bubbles we just injected */
    _attachBubbleListeners();
  }

  function cmdWhoami() {
    Output.addLines([
      ['green',   'Oliver Pearce — Data Curation Engineer @ Apple'],
      ['default', 'Location:  San Francisco, Bay Area'],
      ['default', 'Degree:    B.S. Computer Science — UC Santa Cruz'],
      ['blue',    'Focus:     Networks · AI/ML · Cybersecurity'],
      ['gold',    'Status:    Under a pile of NDAs'],
    ]);
  }

  function cmdUname() {
    /* Returns a realistic Linux system info string matching Kali Linux format */
    Output.addLine('default', 'Linux SLVRD 6.6.9-amd64 #1 SMP PREEMPT_DYNAMIC SLVRD 6.6.9-1slvrd1 x86_64 GNU/Linux');
  }

  function cmdDate() {
    /* new Date().toString() gives the current time in the user's local timezone */
    Output.addLine('white', new Date().toString());
  }

  /*
    pwd (print working directory) — prints the absolute path of the current
    directory. In a real shell, cwd is stored in the shell's process state.
    Here we receive it through the ctx object passed by Commands.execute().

    The path displayed is prefixed with /home/root/ to simulate a real Linux
    home directory — in the virtual filesystem we use ~ as shorthand, but
    a real terminal would show the full expanded path.
  */
  function cmdPwd({ cwd }) {
    /* Expand ~ to /home/root so it looks like a real filesystem path */
    const expanded = cwd === '~'
      ? '/home/root'
      : cwd.replace('~', '/home/root');
    Output.addLine('white', expanded);
  }

  function cmdHint({ cwd }) {
    Output.addLine('white', "ok fine, ill tell you something just dont refresh the page.");
  }

  function cmdLs({ args, cwd }) {
    /* Default to current directory if no argument provided */
    const arg        = args[0] || null;
    const targetPath = arg ? Filesystem.resolve(arg, cwd) : cwd;
    const entries    = Filesystem.listDir(targetPath);

    if (entries) {
      /*
        We build one HTML string with colour-coded spans, then inject it via
        addHTML(). Directories get blue, files get green — matching the colour
        scheme of `ls --color=auto` on most Linux systems.
        We join with four spaces to mimic the default ls column spacing.
        On Windows, use three spaces due to different font spacing.
      */
      const isWindows = navigator.platform.includes('Win');
      const separator = isWindows ? '   ' : '    ';
      const html = entries
        .map(e =>
          e.endsWith('/')
            ? `<span class="line--blue">${Output.esc(e)}</span>`
            : `<span class="line--green">${Output.esc(e)}</span>`
        )
        .join(separator);
      Output.addHTML(html);
    } else if (Filesystem.isFile(targetPath)) {
      Output.addLine('red', `ls: cannot access '${arg}': Not a directory`);
    } else {
      Output.addLine('red', `ls: cannot access '${arg || '.'}': No such file or directory`);
    }
  }

  function cmdCd({ args, cwd, setCwd }) {
    /* With no argument, `cd` goes home — this matches real shell behaviour */
    const arg    = args[0] || '~';
    const target = Filesystem.resolve(arg, cwd);

    if (Filesystem.isDir(target)) {
      /*
        setCwd is passed in from main.js — we don't update cwd directly here
        because cwd lives in main.js and this handler shouldn't know about that.
        This is called "dependency injection" — the dependency (setCwd) is
        passed in rather than imported, keeping this module loosely coupled.
      */
      setCwd(target);
    } else if (Filesystem.isFile(target)) {
      Output.addLine('red', `SLVRD: cd: ${arg}: Not a directory`);
    } else {
      Output.addLine('red', `SLVRD: cd: ${arg}: No such file or directory`);
    }
  }

  /*
    cmdSudo handles any `sudo` command. Most sudo attempts get a dismissal,
    but `sudo rm -rf /` (and its --no-preserve-root variant) prints a hidden
    CTF-style flag as a reward for the curious visitor who tries it.

    The flag is formatted like a real CTF flag: SLVRD{...}
    It's styled to look like terminal output so it blends in just enough
    to be a genuine "aha!" moment for someone who knows what they're looking for.
  */
  function cmdSudo({ args, rawCmd }) {
    /*
      We check the full rawCmd string (not just args) because the flag should
      only appear for the exact dangerous commands, not just any sudo invocation.
      .trim() removes leading/trailing whitespace before comparing.
    */
    const fullArgs = args.join(' ').trim();
    const isRmRf   = fullArgs === 'rm -rf /' || fullArgs === 'rm -rf / --no-preserve-root' || fullArgs === 'rm -r -f /';
    const isRm     = fullArgs === 'rm' || fullArgs === 'rm -rf' || fullArgs === 'rm -r -f';

    if (isRm) {
      /* Just `sudo rm` — playful warning */
      Output.addLines([
        ['red',     `sudo: ${Output.esc(args[0] || 'command')}: permission denied`],
        ['default', 'wait fr chill please dont hahahahaha -oli'],
      ]);
      return;
    }

    if (isRmRf) {
      /*
        Print a realistic-looking permission denied message first,
        then reveal the flag after a short pause. The setTimeout creates
        a dramatic beat between the error and the reward.
      */
      Output.addLines([
        ['red',     'rm: it is dangerous to operate recursively on \'/\''],
        ['red',     'rm: use --no-preserve-root to override this failsafe'],
        ['blank',   ''],
        ['gold', 'let this be a lesson learned; DONT DELETE YOUR COMPUTER!!!'],
        ['blank',   ''],
      ]);

      /*
        setTimeout delays the flag reveal by 800ms so it appears to "load"
        after the error — making it feel like something actually happened
        rather than just printing everything at once.
      */
      setTimeout(() => {
        Output.addLines([
          ['green',   '>>> SLVRD SECURITY SUBSYSTEM <<<'],
          ['default', 'thanks for trying to delete my system,'],
          ['blank',   ''],
          ['gold',    '  ┌─────────────────────────────────────────┐'],
          ['gold',    '  │                                         │'],
          ['gold',    `  │       ${_flag}       │`],
          ['gold',    '  │                                         │'],
          ['gold',    '  └─────────────────────────────────────────┘'],
          ['blank',   ''],
          ['default', 'keep poking around though c:'],
        ]);
        Output.scroll();
      }, 800);

      return;
    }

    /* Any other sudo command gets a generic denial */
    Output.addLines([
      ['red',     `sudo: ${Output.esc(args[0] || 'command')}: permission denied`],
      ['default', 'yo chill thats a me thing -oli'],
    ]);
  }

  function cmdCat({ args, cwd }) {
    if (!args[0]) {
      /* Real `cat` with no args reads from stdin — we just explain we can't do that */
      Output.addLine('default', '(reading from stdin — press Ctrl+C to cancel)');
      return;
    }

    const arg     = args[0];
    const target  = Filesystem.resolve(arg, cwd);
    const content = Filesystem.readFile(target);

    if (content) {
      /*
        addLines() handles the full tuple format [colorClass, text, url?] from
        data/files.js — including making links clickable automatically.
      */
      Output.addLines(content);
    } else if (Filesystem.isDir(target)) {
      Output.addLine('red', `cat: ${arg}: Is a directory`);
    } else {
      Output.addLine('red', `cat: ${arg}: No such file or directory`);
    }
  }

  function cmdEcho({ args }) {
    /* Echo concatenates all arguments with spaces and prints them */
    const output = args.join(' ');
    Output.addLine('white', output);
  }

  function cmdCowsay({ args }) {
    /* Cowsay prints a cow with a speech bubble containing the message */
    const message = args.join(' ') || 'Hello!';
    const width = Math.max(message.length + 2, 20);
    const padding = ' '.repeat(Math.max(0, width - message.length - 2));

    const lines = [
      ' ' + '_'.repeat(width + 2),
      `| ${message}${padding} |`,
      ' ' + '-'.repeat(width + 2),
      '        \\   ^__^',
      '         \\  (oo)\\_______',
      '            (__)\\       )\\/\\',
      '                ||----w |',
      '                ||     ||',
    ];

    lines.forEach(line => Output.addLine('default', line));
  }

  function cmdFile({ args, cwd }) {
    if (!args || args.length === 0) {
      Output.addLine('red', 'file: missing file argument');
      return;
    }

    const arg = args.join(' ');
    const filePath = Filesystem.resolve(arg, cwd);

    if (Filesystem.isFile(filePath)) {
      const content = Filesystem.readFile(filePath);
      const fileName = filePath.split('/').pop();
      
      /* Determine file type based on extension */
      let fileType = 'text';
      if (fileName.endsWith('.txt')) fileType = 'ASCII text';
      else if (fileName.endsWith('.md')) fileType = 'Markdown document';
      else if (fileName.endsWith('.json')) fileType = 'JSON data';
      else if (fileName.endsWith('.py')) fileType = 'Python script';
      else if (fileName.endsWith('.js')) fileType = 'JavaScript source';
      else if (fileName.endsWith('.url')) fileType = 'text file (URL shortcut)';

      /* Calculate file size based on content */
      let size = 0;
      if (content) {
        size = content.reduce((acc, line) => {
          /* Estimate bytes: color code + text + newline */
          return acc + (line[1] ? line[1].length : 0) + 1;
        }, 0);
      }

      Output.addLine('default', `${fileName}: ${fileType} (${size} bytes)`);
    } else if (Filesystem.isDir(filePath)) {
      Output.addLine('red', `file: ${arg}: Is a directory`);
    } else {
      Output.addLine('red', `file: ${arg}: No such file or directory`);
    }
  }

  function cmdFind({ args }) {
    if (!args || args.length === 0) {
      Output.addLine('default', 'Usage: find -name "file_name"');
      return;
    }

    if (args[0] !== '-name' || !args[1]) {
      Output.addLine('default', 'Usage: find -name "file_name"');
      return;
    }

    /* Get the search term — if it's a single argument, use it; otherwise join multiple words */
    const searchTerm = args.slice(1).join(' ').toLowerCase();
    const results = [];

    /* Helper to recursively collect all files from the filesystem */
    function getAllFiles(dirPath, prefix = '') {
      const entries = Filesystem.listDir(dirPath);
      if (!entries) return;

      entries.forEach(entry => {
        if (entry.endsWith('/')) {
          /* Directory — recurse into it */
          const dirName = entry.slice(0, -1);
          const fullDirPath = dirPath === '~' ? `~/${dirName}` : `${dirPath}/${dirName}`;
          getAllFiles(fullDirPath, prefix + dirName + '/');
        } else {
          /* File — check if it matches the search term */
          if (entry.toLowerCase().includes(searchTerm)) {
            const fullPath = dirPath === '~' ? `~/${entry}` : `${dirPath}/${entry}`;
            results.push(fullPath);
          }
        }
      });
    }

    getAllFiles('~');

    if (results.length === 0) {
      Output.addLine('default', `find: no files named '${args[1]}' found`);
    } else {
      results.forEach(path => {
        Output.addLine('blue', path);
      });
    }
  }

  function cmdClear() {
    /* Clear all output from the terminal */
    Output.clear();
    Output.addHTML('Hello world! I have opened my personal console for you to navigate and poke around, so please feel free to explore! If you would prefer a more traditional portfolio, <a href="https://oliverjpearce.com/portfolio-old/" target="_blank" rel="noopener noreferrer" class="terminal-link">please visit this website</a>.');
    Output.addHTML('For the CTF, the flag is in the format SLVRD{...} - good luck! c:');
    Output.addLine('blank', '');
  }


  /* ── Command map ──────────────────────────────────────────────── */

  /*
    An object used as a lookup table: verb string → handler function.
    This is more maintainable than a long if/else or switch statement —
    adding a command is just adding one line to this object.
  */
  const COMMANDS = {
    help:   cmdHelp,
    whoami: cmdWhoami,
    uname:  cmdUname,
    date:   cmdDate,
    pwd:    cmdPwd,
    sudo:   cmdSudo,
    ls:     cmdLs,
    cd:     cmdCd,
    cat:    cmdCat,
    echo:   cmdEcho,
    cowsay: cmdCowsay,
    file:   cmdFile,
    find:   cmdFind,
    clear:  cmdClear,
    hint:   cmdHint,
  };


  /* ── Command bubble click listeners ───────────────────────────── */

  /*
    We store the latest cwd and setCwd here so bubble click handlers can
    use the current values even though the bubbles were created earlier.
    This is a form of "closure" — the click handlers "close over" these
    variables and read whatever value they have at click time, not at
    bubble-creation time.
  */
  let _lastCwd    = '~';
  let _lastSetCwd = null;

  function _attachBubbleListeners() {
    /*
      querySelectorAll returns ALL matching elements in the document.
      We check dataset.wired to avoid adding duplicate event listeners if
      the user runs `help` multiple times — each run adds new bubbles but
      we only want one listener per bubble.
    */
    document.querySelectorAll('.cmd-bubble').forEach(btn => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        if (cmd) execute(cmd, _lastCwd, _lastSetCwd);
      });
    });
  }


  /* ── Router ───────────────────────────────────────────────────── */

  function execute(rawCmd, cwd, setCwd) {
    const trimmed = rawCmd.trim();
    if (!trimmed) return; /* ignore empty submissions */

    /* Store latest values for bubble click handlers */
    _lastCwd    = cwd;
    _lastSetCwd = setCwd;

    /*
      `clear` is handled before the prompt echo because it wipes all output —
      printing a prompt echo and then clearing would just leave it empty anyway.
    */
    // if (trimmed === 'clear') {
    //   Output.clear();
    //   return;
    // }

    /* Always print the prompt echo before the command's output */
    Output.addPromptEcho(trimmed, cwd);

    /*
      split(/\s+/) splits on one or more whitespace characters.
      This handles "ls  projects/" (double space) correctly, unlike split(' ').
      The result is ['ls', 'projects/'], so parts[0] is the verb and the
      rest are arguments.
    */
    const parts = trimmed.split(/\s+/);
    const verb  = parts[0];
    const args  = parts.slice(1);
    const ctx   = { args, rawCmd: trimmed, cwd, setCwd };

    /*
      `uname` can be called as "uname" or "uname -a" — we handle both here
      by routing any call that starts with "uname" to the same handler,
      since we always return the same string regardless of flags.
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
        Mimics the real SLVRD error format. Output.esc() is called on the verb
        in case it contains HTML characters — e.g. if someone types "<script>".
      */
      Output.addLine('red',     `SLVRD: ${Output.esc(verb)}: command not found`);
      Output.addLine('default', `Type 'help' to see available commands.`);
    }

    Output.scroll();
  }

  return { execute };

})();
