/**
 * data/files.js
 *
 * The content of every readable file in the virtual filesystem.
 * This is the only file you should need to edit to update portfolio content.
 *
 * Structure:
 *   Each key is an absolute path matching an entry in data/filesystem.js.
 *   Each value is an array of "line tuples" — small arrays describing one
 *   line of output.
 *
 * Line tuple format:
 *   [colorClass, text]         — a plain coloured line
 *   [colorClass, text, url]    — same, but clicking it opens the URL
 *
 *   colorClass is a string that maps to a CSS class (.line--{colorClass})
 *   defined in terminal.css. Available options:
 *     'default'  → muted grey (body text, descriptions)
 *     'white'    → bright white (names, important facts)
 *     'green'    → terminal green (section borders, status)
 *     'blue'     → soft blue (informational text)
 *     'gold'     → amber/gold (section labels, keys)
 *     'red'      → red/pink (errors, warnings)
 *     'link'     → blue with underline, always clickable
 *     'blank'    → an empty spacer line (the text value is ignored)
 *
 * When a third element (url) is present, output.js wraps the line in an
 * <a> tag so it opens in a new tab when clicked. The 'link' colorClass
 * is a shorthand that implies blue + clickable without needing to repeat
 * the URL if the text IS the URL (output.js normalises bare domains).
 *
 * The box-drawing characters used for headers (╔ ╗ ╚ ╝ ║ ═) are Unicode
 * characters — you can copy them from here or find more at:
 * https://www.w3.org/TR/xml-entity-names/025.html
 */

