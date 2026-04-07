/**
 * data/easter-eggs.js
 *
 * Declares the global EASTER_EGGS object — a map of exact command strings
 * to the output they produce. Checked by js/commands.js before the normal
 * command router, so easter egg commands always win over anything else.
 *
 * Structure:
 *   Each key is the full command string the user must type exactly.
 *   Each value is either:
 *     - An array of [colorClass, text] line tuples (same format as data/files.js)
 *     - null — a sentinel meaning "this command is handled dynamically in
 *              js/commands.js rather than from a static data array"
 *
 * Color classes follow the same rules as data/files.js.
 * Link tuples [colorClass, text, url] work here too if needed.
 *
 * To add a new easter egg, simply add a key/value pair below.
 * No other files need to change — js/commands.js#handleEasterEgg will pick
 * it up automatically the next time the terminal loads.
 *
 * To add an easter egg with dynamic output (e.g. showing the current time),
 * set the value to null here and add a matching branch in
 * js/commands.js#handleEasterEgg.
 */

const EASTER_EGGS = {

  /* ── Fun / personality easter eggs ─────────────────────────────── */

  /*
    'hack' — a self-aware joke: the user types "hack" expecting something
    dramatic, gets a failed port scan, and is redirected to cat resume.txt.
  */
  'hack': [
    ['green',   'Initializing hack sequence...'],
    ['default', 'Scanning target... 192.168.1.1'],
    ['default', '[+] Port 22 open — SSH'],
    ['default', '[+] Port 80 open — HTTP'],
    ['red',     '[!] Intrusion detected by target. Aborting.'],
    ['gold',    'Nice try. Try cat resume.txt instead 😄'],
  ],

  /*
    'matrix' — a nod to the film. Keeps the terminal theme without being
    over-the-top; the last line redirects visitors back to useful content.
  */
  'matrix': [
    ['green',   '░▒▓ Wake up, Oliver... ▓▒░'],
    ['green',   'The Matrix has you.'],
    ['green',   'Follow the white rabbit.'],
    ['gold',    '...or just run cat resume.txt.'],
  ],

  /*
    'fortune' — references the classic Unix `fortune` command that prints
    a random quote. One fixed quote felt more intentional than randomness here.
  */
  'fortune': [
    ['purple',  '"The quieter you become, the more you can hear."'],
    ['default', '                                    — Kali Linux'],
  ],

  /*
    'cowsay' — a nod to the classic Unix cowsay utility.
    The cow text doubles as a subtle call-to-action (hire me).
  */
  'cowsay': [
    ['white',   ' _________________________________'],
    ['white',   '< hire me · github.com/oliverpearce >'],
    ['white',   ' ---------------------------------'],
    ['white',   '        \\   ^__^'],
    ['white',   '         \\  (oo)\\_______'],
    ['white',   '            (__)\\       )\\/\\'],
    ['white',   '                ||----w |'],
    ['white',   '                ||     ||'],
  ],

  /* ── Realistic Unix commands ────────────────────────────────────── */

  /*
    'ls -la' — the long-listing variant of ls. Not wired into the real ls
    handler (which only does basic listing) because implementing full flag
    parsing would complicate commands.js significantly for minimal gain.
    The .secret file is a teaser for the 'cat .secret' easter egg below.
  */
  'ls -la': [
    ['default', 'total 48'],
    ['default', 'drwxr-xr-x  6 oliver oliver 4096 Apr  4 2026 .'],
    ['default', 'drwxr-xr-x 18 oliver oliver 4096 Apr  4 2026 ..'],
    ['green',   '-rw-------  1 oliver oliver  220 Apr  4 2026 .bash_history'],
    ['green',   '-rw-r--r--  1 oliver oliver 3526 Apr  4 2026 .bashrc'],
    ['blue',    'drwxr-xr-x  8 oliver oliver 4096 Apr  4 2026 projects'],
    ['green',   '-rw-r--r--  1 oliver oliver  892 Apr  4 2026 contact.txt'],
    ['green',   '-rw-r--r--  1 oliver oliver 1240 Apr  4 2026 resume.txt'],
    ['green',   '-rw-r--r--  1 oliver oliver  680 Apr  4 2026 skills.txt'],
    ['red',     '-rw-------  1 oliver oliver   42 Apr  4 2026 .secret'],
  ],

  /*
    'cat .secret' — reward for curiosity. The file appears in 'ls -la' above
    but doesn't exist in data/filesystem.js, so 'cat .secret' via the normal
    cat handler would just print "No such file or directory". Handling it here
    lets us give a more interesting response instead.
  */
  'cat .secret': [
    ['red',     'Permission denied — clearance level insufficient.'],
    ['gold',    '...or maybe there\'s nothing there. Who knows. 🤫'],
  ],

  /*
    'cat /etc/passwd' — classic thing to try on a new Linux machine.
    The real file would expose system user accounts; ours is harmless.
  */
  'cat /etc/passwd': [
    ['default', 'root:x:0:0:root:/root:/bin/bash'],
    ['default', 'oliver:x:1000:1000:Oliver Pearce:/home/oliver:/bin/bash'],
    ['default', '...'],
    ['gold',    'Nothing useful here. Try cat resume.txt instead!'],
  ],

  /*
    'ping oliverjpearce.com' — simulates a real ping. The IP is a placeholder
    (93.184.216.34 is actually example.com) but the output format is authentic.
  */
  'ping oliverjpearce.com': [
    ['default', 'PING oliverjpearce.com (93.184.216.34): 56 data bytes'],
    ['green',   '64 bytes from 93.184.216.34: icmp_seq=0 ttl=56 time=11.2 ms'],
    ['green',   '64 bytes from 93.184.216.34: icmp_seq=1 ttl=56 time=10.8 ms'],
    ['green',   '64 bytes from 93.184.216.34: icmp_seq=2 ttl=56 time=11.5 ms'],
    ['default', '--- oliverjpearce.com ping statistics ---'],
    ['default', '3 packets transmitted, 3 received, 0% packet loss'],
  ],

  /*
    'history' — normally handled dynamically by Input._history, but giving
    it a fun curated fake history is more interesting than listing the exact
    commands the visitor happened to type.
  */
  'history': [
    ['default', '    1  cat resume.txt'],
    ['default', '    2  ls projects/'],
    ['default', '    3  cd projects/llm-ctf'],
    ['default', '    4  cat README.md'],
    ['default', '    5  ping oliverjpearce.com'],
    ['default', '    6  fortune'],
    ['red',     '    7  [REDACTED]'],
  ],

  /* ── Simple utility easter eggs ─────────────────────────────────── */

  /*
    'pwd' — always returns the same path regardless of actual cwd.
    Implemented here rather than in commands.js because it's
    effectively a constant and doesn't need access to state.
  */
  'pwd': [
    ['white', '/home/oliver'],
  ],

  /*
    'uptime' — simulates a machine that has been running for a suspiciously
    long time. The load averages are pleasingly low.
  */
  'uptime': [
    ['white', '12:00:00 up 365 days, 0:00, 1 user, load average: 0.42, 0.31, 0.28'],
  ],

  /*
    'exit' — simulates a terminal session ending. Nothing actually closes;
    the visitor can keep using the terminal normally after this.
  */
  'exit': [
    ['gold',    'logout'],
    ['default', 'Connection to oliverjpearce.com closed.'],
  ],

  /*
    'date' — set to null because the output must show the real current time,
    which can't be a static string. js/commands.js#handleEasterEgg has a
    special case for 'date' that calls new Date().toString() dynamically.
  */
  'date': null,

};
