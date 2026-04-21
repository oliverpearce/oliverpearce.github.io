/**
 * js/main.js
 *
 * The application entry point — this is where everything gets wired together.
 *
 * This file owns `cwd` (current working directory), which is the only shared
 * piece of mutable state in the whole app. All other modules are stateless
 * with respect to navigation, which makes them easier to reason about.
 *
 * The startup flow is:
 *   1. Browser parses the HTML and runs this script
 *   2. We wait for DOMContentLoaded to ensure all elements exist
 *   3. Boot.run() starts the animated boot sequence
 *   4. When boot finishes, it calls showShell()
 *   5. showShell() reveals the terminal and initialises Input + Output
 *   6. From then on, every command goes: Input → handleCommand() → Commands.execute()
 *
 * We wrap everything in an IIFE (the outer (function() { ... })()) to avoid
 * polluting the global scope with variables like `cwd` and `setCwd`.
 * These don't need to be global — nothing outside this file uses them.
 */

(function () {

  /*
    cwd (current working directory) starts at home.
    It's declared with `let` because it changes when the user runs `cd`.
    `const` would prevent reassignment, so we can't use it here.
  */
  let cwd = '~';

  /*
    setCwd() is the ONLY place where cwd gets updated. It also updates
    every UI element that shows the current path, keeping them in sync.
    By funnelling all cwd changes through this one function, we guarantee
    the prompt label, title bar, and internal state are always consistent.

    This function is passed into Commands.execute() as a callback so the
    `cd` command handler can trigger a cwd change without needing to import
    or know about main.js — a pattern called "dependency injection".
  */
  function setCwd(newPath) {
    cwd = newPath;
    /* Update the path shown in the input row prompt */
    document.getElementById('cur-path').textContent  = cwd;
    /* Update the terminal window title bar */
    document.getElementById('bar-title').textContent = `root@oliver: ${cwd} — SLVRD`;
  }

  /*
    handleCommand() is what Input calls when the user submits a command.
    It reads `cwd` from the closure (the outer scope of the IIFE) so it
    always has the current value — even if `cd` has changed it since the
    last command ran.
  */
  function handleCommand(rawCmd) {
    Commands.execute(rawCmd, cwd, setCwd);
  }

  /*
    showShell() is the callback passed to Boot.run(). Boot calls it when the
    animation sequence is complete.

    Output.init() and Input.init() are called HERE (not at the top of the file)
    because both functions call document.getElementById() internally, and those
    elements live inside the #main section which has the `hidden` attribute on
    page load. Browsers may not return elements inside a `hidden` ancestor, so
    we must wait until we've removed `hidden` before calling init().
  */
  function showShell() {
    /* Remove the boot screen from layout */
    document.getElementById('boot').style.display = 'none';

    /*
      removeAttribute('hidden') reveals the #main section. This also triggers
      the shell-appear fade-in animation defined in animations.css, because
      the CSS rule targets .shell:not([hidden]).
    */
    document.getElementById('main').removeAttribute('hidden');

    /* Update the title bar text for the interactive shell state */
    document.getElementById('bar-title').textContent = 'root@oliver: ~ — SLVRD';

    Output.init();
    Input.init(handleCommand, () => cwd);

    /* Display the welcome message using terminal output styling with clickable link */
    Output.addHTML('Hello world! I have opened my personal console for you to navigate and poke around, so please feel free to explore! If you would prefer a more traditional portfolio, <a href="https://oliverjpearce.com/" target="_blank" rel="noopener noreferrer" class="terminal-link">please visit this website</a>.');
    Output.addHTML('For the CTF, the flag is in the format SLVRD{...} - good luck! c:');
    Output.addLine('blank', '');

    /* Scroll to top so user can see the whole console */
    setTimeout(() => {
      const outputEl = document.getElementById('output');
      if (outputEl) outputEl.scrollTop = 0;
    }, 100);

    Input.focus(); /* auto-focus the input so users can type immediately */
  }


  /*
    DOMContentLoaded fires when the HTML has been fully parsed and all
    elements exist in the DOM — but before images and stylesheets have
    finished loading. This is the right event to use here because we only
    need the DOM structure, not any loaded resources.

    If we ran Boot.run() immediately (not inside an event listener), the
    script would execute before the HTML elements it references are parsed,
    causing getElementById calls to return null.
  */
  document.addEventListener('DOMContentLoaded', () => {
    Boot.run(showShell);
  });

})();
