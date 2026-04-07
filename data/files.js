/**
 * data/files.js
 *
 * Declares the global FILES object — the content of every readable file
 * in the virtual filesystem. This is what the `cat` command displays.
 *
 * Structure:
 *   Each key is an absolute path matching a file listed in data/filesystem.js.
 *   Each value is an array of line tuples with 2 or 3 elements:
 *
 *     [colorClass, text]
 *     [colorClass, text, url]   ← renders as a clickable <a> link
 *
 *   colorClass must match one of the .line--{class} rules in terminal.css:
 *     'default'  muted grey    — body text, descriptions
 *     'white'    bright white  — important facts, names, titles
 *     'green'    terminal green — section borders, status "OK"
 *     'blue'     soft blue     — links, info text
 *     'gold'     amber/gold    — section labels, keys in key/value pairs
 *     'red'      red/pink      — errors, warnings
 *     'purple'   soft purple   — accent (used sparingly)
 *     'link'     blue underlined clickable — shorthand for blue + anchor
 *     'blank'    empty line    — vertical spacing (text value is ignored)
 *
 *   The third element (url) is optional. When provided, output.js wraps
 *   the line in an <a> tag so it opens in a new tab on click.
 *   For 'link' color class, the url defaults to normalising the text itself
 *   if no third argument is supplied (see js/output.js#_toHref).
 *
 * To add a new file:
 *   1. Add the filename to the correct directory in data/filesystem.js.
 *   2. Add a key here with the full path and its line array.
 *
 * Box-drawing characters used for headers (copy/paste friendly):
 *   ╔ ╗ ╚ ╝ ║ ═
 */

