# Terminal Portfolio 2.0

An interactive terminal-style portfolio website built with vanilla HTML, CSS, and JavaScript. Explore projects, skills, and contact information through a retro CLI interface with a hidden CTF challenge.

## Features

- **Interactive Terminal**: Command-line interface with real Unix-like commands (ls, cat, cd, whoami, etc.)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **CTF Challenge**: Hidden flag reward for discovering the secret `sudo rm -rf /` command
- **Mobile-Optimized**: Floating keyboard toggle button, no accidental zoom, touch-friendly controls
- **Live Links**: Clickable URLs throughout the terminal with old-school hyperlink styling
- **Boot Animation**: Animated startup sequence that mimics a Linux system boot

## Live Demo

Visit [oliverjpearce.com](https://oliverjpearce.com) to see this in action.

## Deployment

This is a static site with no backend requirements. Deploy to any static host:

### GitHub Pages
1. Push this repository to GitHub
2. Go to Settings → Pages
3. Select "Deploy from a branch"
4. Choose `main` branch, root folder
5. Your site will be live at `https://yourusername.github.io/repo-name`

### Vercel
1. Connect your GitHub repo to Vercel
2. Vercel auto-detects it's a static site
3. Deploy with zero configuration

### Other Hosts
Works with any static host (Netlify, Surge, Firebase Hosting, etc.)

## Commands

Try these in the terminal:

- `help` - List available commands
- `whoami` - Display user info
- `cat resume.txt` - View resume
- `cat skills.txt` - View technical skills
- `cat contact.txt` - View contact information
- `ls projects/` - List projects
- `ls` - List files in current directory
- `cd <path>` - Change directory
- `clear` - Clear the screen
- `uname -a` - System information
- `find -name "*.txt"` - Search for files
- `cowsay <message>` - ASCII art cow

### Secret Command

Try running `sudo rm -rf /` to discover the hidden CTF flag! 👀

## Project Structure

```
├── index.html          # Main HTML file
├── css/
│   ├── reset.css      # Browser reset styles
│   ├── theme.css      # CSS variables and color scheme
│   ├── terminal.css   # Terminal styling
│   └── animations.css # Boot animation styles
├── js/
│   ├── boot.js        # Startup animation sequence
│   ├── commands.js    # Command handlers and router
│   ├── filesystem.js  # Virtual filesystem logic
│   ├── input.js       # Input handling and autocomplete
│   ├── main.js        # Application entry point
│   └── output.js      # Terminal output rendering
├── data/
│   ├── filesystem.js  # Filesystem structure definition
│   └── files.js       # File content (resume, projects, etc.)
└── flag.env           # Base64-encoded CTF flag
```

## Customization

### Updating Content

Edit `data/files.js` to change portfolio content:
- Resume, skills, and contact info
- Project descriptions
- Links and URLs

### Modifying Styling

- `css/theme.css` - Colors, fonts, spacing variables
- `css/terminal.css` - Layout and component styles
- `css/animations.css` - Animation timings

### Adding Commands

1. Write a handler function in `js/commands.js`
2. Add it to the `COMMANDS` map
3. Add it to `cmdHelp()` bubbles list
4. Add to `AUTOCOMPLETE_COMMANDS` in `js/input.js`
5. (Optional) Add a button in `index.html` quickbar

## Security Notes

- The CTF flag is base64-encoded for light obfuscation
- No sensitive data is exposed in the public repository
- All file contents are in `data/files.js` - easily editable
- The site is entirely client-side with no server dependencies

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Feel free to fork, modify, and use this template for your own portfolio!

## Credits

Built with:
- Vanilla JavaScript (no frameworks)
- Google Fonts (JetBrains Mono)
- Unicode box-drawing characters for styling