const FILES = {

  /* ── ~/resume.txt ─────────────────────────────────────────────────── */

  '~/resume.txt': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║            OLIVER PEARCE  —  RESUME                  ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['gold',    'EDUCATION'],
    ['white',   '  B.S. Computer Science'],
    ['default', '  University of California, Santa Cruz'],
    ['blue',    '  3.93 / 4.00 + (9×) Dean\'s Honor List'],
    ['blank',   ''],

    ['gold',    'EXPERIENCE'],

    ['white',   '  Data Curation Engineer — Apple'],
    ['default', '    → [REDACTED]'],
    ['default', '    → ...Ryz3n 50lut10n5 @ 4ppl3...'],
    ['default', '    → [REDACTED]'],
    ['blank',   ''],

    ['white',   '  Undergraduate Researcher — UCSC (Offensive Security / LLMs)'],
    ['default', '    → Evaluated autonomous CTF-solving of multi-agentic LLM frameworks'],
    ['default', '    → Built structured benchmark of 25+ RE & exploitation challenges'],
    ['default', '    → Paper currently being published'],
    ['blank',   ''],

    ['white',   '  iOS Engineer — UCSC BluePrint (Nonprofit Tech)'],
    ['default', '    → Login, user profile backend & UI for Santa Cruz Mountains Art Center'],
    ['default', '    → Published on the Apple App Store'],
    ['blank',   ''],

    ['white',   '  Undergraduate Researcher — UCSC ACM AI Lab'],
    ['default', '    → Co-authored manuscript on navigation map data with U-Net & VAE'],
    ['default', '    → Tested architectures from cutting-edge AI research papers'],
    ['blank',   ''],

    ['white',   '  Residential Assistant — John R. Lewis College, UCSC'],
    ['default', '    → Supervised 40+ student residential community'],
    ['default', '    → Coordinated emergency response with campus security & health services'],
    ['blank',   ''],

    ['gold',    'LINKS'],
    /* The third element is the full URL — output.js uses this to make the line clickable */
    ['link', '  Resume PDF  →  drive.google.com/file/...', 'https://drive.google.com/file/d/1KRkfYS8WgYertQLWr6v8A0SsXnRyZJoj/view?usp=sharing'],
    ['link', '  LinkedIn   →  linkedin.com/in/oliverjpearce',                               'https://linkedin.com/in/oliverjpearce'],
    ['link', '  GitHub     →  github.com/oliverpearce',                                     'https://github.com/oliverpearce'],
    ['link', '  Website    →  oliverjpearce.com',                                           'https://oliverjpearce.com'],
  ],


  /* ── ~/skills.txt ─────────────────────────────────────────────────── */

  '~/skills.txt': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║                   SKILL TREE                         ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['gold',    'OFFENSIVE SECURITY'],
    /* The progress bars are just regular text using # and - characters */
    ['white',   '  [##########] Capture-the-Flags                    100%'],
    ['white',   '  [#########-] Computer Networks                     90%'],
    ['white',   '  [#########-] Offensive Research                    90%'],
    ['white',   '  [##??####??] Graduate Education                    ??%'],
  
    ['blank',   ''],

    ['gold',    'ENGINEERING'],
    ['white',   '  [##########] Python                               100%'],
    ['white',   '  [##########] Apple Software / Hardware            100%'],
    ['white',   '  [##########] Git / GitHub                         100%'],
    ['white',   '  [#########-] C / C# / C++                          90%'],
    ['blank',   ''],

    ['gold',    'TOOLS & PLATFORMS'],
    ['default', '  Linux/Unix  ·  GDB  ·  Ghidra  ·  pwntools'],
    ['default', '  Xcode  ·  Git  ·  Vercel  ·  VSCode  ·  Network'],
    ['blank',   ''],

    ['gold',    'RESEARCH'],
    ['default', '  U-Net VAE Architecture  ·  Multi-Agentic LLM Frameworks'],
    ['default', '  Model Architecting  ·  ML/AI Tooling'],
  ],


  /* ── ~/contact.txt ────────────────────────────────────────────────── */

  '~/contact.txt': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║                  CONTACT OLIVER                      ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['white',   '  Name      Oliver Pearce'],
    ['white',   '  Location  San Francisco, Bay Area'],
    ['blank',   ''],

    /* Using 'link' colorClass with explicit url for mailto and https links */
    ['gold',    '  Email'],
    ['link',    '            OliverPearce13@gmail.com',      'mailto:OliverPearce13@gmail.com'],
    ['gold',    '  LinkedIn'],
    ['link',    '            linkedin.com/in/oliverjpearce', 'https://linkedin.com/in/oliverjpearce'],
    ['gold',    '  GitHub'],
    ['link',    '            github.com/oliverpearce',       'https://github.com/oliverpearce'],
    ['gold',    '  Website'],
    ['link',    '            oliverjpearce.com',             'https://oliverjpearce.com'],
    ['blank',   ''],

    ['default', '  Open to: everything! say hi o/'],
  ],


  /* ── ~/projects/llm-ctf/README.md ────────────────────────────────── */

  '~/projects/llm-ctf/README.md': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║     Project: LLM Offensive Security Research         ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['default', '  Researched the offensive security capabilities of a'],
    ['default', '  multi-agentic LLM framework by evaluating autonomous'],
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
    ['green',   '║     Project: SCMAC iOS App (UCSC BluePrint)          ║'],
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
    ['link',    '            apps.apple.com/...',
                             'https://apps.apple.com/us/app/santa-cruz-mountain-art-center/id6550900077'],
    ['blank',   ''],

    ['white',   '  Org: UCSC BluePrint — nonprofit-focused student tech org'],
  ],


  /* ── ~/projects/study-buddy/README.md ────────────────────────────── */

  '~/projects/study-buddy/README.md': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║     Project: Study Buddy (Hackathon)                 ║'],
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
    ['link',    '            devpost.com/', 'https://devpost.com/software/studysync-gbo8fx'],
    ['gold',    '  Source'],
    ['link',    '            github.com/',      'https://github.com/Yelloo5191/StudyBuddy'],
  ],


  /* ── ~/projects/acm-ai-lab/README.md ─────────────────────────────── */

  '~/projects/acm-ai-lab/README.md': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║     Project: ACM AI Lab — Map Enhancement            ║'],
    ['green',   '╚══════════════════════════════════════════════════════╝'],
    ['blank',   ''],

    ['default', '  Co-authored research on enhancing navigation map data'],
    ['default', '  using U-Net and VAE architectures.'],
    ['blank',   ''],

    ['gold',    '  Role'],
    ['white',   '            Co-author · Model testing & evaluation'],
    ['gold',    '  Stack'],
    ['white',   '            Colab · U-Net · VAE'],
    ['gold',    '  Manuscript'],
    ['link',    '            drive.google.com/file/...',
                             'https://drive.google.com/file/d/12vl0m068oqXT2AZkwGLA8TpLOl8bNDVS/view'],
    ['gold',    '  Org'],
    ['link',    '            UCSC ACM Branch', 'https://ucscacm.vercel.app'],
  ],


  /* ── ~/projects/silvered-bot/README.md ───────────────────────────── */

  '~/projects/silvered-bot/README.md': [
    ['green',   '╔══════════════════════════════════════════════════════╗'],
    ['green',   '║     Project: silvered-bot (Discord)                  ║'],
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
