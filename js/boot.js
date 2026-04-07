/**
 * js/boot.js
 *
 * Animated startup sequence displayed before the main shell appears.
 * Simulates a Linux system booting — kernel messages, service checks,
 * warnings — then transitions to the interactive shell.
 *
 * How it works:
 *   Boot.run(onComplete) schedules each line to appear at a specific delay
 *   using setTimeout. When the last delay has passed, it populates the ASCII
 *   art banner and calls onComplete(), which is wired in js/main.js to show
 *   the shell section.
 *
 * To customise the boot sequence:
 *   - Edit the LINES array below. Each entry needs { text, cls, delay }.
 *   - cls must be one of: 'default', 'green', 'red', 'blue'
 *     (these map to .boot__line--{cls} rules in animations.css / terminal.css)
 *   - delay is in milliseconds from when Boot.run() is called.
 *   - Increase the delay of the last line to lengthen the sequence.
 *
 * To customise the ASCII art banner:
 *   - Edit the ASCII_ART array. Each element is one row of the art.
 *   - The art is written into the #ascii-art <pre> element in index.html.
 *
 * Public API:
 *   Boot.run(onComplete)
 */

const Boot = (() => {

  /* ── Boot line sequence ─────────────────────────────────────────── */

  /**
   * Each object represents one line of boot output.
   *
   * text  — the string to display
   * cls   — color variant class suffix (maps to .boot__line--{cls})
   * delay — milliseconds after Boot.run() is called before this line appears
   *
   * Staggering the delays creates the impression of real system activity.
   * The gap between lines doesn't need to be uniform — longer pauses before
   * "important" messages (like the Kali banner at the end) feel more natural.
   */
  const LINES = [
    { text: 'BIOS v2.3.4 — Offensive Security Edition',           cls: 'default', delay: 0    },
    { text: 'Initializing hardware...',                            cls: 'default', delay: 130  },
    { text: '[  OK  ] Memory check passed (16384 MB)',             cls: 'green',   delay: 260  },
    { text: '[  OK  ] CPU: Intel Core i9-13900K × 24',            cls: 'green',   delay: 400  },
    { text: '[  OK  ] Network interface eth0 detected',            cls: 'green',   delay: 530  },
    { text: 'Loading Kali Linux 2024.4...',                        cls: 'default', delay: 680  },
    { text: '[  OK  ] Mounting filesystem /dev/sda1',              cls: 'green',   delay: 810  },
    { text: '[  OK  ] Loading kernel modules',                     cls: 'green',   delay: 940  },
    { text: '[  OK  ] Starting systemd services',                  cls: 'green',   delay: 1060 },
    { text: '[ WARN ] Firewall disabled — pentesting mode active', cls: 'red',     delay: 1210 },
    { text: '[  OK  ] Metasploit framework loaded',                cls: 'green',   delay: 1360 },
    { text: '[  OK  ] Portfolio modules initialized',              cls: 'green',   delay: 1490 },
    { text: '',                                                     cls: 'default', delay: 1600 },
    { text: 'Kali GNU/Linux 2024.4  ─  oliverjpearce.com',        cls: 'blue',    delay: 1670 },
    { text: '',                                                     cls: 'default', delay: 1750 },
  ];

  /* ── ASCII banner art ───────────────────────────────────────────── */

  /**
   * Two-line block-letter ASCII art: "OLIVER" on the first group of rows,
   * "PEARCE" on the second. Each element is one horizontal row of the art.
   * Written as an array and joined with '\n' so the source is readable and
   * easy to update without counting characters in a single long string.
   *
   * The art is written into <pre id="ascii-art"> by the run() function.
   * Font: "ANSI Shadow" variant rendered with box-drawing characters.
   */
  const ASCII_ART = [
    ' ██████╗ ██╗     ██╗██╗   ██╗███████╗██████╗ ',
    '██╔═══██╗██║     ██║██║   ██║██╔════╝██╔══██╗',
    '██║   ██║██║     ██║██║   ██║█████╗  ██████╔╝',
    '██║   ██║██║     ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗',
    '╚██████╔╝███████╗██║ ╚████╔╝ ███████╗██║  ██║',
    ' ╚═════╝ ╚══════╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝',
    '',
    '    ██████╗ ███████╗ █████╗ ██████╗  ██████╗███████╗',
    '    ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝',
    '    ██████╔╝█████╗  ███████║██████╔╝██║     █████╗  ',
    '    ██╔═══╝ ██╔══╝  ██╔══██║██╔══██╗██║     ██╔══╝  ',
    '    ██║     ███████╗██║  ██║██║  ██║╚██████╗███████╗',
    '    ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝',
  ].join('\n');


  /* ── Public functions ───────────────────────────────────────────── */

  /**
   * Start the boot animation and invoke onComplete when it finishes.
   *
   * For each line in LINES, we schedule a setTimeout that creates a DOM
   * element, assigns the correct class, sets its text, and appends it to
   * the boot section. This approach (many small timeouts vs. one interval)
   * makes the timing data-driven — changing a delay only requires editing
   * the LINES array, not any loop logic.
   *
   * The onComplete callback is scheduled 150ms after the last line's delay
   * to give the final line's fade-in animation time to complete before
   * the transition to the shell.
   *
   * @param {function} onComplete - called when the boot sequence ends
   */
  function run(onComplete) {
    const bootEl       = document.getElementById('boot');
    const lastDelay    = LINES[LINES.length - 1].delay;
    const totalDuration = lastDelay + 200; /* extra buffer after the last line appears */

    /* Schedule each boot line to appear at its specified delay */
    LINES.forEach(({ text, cls, delay }) => {
      setTimeout(() => {
        const line = document.createElement('div');

        /*
          Classes are split across two attributes:
            boot__line         — base styles (font-size, line-height, initial opacity: 0)
            boot__line--{cls}  — color (defined in terminal.css)
          The fade-in animation (boot-fadein keyframe) is applied to boot__line
          in animations.css, so every line animates in identically.
        */
        line.className  = `boot__line boot__line--${cls}`;
        line.textContent = text;

        bootEl.appendChild(line);

        /* Keep the boot section scrolled to the bottom as lines appear */
        bootEl.scrollTop = bootEl.scrollHeight;
      }, delay);
    });

    /* After all lines have appeared, write the banner art and hand off to main */
    setTimeout(() => {
      document.getElementById('ascii-art').textContent = ASCII_ART;
      onComplete();
    }, totalDuration + 150);
  }

  /* ── Public API ─────────────────────────────────────────────────── */

  return { run };

})();
