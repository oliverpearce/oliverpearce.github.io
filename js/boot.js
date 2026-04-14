/**
 * js/boot.js
 *
 * The animated startup sequence that plays before the shell appears.
 * It looks like a Linux system booting — kernel messages, service checks,
 * warnings — then transitions to the interactive terminal.
 *
 * The key technique here is staggered setTimeouts. Instead of showing all
 * the lines at once, each line is scheduled to appear after a specific delay.
 * This creates the illusion that the system is actually doing work.
 *
 * Why setTimeout instead of setInterval?
 *   setInterval fires a function every N milliseconds on a fixed schedule.
 *   setTimeout fires once after a specific delay. By giving each line its
 *   own setTimeout with a different delay, we can control the exact timing
 *   of each line independently — some lines appear faster, some slower,
 *   which feels more authentic than perfectly uniform spacing.
 */

const Boot = (() => {

  /*
    Each object in LINES describes one line of boot output.
    'cls' maps to a .boot__line--{cls} CSS class in terminal.css.
    'delay' is the number of milliseconds after Boot.run() is called
    before this line appears.

    To edit the boot sequence, just add, remove, or reorder objects here.
    No other code needs to change.
  */
  const LINES = [
    { text: 'BIOS v2.3.4 — Oliver Pearce Security System (OPSS)',           cls: 'default', delay: 0    },
    { text: 'Initializing hardware...',                            cls: 'default', delay: 130  },
    { text: '[  OK  ] Memory check passed (16384 MB)',             cls: 'green',   delay: 260  },
    { text: '[  OK  ] CPU: Intel Core i9-13900K × 24',            cls: 'green',   delay: 400  },
    { text: '[  OK  ] Network interface eth0 detected',            cls: 'green',   delay: 530  },
    { text: 'Loading SLVRD Linux 2026.4...',                        cls: 'default', delay: 680  },
    { text: '[  OK  ] Mounting filesystem /dev/sda1',              cls: 'green',   delay: 810  },
    { text: '[  OK  ] Loading kernel modules',                     cls: 'green',   delay: 940  },
    { text: '[  OK  ] Starting systemd services',                  cls: 'green',   delay: 1060 },
    { text: '[ WARN ] ERROR:DENIED — SUPERUSER DONT!!!!', cls: 'red',     delay: 1210 },
    { text: '[  OK  ] Metasploit framework loaded',                cls: 'green',   delay: 1360 },
    { text: '[  OK  ] Portfolio modules initialized',              cls: 'green',   delay: 1490 },
    { text: '',                                                     cls: 'default', delay: 1600 },
    { text: 'SLVRD GNU/Linux 202X.10.08  ─  oliverjpearce.com',        cls: 'blue',    delay: 1670 },
    { text: '',                                                     cls: 'default', delay: 1750 },
  ];

  /*
    The ASCII art is stored as an array of strings (one per row) then joined
    with newline characters. This is much easier to read and edit than one long
    string with \n characters embedded everywhere.

    The art uses Unicode box-drawing characters to make solid-looking block letters.
    Generated with: https://patorjk.com/software/taag/#f=ANSI%20Shadow
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

  /*
    run() starts the boot animation and calls onComplete() when it's done.
    The onComplete callback is passed in from main.js — this is why Boot
    doesn't need to know anything about how the shell works. It just does
    its animation and says "I'm done" via the callback. This pattern is
    called "inversion of control".
  */
  function run(onComplete) {
    const bootEl    = document.getElementById('boot');
    const lastDelay = LINES[LINES.length - 1].delay;

    /*
      forEach iterates over the LINES array. For each line object, we use
      object destructuring ({ text, cls, delay }) to unpack the properties
      into named variables — cleaner than writing line.text, line.cls, etc.

      Each setTimeout schedules a function to run after `delay` milliseconds.
      The function creates a new <div>, gives it the right CSS classes and text,
      and appends it to the boot section. Setting scrollTop = scrollHeight
      keeps the section scrolled to the bottom as new lines are added.
    */
    LINES.forEach(({ text, cls, delay }) => {
      setTimeout(() => {
        const line       = document.createElement('div');
        line.className   = `boot__line boot__line--${cls}`;
        line.textContent = text;
        bootEl.appendChild(line);
        bootEl.scrollTop = bootEl.scrollHeight;
      }, delay);
    });

    /*
      We schedule onComplete to run 350ms after the last line's delay.
      This gives the last line's fade-in animation time to complete before
      we transition to the shell. Without this buffer, the transition would
      happen while the last line is still fading in.
    */
    setTimeout(() => {
      document.getElementById('ascii-art').textContent = ASCII_ART;
      onComplete();
    }, lastDelay + 350);
  }

  return { run };

})();