const FILES = {

  /* ── ~/resume.txt ─────────────────────────────────────────────────── */

  '~/resume.txt': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║            OLIVER PEARCE  —  RESUME                 ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['gold',    'EDUCATION'],
    ['white',   '  B.S. Computer Science'],
    ['default', '  University of California, Santa Cruz'],
    ['blue',    '  (8×) Dean\'s Honor List'],
    ['blank',   ''],

    ['gold',    'EXPERIENCE'],

    ['white',   '  Undergraduate Researcher — UCSC (Offensive Security / LLMs)'],
    ['default', '    → Evaluated autonomous CTF-solving capabilities of multi-agentic LLM frameworks'],
    ['default', '    → Built structured benchmark of 25+ RE & exploitation challenges'],
    ['default', '    → Paper currently being published'],
    ['blank',   ''],

    ['white',   '  iOS Engineer — UCSC BluePrint (Nonprofit Tech)'],
    ['default', '    → Built login, user profile backend & UI for Santa Cruz Mountains Art Center app'],
    ['default', '    → Published on the Apple App Store'],
    ['blank',   ''],

    ['white',   '  Undergraduate Researcher — UCSC ACM AI Lab'],
    ['default', '    → Co-authored manuscript on enhancing navigation map data with U-Net & VAE'],
    ['default', '    → Tested high-performance architectures from cutting-edge AI research papers'],
    ['blank',   ''],

    ['white',   '  Residential Assistant — John R. Lewis College, UCSC'],
    ['default', '    → Supervised 40+ student residential community'],
    ['default', '    → Coordinated emergency response with campus security & health services'],
    ['blank',   ''],

    ['gold',    'LINKS'],
    /* Third element is the URL — output.js opens it in a new tab on click */
    ['link', '  Resume PDF  →  drive.google.com/file/d/1KRkfYS8WgYertQLWr6v8A0SsXnRyZJoj', 'https://drive.google.com/file/d/1KRkfYS8WgYertQLWr6v8A0SsXnRyZJoj/view?usp=sharing'],
    ['link', '  LinkedIn   →  linkedin.com/in/oliverjpearce',                               'https://linkedin.com/in/oliverjpearce'],
    ['link', '  GitHub     →  github.com/oliverpearce',                                     'https://github.com/oliverpearce'],
    ['link', '  Website    →  oliverjpearce.com',                                           'https://oliverjpearce.com'],
  ],


  /* ── ~/skills.txt ─────────────────────────────────────────────────── */

  '~/skills.txt': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║                   SKILL TREE                        ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['gold',    'OFFENSIVE SECURITY'],
    /* ASCII progress bars: # = filled, - = empty, number = percentage */
    ['white',   '  [##########] CTF Challenges (RE + Exploitation)  100%'],
    ['white',   '  [#########-] LLM-Assisted Offensive Research      90%'],
    ['white',   '  [########--] Reverse Engineering                   80%'],
    ['white',   '  [#######---] Exploitation Development              70%'],
    ['blank',   ''],

    ['gold',    'ENGINEERING'],
    ['white',   '  [##########] Python                               100%'],
    ['white',   '  [#########-] Swift / iOS Development               90%'],
    ['white',   '  [########--] JavaScript / TypeScript               80%'],
    ['white',   '  [########--] Machine Learning (PyTorch / VAE)      80%'],
    ['white',   '  [#######---] Supabase / Backend                    70%'],
    ['blank',   ''],

    ['gold',    'TOOLS & PLATFORMS'],
    ['default', '  Kali Linux  ·  GDB  ·  Ghidra  ·  pwntools'],
    ['default', '  Xcode  ·  Git  ·  Vercel  ·  PokeAPI  ·  Discord API'],
    ['blank',   ''],

    ['gold',    'RESEARCH'],
    ['default', '  U-Net  ·  VAE Architecture  ·  Multi-Agentic LLM Frameworks'],
    ['default', '  Benchmark Design  ·  CTF Challenge Authoring'],
  ],


  /* ── ~/contact.txt ────────────────────────────────────────────────── */

  '~/contact.txt': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║                  CONTACT OLIVER                     ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['white',   '  Name      Oliver Pearce'],
    ['white',   '  Location  Santa Cruz, CA'],
    ['blank',   ''],

    /* 'link' color class + explicit url → clickable mailto and http links */
    ['gold',    '  Email'],
    ['link',    '            OliverPearce13@gmail.com',      'mailto:OliverPearce13@gmail.com'],
    ['gold',    '  LinkedIn'],
    ['link',    '            linkedin.com/in/oliverjpearce', 'https://linkedin.com/in/oliverjpearce'],
    ['gold',    '  GitHub'],
    ['link',    '            github.com/oliverpearce',       'https://github.com/oliverpearce'],
    ['gold',    '  Website'],
    ['link',    '            oliverjpearce.com',             'https://oliverjpearce.com'],
    ['blank',   ''],

    ['default', '  Open to: internships, research collabs, CTF teams'],
  ],


  /* ── ~/projects/llm-ctf/README.md ────────────────────────────────── */

  '~/projects/llm-ctf/README.md': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║     Project: LLM Offensive Security Research        ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['default', '  Researched the offensive security capabilities of a'],
    ['default', '  multi-agentic LLM framework by evaluating its autonomous'],
    ['default', '  CTF-solving on a custom-built benchmark.'],
    ['blank',   ''],

    ['gold',    '  Benchmark'],
    ['white',   '            25+ RE & exploitation CTF challenges'],
    ['gold',    '  Output'],
    ['white',   '            Autonomous tooling + walkthrough documentation'],
    ['gold',    '  Status'],
    ['blue',    '            Paper being published...'],
    ['blank',   ''],

    ['white',   '  Type: Undergraduate Research (UCSC)'],
    ['default', '  Tags: LLM · Offensive Security · CTF · Reverse Engineering'],
  ],


  /* ── ~/projects/scmac-ios/README.md ──────────────────────────────── */

  '~/projects/scmac-ios/README.md': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║     Project: SCMAC iOS App (UCSC BluePrint)         ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['default', '  iOS app for the Santa Cruz Mountains Art Center to'],
    ['default', '  organize volunteering events for the community.'],
    ['blank',   ''],

    ['gold',    '  Role'],
    ['white',   '            iOS Engineer'],
    ['gold',    '  Built'],
    ['white',   '            Login · User Profile Backend · UI'],
    ['gold',    '  Status'],
    ['green',   '            LIVE on Apple App Store ✓'],
    ['gold',    '  Link'],
    ['link',    '            apps.apple.com/us/app/santa-cruz-mountain-art-center/id6550900077',
                             'https://apps.apple.com/us/app/santa-cruz-mountain-art-center/id6550900077'],
    ['blank',   ''],

    ['white',   '  Org: UCSC BluePrint — nonprofit-focused student tech org'],
  ],


  /* ── ~/projects/study-buddy/README.md ────────────────────────────── */

  '~/projects/study-buddy/README.md': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║     Project: Study Buddy (Hackathon)                ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['default', '  Real-time collaborative study sessions with integrated'],
    ['default', '  music, video, and chat functionality.'],
    ['blank',   ''],

    ['gold',    '  Role'],
    ['white',   '            Supabase integration · Login · Frontend UX'],
    ['gold',    '  Stack'],
    ['white',   '            Supabase · WebRTC · React'],
    ['gold',    '  Devpost'],
    ['link',    '            devpost.com/software/studysync-gbo8fx', 'https://devpost.com/software/studysync-gbo8fx'],
    ['gold',    '  Source'],
    ['link',    '            github.com/Yelloo5191/StudyBuddy',      'https://github.com/Yelloo5191/StudyBuddy'],
  ],


  /* ── ~/projects/acm-ai-lab/README.md ─────────────────────────────── */

  '~/projects/acm-ai-lab/README.md': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║     Project: ACM AI Lab — Map Enhancement           ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['default', '  Co-authored research on enhancing navigation map data'],
    ['default', '  using U-Net and VAE architectures.'],
    ['blank',   ''],

    ['gold',    '  Role'],
    ['white',   '            Co-author · Model testing & evaluation'],
    ['gold',    '  Stack'],
    ['white',   '            PyTorch · U-Net · VAE'],
    ['gold',    '  Manuscript'],
    ['link',    '            drive.google.com/file/d/12vl0m068oqXT2AZkwGLA8TpLOl8bNDVS',
                             'https://drive.google.com/file/d/12vl0m068oqXT2AZkwGLA8TpLOl8bNDVS/view'],
    ['gold',    '  Org'],
    ['link',    '            UCSC ACM Branch · ucscacm.vercel.app', 'https://ucscacm.vercel.app'],
  ],


  /* ── ~/projects/silvered-bot/README.md ───────────────────────────── */

  '~/projects/silvered-bot/README.md': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║     Project: silvered-bot (Discord)                 ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['default', '  Live Discord bot with a real-time Pokémon guessing game,'],
    ['default', '  server engagement tracking, and user data tooling.'],
    ['blank',   ''],

    ['gold',    '  Stack'],
    ['white',   '            Python · discord.py · PokeAPI'],
    ['gold',    '  Source'],
    ['link',    '            github.com/oliverpearce/silvered-bot', 'https://github.com/oliverpearce/silvered-bot'],
  ],

};
