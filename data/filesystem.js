/**
 * data/filesystem.js
 *
 * This file defines the FILESYSTEM object — the virtual directory tree that
 * the terminal's ls and cd commands navigate.
 *
 * It's a plain JavaScript object (not a class or function) because we just
 * need a simple data structure. The key is a directory path, the value is
 * an array of its contents. This is called a "lookup table" or "map" pattern.
 *
 * Conventions:
 *   - All paths start from ~ (which represents the home directory)
 *   - Directory entries end with a trailing slash, file entries do not
 *   - Paths never have a trailing slash as keys (js/filesystem.js strips them)
 *
 * To add a new project:
 *   1. Add 'my-project/' as an entry in '~/projects'
 *   2. Add a '~/projects/my-project' key with its files listed
 *   3. Add the actual file content to data/files.js
 */

const FILESYSTEM = {

  /* The home directory — what you see when you first open the terminal */
  '~': [
    'resume.txt',
    'skills.txt',
    'contact.txt',
    'projects/',
  ],

  /* Each project gets its own subdirectory */
  '~/projects': [
    'llm-ctf/',
    'scmac-ios/',
    'study-buddy/',
    'acm-ai-lab/',
    'silvered-bot/',
  ],

  '~/projects/llm-ctf': [
    'README.md',
    'benchmark/',
    'walkthroughs/',
  ],

  /* These subdirectories exist so you can cd into them, but their files
     don't have entries in data/files.js so cat won't work on them —
     they're just listed for realism */
  '~/projects/llm-ctf/benchmark': [
    'challenges.json',
    'scoring.py',
  ],

  '~/projects/llm-ctf/walkthroughs': [
    'chall-01.md',
    'chall-02.md',
  ],

  '~/projects/scmac-ios': [
    'README.md',
    'AppStore.url',
  ],

  '~/projects/study-buddy': [
    'README.md',
    'devpost.url',
  ],

  '~/projects/acm-ai-lab': [
    'README.md',
    'research-manuscript.url',
  ],

  '~/projects/silvered-bot': [
    'README.md',
    'source.url',
  ],

};
