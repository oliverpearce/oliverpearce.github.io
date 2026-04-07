/**
 * js/main.js
 *
 * Application entry point. Owns the single piece of shared mutable state
 * (cwd — the current working directory) and wires all modules together.
 *
 * Startup sequence:
 *   1. DOMContentLoaded fires → Boot.run() starts the animated boot sequence.
 *   2. Boot sequence finishes → showShell() is called as the onComplete callback.
 *   3. showShell() hides the boot section, reveals the shell, and initialises
 *      Output and Input (both require the shell's DOM elements to exist and
 *      be visible before they can cache element references).
 *   4. From here, every user interaction flows through handleCommand():
 *        user types / clicks → Input captures it → handleCommand() →
 *        Commands.execute() → Output renders results
 *
 * Why cwd lives here (not in commands.js or input.js):
 *   cwd is mutated by `cd` but read by every command for path resolution.
 *   Keeping it here — in the module that wires everything together — avoids
 *   circular dependencies and makes the data flow explicit:
 *     main.js passes cwd into Commands.execute() on every call
 *     main.js passes setCwd into Commands.execute() so only `cd` can update it
 *   No module holds a stale reference; cwd is always read fresh at call time.
 *
 * Dependencies (must be loaded before this file — see index.html <script> order):
 *   data/filesystem.js  → FILESYSTEM global
 *   data/files.js       → FILES global
 *   data/easter-eggs.js → EASTER_EGGS global
 *   js/output.js        → Output global
 *   js/filesystem.js    → Filesystem global
 *   js/commands.js      → Commands global
 *   js/boot.js          → Boot global
 *   js/input.js         → Input global
 */

(function () {

  /* ── Shared state ───────────────────────────────────────────────── */

  /**
   * Current working directory.
   * Always a normalised absolute path (e.g. '~', '~/projects/llm-ctf').
   * Never has a trailing slash. Starts at home on load.
   * Updated only via setCwd() to keep all side-effects (DOM updates) in one place.
   * @type {string}
   */
  let cwd = '~';


  /* ── State updater ──────────────────────────────────────────────── */

  /**
   * Update cwd and reflect the change in every UI element that shows it.
   *
   * Two places in the UI always display the current path:
   *   1. The prompt label in the input row (#cur-path span)
   *   2. The window title bar (#bar-title)
   *
   * By funnelling all cwd changes through this one function, we guarantee
   * those two elements are always in sync with the actual value.
   *
   * Passed into Commands.execute() as a callback so command handlers can
   * trigger a cwd change without importing or knowing about main.js.
   *
   * @param {string} newPath - normalised absolute path (from Filesystem.resolve)
   */
  function setCwd(newPath) {
    cwd = newPath;
    document.getElementById('cur-path').textContent  = cwd;
    document.getElementById('bar-title').textContent = `oliver@kali: ${cwd} — bash`;
  }


  /* ── Command pipeline ───────────────────────────────────────────── */

  /**
   * Handle a submitted command string.
   * This is the single entry point for all command execution — both typed
   * input (from Input's keydown handler) and button clicks (from the quick bar)
   * route through here.
   *
   * We read cwd fresh on every call (closure over the let variable above)
   * so `cd` changes are always visible to the next command.
   *
   * @param {string} rawCmd - the raw command string exactly as the user submitted it
   */
  function handleCommand(rawCmd) {
    Commands.execute(rawCmd, cwd, setCwd);
  }


  /* ── Boot → Shell transition ────────────────────────────────────── */

  /**
   * Called by Boot.run() when the boot animation completes.
   * Transitions from the boot screen to the interactive shell.
   *
   * Why Output.init() and Input.init() are called here (not at the top):
   *   Both modules cache DOM element references on init. The #output element
   *   and #cmd-input live inside the #main shell section, which has the HTML
   *   `hidden` attribute on page load. Some browsers refuse to return elements
   *   from getElementById when they're inside a hidden subtree, so we must
   *   call init() only after revealing the section.
   */
  function showShell() {
    /* Hide the boot section — it's no longer needed */
    document.getElementById('boot').style.display = 'none';

    /* Reveal the shell section by removing the `hidden` attribute.
       This also triggers the shell-appear fade-in animation in animations.css. */
    document.getElementById('main').removeAttribute('hidden');

    /* Update the title bar to reflect the interactive shell state */
    document.getElementById('bar-title').textContent = 'oliver@kali: ~ — bash';

    /* Initialise modules that depend on shell DOM elements being visible */
    Output.init();
    Input.init(handleCommand);

    /* Focus the input field so the user can start typing immediately */
    Input.focus();
  }


  /* ── Bootstrap ──────────────────────────────────────────────────── */

  /**
   * Wait for the DOM to be fully parsed before doing anything.
   * DOMContentLoaded fires before images and stylesheets finish loading,
   * but after all HTML is parsed — which is all we need since we're only
   * working with DOM elements, not image dimensions or computed styles.
   */
  document.addEventListener('DOMContentLoaded', () => {
    Boot.run(showShell);
  });

})();
