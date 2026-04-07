/**
 * data/filesystem.js
 *
 * Declares the global FILESYSTEM object — the virtual directory tree that
 * the terminal's ls and cd commands navigate.
 *
 * Structure:
 *   - Each key is an absolute path string, using ~ as the home directory root.
 *   - Each value is an array of entry name strings for that directory.
 *   - Directory entries end with a trailing slash; file entries do not.
 *   - Paths here must have a matching entry in data/files.js to be readable
 *     with `cat` (otherwise js/filesystem.js#isFile returns false).
 *
 * To add a new directory:
 *   1. Add a key here with its list of children.
 *   2. Add it as a child entry (with trailing slash) in its parent directory.
 *   3. Add any readable files in data/files.js.
 *
 * Example — adding a "~/blog" directory with one post:
 *   '~/blog':            ['post-01.md'],
 *   // and in the '~' entry: add 'blog/'
 *   // and in data/files.js: add '~/blog/post-01.md': [...]
 */

const FILESYSTEM = {

  /* Home directory — the starting point when the terminal loads */
  '~': [
    'resume.txt',
    'skills.txt',
    'contact.txt',
    'projects/',
  ],

  /* Top-level projects directory */
  '~/projects': [
    'llm-ctf/',
    'scmac-ios/',
    'study-buddy/',
    'acm-ai-lab/',
    'silvered-bot/',
  ],

  /* Project: LLM-assisted offensive security research (undergraduate) */
  '~/projects/llm-ctf': [
    'README.md',
    'benchmark/',
    'walkthroughs/',
  ],

  /* Sub-directories within llm-ctf — no files.js entries needed
     if they're only meant to be listed, not read with cat */
  '~/projects/llm-ctf/benchmark': [
    'challenges.json',
    'scoring.py',
  ],

  '~/projects/llm-ctf/walkthroughs': [
    'chall-01.md',
    'chall-02.md',
  ],

  /* Project: iOS app for the Santa Cruz Mountains Art Center (UCSC BluePrint) */
  '~/projects/scmac-ios': [
    'README.md',
    'AppStore.url',
  ],

  /* Project: Real-time collaborative study sessions (hackathon) */
  '~/projects/study-buddy': [
    'README.md',
    'devpost.url',
  ],

  /* Project: Navigation map enhancement using U-Net + VAE (ACM AI Lab) */
  '~/projects/acm-ai-lab': [
    'README.md',
    'research-manuscript.url',
  ],

  /* Project: Discord bot with live Pokémon guessing game */
  '~/projects/silvered-bot': [
    'README.md',
    'source.url',
  ],

};
